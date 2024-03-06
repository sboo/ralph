import React from 'react';
import {View, StyleSheet} from 'react-native';
import {useTheme} from 'react-native-paper';
import {SettingsScreenNavigationProps} from '../navigation/types';
import {useTranslation} from 'react-i18next';
import Settings from '../../components/Settings';

const SettingsScreen: React.FC<SettingsScreenNavigationProps> = ({
  navigation,
}) => {
  const {t} = useTranslation();
  const theme = useTheme();

  return (
    <View
      style={{
        backgroundColor: theme.colors.primaryContainer,
        ...styles.container,
      }}>
      <Settings
        onSettingsSaved={() => navigation.navigate('Home')}
        buttonLabel={t('buttons:save')}
      />
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
});

export default SettingsScreen;
