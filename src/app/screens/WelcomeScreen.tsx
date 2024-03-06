import React from 'react';
import {View, StyleSheet} from 'react-native';
import {Text, useTheme} from 'react-native-paper';
import {WelcomeScreenNavigationProps} from '../navigation/types';
import {useTranslation} from 'react-i18next';
import Settings from '../../components/Settings';
import LinearGradient from 'react-native-linear-gradient';

const WelcomeScreen: React.FC<WelcomeScreenNavigationProps> = ({
  navigation,
}) => {
  const {t} = useTranslation();
  const theme = useTheme();

  const onSettingsSaved = () => {
    navigation.reset({
      index: 0,
      routes: [{name: 'Home'}],
    });
  };

  return (
    <LinearGradient
      colors={[theme.colors.primaryContainer, theme.colors.background]}
      style={styles.container}>
      <Text variant="headlineLarge">{t('welcome')}</Text>
      <Settings onSettingsSaved={onSettingsSaved} />
    </LinearGradient>
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

export default WelcomeScreen;
