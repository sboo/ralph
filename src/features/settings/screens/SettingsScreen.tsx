import { SettingsScreenNavigationProps } from '@/features/navigation/types.tsx';
import Settings from '@/features/settings/components/Settings.tsx';
import React from 'react';
import { StyleSheet } from 'react-native';
import DeviceInfo from 'react-native-device-info';
import LinearGradient from 'react-native-linear-gradient';
import { Text, useTheme } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';

const SettingsScreen: React.FC<SettingsScreenNavigationProps> = ({
  navigation,
}) => {
  const theme = useTheme();

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
      <Text style={styles.versionInfo} variant={'labelSmall'}>
        v{DeviceInfo.getVersion()} ({DeviceInfo.getBuildNumber()})
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
    bottom: 10,
    left: 0,
    width: '100%',
    textAlign: 'center',
    color: '#afafaf',
  },
});

export default SettingsScreen;
