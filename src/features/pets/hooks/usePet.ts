import React from 'react';
import {useQuery} from '@realm/react';
import {Pet} from '@/app/models/Pet';

const usePet = () => {
  const pets = useQuery(Pet);

  const activeOrFirstPet = React.useMemo(() => {
    const activePet = pets.find(pet => pet.isActive);
    return activePet || pets[0];
  }, [pets]);

  return {pets, activeOrFirstPet};
};

export default usePet;
