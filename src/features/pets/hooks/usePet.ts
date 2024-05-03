import React from 'react';
import {useQuery, useRealm} from '@realm/react';
import {Pet} from '@/app/models/Pet';
import {BSON} from 'realm';
import { MD3Theme, useTheme } from 'react-native-paper';

export interface PetData {
  species?: string;
  name?: string;
  avatar?: string;
  notificationsEnabled?: boolean;
  notificationsTime?: string;
  headerColor?: string;
}

const usePet = () => {
  const realm = useRealm();
  const theme = useTheme();
  const pets = useQuery(Pet);
  const inactivePets = useQuery(Pet, collection => {
    return collection.filtered('isActive == false');
  });

  const activePet = React.useMemo(() => {
    const _activePet = pets.find(pet => pet.isActive);
    return _activePet || pets[0];
  }, [pets]);

  const switchActivePet = (newActivePetId: BSON.ObjectId) => {
    realm.write(() => {
      // Find the currently active pet and deactivate it
      const currentActivePets = realm.objects(Pet).filtered('isActive == true');
      currentActivePets.forEach(currentActivePet => {
        currentActivePet.isActive = false;
      });

      // Activate the new pet
      const newActivePet = realm.objectForPrimaryKey(Pet, newActivePetId);
      if (newActivePet) {
        newActivePet.isActive = true;
      } else {
        console.error('No pet found with the given ID');
      }
    });
  };

  const updatePet = (petId: BSON.ObjectId, updates: PetData) => {
    realm.write(() => {
      const pet = realm.objectForPrimaryKey('Pet', petId);
      if (pet) {
        // Update the fields with the values provided in 'updates'
        Object.keys(updates).forEach(field => {
          if (field in pet) {
            pet[field as keyof PetData] = updates[field as keyof PetData];
          } else {
            console.warn(`No such field '${field}' exists in the Pet schema`);
          }
        });
      } else {
        console.error('No pet found with the given ID');
      }
    });
  };

  const createPet = (data: PetData) => {
    realm.write(() => {
      const newPet = realm.create(Pet, {
        ...data,
        _id: new BSON.ObjectId(),
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

  const getHeaderColor = (colorTheme: MD3Theme) => {
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
  };

  return {
    pets,
    activePet,
    inactivePets,
    switchActivePet,
    updatePet,
    createPet,
    getHeaderColor,
  };
};

export default usePet;
