import { SettingsScreenNavigationProps } from '@/features/navigation/types';
import Settings from '@/features/settings/components/Settings';
import { GradientBackground } from '@/shared/components/gradient-background';
import * as Application from 'expo-application';
import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Text, useTheme } from 'react-native-paper';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

const SettingsScreen: React.FC<SettingsScreenNavigationProps> = ({
  navigation,
}) => {
  const theme = useTheme();
  const insets = useSafeAreaInsets();

  return (
    <GradientBackground>
    <SafeAreaView
      edges={['bottom', 'left', 'right']}
      style={{
        ...styles.container,
      }}>
      <View
        style={styles.gradient}>
        <Settings onSettingsSaved={() => navigation.goBack()} />
      </View>
      <Text style={{...styles.versionInfo, bottom: insets.bottom}} variant={'labelSmall'}>
        v{Application.nativeApplicationVersion} ({Application.nativeBuildVersion})
      </Text>
    </SafeAreaView>
    </GradientBackground>
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
