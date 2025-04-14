import { useMemo } from 'react';
import { useDatabaseContext } from './context';
import { Q } from '@nozbe/watermelondb';
import { withObservables } from '@nozbe/watermelondb/react';
import { Pet } from './models/Pet';
import { Assessment } from './models/Assessment';
import { Observable } from 'rxjs';
import { database } from '.';
import { map } from 'rxjs/operators';


/**
 * Hook to get all pets
 */
export const usePetsCollection = () => {
  const { collections } = useDatabaseContext();
  return collections.pets.query();
};

/**
 * Hook to get all active pets
 */
export const useActivePets = () => {
  const { collections } = useDatabaseContext();
  return collections.pets.query(Q.where('is_active', true));
};

/**
 * Get active pet with HOC support
 */
export const useActivePet = () => {
  const { collections } = useDatabaseContext();
  return withObservables([], () => ({
    activePet: collections.pets.query(Q.where('is_active', true)).observeWithColumns(['is_active'])
      .pipe(map(pets => pets.length > 0 ? pets[0] : undefined))
  }));
};

/**
 * Get inactive pets with HOC support
 */
export const useInactivePets = () => {
  const { collections } = useDatabaseContext();
  return withObservables([], () => ({
    inactivePets: collections.pets.query(Q.where('is_active', false))
  }));
};

/**
 * Get both active and inactive pets with HOC support
 */
export const usePets = () => {
  const { collections } = useDatabaseContext();
  return withObservables([], () => ({
    activePet: collections.pets.query(Q.where('is_active', true)).observeWithColumns(['is_active'])
      .pipe(map(pets => pets.length > 0 ? pets[0] : undefined)),
    inactivePets: collections.pets.query(Q.where('is_active', false))
  }));
};

/**
 * Switches the active pet
 */
export const switchActivePet = async (petId: string) => {
  console.log('[RALPH DEBUG] Switching active pet to:', petId);
  try {
    // Re-import the database to ensure we have the latest reference
    const { database, petCollection } = require('@/app/database');
    
    if (!database) {
      console.error('[RALPH DEBUG] Database is undefined after direct import!');
      return;
    }
    
    console.log('[RALPH DEBUG] Database object:', database ? 'Available' : 'Undefined');
    
    await database.write(async () => {
      console.log('[RALPH DEBUG] Inside database.write transaction');
      
      // Find current active pets and deactivate them
      console.log('[RALPH DEBUG] Fetching active pets');
      const activePets = await petCollection
        .query(Q.where('is_active', true))
        .fetch();
      
      console.log('[RALPH DEBUG] Current active pets:', JSON.stringify(activePets.map(p => ({ id: p.id, name: p.name }))));
      
      for (const pet of activePets) {
        console.log('[RALPH DEBUG] Deactivating pet:', pet.id, pet.name);
        await pet.update(record => {
          console.log('[RALPH DEBUG] Setting isActive to false for pet:', record.id);
          record.isActive = false;
        });
      }
      
      // Activate the selected pet
      console.log('[RALPH DEBUG] Finding pet to activate with ID:', petId);
      const petToActivate = await petCollection.find(petId);
      
      if (petToActivate) {
        console.log('[RALPH DEBUG] Found pet to activate:', petToActivate.id, petToActivate.name);
        await petToActivate.update(record => {
          console.log('[RALPH DEBUG] Setting isActive to true for pet:', record.id);
          record.isActive = true;
          record.showNotificationDot = false;
        });
      } else {
        console.error('[RALPH DEBUG] Could not find pet with ID:', petId);
      }
    });
    
    // Verify the change took effect
    const newActivePets = await petCollection
      .query(Q.where('is_active', true))
      .fetch();
    
    console.log('[RALPH DEBUG] New active pets after switch:', 
      JSON.stringify(newActivePets.map(p => ({ id: p.id, name: p.name }))));
      
  } catch (error) {
    console.error('[RALPH DEBUG] Error switching active pet:', error);
  }
};

/**
 * Enable notification dot for a pet
 */
export const enableNotificationDot = async (petId: string) => {
  await database.write(async () => {
    const pet = await database.get<Pet>('pets').find(petId);
    if (pet && !pet.isActive) {
      await pet.update(record => {
        record.showNotificationDot = true;
      });
    }
  });
};

/**
 * Hook to get a pet by ID
 */
export const usePet = (petId: string) => {
  const { collections } = useDatabaseContext();
  return useMemo(() => {
    return petId ? collections.pets.findAndObserve(petId) : null;
  }, [collections.pets, petId]);
};

/**
 * Hook to get assessments for a pet
 */
export const usePetAssessments = (pet: Pet) => {
  return useMemo(() => {
    return pet ? pet.assessments.observe() : null;
  }, [pet]);
};

/**
 * Hook to get assessments for a pet by date
 */
