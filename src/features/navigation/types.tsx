import type {NativeStackScreenProps} from '@react-navigation/native-stack';

export type RootStackParamList = {
  Welcome: undefined;
  Onboarding: undefined;
  Settings: undefined;
  Home: undefined;
  AddPet: undefined;
  EditPet: undefined;
  AssessmentSettings: {assessmentFrequency: string; assessmentsPaused: boolean; isExistingPet: boolean};
  NotificationSettings: {notificationsEnabled: boolean; notificationTime: string};
  AddAssessment: {timestamp: number};
  EditAssessment: {assessmentId: string, scrollToNotes?: boolean};
  AllNotes: undefined;
  AllAssessments: undefined;
  DebugScreen: undefined;
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
