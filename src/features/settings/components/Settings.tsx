import React, {useEffect, useState} from 'react';
import {Alert, Linking, Platform, StyleSheet, View} from 'react-native';
import {
  Button,
  Icon,
  IconButton,
  Switch,
  Text,
  TextInput,
  useTheme,
} from 'react-native-paper';
import {useTranslation} from 'react-i18next';
import notifee, {
  AuthorizationStatus,
  RepeatFrequency,
  TimestampTrigger,
  TriggerType,
} from '@notifee/react-native';
import Avatar from '@/features/avatar/components/Avatar';
import {AVAILABLE_LANGUAGES} from '@/app/localization/i18n';
import CountryFlag from 'react-native-country-flag';
import i18next from 'i18next';
import moment from 'moment';
import DatePicker from 'react-native-date-picker';
import {
  dateObjectToTimeString,
  timeToDateObject,
} from '@/support/helpers/DateTimeHelpers';
import usePet from '@/features/pets/hooks/usePet';

interface SettingsProps {
  onSettingsSaved: () => void;
  buttonLabel?: string;
}

const Settings: React.FC<SettingsProps> = ({onSettingsSaved, buttonLabel}) => {
  const {t} = useTranslation();

  // Store pet name and type in storage
  const storeSettings = async () => {
    // Navigate to the next screen after successful storage
    onSettingsSaved();
  };

  return (
    <View style={styles.container}>
      <View style={styles.profileInput}>
        <View style={styles.inputRow}>
          <Icon source={'earth'} size={30} />
          <View style={styles.inputFlags}>
            {AVAILABLE_LANGUAGES.map(lang => (
              <IconButton
                key={lang.langCode}
                // eslint-disable-next-line react/no-unstable-nested-components
                icon={() => <CountryFlag isoCode={lang.isoCode} size={32} />}
                onPress={() => {
                  i18next.changeLanguage(lang.langCode);
                }}
                accessibilityLabel={'lang'}
                size={15}
                mode={'contained'}
              />
            ))}
          </View>
        </View>
      </View>
      <View style={styles.buttons}>
        <Button onPress={storeSettings} mode={'contained'}>
          {buttonLabel ?? t('buttons:continue')}
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
    alignItems: 'stretch',
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
  inputRowPet: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'stretch',
    justifyContent: 'flex-end',
  },
  inputFlags: {
    flexDirection: 'row',
    alignItems: 'center',
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
