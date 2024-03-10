import React from 'react';
import {SafeAreaView, StyleSheet} from 'react-native';
import {Text, useTheme} from 'react-native-paper';
import {WelcomeScreenNavigationProps} from '@/features/navigation/types.tsx';
import {useTranslation} from 'react-i18next';
import Settings from '@/features/settings/components/Settings.tsx';
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
        <Text variant="headlineLarge">{t('welcome')}</Text>
        <Settings onSettingsSaved={onSettingsSaved} />
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

export default WelcomeScreen;
