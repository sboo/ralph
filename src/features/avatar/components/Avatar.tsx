import React, {useEffect, useState} from 'react';
import ImagePicker, {Image} from 'react-native-image-crop-picker';
import {Avatar as BaseAvatar} from 'react-native-paper';
import {Platform, StyleSheet} from 'react-native';
import * as RNFS from '@dr.pogodin/react-native-fs';
import {Pet} from '@/app/models/Pet';
import {BSON} from 'realm';

interface AvatarProps {
  mode?: 'edit' | 'view';
  size?: 'big' | 'small';
  pet?: Pet;
  onAvatarSelected?: (avatar: string | undefined) => void;
  onAvatarViewModeTouch?: (petId: BSON.ObjectID | undefined) => void;
}

const Avatar: React.FC<AvatarProps> = ({
  pet,
  mode = 'view',
  size = 'big',
  onAvatarSelected,
  onAvatarViewModeTouch,
}) => {
  const [avatar, setAvatar] = useState<string>();

  const onAvatarClick = () => {
    if (mode === 'edit') {
      openImagePicker();
    } else {
      if (onAvatarViewModeTouch) {
        onAvatarViewModeTouch(pet?._id);
      }
    }
  };

  const openImagePicker = () => {
    ImagePicker.openPicker({
      width: 300,
      height: 300,
      mediaType: 'photo',
      cropping: true,
      cropperCircleOverlay: true,
    }).then(image => {
      console.log(image);
      storeAvatar(image).then(avatarFilename => {
        console.log('Avatar path: ', avatarFilename);
        if (avatarFilename === undefined) {
          return;
        }
        setAvatar(getAvatarPath(avatarFilename, true));
      });
    });
  };

  const getAvatarPath = (
    filename: string,
    addAndroidFilePrepend = false,
  ): string => {
    const path = `${RNFS.DocumentDirectoryPath}/${filename}`;
    if (Platform.OS === 'android' && addAndroidFilePrepend) {
      return `file://${path}`;
    }
    return path;
  };

  const deleteAvatar = async () => {
    if (avatar === undefined) {
      return;
    }
    console.log('Avatar path: ', avatar);
    const exists = await RNFS.exists(avatar);
    console.log('Avatar exists: ', exists);
    if (exists) {
      await RNFS.unlink(avatar);
    }
    if (onAvatarSelected) {
      onAvatarSelected(undefined);
    }
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
    // await deleteAvatar();

    const filename = `avatar_${Date.now()}.${extension}`;
    const path = getAvatarPath(filename);

    try {
      await RNFS.moveFile(image.path, path);
      if (onAvatarSelected) {
        onAvatarSelected(filename);
      }
    } catch (error) {
      console.error(error);
    }
    return filename;
  };

  useEffect(() => {
    if (pet?.avatar) {
      setAvatar(getAvatarPath(pet.avatar, true));
    }
  }, [pet?.avatar]);

  return (
    <BaseAvatar.Image
      size={size === 'big' ? 65 : 35}
      style={styles.avatar}
      source={avatar ? {uri: avatar} : require('@/app/assets/camera.png')}
      onTouchStart={onAvatarClick}
    />
  );
};

const styles = StyleSheet.create({
  avatar: {
    backgroundColor: '#ffffff',
  },
});

export default Avatar;
