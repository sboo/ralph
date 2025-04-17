import { createNativeStackNavigator } from '@react-navigation/native-stack';
import React from 'react';
import { useTranslation } from 'react-i18next';
import {
    createDefaultScreenOptions,
    createHeaderOptions,
    createHomeHeaderOptions,
    createNoHeaderOptions
} from './navigationOptions';
import { RootStackParamList } from './routes';

// Import from Pet model
import { Pet } from '@core/database/models/Pet';

// Import screens from their respective feature modules
import {
    AddAssessment,
    AllAssessmentsScreen,
    AllNotesScreen,
    EditAssessment
} from '@/features/assessments';

import { DebugScreen } from '@/features/debug';

import {
    HomeScreen,
} from '@/features/home';

import {
    MigrationScreen
} from '@/features/app';

import {
    OnboardingScreen,
    WelcomeScreen
} from '@/features/onboarding';

import {
    AddPet,
    AssessmentSettings,
    CustomTrackingSettingsScreen,
    EditPet,
    NotificationSettings
} from '@/features/pets';

import { SettingsScreen } from '@/features/settings';

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
          t('measurements:title', {petName: activePet?.name}),
          theme.colors.primaryContainer
        )}
      />
      <Stack.Screen
        name="EditAssessment"
        component={EditAssessment}
        options={createHeaderOptions(
          t('measurements:title', {petName: activePet?.name}),
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