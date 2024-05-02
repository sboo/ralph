import React, {useEffect, useState} from 'react';
import {Alert, Linking, Platform, StyleSheet, View} from 'react-native';
import {
  Button,
  IconButton,
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
import {PetData} from '../hooks/usePet';
import slugify from 'slugify';

interface Props {
  pet?: Pet;
  buttonLabel?: string;
  onSubmit: (data: PetData) => void;
}

const Settings: React.FC<Props> = ({pet, buttonLabel, onSubmit}) => {
  const {t} = useTranslation();
  const theme = useTheme();
  const [petType, setPetType] = useState<string>(pet?.species ?? '');
  const [petName, setPetName] = useState<string>(pet?.name ?? '');
  const [avatar, setAvatar] = useState<string | undefined>(pet?.avatar);
  const [remindersEnabled, setRemindersEnabled] = useState<boolean>(false);
  const [timePickerOpen, setTimePickerOpen] = useState(false);
  const [reminderTime, setReminderTime] = useState(
    timeToDateObject(pet?.notificationsTime ?? '20:00'),
  );

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
    const notificationsEnabled = await toggleReminders();
    onSubmit({
      name: petName,
      species: petType,
      notificationsEnabled,
      notificationsTime: dateObjectToTimeString(reminderTime),
      avatar: avatar,
    });
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

  const enableReminders = async () => {
    const hasPermissions = await checkPermissions();
    if (hasPermissions) {
      try {
        await createTriggerNotification();
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
  const createTriggerNotification = async () => {
    const channelId = await notifee.createChannel({
      id: 'reminders',
      name: i18next.t('measurements:reminders'),
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
      repeatFrequency: RepeatFrequency.DAILY,
    };

    await notifee.createTriggerNotification(
      {
        id: 'eu.sboo.ralph.reminder_' + slugify(petName),
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

  // Toggle reminders
  const toggleReminders = async () => {
    await notifee.cancelAllNotifications();
    let enabled = remindersEnabled;
    if (enabled) {
      enabled = await enableReminders();
      console.log('Notifications enabled', enabled);
    }
    return enabled;
  };

  return (
    <View style={styles.container}>
      <View style={styles.profileInput}>
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
            {t('settings:enableNotificationsLabel')}
          </Text>
          <Switch
            value={remindersEnabled}
            onValueChange={toggleReminderSwitch}
          />
        </View>
        {remindersEnabled ? (
          <View style={styles.inputRow}>
            <Text variant="labelLarge">{t('settings:reminderTimeLabel')}</Text>
            <Button mode={'outlined'} onPress={() => setTimePickerOpen(true)}>
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
      </View>
      <View style={styles.buttons}>
        <Button onPress={submitData} mode={'contained'}>
          {buttonLabel ?? t('buttons:continue')}
        </Button>
      </View>
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
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'stretch',
    justifyContent: 'space-between',
    height: 50,
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
    marginTop: 20,
    alignItems: 'center',
  },
  avatar: {
    backgroundColor: '#ffffff',
  },
});

export default Settings;
