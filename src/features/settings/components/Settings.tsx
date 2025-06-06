import { AVAILABLE_LANGUAGES } from '@/core/localization/i18n';
import { STORAGE_KEYS } from '@/core/store/storageKeys';
import { Appearance, useAppearance } from '@/core/themes';
import { ANDROID_APP_ID, IOS_APP_ID } from '@/shared/constants';
import AsyncStorage from '@react-native-async-storage/async-storage';
import i18next from 'i18next';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Linking, Platform, StyleSheet, View } from 'react-native';
import { Button, Divider, Icon, IconButton, Switch, Text } from 'react-native-paper';

interface SettingsProps {
  onSettingsSaved: () => void;
}

const Settings: React.FC<SettingsProps> = ({ onSettingsSaved }) => {
  const { t } = useTranslation();

  const [useRatingButtons, setUseRatingButtons] = useState(false);

  useEffect(() => {
    const getUseRatingButtons = async () => {
      const useRatingButtons = await AsyncStorage.getItem(STORAGE_KEYS.USE_RATING_BUTTONS);
      setUseRatingButtons(useRatingButtons === 'true');
    }
    getUseRatingButtons();
  }, []);

  const APP_STORE_LINK = `itms-apps://apps.apple.com/app/id${IOS_APP_ID}?action=write-review`;
  const PLAY_STORE_LINK = `market://details?id=${ANDROID_APP_ID}`;

  const STORE_LINK = Platform.select({
    ios: APP_STORE_LINK,
    android: PLAY_STORE_LINK,
  });

  const openReviewInStore = () => Linking.openURL(STORE_LINK!);

  const { appearance, changeAppearance } = useAppearance();
  
  const handleThemeChange = async (newTheme: Appearance) => {
    await changeAppearance(newTheme);
  };

  const handleRatingButtonsChange = async(value: boolean) => {
    setUseRatingButtons(value);
    await AsyncStorage.setItem(STORAGE_KEYS.USE_RATING_BUTTONS, value.toString());
  }

  const onDone = async () => {
    onSettingsSaved();
  };

  return (
    <View style={styles.container}>
      <View style={styles.profileInput}>
        <View style={styles.inputRow}>
          <Text style={styles.inputLabel} variant="labelLarge">
            {t('settings:appearance')}
          </Text>
          <View>
            <View style={styles.inputColorMode}>
              <IconButton selected={appearance === 'light'} mode={'contained'} icon={'white-balance-sunny'} onPress={() => { handleThemeChange('light') }} />
              <IconButton selected={appearance === 'dark'} mode={'contained'} icon={'weather-night'} onPress={() => { handleThemeChange('dark') }} />
              <IconButton selected={appearance === 'system'} mode={'contained'} icon={'theme-light-dark'} onPress={() => { handleThemeChange('system') }} />
            </View>
          </View>
        </View>
        <Divider style={styles.divider} bold={true} />
        <View style={styles.inputRowLanguage}>
          <Icon source={'earth'} size={30} />
          <View style={styles.inputLanguage}>
            {AVAILABLE_LANGUAGES.map(lang => (
              <Button
                key={lang.langCode}
                icon={'chevron-right'}
                contentStyle={{ flexDirection: 'row-reverse' }}
                onPress={() => {
                  i18next.changeLanguage(lang.langCode);
                }}
                accessibilityLabel={'lang'}>
                {lang.name}
              </Button>
            ))}
          </View>
        </View>
        <Divider style={styles.divider} bold={true} />
        <View style={styles.inputRow}>
          <Text style={styles.inputLabel} variant="labelLarge">
            {t('settings:useRatingButtons')}
          </Text>
          <Switch
            value={useRatingButtons}
            onValueChange={handleRatingButtonsChange}
          />
        </View>
     
        
        <Divider style={styles.divider} bold={true} />
        <View style={styles.inputRowReview}>
          <Text>{t('settings:app_useful')}</Text>
          <Button onPress={openReviewInStore} icon={'star'} mode={'outlined'}>
            {t('settings:review_app')}
          </Button>
        </View>
      </View>
      <View style={styles.buttons}>
        <Button onPress={onDone} mode={'contained'}>
          {t('buttons:done')}
        </Button>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 40,
    justifyContent: 'flex-start',
    alignItems: 'stretch',
  },
  divider: {
    width: '100%',
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
    height: 50,
  },
  inputRowReview: {
    flexDirection: 'column',
    alignItems: 'flex-end',
    alignSelf: 'stretch',
    gap: 15,
    justifyContent: 'space-between',
  },
  inputColorMode: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'stretch',
    justifyContent: 'flex-end',
  },
  inputRowLanguage: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    alignSelf: 'stretch',
    justifyContent: 'space-between',
  },
  inputLanguage: {
    flexDirection: 'column',
    alignItems: 'flex-end',
    alignSelf: 'stretch',
    justifyContent: 'flex-end',
  },
  inputLabel: {
    flexShrink: 1,
    marginRight: 10,
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
