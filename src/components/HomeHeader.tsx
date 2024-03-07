import React, {useEffect, useState} from 'react';
import {useTranslation} from 'react-i18next';
import {StyleSheet, View} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {STORAGE_KEYS} from '../support/storageKeys';
import {Text, Avatar} from 'react-native-paper';
import {useTheme} from 'react-native-paper';
import {launchImageLibrary} from 'react-native-image-picker';
import {EVENT_NAMES, event} from '../app/event';

interface HomeHeaderPros {
  petName: string;
}

const HomeHeader: React.FC<HomeHeaderPros> = ({petName}) => {
  const {t} = useTranslation();
  const theme = useTheme();
  const [avatar, setAvatar] = useState<string>();

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

  useEffect(() => {
    const fetchAvatar = async () => {
      const uri = await AsyncStorage.getItem(STORAGE_KEYS.AVATAR);
      if (uri !== null) {
        console.log(typeof uri, uri);
        setAvatar(uri);
      }
    };
    fetchAvatar();

    const onProfileSet = () => {
      fetchAvatar();
    };

    event.on(EVENT_NAMES.PROFILE_SET, onProfileSet);

    return () => {
      event.off(EVENT_NAMES.PROFILE_SET, onProfileSet);
    };
  }, []);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) {
      return t('greeting_morning');
    }
    if (hour < 18) {
      return t('greeting_afternoon');
    }
    return t('greeting_evening');
  };

  return (
    <View
      style={{
        backgroundColor: theme.colors.primary,
        ...styles.container,
      }}>
      <View style={styles.greetingsContainer}>
        <Text style={{color: theme.colors.onPrimary, ...styles.greeting}}>
          {getGreeting()}
        </Text>
        <Text style={{color: theme.colors.onPrimary, ...styles.petName}}>
          {petName}
        </Text>
      </View>
      <Avatar.Image
        size={65}
        style={styles.avatar}
        source={avatar ? {uri: avatar} : require('../assets/camera.png')}
        onTouchStart={openImagePicker}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    height: 150,
    padding: 20,
    borderBottomStartRadius: 20,
    borderBottomEndRadius: 20,
  },
  greetingsContainer: {
    flexDirection: 'column',
    justifyContent: 'flex-start',
    alignItems: 'flex-start',
  },
  greeting: {
    fontSize: 14,
  },
  petName: {
    fontSize: 22,
    fontWeight: 'bold',
  },
  avatar: {
    backgroundColor: 'white',
  }
});

export default HomeHeader;
