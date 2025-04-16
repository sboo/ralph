import { Assessment, database } from '@/app/database';
import { Pet } from '@/app/database/models/Pet';
import AssessmentItem from '@/features/assessments/components/AssessmentItem';
import { calculateScore, storeImages } from '@/features/assessments/helpers/helperFunctions';
import { AddAssessmentScreenNavigationProps } from '@/features/navigation/types.tsx';
import { Q } from '@nozbe/watermelondb';
import { withObservables } from '@nozbe/watermelondb/react';
import moment from 'moment';
import React, { useState } from 'react';
import { SafeAreaView, StyleSheet } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { useTheme } from 'react-native-paper';
import { map } from 'rxjs/operators';

// The presentational component
const AddAssessmentComponent: React.FC<AddAssessmentScreenNavigationProps & {
  activePet: Pet | undefined
}> = ({
  route,
  navigation,
  activePet
}) => {
    const [date] = useState(new Date(route.params.timestamp));
    const theme = useTheme();

    if (!activePet) {
      navigation.goBack();
      return null;
    }

    const handleSubmit = async (
      hurt: number,
      hunger: number,
      hydration: number,
      hygiene: number,
      happiness: number,
      mobility: number,
      customValue?: number,
      notes?: string,
      images?: string[],
    ) => {


      const assessmentDate = moment(date).format('YYYY-MM-DD');

      const score = calculateScore({
        date: assessmentDate,
        hurt,
        hunger,
        hydration,
        hygiene,
        happiness,
        mobility,
        customValue,
      });

      const noteImages = await storeImages(images);

      await database.write(async () => {
        await database.get<Assessment>('assessments').create(record => {
          record.date = assessmentDate
          record.hurt = hurt;
          record.hunger = hunger;
          record.hydration = hydration;
          record.hygiene = hygiene;
          record.happiness = happiness;
          record.mobility = mobility;
          if (customValue !== undefined) record.customValue = customValue;
          if (notes) record.notes = notes;
          record.images = noteImages;
          record.score = score;
          record.pet.set(activePet);
        });
      });
      navigation.goBack();
    };

    // Get custom tracking settings from the pet
    const customTrackingSettings = activePet.customTrackingSettings ?
      (typeof activePet.customTrackingSettings === 'string' ?
        JSON.parse(activePet.customTrackingSettings) :
        activePet.customTrackingSettings) :
      {};

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
          <AssessmentItem
            date={date}
            petName={activePet.name}
            petSpecies={activePet.species}
            customTracking={customTrackingSettings}
            onCancel={() => navigation.goBack()}
            onSubmit={handleSubmit}
          />
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
    .pipe(map(pets => pets.length > 0 ? pets[0] : undefined))
}));

// Export the enhanced component
export default enhance(AddAssessmentComponent);
