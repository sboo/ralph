import { appSchema, tableSchema } from '@nozbe/watermelondb';

export default appSchema({
  version: 1,
  tables: [
    tableSchema({
      name: 'pets',
      columns: [
        { name: 'species', type: 'string' },
        { name: 'name', type: 'string', isIndexed: true },
        { name: 'avatar', type: 'string', isOptional: true },
        { name: 'notifications_enabled', type: 'boolean' },
        { name: 'notifications_time', type: 'string', isOptional: true },
        { name: 'show_notification_dot', type: 'boolean' },
        { name: 'is_active', type: 'boolean', isIndexed: true },
        { name: 'assessment_frequency', type: 'string' },
        { name: 'header_color', type: 'string', isOptional: true },
        { name: 'paused_at', type: 'number', isOptional: true },
        { name: 'custom_tracking_settings', type: 'string', isOptional: true },
        { name: 'created_at', type: 'number' },
        { name: 'updated_at', type: 'number' },
      ],
    }),
    tableSchema({
      name: 'assessments',
      columns: [
        { name: 'date', type: 'string', isIndexed: true },
        { name: 'score', type: 'number' },
        { name: 'hurt', type: 'number' },
        { name: 'hunger', type: 'number' },
        { name: 'hydration', type: 'number' },
        { name: 'hygiene', type: 'number' },
        { name: 'happiness', type: 'number' },
        { name: 'mobility', type: 'number' },
        { name: 'custom_value', type: 'number', isOptional: true },
        { name: 'pet_id', type: 'string', isIndexed: true },
        { name: 'notes', type: 'string', isOptional: true },
        { name: 'images', type: 'string', isOptional: true }, // We'll store as JSON string
        { name: 'created_at', type: 'number' },
        { name: 'updated_at', type: 'number' },
      ],
    }),
  ],
});