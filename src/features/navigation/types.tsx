import type {NativeStackScreenProps} from '@react-navigation/native-stack';

export type RootStackParamList = {
  Welcome: undefined;
  Settings: undefined;
  Home: undefined;
  AddAssessment: {timestamp: number};
  EditAssessment: {assessmentId: string};
  AllAssessments: undefined;
  AboutScreen: undefined;
  DebugScreen: undefined;
};

export type WelcomeScreenNavigationProps = NativeStackScreenProps<
  RootStackParamList,
  'Welcome'
>;

export type SettingsScreenNavigationProps = NativeStackScreenProps<
  RootStackParamList,
  'Settings'
>;

export type HomeScreenNavigationProps = NativeStackScreenProps<
  RootStackParamList,
  'Home'
>;

export type AddAssessmentScreenNavigationProps = NativeStackScreenProps<
  RootStackParamList,
  'AddAssessment'
>;

export type EditAssessmentScreenNavigationProps = NativeStackScreenProps<
  RootStackParamList,
  'EditAssessment'
>;

export type AllAssessmentsScreenNavigationProps = NativeStackScreenProps<
  RootStackParamList,
  'AllAssessments'
>;
