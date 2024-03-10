import React, {useEffect, useState} from 'react';
import {launchImageLibrary, MediaType} from 'react-native-image-picker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {STORAGE_KEYS} from '@/support/storageKeys.ts';
import {event, EVENT_NAMES} from '@/features/event';
import {Avatar} from 'react-native-paper';
import {StyleSheet} from 'react-native';

const AvatarPicker: React.FC = () => {
  const [avatar, setAvatar] = useState<string>();
  const openImagePicker = () => {
    const options = {
      mediaType: 'photo' as MediaType,
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

  return (
    <Avatar.Image
      size={65}
      style={styles.avatar}
      source={avatar ? {uri: avatar} : require('@/app/assets/camera.png')}
      onTouchStart={openImagePicker}
    />
  );
};

const styles = StyleSheet.create({
  avatar: {
    backgroundColor: '#ffffff',
  },
});

export default AvatarPicker;
