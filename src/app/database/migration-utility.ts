import Realm, { BSON } from 'realm';
import { database, petCollection, assessmentCollection } from '@/app/database';
import { Pet as WatermelonPet } from '@/app/database/models/Pet';
import { Assessment as WatermelonAssessment } from '@/app/database/models/Assessment';
import { Model } from '@nozbe/watermelondb';

// Original Realm models
import { Pet as RealmPet } from '@/app/models/Pet';
import { Measurement as RealmMeasurement } from '@/app/models/Measurement';

// Define types for migration result
interface MigrationResult {
  success: boolean;
  message: string;
  error?: unknown;
}

/**
 * Migrate data from Realm to WatermelonDB
 */
export const migrateFromRealm = async (): Promise<MigrationResult> => {
  // Open the Realm database
  const realm = await Realm.open({
    schema: [RealmPet, RealmMeasurement],
    schemaVersion: 12,
  });

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
          if (pet.headerColor) record.headerColor = pet.headerColor;
          if (pet.pausedAt) record.pausedAt = pet.pausedAt;
          record.customTrackingSettings = typeof pet.customTrackingSettings === 'string' 
            ? JSON.parse(pet.customTrackingSettings) 
            : pet.customTrackingSettings;
        });
        
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
    
    return { success: true, message: 'Migration completed successfully!' };
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