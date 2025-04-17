import { AssessmentFrequency, CustomTrackingSettings, Pet } from "@/core/database/models/Pet";
import { MD3Theme } from "react-native-paper/src/types";

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

export const getHeaderColor = (allPets: Pet[], petId: string, theme: MD3Theme): string => {
  const petIndex = allPets.findIndex(pet => pet.id === petId);
  switch (petIndex % 3) {
    case 0:
      return theme.colors.primary;
    case 1:
      return theme.colors.secondary;
    case 2:
      return theme.colors.tertiary;
    default:
      return theme.colors.primary;
  }
}
