import { Model } from '@nozbe/watermelondb';
import { field, date, children, text, readonly, json } from '@nozbe/watermelondb/decorators';
import { associations } from '@nozbe/watermelondb/Model';

export type AssessmentFrequency = 'DAILY' | 'WEEKLY';

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
  @text('header_color') headerColor?: string;
  @date('paused_at') pausedAt?: Date;
  @json('custom_tracking_settings') customTrackingSettings?: Record<string, any>;
  @readonly @date('created_at') createdAt!: Date;
  @readonly @date('updated_at') updatedAt!: Date;

  @children('assessments') assessments: any;
}