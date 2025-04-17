import { database, petCollection } from '@core/database';
import { Q } from '@nozbe/watermelondb';
import { withObservables } from '@nozbe/watermelondb/react';
import { ComponentType } from 'react';
import { Observable } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';
import { Assessment } from './models/Assessment';
import { Pet } from './models/Pet';

/**
 * HOC to observe a single active pet
 */
export const withAllPets = (Component: ComponentType<any>) => {
  return withObservables([], () => ({
    allPets: database.get<Pet>('pets').query(),
  }))(Component);
};


/**
 * HOC to observe a single active pet
 */
export const withActivePet = (Component: ComponentType<any>) => {
  return withObservables([], () => ({
    activePet: petCollection.query(Q.where('is_active', true))
      .observe()
      .pipe(map(pets => pets.length > 0 ? pets[0] : undefined)),
  }))(Component);
};


/**
 * HOC to observe all pets and the active pet
 */
export const withAllAndActivePet = (Component: ComponentType<any>) => {
  return withObservables([], () => ({
    allPets: database.get<Pet>('pets').query().observe(),
    activePet: database
      .get<Pet>('pets')
      .query(Q.where('is_active', true))
      .observe()
      .pipe(map(pets => pets.length > 0 ? pets[0] : undefined)),
  }))(Component);
};

/**
 * HOC to observe assessments for the active pet
 */
export const withActivePetAssessments = (options?: {
  sortBy?: { column: string; direction: 'asc' | 'desc' };
  withNotes?: boolean;
  limit?: number;
}) => (Component: ComponentType<any>) => {
  return withObservables([], () => {
    // Get active pet
    const activePetObservable = database
      .get<Pet>('pets')
      .query(Q.where('is_active', true))
      .observe()
      .pipe(map(pets => pets.length > 0 ? pets[0] : undefined));

    // Set default options
    const defaultOptions = {
      sortBy: { column: 'date', direction: 'desc' as const },
      withNotes: false,
      limit: undefined,
    };
    
    const { sortBy, withNotes, limit } = { ...defaultOptions, ...options };
    
    // Create assessments observable that depends on the active pet
    const assessmentsObservable = activePetObservable.pipe(
      switchMap(pet => {
        if (!pet) {
          return new Observable<Assessment[]>(subscriber => subscriber.next([]));
        }
        
        let query = database
          .get<Assessment>('assessments')
          .query(
            Q.where('pet_id', pet.id),
            ...(withNotes ? [Q.where('notes', Q.notEq(null))] : []),
            Q.sortBy(sortBy.column, sortBy.direction),
            ...(limit ? [Q.take(limit)] : [])
          );
        
        return query.observe();
      })
    );

    return {
      activePet: activePetObservable,
      assessments: assessmentsObservable,
    };
  })(Component);
};
