import React, {useEffect, useMemo, useState} from 'react';
import {
  Alert,
  Linking,
  Platform,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import {
  Button,
  Dialog,
  IconButton,
  Portal,
  RadioButton,
  Switch,
  Text,
  TextInput,
  useTheme,
} from 'react-native-paper';
import {useTranslation} from 'react-i18next';
import notifee, {
  AuthorizationStatus,
  RepeatFrequency,
  TimestampTrigger,
  TriggerType,
} from '@notifee/react-native';
import Avatar from '@/features/avatar/components/Avatar';
import i18next from 'i18next';
import moment from 'moment';
import DatePicker from 'react-native-date-picker';
import {
  dateObjectToTimeString,
  timeToDateObject,
} from '@/support/helpers/DateTimeHelpers';
import {Pet} from '@/app/models/Pet';
import usePet, {PetData} from '../hooks/usePet';
import {BSON} from 'realm';
import useNotifications from '@/features/notifications/hooks/useNotifications';
import { AssessmentFrequency } from '@/app/models/Pet';

interface Props {
  pet?: Pet;
  buttonLabel?: string;
  onSubmit: (data: PetData) => void;
}

const Settings: React.FC<Props> = ({pet, buttonLabel, onSubmit}) => {
  const {t} = useTranslation();
  const theme = useTheme();
  const {getNotificationId} = useNotifications();
  const [petType, setPetType] = useState<string>(pet?.species ?? '');
  const [petName, setPetName] = useState<string>(pet?.name ?? '');
  const [avatar, setAvatar] = useState<string | undefined>(pet?.avatar);
  const [assessmentFrequency, setAssessmentFrequency] = useState<AssessmentFrequency>(pet?.assessmentFrequency as AssessmentFrequency ?? 'DAILY');
  const [assessmentsPaused, setAssessmentsPaused] = useState<boolean>(
    (pet && pet?.pausedAt !== null) ?? false,
  );
  const [remindersEnabled, setRemindersEnabled] = useState<boolean>(false);
  const [timePickerOpen, setTimePickerOpen] = useState(false);
  const [reminderTime, setReminderTime] = useState(
    timeToDateObject(pet?.notificationsTime ?? '20:00'),
  );
  const [confirmDeleteVisible, setConfirmDeleteVisible] = React.useState(false);
  const {pets} = usePet();

  const petComplete = useMemo(() => petType && petName, [petType, petName]);

  console.log(pet);

  // Load reminders enabled from storage
  useEffect(() => {
    const checkPermissions = async () => {
      const settings = await notifee.getNotificationSettings();
      if (settings.authorizationStatus !== AuthorizationStatus.AUTHORIZED) {
        setRemindersEnabled(false);
        return;
      }
      const enabled = pet?.notificationsEnabled ?? false;
      setRemindersEnabled(enabled);
    };
    checkPermissions();
  }, [pet?.notificationsEnabled]);

  // Store pet name and type in storage
  const submitData = async () => {
    const id = pet?._id ?? new BSON.ObjectId();
    let notificationsEnabled = remindersEnabled;
    // Disable reminders if assessments are paused
    if (assessmentsPaused) {
      setRemindersEnabled(false);
      await cancelReminders(id);
      notificationsEnabled = false;
    } else {
      // Enable reminders if they are not paused and permission granted
      notificationsEnabled = await toggleReminders(id);
    }
    onSubmit({
      id,
      name: petName,
      species: petType,
      notificationsEnabled,
      notificationsTime: dateObjectToTimeString(reminderTime),
      isPaused: assessmentsPaused,
      avatar: avatar,
      assessmentFrequency: assessmentFrequency,
    });
  };

  const deletePet = async () => {
    if (!pet) {
      return;
    }
    const notificationId = getNotificationId(pet._id);
    await notifee.cancelAllNotifications([
      'eu.sboo.ralph.reminder',
      notificationId,
    ]);
    onSubmit({delete: true});
  };

  const checkPermissions = async () => {
    if (Platform.OS === 'ios') {
      const settings = await notifee.requestPermission();
      return Boolean(
        settings.authorizationStatus === AuthorizationStatus.AUTHORIZED ||
          settings.authorizationStatus === AuthorizationStatus.PROVISIONAL,
      );
    }
    const settings =
      Platform.OS === 'android' && Platform.Version >= 33
        ? await notifee.requestPermission()
        : await notifee.getNotificationSettings();
    const channel = await notifee.getChannel('MyChannelID');
    return (
      settings.authorizationStatus === AuthorizationStatus.AUTHORIZED &&
      !channel?.blocked
    );
  };

  const enableReminders = async (petId: BSON.ObjectId) => {
    const hasPermissions = await checkPermissions();
    if (hasPermissions) {
      try {
        await createTriggerNotification(petId);
        return true;
      } catch (error) {
        console.error(error);
        return false;
      }
    }
    Alert.alert(
      'Enable Notifications',
      'To receive notifications opt in from your Settings.',
      [
        {text: t('buttons:cancel')},
        {text: t('buttons:settings'), onPress: openPermissionSettings},
      ],
    );
    return false;
  };

  const openPermissionSettings = async () => {
    if (Platform.OS === 'ios') {
      await Linking.openSettings();
    } else {
      await notifee.openNotificationSettings();
    }
  };
  const createTriggerNotification = async (petId: BSON.ObjectId) => {
    const channelGroupId = await notifee.createChannelGroup({
      id: 'reminders',
      name: i18next.t('measurements:reminders'),
    });

    const channelId = await notifee.createChannel({
      id: petId.toHexString(),
      groupId: channelGroupId,
      name: petName,
    });

    const timestamp = reminderTime.getTime();
    const validTimestamp =
      moment(timestamp).seconds(0).valueOf() > moment().valueOf()
        ? moment(timestamp).seconds(0).valueOf()
        : moment(timestamp).add(1, 'days').seconds(0).valueOf();

    // Create a time-based trigger
    const trigger: TimestampTrigger = {
      type: TriggerType.TIMESTAMP,
      timestamp: validTimestamp,
      repeatFrequency: assessmentFrequency == 'WEEKLY' ? RepeatFrequency.WEEKLY : RepeatFrequency.DAILY,
    };

    await notifee.createTriggerNotification(
      {
        id: getNotificationId(petId),
        title: t('measurements:notificationTitle', {
          petName: petName,
        }),
        body: t('measurements:notificationBody', {
          petName: petName,
        }),
        android: {
          channelId: channelId,
          smallIcon: 'ic_small_icon',
          pressAction: {
            id: 'default',
          },
        },
      },
      trigger,
    );
  };

  const toggleReminderSwitch = async () => {
    setRemindersEnabled(!remindersEnabled);
  };

  const cancelReminders = async (petId: BSON.ObjectId) => {
    await notifee.cancelAllNotifications([
      'eu.sboo.ralph.reminder',
      getNotificationId(petId),
    ]);
  };

  // Toggle reminders
  const toggleReminders = async (petId: BSON.ObjectId) => {
    await cancelReminders(petId);
    let enabled = remindersEnabled;
    if (enabled) {
      enabled = await enableReminders(petId);
      console.log('Notifications enabled', enabled);
    }
    return enabled;
  };

  const toggleAssessmentsPaused = () => {
    setAssessmentsPaused(!assessmentsPaused);
  };

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.profileInput}>
        <View style={styles.inputRow}>
          <Text style={styles.inputLabel} variant="labelLarge">
            {t('settings:petTypeInputLabel')}
          </Text>
          <View style={styles.inputRowPet}>
            <IconButton
              selected={petType === 'dog'}
              mode="contained"
              icon="dog"
              accessibilityLabel={t('buttons:dog')}
              size={32}
              onPress={() => setPetType('dog')}
            />
            <IconButton
              selected={petType === 'cat'}
              mode="contained"
              icon="cat"
              accessibilityLabel={t('buttons:cat')}
              size={32}
              onPress={() => setPetType('cat')}
            />
            <IconButton
              selected={petType === 'other'}
              mode="contained"
              icon="google-downasaur"
              accessibilityLabel={t('buttons:other')}
              size={32}
              onPress={() => setPetType('other')}
            />
          </View>
        </View>
        <TextInput
          label={t('settings:petNameInputLabel')}
          style={{backgroundColor: theme.colors.surface, ...styles.textInput}}
          value={petName}
          onChangeText={(text: string) => setPetName(text)}
        />
        <View style={styles.inputRow}>
          <Text style={styles.inputLabel} variant="labelLarge">
            {t('settings:avatarInputLabel')}
          </Text>
          <Avatar mode={'edit'} pet={pet} onAvatarSelected={setAvatar} />
        </View>

        <View style={styles.inputRow}>
          <Text style={styles.inputLabel} variant="labelLarge">
            {t('settings:reminderFrequency')}
          </Text>
        
        <View style={styles.inputRowRadioButtonContainer}>
          <View style={styles.inputRowRadioButton}>
          <Text style={styles.inputLabel} variant="labelSmall">
            {t('settings:daily')}
          </Text>
          <RadioButton
            value={'DAILY'}
            status={assessmentFrequency === 'DAILY' ? 'checked' : 'unchecked'}
            onPress={() => setAssessmentFrequency('DAILY')}
              />
              </View>
              <View style={styles.inputRowRadioButton}>
          <Text style={styles.inputLabel} variant="labelSmall">
            {t('settings:weekly')}
          </Text>
              <RadioButton
            value={'WEEKLY'}
            status={assessmentFrequency === 'WEEKLY' ? 'checked' : 'unchecked'}
            onPress={() => setAssessmentFrequency('WEEKLY')}
              />
              </View>
          </View>
        </View>
        
        <View style={styles.inputRow}>
          <Text style={styles.inputLabel} variant="labelLarge">
            {t('settings:enableNotificationsLabel')}
          </Text>
          <Switch
            disabled={assessmentsPaused}
            value={remindersEnabled}
            onValueChange={toggleReminderSwitch}
          />
        </View>
        {remindersEnabled ? (
          <View style={styles.inputRow}>
            <Text variant="labelLarge">{t('settings:reminderTimeLabel')}</Text>
            <Button
              mode={'outlined'}
              onPress={() => setTimePickerOpen(true)}
              disabled={assessmentsPaused}>
              {dateObjectToTimeString(reminderTime)}
            </Button>
            <DatePicker
              modal
              mode={'time'}
              minuteInterval={15}
              open={timePickerOpen}
              date={reminderTime}
              onConfirm={date => {
                setTimePickerOpen(false);
                setReminderTime(date);
              }}
              onCancel={() => {
                setTimePickerOpen(false);
              }}
            />
          </View>
        ) : null}
        {pet ? (
          <View style={styles.inputRow}>
            <View style={styles.inputLabel}>
              <Text variant="labelLarge">
                {t('settings:pauseAssessmentsLabel')}
              </Text>
              <Text style={{color: theme.colors.outline}} variant="bodySmall">
                {t('settings:pauseAssessmentsLabelInfo')}
              </Text>
            </View>
            <Switch
              value={assessmentsPaused}
              onValueChange={toggleAssessmentsPaused}
            />
          </View>
        ) : null}
      </ScrollView>
      <View style={styles.buttons}>
        {pet && pets.length > 1 ? (
          <Button
            textColor={theme.colors.error}
            buttonColor={theme.colors.errorContainer}
            onPress={() => setConfirmDeleteVisible(true)}
            mode={'contained'}>
            {t('buttons:delete_pet')}
          </Button>
        ) : null}
        <Button disabled={!petComplete} onPress={submitData} mode={'contained'}>
          {buttonLabel ?? t('buttons:save')}
        </Button>
      </View>
      <Portal>
        <Dialog
          visible={confirmDeleteVisible}
          onDismiss={() => setConfirmDeleteVisible(false)}>
          <Dialog.Icon icon="alert" color={theme.colors.error} />
          <Dialog.Title style={styles.dialogTitle}>
            {t('delete_pet')}
          </Dialog.Title>
          <Dialog.Content>
            <Text style={styles.dialogText} variant="bodyMedium">
              {t('delete_pet_text', {petName})}
            </Text>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setConfirmDeleteVisible(false)}>
              {t('buttons:cancel')}
            </Button>
            <Button textColor={theme.colors.error} onPress={deletePet}>
              {t('buttons:delete_pet')}
            </Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: 'flex-start',
    alignItems: 'stretch',
  },
  profileInput: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 20,
    marginBottom: 30,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'stretch',
    justifyContent: 'space-between',
    height: 50,
  },
  inputRowRadioButtonContainer: {
    flexDirection: 'column',
  },
  inputRowRadioButton: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'stretch',
    justifyContent: 'space-between',
    borderBottomColor: 'red',
    borderWidth: 1,
  },
  inputRowPet: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'stretch',
    justifyContent: 'flex-end',
  },
  inputFlags: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'stretch',
    justifyContent: 'flex-end',
  },
  inputLabel: {
    flexShrink: 1,
    marginRight: 10,
  },
  textInput: {
    alignSelf: 'stretch',
  },
  buttons: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 10,
    alignItems: 'center',
  },
  avatar: {
    backgroundColor: '#ffffff',
  },
  dialogTitle: {
    textAlign: 'center',
  },
  dialogText: {
    textAlign: 'center',
  },
});

export default Settings;
