import {useCallback, useMemo} from 'react';
import {useQuery, useRealm} from '@realm/react';
import {Pet} from '@/app/models/Pet';
import {BSON} from 'realm';
import {MD3Theme, useTheme} from 'react-native-paper';
import { AssessmentFrequency } from '@/app/models/Pet';
import { CustomTrackingSettings } from '@/features/assessments/helpers/customTracking';

export interface PetData {
  id?: BSON.ObjectId;
  species?: string;
  name?: string;
  avatar?: string;
  assessmentFrequency?: AssessmentFrequency;
  notificationsEnabled?: boolean;
  notificationsTime?: string;
  headerColor?: string;
  isPaused?: boolean;
  pausedAt?: Date;
  delete?: boolean;
  customTrackingSettings?: string;
}

const usePet = () => {
  const realm = useRealm();
  const pets = useQuery(Pet);
  const theme = useTheme();
  const inactivePets = useQuery(Pet, collection => {
    return collection.filtered('isActive == false');
  });

  const switchActivePet = useCallback(
    (newActivePetId: BSON.ObjectId) => {
      realm.write(() => {
        // Find the currently active pet and deactivate it
        const currentActivePets = realm
          .objects(Pet)
          .filtered('isActive == true');
        currentActivePets.forEach(currentActivePet => {
          currentActivePet.isActive = false;
        });

        // Activate the new pet
        const newActivePet = realm.objectForPrimaryKey(Pet, newActivePetId);
        if (newActivePet) {
          newActivePet.isActive = true;
          newActivePet.showNotificationDot = false;
        }
      });
    },
    [realm],
  );

  const enableNotifcationDot = useCallback(
    (petId: BSON.ObjectId) => {
      realm.write(() => {
        const pet = realm.objectForPrimaryKey(Pet, petId);
        if (pet && !pet.isActive) {
          pet.showNotificationDot = true;
        }
      });
    },
    [realm],
  );

  const activePet = useMemo(() => {
    if (pets.length === 0) {
      return undefined;
    }
    const _activePet = pets.find(pet => pet.isActive);
    if (!_activePet && pets.length > 0) {
      switchActivePet(pets[0]._id);
    }
    return _activePet || pets[0];
  }, [pets, switchActivePet]);

  const updatePet = (petId: BSON.ObjectId, updates: PetData) => {
    realm.write(() => {
      const pet = realm.objectForPrimaryKey('Pet', petId);
      if (pet) {
        if (!pet.pausedAt && updates.isPaused) {
          const pausedAt = new Date();
          pausedAt.setHours(0, 0, 0, 0);
          pet.pausedAt = pausedAt;
        } else if (pet.pausedAt && !updates.isPaused) {
          pet.pausedAt = undefined;
        }
        // Update the fields with the values provided in 'updates'
        Object.keys(updates).forEach(field => {
          if (field in pet) {
            pet[field as keyof PetData] = updates[field as keyof PetData];
          }
        });
      } else {
        console.error(`No pet found with the given ID : ${petId}`);
      }
    });
  };

  const createPet = (data: PetData) => {
    realm.write(() => {
      const newPet = realm.create(Pet, {
        ...data,
        _id: data.id ?? new BSON.ObjectId(),
        isActive: false,
      });
      // Find the currently active pet and deactivate it
      const currentActivePets = realm.objects(Pet).filtered('isActive == true');
      currentActivePets.forEach(currentActivePet => {
        currentActivePet.isActive = false;
      });
      newPet.isActive = true;
    });
  };

  const deletePet = (petId: BSON.ObjectId) => {
    if (pets.length === 1) {
      console.error('Cannot delete the only pet in the list');
      return;
    }

    const anotherPet = realm.objects(Pet).filtered(`_id != $0`, petId)[0];
    if(anotherPet) {
      switchActivePet(anotherPet._id);
    }

    realm.write(() => {
      const pet = realm.objectForPrimaryKey('Pet', petId);
      if (pet) {
        realm.delete(pet);
      } else {
        console.error(`No pet found with the given ID : ${petId}`);
      }
    });
  };

  const getHeaderColor = useCallback(
    (colorTheme: MD3Theme) => {
      const activePetIndex = pets.findIndex(pet => pet.isActive) % 3;
      switch (activePetIndex) {
        case 0:
          return colorTheme.colors.primary;
        case 1:
          return colorTheme.colors.secondary;
        case 2:
          return colorTheme.colors.tertiary;
        default:
          return colorTheme.colors.primary;
      }
    },
    [pets],
  );

  const headerColor = useMemo(() => {
    const activePetIndex = pets.findIndex(pet => pet.isActive) % 3;
    switch (activePetIndex) {
      case 0:
        return theme.colors.primary;
      case 1:
        return theme.colors.secondary;
      case 2:
        return theme.colors.tertiary;
      default:
        return theme.colors.primary;
    }
  }, [pets, theme]);

  return {
    pets,
    activePet,
    inactivePets,
    switchActivePet,
    enableNotifcationDot,
    updatePet,
    createPet,
    deletePet,
    headerColor,
    getHeaderColor,
  };
};

export default usePet;
