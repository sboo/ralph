import React, {useEffect, useState} from 'react';
import ImagePicker, {Image} from 'react-native-image-crop-picker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {STORAGE_KEYS} from '@/app/store/storageKeys.ts';
import {event, EVENT_NAMES} from '@/features/events';
import {Avatar} from 'react-native-paper';
import {StyleSheet} from 'react-native';
import RNFS from 'react-native-fs';
import { get } from 'react-native/Libraries/TurboModule/TurboModuleRegistry';

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
      storeAvatar(image).then(avatarPath => {
        console.log('Avatar path: ', avatarPath);
        if (avatarPath === undefined) {
          return;
        }
        setAvatar(avatarPath);
      });
    });
  };

  const getAvatarPath = (filename: string): string => {
    return `${RNFS.DocumentDirectoryPath}/${filename}`;
  };

  const deleteAvatar = async () => {
    if (avatar === undefined) {
      return;
    }
    const path = getAvatarPath(avatar);
    const exists = await RNFS.exists(path);
    if (exists) {
      await RNFS.unlink(path);
    }
    await AsyncStorage.removeItem(STORAGE_KEYS.AVATAR);
    setAvatar(undefined);
  };

  const storeAvatar = async (image: Image): Promise<string | undefined> => {
    let extension = '';
    switch (image.mime) {
      case 'image/png':
        extension = 'png';
        break;
      case 'image/jpeg':
        extension = 'jpg';
        break;
      default:
        console.error('Unsupported image type');
        return;
    }
    deleteAvatar();

    const filename = `avatar_${Date.now()}.${extension}`;
    const path = getAvatarPath(filename);

    try {
      await RNFS.moveFile(image.path, path);
      await AsyncStorage.setItem(STORAGE_KEYS.AVATAR, filename);
    } catch (error) {
      console.error(error);
    }
    return path;
  };

  useEffect(() => {
    const fetchAvatar = async () => {
      const fileName = await AsyncStorage.getItem(STORAGE_KEYS.AVATAR);
      console.log('Avatar fileName: ', fileName);
      if (fileName !== null) {
        setAvatar(getAvatarPath(fileName));
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
