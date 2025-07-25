import { database, Pet } from '@/core/database';
import { withAllPets } from '@/core/database/hoc';
import { event, EVENT_NAMES } from '@/features/events';
import { AddPetScreenNavigationProps } from '@/features/navigation/types';
import PetItem from '@/features/pets/components/PetItem';
import { PetData } from '@/features/pets/helpers/helperFunctions';
import { compose } from '@nozbe/watermelondb/react';
import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { StyleSheet } from 'react-native';
import { useTheme } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';


// The presentational component
const AddPetComponent: React.FC<AddPetScreenNavigationProps & {
  allPets: Pet[]
}> = ({ navigation, allPets }) => {
  const theme = useTheme();

  const onSubmit = async (data: PetData) => {
    console.log('AddPetComponent', data);
    await database.write(async () => {
      const newPet = await database.get<Pet>('pets').create((record: Pet) => {
        record.species = data.species!;
        record.name = data.name!;
        record.isActive = true; // New pet is active by default
        if (data.avatar) record.avatar = data.avatar;
        record.notificationsEnabled = data.notificationsEnabled!;
        if (data.notificationsTime) record.notificationsTime = data.notificationsTime;
        record.showNotificationDot = false;
        record.assessmentFrequency = data.assessmentFrequency!;
        if (data.customTrackingSettings) {
          record.customTrackingSettings = data.customTrackingSettings;
        }
      });
      event.emit(EVENT_NAMES.SWITCHING_PET, newPet.id);
      for (const pet of allPets) {
        pet.update((record: Pet) => {
          record.isActive = false;
        });
      }
    });
    navigation.goBack();
  };

  return (
    <SafeAreaView
        edges={['bottom', 'left', 'right']}

      style={{
        backgroundColor: theme.colors.primaryContainer,
        ...styles.container,
      }}>
      <LinearGradient
        colors={[
          theme.colors.primaryContainer,
          theme.colors.background,
          theme.colors.primaryContainer,
        ]}
        locations={[0, 0.75, 1]}
        style={styles.gradient}>
        <PetItem onSubmit={onSubmit} navigation={navigation} />
      </LinearGradient>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradient: {
    flex: 1,
    justifyContent: 'flex-start',
    alignItems: 'stretch',
  },
});


const enhance = compose(
  withAllPets,
);

export default enhance(AddPetComponent);
