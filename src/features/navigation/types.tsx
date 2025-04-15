import type {NativeStackScreenProps} from '@react-navigation/native-stack';
import { CustomTrackingLabels, CustomTrackingSettings } from '../assessments/helpers/customTracking';

export type RootStackParamList = {
  Welcome: undefined;
  Onboarding: undefined;
  Settings: undefined;
  Home: undefined;
  Migration: undefined;
  AddPet: undefined;
  EditPet: undefined;
  AssessmentSettings: {assessmentFrequency: string; assessmentsPaused: boolean; isExistingPet: boolean, customTrackingSettings: CustomTrackingSettings};
  NotificationSettings: {notificationsEnabled: boolean; notificationTime: string};
  CustomTrackingSettings: {customTrackingSettings: CustomTrackingSettings};
  AddAssessment: {timestamp: number};
  EditAssessment: {assessmentId: string, scrollToNotes?: boolean};
  AllNotes: undefined;
  AllAssessments: undefined;
  DebugScreen: undefined;
  WatermelonTest: undefined;
  WatermelonDBIntegration: undefined;
};

export type WelcomeScreenNavigationProps = NativeStackScreenProps<
  RootStackParamList,
  'Welcome'
>;

export type OnboardingScreenNavigationProps = NativeStackScreenProps<
  RootStackParamList,
  'Onboarding'
>;

export type SettingsScreenNavigationProps = NativeStackScreenProps<
  RootStackParamList,
  'Settings'
>;

export type HomeScreenNavigationProps = NativeStackScreenProps<
  RootStackParamList,
  'Home'
>;
export type AddPetScreenNavigationProps = NativeStackScreenProps<
  RootStackParamList,
  'AddPet'
>;

export type EditPetScreenNavigationProps = NativeStackScreenProps<
  RootStackParamList,
  'EditPet'
>;

export type AssessmentSettingsScreenNavigationProps = NativeStackScreenProps<
  RootStackParamList,
  'AssessmentSettings'
>;

export type NotificationSettingsScreenNavigationProps = NativeStackScreenProps<
  RootStackParamList,
  'NotificationSettings'
>;
export type AddAssessmentScreenNavigationProps = NativeStackScreenProps<
  RootStackParamList,
  'AddAssessment'
>;

export type CustomTrackingSettingsScreenNavigationProps = NativeStackScreenProps<
  RootStackParamList,
  'CustomTrackingSettings'
>;

export type EditAssessmentScreenNavigationProps = NativeStackScreenProps<
  RootStackParamList,
  'EditAssessment'
>;

export type AllNotesNavigationProps = NativeStackScreenProps<
  RootStackParamList,
  'AllNotes'
>;

export type AllAssessmentsScreenNavigationProps = NativeStackScreenProps<
  RootStackParamList,
  'AllAssessments'
>;

export type MigrationScreenNavigationProps = NativeStackScreenProps<
  RootStackParamList,
  'Migration'
>;
