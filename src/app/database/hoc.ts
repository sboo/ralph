import { withObservables } from '@nozbe/watermelondb/react';
import { database, petCollection, assessmentCollection } from '../database';
import { Q } from '@nozbe/watermelondb';
import { ComponentType } from 'react';
import { Pet } from './models/Pet';
import { Assessment } from './models/Assessment';

/**
 * HOC to observe all pets or filtered pets
 */
export const withPets = (Component: ComponentType<any>) => {
  return withObservables([], () => ({
    pets: petCollection.query().observe(),
  }))(Component);
};

/**
 * HOC to observe active pets
 */
export const withActivePets = (Component: ComponentType<any>) => {
  return withObservables([], () => ({
    activePets: petCollection.query(Q.where('is_active', true)).observe(),
  }))(Component);
};

/**
 * HOC to observe a single pet by ID
 */
export const withPet = (Component: ComponentType<any>) => {
  return withObservables(['petId'], ({ petId }: { petId: string }) => ({
    pet: petCollection.findAndObserve(petId),
  }))(Component);
};

/**
 * HOC to observe assessments for a specific pet
 */
export const withPetAssessments = (Component: ComponentType<any>) => {
  return withObservables(['pet'], ({ pet }: { pet: Pet }) => ({
    assessments: pet.assessments.observe(),
  }))(Component);
};

/**
 * HOC to observe assessments filtered by date
 */
export const withAssessmentsByDate = (Component: ComponentType<any>) => {
  return withObservables(['pet', 'date'], ({ pet, date }: { pet: Pet, date: string }) => ({
    assessments: pet.assessments.query(
      Q.where('date', date)
    ).observe(),
  }))(Component);
};

/**
 * HOC to observe a single assessment by ID
 */
export const withAssessment = (Component: ComponentType<any>) => {
  return withObservables(['assessmentId'], ({ assessmentId }: { assessmentId: string }) => ({
    assessment: assessmentCollection.findAndObserve(assessmentId),
  }))(Component);
};

/**
 * HOC to observe all assessments
 */
export const withAllAssessments = (Component: ComponentType<any>) => {
  return withObservables([], () => ({
    assessments: assessmentCollection.query().observe(),
  }))(Component);
};