import React from 'react';
import { useTranslation } from 'react-i18next';
import { StyleSheet, View } from 'react-native';
import { ActivityIndicator, useTheme } from 'react-native-paper';

const MigrationScreen: React.FC = () => {
  const { t } = useTranslation();
  const theme = useTheme();
  
  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" animating={true} color={theme.colors.primary} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 20,
  },
});

export default MigrationScreen;