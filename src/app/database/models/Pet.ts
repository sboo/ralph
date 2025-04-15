import { Model } from '@nozbe/watermelondb';
import { field, date, children, text, readonly, json } from '@nozbe/watermelondb/decorators';
import { associations } from '@nozbe/watermelondb/Model';

export type AssessmentFrequency = 'DAILY' | 'WEEKLY';

export type CustomTrackingLabels = {
  [key: string]: string;
}

export const emptyCustomTrackingLabels: CustomTrackingLabels = {
  '0': '',
  '2.5': '',
  '5': '',
  '7.5': '',
  '10': '',
};

export type CustomTrackingSettings = {
  customTrackingEnabled: boolean;
  customTrackingName: string;
  customTrackingDescription: string;
  customTrackingLabels: CustomTrackingLabels;
};

export const emptyCustomTrackingSettings: CustomTrackingSettings = {
  customTrackingEnabled: false,
  customTrackingName: '',
  customTrackingDescription: '',
  customTrackingLabels: emptyCustomTrackingLabels,
};

// Sanitizer function for customTrackingSettings
const sanitizeTrackingSettings = (rawSettings: any): Record<string, any> => {
  // Ensure we return an object even if we get invalid input
  if (rawSettings && typeof rawSettings === 'object' && !Array.isArray(rawSettings)) {
    return rawSettings;
  }
  // Return empty object for invalid inputs
  return {};
};

export class Pet extends Model {
  static table = 'pets';
  static associations = {
    assessments: { type: 'has_many' as const, foreignKey: 'pet_id' },
  };

  @text('species') species!: string;
  @text('name') name!: string;
  @text('avatar') avatar?: string;
  @field('notifications_enabled') notificationsEnabled!: boolean;
  @text('notifications_time') notificationsTime?: string;
  @field('show_notification_dot') showNotificationDot!: boolean;
  @field('is_active') isActive!: boolean;
  @text('assessment_frequency') assessmentFrequency!: AssessmentFrequency;
  @date('paused_at') pausedAt?: Date;
  @json('custom_tracking_settings', sanitizeTrackingSettings) customTrackingSettings?: CustomTrackingSettings;
  @readonly @date('created_at') createdAt!: Date;
  @readonly @date('updated_at') updatedAt!: Date;

  @children('assessments') assessments: any;
}