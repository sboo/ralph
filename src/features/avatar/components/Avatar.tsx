import { Pet } from '@/core/database/models/Pet'; // Updated import from WatermelonDB models
import { getImagePath } from '@/shared/helpers/ImageHelper';
import * as RNFS from '@dr.pogodin/react-native-fs';
import React, { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import ImagePicker, { Image } from 'react-native-image-crop-picker';
import { Badge, Avatar as BaseAvatar, useTheme } from 'react-native-paper';

interface AvatarProps {
  mode?: 'edit' | 'view';
  size?: 'big' | 'small';
  pet?: Pet;
  onAvatarSelected?: (avatar: string | undefined) => void;
  onAvatarViewModeTouch?: (petId: string | undefined) => void; // Changed from BSON.ObjectID to string
}

const Avatar: React.FC<AvatarProps> = ({
  pet,
  mode = 'view',
  size = 'big',
  onAvatarSelected,
  onAvatarViewModeTouch,
}) => {
  const theme = useTheme();
  const [avatar, setAvatar] = useState<string>();

  const onAvatarClick = () => {
    if (mode === 'edit') {
      openImagePicker();
    } else {
      if (onAvatarViewModeTouch) {
        onAvatarViewModeTouch(pet?.id); // Using id instead of _id
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
    })
      .then(image => {
        storeAvatar(image).then(avatarFilename => {
          if (avatarFilename === undefined) {
            return;
          }
          setAvatar(getImagePath(avatarFilename, true));
        });
      })
      .catch(err => {
        console.log('Error while picking image: ', err);
      });
  };

  const deleteAvatar = async () => {
    if (avatar === undefined) {
      return;
    }
    const exists = await RNFS.exists(avatar);
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
    const path = getImagePath(filename);

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
      setAvatar(getImagePath(pet.avatar, true));
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
          size={size === 'big' ? 55 : 35}
          color={theme.colors.outlineVariant}
          style={size === 'big' ? styles.pauseAvatar : styles.pauseAvatarSmall}
          icon={'pause-circle'}
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
  pauseAvatarSmall: {
    backgroundColor: 'transparent',
    position: 'absolute',
    right: -15,
    bottom: -15,
  },
  pauseAvatar: {
    backgroundColor: 'transparent',
    position: 'absolute',
    right: -20,
    bottom: -20,
  },
  notificationDot: {
    position: 'absolute',
    right: -2,
    top: -2,
  },
});

export default Avatar;
