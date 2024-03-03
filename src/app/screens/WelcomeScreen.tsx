import React, {useState} from 'react';
import {View, StyleSheet} from 'react-native';
import {Text, TextInput, Button, useTheme, Avatar} from 'react-native-paper';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {STORAGE_KEYS} from '../../support/storageKeys';
import {EVENT_NAMES, event} from '../event';
import {WelcomeScreenNavigationProps} from '../navigation/types';
import {useTranslation} from 'react-i18next';
import {launchImageLibrary} from 'react-native-image-picker';

const WelcomeScreen: React.FC<WelcomeScreenNavigationProps> = ({
  navigation,
}) => {
  const {t} = useTranslation();
  const theme = useTheme();
  const [petName, setPetName] = useState<string>('');
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

  const storeDogInfo = async () => {
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
        <Button onPress={storeDogInfo} mode={'contained'}>
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
