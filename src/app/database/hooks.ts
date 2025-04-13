import { useMemo } from 'react';
import { useDatabaseContext } from './context';
import { Q } from '@nozbe/watermelondb';
import { withObservables } from '@nozbe/watermelondb/react';
import { Pet } from './models/Pet';
import { Assessment } from './models/Assessment';
import { Observable } from 'rxjs';

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
export const createPet = async (petData: Partial<Pet>) => {
  const { database, collections } = useDatabaseContext();
  let newPet;

  await database.write(async () => {
    newPet = await collections.pets.create((pet: Pet) => {
      Object.assign(pet, petData);
    });
  });

  return newPet;
};

/**
 * Update a pet
 */
export const updatePet = async (pet: Pet, updates: Partial<Pet>) => {
  const { database } = useDatabaseContext();
  
  await database.write(async () => {
    await pet.update((p) => {
      Object.assign(p, updates);
    });
  });

  return pet;
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