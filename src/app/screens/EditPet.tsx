import { database } from '@/app/database';
import { Pet } from '@/app/database/models/Pet';
import { EditPetScreenNavigationProps } from '@/features/navigation/types';
import PetItem from '@/features/pets/components/PetItem';
import { PetData } from '@/features/pets/helpers/helperFunctions';
import { Q } from '@nozbe/watermelondb';
import { withObservables } from '@nozbe/watermelondb/react';
import React from 'react';
import { SafeAreaView, StyleSheet } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { useTheme } from 'react-native-paper';
import { map } from 'rxjs/operators';

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
        await activePet.destroyPermanently();
        const newActivePet = allPets[0];
        await newActivePet.update(record => {
          record.isActive = true;
        });

      });
      navigation.goBack();
      return;
    }

    try {
      await database.write(async () => {
        await activePet.update(record => {
          record.species = data.species!;
          record.name = data.name!;
          if (data.avatar !== undefined) record.avatar = data.avatar;
          record.notificationsEnabled = data.notificationsEnabled!;
          if (data.notificationsTime !== undefined) record.notificationsTime = data.notificationsTime;
          record.assessmentFrequency = data.assessmentFrequency!;
          if (data.customTrackingSettings) {
            record.customTrackingSettings = data.customTrackingSettings;
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

// Connect the component with WatermelonDB observables
const enhance = withObservables([], () => ({
  activePet: database
    .get<Pet>('pets')
    .query(Q.where('is_active', true))
    .observe()
    .pipe(map(pets => pets.length > 0 ? pets[0] : undefined)),
    allPets : database
    .get<Pet>('pets')
    .query()
    .observe(),
}));

// Export the enhanced component
export default enhance(EditPetComponent);
