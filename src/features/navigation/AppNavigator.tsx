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

import { useAppearance } from '@/core/themes/hooks/useAppearance';
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
  theme,
  activePet 
}) => {
  const { t } = useTranslation();
  const { effectiveAppearance } = useAppearance();

  const headerColor = effectiveAppearance === 'dark' ? '#1a3d3d' : '#e8f9f8'

  return (
    <Stack.Navigator
      initialRouteName="Home"
      screenOptions={createDefaultScreenOptions()}>
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
        options={createHeaderOptions(t('settings'), headerColor)}
      />
      <Stack.Screen
        name="EditPet"
        component={EditPet}
        options={createHeaderOptions(t('edit_pet'), headerColor)}
      />
      <Stack.Screen
        name="AddPet"
        component={AddPet}
        options={createHeaderOptions(t('add_pet'), headerColor)}
      />
      <Stack.Screen
        name="AssessmentSettings"
        component={AssessmentSettings}
        options={createHeaderOptions(t('settings:assessments'), headerColor)}
      />
      <Stack.Screen
        name="NotificationSettings"
        component={NotificationSettings}
        options={createHeaderOptions(t('settings:notifications'), headerColor)}
      />
      <Stack.Screen
        name="CustomTrackingSettings"
        component={CustomTrackingSettingsScreen}
        options={createHeaderOptions(t('settings:customTracking'), headerColor)}
      />
      <Stack.Screen
        name="AddAssessment"
        component={AddAssessment}
        options={createHeaderOptions(
          t('measurements:title', {petName: activePet?.name}),
          headerColor
        )}
      />
      <Stack.Screen
        name="EditAssessment"
        component={EditAssessment}
        options={createHeaderOptions(
          t('measurements:title', {petName: activePet?.name}),
          headerColor
        )}
      />
      <Stack.Screen
        name="AllNotes"
        component={AllNotesScreen}
        options={createHeaderOptions(t('measurements:notes'), headerColor)}
      />
      <Stack.Screen
        name="AllAssessments"
        component={AllAssessmentsScreen}
        options={createHeaderOptions(t('measurements:allAssessments'), headerColor)}
      />
      <Stack.Screen 
        name="DebugScreen" 
        component={DebugScreen} 
      />
    </Stack.Navigator>
  );
};

export default AppNavigator;