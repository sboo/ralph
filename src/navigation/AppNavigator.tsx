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
import AddAssessment from '@/app/screens/AddAssessment';
import AddPet from '@/app/screens/AddPet';
import AllAssessmentsScreen from '@/app/screens/AllAssessmentsScreen';
import AllNotesScreen from '@/app/screens/AllNotesScreen';
import AssessmentSettings from '@/app/screens/AssessmentSettings';
import CustomTrackingSettingsScreen from '@/app/screens/CustomTrackingSettingsScreen';
import DebugScreen from '@/app/screens/DebugScreen';
import EditAssessment from '@/app/screens/EditAssessment';
import EditPet from '@/app/screens/EditPet';
import HomeScreen from '@/app/screens/HomeScreen';
import MigrationScreen from '@/app/screens/MigrationScreen';
import NotificationSettings from '@/app/screens/NotificationSettings';
import OnboardingScreen from '@/app/screens/OnboardingScreen';
import SettingsScreen from '@/app/screens/SettingsScreen';
import WelcomeScreen from '@/app/screens/WelcomeScreen';

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