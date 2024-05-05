import React, {useCallback} from 'react';
import {useQuery, useRealm} from '@realm/react';
import {Pet} from '@/app/models/Pet';
import {BSON} from 'realm';
import {MD3Theme, useTheme} from 'react-native-paper';

export interface PetData {
  id?: BSON.ObjectId;
  species?: string;
  name?: string;
  avatar?: string;
  notificationsEnabled?: boolean;
  notificationsTime?: string;
  headerColor?: string;
  delete?: boolean;
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
        } else {
          console.error('No pet found with the given ID');
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
        } else {
          console.error('No pet found with the given ID');
        }
      });
    },
    [realm],
  );

  const activePet = React.useMemo(() => {
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
        // Update the fields with the values provided in 'updates'
        Object.keys(updates).forEach(field => {
          if (field in pet) {
            pet[field as keyof PetData] = updates[field as keyof PetData];
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
    realm.write(() => {
      const pet = realm.objectForPrimaryKey('Pet', petId);
      if (pet) {
        realm.delete(pet);
      } else {
        console.error('No pet found with the given ID');
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

  const headerColor = React.useMemo(() => {
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
