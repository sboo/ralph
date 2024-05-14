import React, {useEffect, useState} from 'react';
import ImagePicker, {Image} from 'react-native-image-crop-picker';
import {Badge, Avatar as BaseAvatar} from 'react-native-paper';
import {Platform, StyleSheet, View} from 'react-native';
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

  const getAvatar = () => {
    if (avatar) {
      return (
        <View style={styles.avatarHolder}>
          <BaseAvatar.Image
            size={size === 'big' ? 65 : 35}
            style={styles.avatar}
            source={{uri: avatar}}
            onTouchStart={onAvatarClick}
          />
          {mode === 'edit' ? (
            <BaseAvatar.Icon
              size={25}
              style={styles.editAvatar}
              icon="camera"
              onTouchStart={onAvatarClick}
            />
          ) : null}
        </View>
      );
    }
    if (mode === 'edit') {
      return (
        <BaseAvatar.Icon
          size={size === 'big' ? 65 : 35}
          style={styles.avatar}
          icon="camera"
          onTouchStart={onAvatarClick}
        />
      );
    }
    switch (pet?.species) {
      case 'dog':
        return (
          <BaseAvatar.Icon
            size={size === 'big' ? 65 : 35}
            style={styles.avatar}
            icon="dog"
            onTouchStart={onAvatarClick}
          />
        );
      case 'cat':
        return (
          <BaseAvatar.Icon
            size={size === 'big' ? 65 : 35}
            style={styles.avatar}
            icon="cat"
            onTouchStart={onAvatarClick}
          />
        );
      default:
        return (
          <BaseAvatar.Icon
            size={size === 'big' ? 65 : 35}
            style={styles.avatar}
            icon="google-downasaur"
            onTouchStart={onAvatarClick}
          />
        );
    }
  };

  return (
    <View style={styles.avatarHolder}>
      {getAvatar()}
      {mode === 'view' &&
      pet?.showNotificationDot === true &&
      !pet?.isActive ? (
        <Badge style={styles.notificationDot} size={10} />
      ) : null}
      {mode === 'view' && pet?.pausedAt ? (
        <BaseAvatar.Icon
          size={size === 'big' ? 65 : 35}
          style={styles.pauseAvatar}
          icon="pause-circle-outline"
          onTouchStart={onAvatarClick}
        />
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  avatarHolder: {
    position: 'relative',
  },
  avatar: {
    backgroundColor: '#ffffff',
  },
  editAvatar: {
    backgroundColor: '#ffffff',
    position: 'absolute',
    right: -5,
    bottom: -5,
  },
  pauseAvatar: {
    position: 'absolute',
    opacity: 0.5,
    top: 0,
    left: 0,
  },
  notificationDot: {
    position: 'absolute',
    right: -2,
    top: -2,
  },
});

export default Avatar;
