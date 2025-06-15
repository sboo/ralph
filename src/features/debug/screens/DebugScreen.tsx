import { database } from '@/core/database';
import { Pet } from '@/core/database/models/Pet';
import { STORAGE_KEYS } from '@/core/store/storageKeys';
import { event, EVENT_NAMES } from '@/features/events';
import Tips from '@/features/tips/components/Tips';
import { Q } from '@nozbe/watermelondb';
import { withObservables } from '@nozbe/watermelondb/react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import React from 'react';
import { Text, View } from 'react-native';
import { Divider } from 'react-native-paper';
import { map } from 'rxjs/operators';

// The presentational component
const DebugScreenComponent: React.FC<{
  activePet: Pet | undefined
}> = ({ 
  activePet 
}) => {


  const unpurchase = async () => {
    await AsyncStorage.setItem(STORAGE_KEYS.COFFEE_PURCHASED, 'false');
    event.emit(EVENT_NAMES.COFFEE_PURCHASED, false);
  };

  

  return (
    <>
      <Text>Active Pet:</Text>
      <Text>Name: {activePet?.name}</Text>
      <Text>Species: {activePet?.species}</Text>
      <Text>isActive: {activePet?.isActive ? 'yes' : 'no'}</Text>
      <Text>notificationsEnabled: {activePet?.notificationsEnabled ? 'yes' : 'no'}</Text>
      <Text>pausedAt: {activePet?.pausedAt?.toISOString()}</Text>
      <Divider />
      <View style={{padding: 20}}>
        {activePet ? <Tips activePet={activePet} /> : null}
      </View>
    </>
  );
};

// Connect the component with WatermelonDB observables
const enhance = withObservables([], () => ({
  activePet: database
    .get<Pet>('pets')
    .query(Q.where('is_active', true))
    .observe()
    .pipe(map(pets => pets.length > 0 ? pets[0] : undefined))
}));

// Export the enhanced component
export default enhance(DebugScreenComponent);
