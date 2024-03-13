import React, {useEffect, useState} from 'react';
import {StyleSheet, View} from 'react-native';
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
import notifee, {AuthorizationStatus} from '@notifee/react-native';
import {
  initBackgroundFetch,
  scheduleReminderTask,
  stopBackgroundTasks,
} from '@/features/backgroundTasks';
import AvatarPicker from '@/features/avatar/components/AvatarPicker.tsx';
import {AVAILABLE_LANGUAGES} from '@/app/localization/i18n';
import CountryFlag from 'react-native-country-flag';
import i18next from 'i18next';

interface WelcomeScreenNavigationProps {
  onSettingsSaved: () => void;
  buttonLabel?: string;
}

const Settings: React.FC<WelcomeScreenNavigationProps> = ({
  onSettingsSaved,
  buttonLabel,
}) => {
  const {t} = useTranslation();
  const theme = useTheme();
  const [petType, setPetType] = useState<string>('');
  const [petName, setPetName] = useState<string>('');
  const [remindersEnabled, setRemindersEnabled] = useState<boolean>(false);

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
    };
    checkPermissions();
  }, []);

  // Store pet name and type in storage
  const storePetInfo = async () => {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.PET_NAME, petName);
      await AsyncStorage.setItem(STORAGE_KEYS.PET_TYPE, petType);

      event.emit(EVENT_NAMES.PROFILE_SET, petName);
      // Navigate to the next screen after successful storage
      onSettingsSaved();
    } catch (error) {
      // Error saving data
      console.log(error);
    }
  };

  // Toggle reminders
  const toggleReminders = async () => {
    let enabled = !remindersEnabled;

    if (enabled) {
      const settings = await notifee.requestPermission();
      if (settings.authorizationStatus !== AuthorizationStatus.AUTHORIZED) {
        enabled = false;
      }
    }

    if (enabled) {
      initBackgroundFetch();
      const x = await scheduleReminderTask();
      console.log('Scheduled reminder task', x);
      // startBackgroundTasks();
    } else {
      stopBackgroundTasks();
    }

    try {
      await AsyncStorage.setItem(
        STORAGE_KEYS.NOTIFICATIONS_ENABLED,
        enabled.toString(),
      );
      setRemindersEnabled(enabled);
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
          <Switch value={remindersEnabled} onValueChange={toggleReminders} />
        </View>
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
        <Button onPress={storePetInfo} mode={'contained'}>
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
