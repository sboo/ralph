import { Database } from '@nozbe/watermelondb';
import SQLiteAdapter from '@nozbe/watermelondb/adapters/sqlite';

import migrations from '@core/database/migrations';
import { Assessment } from '@core/database/models/Assessment';
import { Pet } from '@core/database/models/Pet';
import schema from '@core/database/schema';

// Set up the adapter
const adapter = new SQLiteAdapter({
  schema,
  migrations,
  jsi: true, // enable JSI for better performance (optional)
  onSetUpError: error => {
    console.error('Database setup error:', error);
  },
});

// Create the database
export const database = new Database({
  adapter,
  modelClasses: [
    Pet,
    Assessment,
  ],
});

// Export the model instances
export const petCollection = database.get<Pet>('pets');
export const assessmentCollection = database.get<Assessment>('assessments');

// Export the models
export { Assessment, Pet };
