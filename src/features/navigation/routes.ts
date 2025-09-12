import { CustomTrackingSettings } from "@/features/assessments/helpers/customTracking";

/**
 * Type definition for all routes in the application
 */
export type RootStackParamList = {
  Welcome: undefined;
  Onboarding: undefined;
  Settings: undefined;
  Home: undefined;
  AddPet: undefined;
  EditPet: undefined;
  AssessmentSettings: {assessmentFrequency: string; assessmentsPaused: boolean; isExistingPet: boolean, customTrackingSettings: CustomTrackingSettings};
  NotificationSettings: {notificationsEnabled: boolean; notificationTime: string};
  CustomTrackingSettings: {customTrackingSettings: CustomTrackingSettings};
  AddAssessment: {assessmentDate: string};
  EditAssessment: {assessmentId: string, scrollToNotes?: boolean};
  AllNotes: undefined;
  AllAssessments: undefined;
  DebugScreen: undefined;
  WatermelonTest: undefined;
  WatermelonDBIntegration: undefined;
};