import { assessmentCollection, database, petCollection } from '@core/database';
import { Assessment as WatermelonAssessment } from '@core/database/models/Assessment';
import { AssessmentFrequency, Pet as WatermelonPet } from '@core/database/models/Pet';
import { onMigration } from '@core/legacy-realm/models';
import notifee from '@notifee/react-native';
import Realm from 'realm';

// Original Realm models
import { createTriggerNotification } from '@/features/notifications/helpers/helperFunctions';
import { timeToDateObject } from '@/support/helpers/DateTimeHelpers';
import { Measurement as RealmMeasurement } from '@core/legacy-realm/models/Measurement';
import { Pet as RealmPet } from '@core/legacy-realm/models/Pet';

// Define types for migration result
interface MigrationResult {
  success: boolean;
  message: string;
  error?: unknown;
}

const resetDatabase = async () => {
    try {
      await database.write(async () => {
        // Delete all assessments first (due to foreign key constraints)
        const allAssessments = await assessmentCollection.query().fetch();
        for (const assessment of allAssessments) {
          await assessment.destroyPermanently();
        }
        
        // Then delete all pets
        const allPets = await petCollection.query().fetch();
        for (const pet of allPets) {
          await pet.destroyPermanently();
        }
      });
      
    } catch (error) {
      console.error('Error resetting database:', error);
    }
  };

/**
 * Migrate data from Realm to WatermelonDB
 */
export const migrateFromRealm = async (): Promise<MigrationResult> => {

  // Reset the database before migration
  await resetDatabase();
  console.log('Database reset successfully.');
  
  // Open the Realm database, and make sure we're on version 12
  const realm = await Realm.open({
    schema: [RealmPet, RealmMeasurement],
    schemaVersion: 12,
    onMigration: onMigration
  });



  notifee.cancelAllNotifications();

  try {
    // Start a batch operation in WatermelonDB
    
    await database.write(async () => {
      console.log('Starting migration from Realm to WatermelonDB...');

      // --- Migrate Pets ---
      const realmPets = realm.objects<RealmPet>('Pet');
      console.log(`Found ${realmPets.length} pets to migrate`);

      for (const realmPet of realmPets) {
        // Convert Realm object to plain object
        const pet = {
          species: realmPet.species,
          name: realmPet.name,
          avatar: realmPet.avatar,
          notificationsEnabled: realmPet.notificationsEnabled,
          notificationsTime: realmPet.notificationsTime,
          showNotificationDot: realmPet.showNotificationDot,
          isActive: realmPet.isActive,
          assessmentFrequency: realmPet.assessmentFrequency,
          headerColor: realmPet.headerColor,
          pausedAt: realmPet.pausedAt,
          customTrackingSettings: realmPet.customTrackingSettings || '{}',
        };

        // Create a new Pet record in WatermelonDB
        const newPet = await petCollection.create((record: WatermelonPet) => {
          record.species = pet.species;
          record.name = pet.name;
          if (pet.avatar) record.avatar = pet.avatar;
          record.notificationsEnabled = pet.notificationsEnabled;
          if (pet.notificationsTime) record.notificationsTime = pet.notificationsTime;
          record.showNotificationDot = pet.showNotificationDot;
          record.isActive = pet.isActive;
          record.assessmentFrequency = pet.assessmentFrequency as any;
          if (pet.pausedAt) record.pausedAt = pet.pausedAt;
          record.customTrackingSettings = typeof pet.customTrackingSettings === 'string'
            ? JSON.parse(pet.customTrackingSettings)
            : pet.customTrackingSettings;
        });

        if(pet.notificationsEnabled) {
          createTriggerNotification(newPet.id, pet.name, timeToDateObject(pet.notificationsTime!), pet.assessmentFrequency as AssessmentFrequency);
        }


        console.log(`Migrated pet: ${pet.name} with new ID: ${newPet.id}`);

        // Store the mapping between old and new IDs for reference in measurements
        const oldPetId = (realmPet as any)._id.toString();

        // Migrate measurements for this pet
        const realmMeasurements = realm.objects<RealmMeasurement>('Measurement').filtered('petId == $0', (realmPet as any)._id);
        console.log(`Found ${realmMeasurements.length} measurements for pet: ${pet.name}`);

        for (const realmMeasurement of realmMeasurements) {
          // Convert Realm.List<string> to regular array
          const imageArray: string[] = [];
          for (let i = 0; i < (realmMeasurement.images as any).length; i++) {
            imageArray.push((realmMeasurement.images as any)[i]);
          }

          // Create a new Assessment record in WatermelonDB
          await assessmentCollection.create((record: WatermelonAssessment) => {
            record.date = realmMeasurement.date;
            record.score = realmMeasurement.score;
            record.hurt = realmMeasurement.hurt;
            record.hunger = realmMeasurement.hunger;
            record.hydration = realmMeasurement.hydration;
            record.hygiene = realmMeasurement.hygiene;
            record.happiness = realmMeasurement.happiness;
            record.mobility = realmMeasurement.mobility;
            if (realmMeasurement.customValue !== undefined) record.customValue = realmMeasurement.customValue;
            if (realmMeasurement.notes) record.notes = realmMeasurement.notes;
            record.images = imageArray;
            record.pet.set(newPet);
          });
        }
      }

      console.log('Migration completed successfully!');
    });

    return { success: true, message: 'Migration completed successfully!'};
  } catch (error: unknown) {
    console.error('Migration failed:', error);
    return {
      success: false,
      message: `Migration failed: ${error instanceof Error ? error.message : String(error)}`,
      error
    };
  } finally {
    // Close the Realm instance
    realm.close();
  }
};