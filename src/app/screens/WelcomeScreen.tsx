import React, {useEffect, useState} from 'react';
import {View, StyleSheet} from 'react-native';
import {
  Text,
  TextInput,
  Button,
  useTheme,
  Avatar,
  Switch,
} from 'react-native-paper';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {STORAGE_KEYS} from '../../support/storageKeys';
import {EVENT_NAMES, event} from '../event';
import {WelcomeScreenNavigationProps} from '../navigation/types';
import {useTranslation} from 'react-i18next';
import {launchImageLibrary} from 'react-native-image-picker';
import notifee, {AuthorizationStatus} from '@notifee/react-native';
import BackgroundFetch from 'react-native-background-fetch';
import {
  initBackgroundFetch,
  startBackgroundTasks,
  stopBackgroundTasks,
  scheduleReminderTask,
  TASK_IDS,
} from '../../backgroundTasks';

const WelcomeScreen: React.FC<WelcomeScreenNavigationProps> = ({
  navigation,
}) => {
  const {t} = useTranslation();
  const theme = useTheme();
  const [petName, setPetName] = useState<string>('');
  const [avatar, setAvatar] = useState<string>();
  const [remindersEnabled, setRemindersEnabled] = useState<boolean>(false);

  useEffect(() => {
    const fetchDogName = async () => {
      const name = await AsyncStorage.getItem(STORAGE_KEYS.PET_NAME);
      if (name !== null) {
        setPetName(name);
      }
    };
    const fetchAvatar = async () => {
      const uri = await AsyncStorage.getItem(STORAGE_KEYS.AVATAR);
      if (uri !== null) {
        console.log(typeof uri, uri);
        setAvatar(uri);
      }
    };

    fetchDogName();
    fetchAvatar();
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

  const openImagePicker = () => {
    const options = {
      mediaType: 'photo',
      includeBase64: false,
      maxHeight: 2000,
      maxWidth: 2000,
    };

    launchImageLibrary(options, response => {
      if (response.didCancel) {
        console.log('User cancelled image picker');
      } else if (response.errorMessage) {
        console.log('Image picker error: ', response.errorMessage);
      } else {
        let imageUri = response.assets?.[0]?.uri;
        console.log('Image URI: ', imageUri);
        if (imageUri !== undefined) {
          storeAvatar(imageUri).then(() => {
            setAvatar(imageUri);
          });
        }
      }
    });
  };

  const storeAvatar = async (uri: string) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.AVATAR, uri);
    } catch (error) {
      console.error(error);
    }
  };

  const storePetInfo = async () => {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.PET_NAME, petName);
      event.emit(EVENT_NAMES.PROFILE_SET, petName);
      // Navigate to the next screen after successful storage
      navigation.navigate('Home');
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
      startBackgroundTasks();
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
    <View
      style={{
        backgroundColor: theme.colors.primaryContainer,
        ...styles.container,
      }}>
      <Text variant="headlineLarge">Welcome</Text>
      <View style={styles.profileInput}>
        <Avatar.Image
          size={65}
          style={{backgroundColor: theme.colors.surface}}
          source={avatar ? {uri: avatar} : require('../../assets/camera.png')}
          onTouchStart={openImagePicker}
        />
        <TextInput
          label={t('welcome:petNameInputLabel')}
          style={{backgroundColor: theme.colors.surface, ...styles.textInput}}
          value={petName}
          onChangeText={(text: string) => setPetName(text)}
        />
        <Switch value={remindersEnabled} onValueChange={toggleReminders} />
        <Button onPress={storePetInfo} mode={'contained'}>
          {t('buttons:continue')}
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
  },
  profileInput: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 20,
  },
  textInput: {
    alignSelf: 'stretch',
  },
});

export default WelcomeScreen;
