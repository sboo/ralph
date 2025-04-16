import { Pet } from "@/app/database/models/Pet";
import { CustomTrackingSettings } from "@/features/assessments/helpers/customTracking";
import { Theme } from "@react-navigation/native";

/**
 * Interface for the key functionality provided by the pets feature
 */
export interface PetsFeatureAPI {
  /**
   * Gets the header color based on the active pet
   */
  getHeaderColor: (allPets: Pet[], activePetId: string, theme: Theme) => string;
}

/**
 * Interface for the settings related to assessments
 */
export interface AssessmentSettingsProps {
  assessmentFrequency: string;
  assessmentsPaused: boolean;
  isExistingPet: boolean;
  customTrackingSettings: CustomTrackingSettings;
}

/**
 * Interface for the notification settings
 */
export interface NotificationSettingsProps {
  notificationsEnabled: boolean;
  notificationTime: string;
}

/**
 * Interface for the custom tracking settings
 */
export interface CustomTrackingSettingsProps {
  customTrackingSettings: CustomTrackingSettings;
}