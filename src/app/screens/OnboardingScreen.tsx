import { database, Pet } from '@/app/database';
import { OnboardingScreenNavigationProps } from '@/features/navigation/types.tsx';
import PetItem from '@/features/pets/components/PetItem';
import { PetData } from '@/features/pets/helpers/helperFunctions';
import { withObservables } from '@nozbe/watermelondb/react';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { SafeAreaView, StyleSheet } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { useTheme } from 'react-native-paper';

// The presentational component
const OnboardingScreenComponent: React.FC<OnboardingScreenNavigationProps> = ({
  navigation,
}) => {
  const {t} = useTranslation();
  const theme = useTheme();

  console.log('OnboardingScreenComponent');

  const onSubmit = async (data: PetData) => {
    // Create the pet using WatermelonDB directly
    await database.write(async () => {
      await database.get<Pet>('pets').create(record => {
        record.species = data.species;
        record.name = data.name;
        if (data.avatar) record.avatar = data.avatar;
        record.notificationsEnabled = data.notificationsEnabled;
        if (data.notificationsTime) record.notificationsTime = data.notificationsTime;
        record.showNotificationDot = data.showNotificationDot || false;
        record.isActive = true; // New pet is active by default
        record.assessmentFrequency = data.assessmentFrequency;
        if (data.customTrackingSettings) {
          record.customTrackingSettings = typeof data.customTrackingSettings === 'string'
            ? data.customTrackingSettings
            : JSON.stringify(data.customTrackingSettings);
        }
      });
    });

    // After creating the pet, navigate to Home
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
       
        <PetItem onSubmit={onSubmit} navigation={navigation} isWelcomeScreen={true} buttonLabel={t('buttons:continue')} />
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
    justifyContent: 'flex-start',
    alignItems: 'stretch',
  },
});

// Connect the component with WatermelonDB observables 
const enhance = withObservables([], () => ({}));

// Export the enhanced component
export default OnboardingScreenComponent;
