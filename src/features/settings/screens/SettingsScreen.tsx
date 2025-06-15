import { SettingsScreenNavigationProps } from '@/features/navigation/types';
import Settings from '@/features/settings/components/Settings';
import * as Application from 'expo-application';
import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { StyleSheet } from 'react-native';
import { Text, useTheme } from 'react-native-paper';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

const SettingsScreen: React.FC<SettingsScreenNavigationProps> = ({
  navigation,
}) => {
  const theme = useTheme();
  const insets = useSafeAreaInsets();

  return (
    <SafeAreaView
      edges={['bottom', 'left', 'right']}
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
        <Settings onSettingsSaved={() => navigation.goBack()} />
      </LinearGradient>
      <Text style={{...styles.versionInfo, bottom: insets.bottom}} variant={'labelSmall'}>
        v{Application.nativeApplicationVersion} ({Application.nativeBuildVersion})
      </Text>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradient: {
    flex: 1,
    justifyContent: 'flex-start',
    alignItems: 'stretch',
  },
  versionInfo: {
    position: 'absolute',
    left: 0,
    width: '100%',
    textAlign: 'center',
    color: '#afafaf',
  },
});

export default SettingsScreen;
