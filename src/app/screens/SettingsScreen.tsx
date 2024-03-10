import React from 'react';
import {SafeAreaView, StyleSheet} from 'react-native';
import {useTheme} from 'react-native-paper';
import {SettingsScreenNavigationProps} from '../navigation/types';
import {useTranslation} from 'react-i18next';
import Settings from '../../components/Settings';
import LinearGradient from 'react-native-linear-gradient';

const SettingsScreen: React.FC<SettingsScreenNavigationProps> = ({
  navigation,
}) => {
  const {t} = useTranslation();
  const theme = useTheme();

  return (
    <SafeAreaView
      style={{
        backgroundColor: theme.colors.primaryContainer,
        ...styles.container,
      }}>
      <LinearGradient
        colors={[
          theme.colors.primaryContainer,
          theme.colors.background,
          theme.colors.primaryContainer,
        ]}
        locations={[0, 0.75, 1]}
        style={styles.gradient}>
        <Settings
          onSettingsSaved={() => navigation.navigate('Home')}
          buttonLabel={t('buttons:save')}
        />
      </LinearGradient>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradient: {
    flex: 1,
    padding: 20,
    justifyContent: 'flex-start',
    alignItems: 'stretch',
  },
});

export default SettingsScreen;
