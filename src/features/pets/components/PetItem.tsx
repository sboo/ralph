import { withAllPets } from '@/core/database/hoc';
import { AssessmentFrequency, CustomTrackingSettings, emptyCustomTrackingSettings, Pet } from '@/core/database/models/Pet';
import Avatar from '@/features/avatar/components/Avatar';
import { event, EVENT_NAMES } from '@/features/events';
import { createTriggerNotification } from '@/features/notifications/helpers/helperFunctions';
import useNotifications from '@/features/notifications/hooks/useNotifications';
import {
  dateObjectToTimeString,
  timeToDateObject
} from '@/shared/helpers/DateTimeHelpers';
import notifee, {
  AuthorizationStatus
} from '@notifee/react-native';
import { compose } from '@nozbe/watermelondb/react';
import { getCalendars } from 'expo-localization';
import React, { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
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
  List,
  Portal,
  Text,
  TextInput,
  useTheme,
} from 'react-native-paper';
import { PetData } from '../helpers/helperFunctions';

interface Props {
  pet?: Pet;
  buttonLabel?: string;
  onSubmit: (data: PetData) => void;
  isWelcomeScreen?: boolean;
  navigation: any;
  allPets?: Pet[];
}

const PetItem: React.FC<Props> = ({ 
  pet, 
  buttonLabel, 
  onSubmit, 
  navigation, 
  isWelcomeScreen = false,
  allPets = []
}) => {
  const { t } = useTranslation();
  const theme = useTheme();
  const { getNotificationId } = useNotifications();
  const [petType, setPetType] = useState<string>(pet?.species ?? '');
  const [petName, setPetName] = useState<string>(pet?.name ?? '');
  const [avatar, setAvatar] = useState<string | undefined>(pet?.avatar);
  const [assessmentFrequency, setAssessmentFrequency] = useState<AssessmentFrequency>(pet?.assessmentFrequency as AssessmentFrequency ?? 'DAILY');
  const [assessmentsPaused, setAssessmentsPaused] = useState<boolean>(
    (pet && pet?.pausedAt !== null) ?? false,
  );
  const [customTrackingSettings, setCustomTrackingSettings] = useState<CustomTrackingSettings>({
    ...emptyCustomTrackingSettings,
    ...(pet?.customTrackingSettings ?? {}),
  });
  const [remindersEnabled, setRemindersEnabled] = useState<boolean>(false);
  const [reminderTime, setReminderTime] = useState(
    timeToDateObject(pet?.notificationsTime ?? '20:00'),
  );
  const [hour12, setHour12] = useState<boolean>(false);
  const [confirmDeleteVisible, setConfirmDeleteVisible] = React.useState(false);

  const petComplete = useMemo(() => petType && petName, [petType, petName]);
  const welcomeTextTopMargin = useMemo(() => (Platform.OS === 'android' ? 30 : 5), []);

  useEffect(() => {
    const calendars = getCalendars();
    const uses24Hour = calendars[0]?.uses24hourClock ?? false;
    setHour12(!uses24Hour);
  }, []);

  useEffect(() => {
    const handleAssessmentFrequency = (assessmentFrequency: AssessmentFrequency) => {
      setAssessmentFrequency(assessmentFrequency)
    }
    event.on(EVENT_NAMES.ASSESSMENT_FREQUENCY_CHANGED, handleAssessmentFrequency);
    return () => {
      event.off(EVENT_NAMES.ASSESSMENT_FREQUENCY_CHANGED, handleAssessmentFrequency);
    }
  }, [setAssessmentFrequency]);

  useEffect(() => {
    const handleAssemmentPaused = (paused: boolean) => {
      setAssessmentsPaused(paused)
    }
    event.on(EVENT_NAMES.ASSESSMENT_PAUSED, handleAssemmentPaused);
    return () => {
      event.off(EVENT_NAMES.ASSESSMENT_PAUSED, handleAssemmentPaused);
    }
  }, [setAssessmentsPaused]);

  useEffect(() => {
    const handleRemindersToggled = (remindersEnabled: boolean) => {
      setRemindersEnabled(remindersEnabled)
    }
    event.on(EVENT_NAMES.REMINDERS_TOGGLED, handleRemindersToggled);
    return () => {
      event.off(EVENT_NAMES.REMINDERS_TOGGLED, handleRemindersToggled);
    }
  }, [setRemindersEnabled]);

  useEffect(() => {
    const handleReminderTime = (reminderTime: Date) => {
      setReminderTime(reminderTime)
    }
    event.on(EVENT_NAMES.REMINDER_TIME_CHANGED, handleReminderTime);
    return () => {
      event.off(EVENT_NAMES.REMINDER_TIME_CHANGED, handleReminderTime);
    }
  }, [setReminderTime]);

  useEffect(() => {
    const handleCustomTrackingSettings = (customTrackingSettings: CustomTrackingSettings) => {
      setCustomTrackingSettings(customTrackingSettings)
    }
    event.on(EVENT_NAMES.CUSTOM_TRACKING_CHANGED, handleCustomTrackingSettings);
    return () => {
      event.off(EVENT_NAMES.CUSTOM_TRACKING_CHANGED, handleCustomTrackingSettings);
    }
  }, [setCustomTrackingSettings]);

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
    let id = pet?.id;
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
      customTrackingSettings: customTrackingSettings,
    });
  };

  const deletePet = async () => {
    if (!pet) {
      return;
    }
    const notificationId = getNotificationId(pet.id);
    await notifee.cancelAllNotifications([
      'eu.sboo.ralph.reminder',
      notificationId,
    ]);
    onSubmit({ delete: true });
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

  const enableReminders = async (petId: string) => {
    const hasPermissions = await checkPermissions();
    if (hasPermissions) {
      try {
        await createTriggerNotification(petId, petName, reminderTime, assessmentFrequency);
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
        { text: t('buttons:cancel') },
        { text: t('buttons:settings'), onPress: openPermissionSettings },
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

  const cancelReminders = async (petId: string | undefined) => {
    if (!petId) return;
    
    await notifee.cancelAllNotifications([
      'eu.sboo.ralph.reminder',
      getNotificationId(petId),
    ]);
  };

  // Toggle reminders
  const toggleReminders = async (petId: string | undefined) => {
    if (!petId) return false;
    
    await cancelReminders(petId);
    let enabled = remindersEnabled;
    if (enabled) {
      enabled = await enableReminders(petId);
    }
    return enabled;
  };

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollViewContent}
        showsVerticalScrollIndicator={true}
      >
        {isWelcomeScreen ? (
          <Text variant="titleLarge" style={{ ...styles.welcomeText, marginTop: welcomeTextTopMargin }}>
            {t('welcome_text')}
          </Text>
        ) : null}
        <View style={styles.inputContainer}>
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
                size={30}
                onPress={() => setPetType('dog')}
              />
              <IconButton
                selected={petType === 'cat'}
                mode="contained"
                icon="cat"
                accessibilityLabel={t('buttons:cat')}
                size={30}
                onPress={() => setPetType('cat')}
              />
              <IconButton
                selected={petType === 'other'}
                mode="contained"
                icon="google-downasaur"
                accessibilityLabel={t('buttons:other')}
                size={30}
                onPress={() => setPetType('other')}
              />
            </View>
          </View>
          <TextInput
            label={t('settings:petNameInputLabel')}
            style={{ backgroundColor: theme.colors.surface, ...styles.textInput }}
            value={petName}
            onChangeText={(text: string) => setPetName(text)}
          />
          <View style={styles.inputRow}>
            <Text style={styles.inputLabel} variant="labelLarge">
              {t('settings:avatarInputLabel')}
            </Text>
            <Avatar mode={'edit'} pet={pet} onAvatarSelected={setAvatar} />
          </View>

          {/* Navigation Links */}
          <List.Section>
            <List.Item
              title={t('settings:assessments')}
              left={props => <List.Icon {...props} icon="clipboard-check-outline" />}
              right={props => <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Text variant='bodySmall'>{
                  assessmentsPaused ? t('settings:paused') :
                    assessmentFrequency == 'DAILY' ? t('settings:daily') : t('settings:weekly')
                }</Text>
                <List.Icon {...props} icon="chevron-right" />
              </View>
              }
              onPress={() => navigation.navigate('AssessmentSettings', {
                assessmentFrequency,
                assessmentsPaused,
                isExistingPet: pet ? true : false,
                customTrackingSettings
              })}
            />

            <List.Item
              title={t('settings:notifications')}
              left={props => <List.Icon {...props} icon="bell" />}
              right={props => <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Text variant='bodySmall'>{!remindersEnabled ? t('settings:off') : reminderTime.toLocaleTimeString([], {
                  hour: '2-digit',
                  minute: '2-digit',
                  hour12: hour12
                })}</Text>
                <List.Icon {...props} icon="chevron-right" />
              </View>
              }
              onPress={() => navigation.navigate('NotificationSettings', {
                notificationsEnabled: remindersEnabled,
                notificationTime: dateObjectToTimeString(reminderTime)
              })}
            />


          </List.Section>
        </View>
      </ScrollView>
      {pet && allPets.length > 1 ? (
        <List.Section>
          <List.Item
            left={props => <List.Icon {...props} icon="trash-can-outline" />}
            right={props => <List.Icon {...props} icon="chevron-right" />}
            onPress={() => setConfirmDeleteVisible(true)}
            title={t('buttons:delete_pet')}
          />
        </List.Section>
      ) : null}
      <View style={styles.buttons}>
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
              {t('delete_pet_text', { petName })}
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

// Styles remain the same
const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 20,
  },
  welcomeText: {
    marginBottom: 20,
    marginTop: 40,
  },
  scrollView: {
    flex: 1,
  },
  scrollViewContent: {
    paddingVertical: 20,
  },
  inputContainer: {
    gap: 30,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    paddingHorizontal: 20,
  },
  inputRowPet: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',

  },
  inputLabel: {
    flexShrink: 1,
    marginRight: 10,
  },
  textInput: {
    marginHorizontal: 20,
  },
  buttons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.1)',
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


const enhance = compose(
  withAllPets
)

// Export the enhanced component
export default enhance(PetItem);
