import React, {useEffect, useState} from 'react';
import ImagePicker from 'react-native-image-crop-picker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {STORAGE_KEYS} from '@/app/store/storageKeys.ts';
import {event, EVENT_NAMES} from '@/features/events';
import {Avatar} from 'react-native-paper';
import {StyleSheet} from 'react-native';

const AvatarPicker: React.FC = () => {
  const [avatar, setAvatar] = useState<string>();
  const openImagePicker = () => {
    ImagePicker.openPicker({
      width: 300,
      height: 300,
      mediaType: 'photo',
      cropping: true,
      cropperCircleOverlay: true,
    }).then(image => {
      console.log(image);
      storeAvatar(image.path).then(() => {
        setAvatar(image.path);
      });
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
      console.log('Avatar URI: ', uri);
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