export const useAssessmentsByDate = (pet: Pet, date: string) => {
  return useMemo(() => {
    return pet 
      ? pet.assessments.query(Q.where('date', date)).observe()
      : null;
  }, [pet, date]);
};

/**
 * Hook to get an assessment by ID
 */
export const useAssessment = (assessmentId: string) => {
  const { collections } = useDatabaseContext();
  return useMemo(() => {
    return assessmentId ? collections.assessments.findAndObserve(assessmentId) : null;
  }, [collections.assessments, assessmentId]);
};

/**
 * Create a new pet
 */
export const createPet = async (petData: {
  species: string;
  name: string;
  avatar?: string;
  notificationsEnabled: boolean;
  notificationsTime?: string;
  showNotificationDot?: boolean;
  isActive: boolean;
  assessmentFrequency: string;
  headerColor?: string;
  customTrackingSettings?: Record<string, any>;
}) => {
  const { database, collections } = useDatabaseContext();
  
  return await database.write(async () => {
    // If this pet will be active, deactivate others first
    if (petData.isActive) {
      const activePets = await collections.pets
        .query(Q.where('is_active', true))
        .fetch();
      
      for (const pet of activePets) {
        await pet.update(record => {
          record.isActive = false;
        });
      }
    }

    // Create the new pet
    return await collections.pets.create(pet => {
      pet.species = petData.species;
      pet.name = petData.name;
      if (petData.avatar) pet.avatar = petData.avatar;
      pet.notificationsEnabled = petData.notificationsEnabled;
      if (petData.notificationsTime) pet.notificationsTime = petData.notificationsTime;
      pet.showNotificationDot = petData.showNotificationDot || false;
      pet.isActive = petData.isActive;
      pet.assessmentFrequency = petData.assessmentFrequency as any;
      if (petData.headerColor) pet.headerColor = petData.headerColor;
      if (petData.customTrackingSettings) pet.customTrackingSettings = petData.customTrackingSettings;
    });
  });
};

/**
 * Update a pet
 */
export const updatePet = async (petId: string, updates: {
  species?: string;
  name?: string;
  avatar?: string;
  notificationsEnabled?: boolean;
  notificationsTime?: string;
  showNotificationDot?: boolean;
  isActive?: boolean;
  assessmentFrequency?: string;
  headerColor?: string;
  isPaused?: boolean;
  pausedAt?: Date;
  customTrackingSettings?: Record<string, any>;
}) => {
  await database.write(async () => {
    const pet = await database.get<Pet>('pets').find(petId);
    if (pet) {
      await pet.update(record => {
        // Handle pausing/unpausing
        if (!record.pausedAt && updates.isPaused) {
          const pausedAt = new Date();
          pausedAt.setHours(0, 0, 0, 0);
          record.pausedAt = pausedAt;
        } else if (record.pausedAt && !updates.isPaused) {
          record.pausedAt = undefined;
        }

        // Update other fields if provided
        if (updates.species) record.species = updates.species;
        if (updates.name) record.name = updates.name;
        if (updates.avatar !== undefined) record.avatar = updates.avatar;
        if (updates.notificationsEnabled !== undefined) record.notificationsEnabled = updates.notificationsEnabled;
        if (updates.notificationsTime !== undefined) record.notificationsTime = updates.notificationsTime;
        if (updates.showNotificationDot !== undefined) record.showNotificationDot = updates.showNotificationDot;
        if (updates.isActive !== undefined) record.isActive = updates.isActive;
        if (updates.assessmentFrequency) record.assessmentFrequency = updates.assessmentFrequency as any;
        if (updates.headerColor !== undefined) record.headerColor = updates.headerColor;
        if (updates.customTrackingSettings) record.customTrackingSettings = updates.customTrackingSettings;
      });
    }
  });
};

/**
 * Delete a pet
 */
export const deletePet = async (pet: Pet) => {
  const { database } = useDatabaseContext();
  
  await database.write(async () => {
    await pet.destroyPermanently();
  });
};

/**
 * Create a new assessment
 */
export const createAssessment = async (assessmentData: Partial<Assessment> & { pet: Pet }) => {
  const { database, collections } = useDatabaseContext();
  let newAssessment;
  const { pet, ...data } = assessmentData;

  await database.write(async () => {
    newAssessment = await collections.assessments.create((assessment: Assessment) => {
      Object.assign(assessment, data);
      assessment.pet.set(pet);
    });
  });

  return newAssessment;
};

/**
 * Update an assessment
 */
export const updateAssessment = async (assessment: Assessment, updates: Partial<Assessment>) => {
  const { database } = useDatabaseContext();
  
  await database.write(async () => {
    await assessment.update((a) => {
      Object.assign(a, updates);
    });
  });

  return assessment;
};

/**
 * Delete an assessment
 */
export const deleteAssessment = async (assessment: Assessment) => {
  const { database } = useDatabaseContext();
  
  await database.write(async () => {
    await assessment.destroyPermanently();
  });
};