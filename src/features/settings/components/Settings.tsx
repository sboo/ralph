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
import AsyncStorage from '@react-native-async-storage/async-storage';
import {STORAGE_KEYS} from '@/app/store/storageKeys.ts';
import {event, EVENT_NAMES} from '@/features/events';
import {useTranslation} from 'react-i18next';
import notifee, {
  AuthorizationStatus,
  RepeatFrequency,
  TimestampTrigger,
  TriggerType,
} from '@notifee/react-native';
import AvatarPicker from '@/features/avatar/components/AvatarPicker.tsx';
import {AVAILABLE_LANGUAGES} from '@/app/localization/i18n';
import CountryFlag from 'react-native-country-flag';
import i18next from 'i18next';
import moment from 'moment';
import DatePicker from 'react-native-date-picker';
import {
  dateObjectToTimeString,
  timeToDateObject,
} from '@/support/helpers/DateTimeHelpers';

interface SettingsProps {
  onSettingsSaved: () => void;
  buttonLabel?: string;
}

const Settings: React.FC<SettingsProps> = ({onSettingsSaved, buttonLabel}) => {
  const {t} = useTranslation();
  const theme = useTheme();
  const [petType, setPetType] = useState<string>('');
  const [petName, setPetName] = useState<string>('');
  const [remindersEnabled, setRemindersEnabled] = useState<boolean>(false);
  const [timePickerOpen, setTimePickerOpen] = useState(false);
  const [reminderTime, setReminderTime] = useState(new Date());

  // Load pet name and type from storage
  useEffect(() => {
    const fetchPetName = async () => {
      const name = await AsyncStorage.getItem(STORAGE_KEYS.PET_NAME);
      if (name !== null) {
        setPetName(name);
      }
    };
    const fetchPetType = async () => {
      const type = await AsyncStorage.getItem(STORAGE_KEYS.PET_TYPE);
      setPetType(type ?? '');
    };

    fetchPetName();
    fetchPetType();
  }, []);

  // Load reminders enabled from storage
  useEffect(() => {
    const checkPermissions = async () => {
      const settings = await notifee.getNotificationSettings();
      if (settings.authorizationStatus !== AuthorizationStatus.AUTHORIZED) {
        setRemindersEnabled(false);
        return;
      }
      const enabled = await AsyncStorage.getItem(
        STORAGE_KEYS.NOTIFICATIONS_ENABLED,
      );
      setRemindersEnabled(enabled === 'true');

      const notificationTime =
        (await AsyncStorage.getItem(STORAGE_KEYS.NOTIFICATIONS_TIME)) ??
        '20:00';

      setReminderTime(timeToDateObject(notificationTime));
    };
    checkPermissions();
  }, []);

  // Store pet name and type in storage
  const storeSettings = async () => {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.PET_NAME, petName);
      await AsyncStorage.setItem(STORAGE_KEYS.PET_TYPE, petType);
      await toggleReminders();

      event.emit(EVENT_NAMES.PROFILE_SET, petName);
      // Navigate to the next screen after successful storage
      onSettingsSaved();
    } catch (error) {
      // Error saving data
      console.log(error);
    }
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
        id: 'eu.sboo.ralph.reminder',
        title: t('measurements:notificatationTitle'),
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
    try {
      await AsyncStorage.setItem(
        STORAGE_KEYS.NOTIFICATIONS_ENABLED,
        enabled.toString(),
      );
      await AsyncStorage.setItem(
        STORAGE_KEYS.NOTIFICATIONS_TIME,
        dateObjectToTimeString(reminderTime),
      );
    } catch (error) {
      console.error(error);
    }
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
          <Text variant="labelLarge">{t('settings:avatarInputLabel')}</Text>
          <AvatarPicker />
        </View>
        <View style={styles.inputRow}>
          <Text variant="labelLarge">
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
        <View style={styles.inputRow}>
          <Text variant="labelLarge">{t('settings:selectLanguageLabel')}</Text>
          <View style={styles.inputFlags}>
            {AVAILABLE_LANGUAGES.map(lang => (
              <IconButton
                key={lang.langCode}
                // eslint-disable-next-line react/no-unstable-nested-components
                icon={() => <CountryFlag isoCode={lang.isoCode} size={36} />}
                onPress={() => {
                  i18next.changeLanguage(lang.langCode);
                }}
                accessibilityLabel={'lang'}
                size={20}
                mode={'contained'}
              />
            ))}
          </View>
        </View>
      </View>
      <View style={styles.buttons}>
        <Button onPress={storeSettings} mode={'contained'}>
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
