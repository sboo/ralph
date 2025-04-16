import { createNativeStackNavigator } from '@react-navigation/native-stack';
import React from 'react';
import { useTranslation } from 'react-i18next';
import {
  createAssessmentTitle,
  createDefaultScreenOptions,
  createHeaderOptions,
  createHomeHeaderOptions,
  createNoHeaderOptions
} from './navigationOptions';
import { RootStackParamList } from './routes';

// Screen imports
import { Pet } from '@/app/database/models/Pet';
import AddAssessment from '@/features/assessments/screens/AddAssessment';
import AllAssessmentsScreen from '@/features/assessments/screens/AllAssessmentsScreen';
import AllNotesScreen from '@/features/assessments/screens/AllNotesScreen';
import EditAssessment from '@/features/assessments/screens/EditAssessment';
import DebugScreen from '@/features/debug/screens/DebugScreen';
import HomeScreen from '@/features/home/screens/HomeScreen';
import MigrationScreen from '@/features/home/screens/MigrationScreen';
import OnboardingScreen from '@/features/home/screens/OnboardingScreen';
import WelcomeScreen from '@/features/home/screens/WelcomeScreen';
import AddPet from '@/features/pets/screens/AddPet';
import AssessmentSettings from '@/features/pets/screens/AssessmentSettings';
import CustomTrackingSettingsScreen from '@/features/pets/screens/CustomTrackingSettingsScreen';
import EditPet from '@/features/pets/screens/EditPet';
import NotificationSettings from '@/features/pets/screens/NotificationSettings';
import SettingsScreen from '@/features/settings/screens/SettingsScreen';

// Initialize Stack Navigator
const Stack = createNativeStackNavigator<RootStackParamList>();

interface AppNavigatorProps {
  headerColor: string;
  theme: any;
  activePet?: Pet;
}

/**
 * Main application navigator component that defines all screens and their options
 */
export const AppNavigator: React.FC<AppNavigatorProps> = ({ 
  headerColor, 
  theme,
  activePet 
}) => {
  const { t } = useTranslation();

  return (
    <Stack.Navigator
      initialRouteName="Home"
      screenOptions={createDefaultScreenOptions()}>
      <Stack.Screen
        name="Migration"
        component={MigrationScreen}
        options={createNoHeaderOptions()}
      />
      <Stack.Screen
        name="Home"
        component={HomeScreen}
        options={createHomeHeaderOptions(headerColor)}
      />
      <Stack.Screen
        name="Welcome"
        component={WelcomeScreen}
        options={createNoHeaderOptions()}
      />
      <Stack.Screen
        name="Onboarding"
        component={OnboardingScreen}
        options={createNoHeaderOptions()}
      />
      <Stack.Screen
        name="Settings"
        component={SettingsScreen}
        options={createHeaderOptions(t('settings'), theme.colors.primaryContainer)}
      />
      <Stack.Screen
        name="EditPet"
        component={EditPet}
        options={createHeaderOptions(t('edit_pet'), theme.colors.primaryContainer)}
      />
      <Stack.Screen
        name="AddPet"
        component={AddPet}
        options={createHeaderOptions(t('add_pet'), theme.colors.primaryContainer)}
      />
      <Stack.Screen
        name="AssessmentSettings"
        component={AssessmentSettings}
        options={createHeaderOptions(t('settings:assessments'), theme.colors.primaryContainer)}
      />
      <Stack.Screen
        name="NotificationSettings"
        component={NotificationSettings}
        options={createHeaderOptions(t('settings:notifications'), theme.colors.primaryContainer)}
      />
      <Stack.Screen
        name="CustomTrackingSettings"
        component={CustomTrackingSettingsScreen}
        options={createHeaderOptions(t('settings:customTracking'), theme.colors.primaryContainer)}
      />
      <Stack.Screen
        name="AddAssessment"
        component={AddAssessment}
        options={createHeaderOptions(
          createAssessmentTitle(t('measurements:title'), activePet?.name), 
          theme.colors.primaryContainer
        )}
      />
      <Stack.Screen
        name="EditAssessment"
        component={EditAssessment}
        options={createHeaderOptions(
          createAssessmentTitle(t('measurements:title'), activePet?.name),
          theme.colors.primaryContainer
        )}
      />
      <Stack.Screen
        name="AllNotes"
        component={AllNotesScreen}
        options={createHeaderOptions(t('measurements:notes'), theme.colors.primaryContainer)}
      />
      <Stack.Screen
        name="AllAssessments"
        component={AllAssessmentsScreen}
        options={createHeaderOptions(t('measurements:allAssessments'), theme.colors.primaryContainer)}
      />
      <Stack.Screen 
        name="DebugScreen" 
        component={DebugScreen} 
      />
    </Stack.Navigator>
  );
};

export default AppNavigator;