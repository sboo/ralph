import React, {useEffect, useState} from 'react';
import {View, StyleSheet} from 'react-native';
import {
  Text,
  TextInput,
  Button,
  useTheme,
  Avatar,
  Switch,
  IconButton,
} from 'react-native-paper';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {STORAGE_KEYS} from '../support/storageKeys';
import {EVENT_NAMES, event} from '../features/event';
import {useTranslation} from 'react-i18next';
import {launchImageLibrary, type MediaType} from 'react-native-image-picker';
import notifee, {AuthorizationStatus} from '@notifee/react-native';
import {
  initBackgroundFetch,
  stopBackgroundTasks,
  scheduleReminderTask,
} from '../backgroundTasks';
import AvatarPicker from "@/support/components/AvatarPicker.tsx";

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
          <Text variant="labelLarge">{t('settings:petTypeInputLabel')}</Text>
          <View style={styles.inputRowPet}>
            <IconButton
              selected={petType === 'dog'}
              mode="contained"
              icon="dog"
              accessibilityLabel={t('buttons:dog')}
              size={40}
              onPress={() => setPetType('dog')}
            />
            <IconButton
              selected={petType === 'cat'}
              mode="contained"
              icon="cat"
              accessibilityLabel={t('buttons:cat')}
              size={40}
              onPress={() => setPetType('cat')}
            />
            <IconButton
              selected={petType === 'other'}
              mode="contained"
              icon="google-downasaur"
              accessibilityLabel={t('buttons:other')}
              size={40}
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
  },
  inputRowPet: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'stretch',
    justifyContent: 'flex-end',
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
