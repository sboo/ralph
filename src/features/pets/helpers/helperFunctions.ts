import { AssessmentFrequency, CustomTrackingSettings } from "@/app/database/models/Pet";

export interface PetData {
  id?: string;
  species?: string;
  name?: string;
  avatar?: string;
  assessmentFrequency?: AssessmentFrequency;
  notificationsEnabled?: boolean;
  notificationsTime?: string;
  isPaused?: boolean;
  pausedAt?: Date;
  delete?: boolean;
  customTrackingSettings?: CustomTrackingSettings;
}