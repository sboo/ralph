import { database } from '@/core/database';
import { withAllAndActivePet } from '@/core/database/hoc';
import { Pet } from '@/core/database/models/Pet';
import { EditPetScreenNavigationProps } from '@/features/navigation/types';
import PetItem from '@/features/pets/components/PetItem';
import { PetData } from '@/features/pets/helpers/helperFunctions';
import { compose } from '@nozbe/watermelondb/react';
import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { StyleSheet } from 'react-native';
import { useTheme } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';


// The presentational component
const EditPetComponent: React.FC<EditPetScreenNavigationProps & {
  activePet: Pet | undefined
  allPets: Pet[]
}> = ({ navigation, activePet, allPets }) => {
  const theme = useTheme();

  if (!activePet) {
    navigation.goBack();
    return null;
  }

  const onSubmit = async (data: PetData) => {
    console.log('EditPetComponent onSubmit', data);
    if (data.delete) {
      await database.write(async () => {
        // First destroy the current pet
        await activePet.destroyPermanently();
       
        // Find remaining pets (excluding the one we just deleted)
        const remainingPets = allPets.filter(pet => pet.id !== activePet.id);
        
        // If there are remaining pets, make the first one active
        if (remainingPets.length > 0) {
          await remainingPets[0].update((record: Pet) => {
            record.isActive = true;
          });
        }


      });
      navigation.goBack();
      return;
    }

    try {
      await database.write(async () => {
        await activePet.update((record: Pet) => {
          record.species = data.species!;
          record.name = data.name!;
          if (data.avatar !== undefined) record.avatar = data.avatar;
          record.notificationsEnabled = data.notificationsEnabled!;
          if (data.notificationsTime !== undefined) record.notificationsTime = data.notificationsTime;
          record.assessmentFrequency = data.assessmentFrequency!;
          if (data.customTrackingSettings) {
            record.customTrackingSettings = data.customTrackingSettings;
          }
          if(data.isPaused === true) {
            record.pausedAt = new Date();
          } else {
            record.pausedAt = undefined;
          }
        });
      });
    } catch (error) {
      console.error('Error updating pet', error);
    }
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
        <PetItem pet={activePet} onSubmit={onSubmit} navigation={navigation} />
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
  withAllAndActivePet
)

// Export the enhanced component
export default enhance(EditPetComponent);
