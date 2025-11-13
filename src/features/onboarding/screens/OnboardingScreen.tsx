import { OnboardingScreenNavigationProps } from '@/features/navigation/types';
import PetItem from '@/features/pets/components/PetItem';
import { PetData } from '@/features/pets/helpers/helperFunctions';
import { GradientBackground } from '@/shared/components/gradient-background';
import { database, Pet } from '@core/database';
import { AssessmentFrequency } from '@core/database/models/Pet';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { StyleSheet } from 'react-native';
import { useTheme } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';


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
        record.species = data.species || 'other';
        record.name = data.name || 'New Pet';
        if (data.avatar) record.avatar = data.avatar;
        record.notificationsEnabled = data.notificationsEnabled || false;
        if (data.notificationsTime) record.notificationsTime = data.notificationsTime;
        record.showNotificationDot = false;
        record.isActive = true; // New pet is active by default
        record.assessmentFrequency = data.assessmentFrequency as AssessmentFrequency;
        if (data.customTrackingSettings) {
          record.customTrackingSettings = data.customTrackingSettings;
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
    <GradientBackground>
    <SafeAreaView
      style={{
        ...styles.container,
      }}>
       
        <PetItem onSubmit={onSubmit} navigation={navigation} isWelcomeScreen={true} buttonLabel={t('buttons:continue')} />
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
});

// Export the enhanced component
export default OnboardingScreenComponent;
