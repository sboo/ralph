import { Assessment, database } from '@/core/database';
import { Pet } from '@/core/database/models/Pet';
import AssessmentItem from '@/features/assessments/components/AssessmentItem';
import { AssessmentData, calculateScore, storeImages } from '@/features/assessments/helpers/helperFunctions';
import { AddAssessmentScreenNavigationProps } from '@/features/navigation/types.tsx';
import { Q } from '@nozbe/watermelondb';
import { withObservables } from '@nozbe/watermelondb/react';
import moment from 'moment';
import React, { useState } from 'react';
import { SafeAreaView, StyleSheet } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { useTheme } from 'react-native-paper';
import { map } from 'rxjs/operators';
import { emptyCustomTrackingSettings } from '../helpers/customTracking';

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

    const handleSubmit = async (assessmentData: AssessmentData) => {

      const assessmentDate = moment(date).format('YYYY-MM-DD');

      const score = calculateScore({
        date: assessmentDate,
        hurt: assessmentData.hurt,
        hunger: assessmentData.hunger,
        hydration: assessmentData.hydration,
        hygiene: assessmentData.hygiene,
        happiness: assessmentData.happiness,
        mobility: assessmentData.mobility,
        customValue: assessmentData.customValue,
      });

      const noteImages = await storeImages(assessmentData.images);

      await database.write(async () => {
        await database.get<Assessment>('assessments').create((record: Assessment) => {
          record.date = assessmentDate
          record.hurt = assessmentData.hurt;
          record.hunger = assessmentData.hunger;
          record.hydration = assessmentData.hydration;
          record.hygiene = assessmentData.hygiene;
          record.happiness = assessmentData.happiness;
          record.mobility = assessmentData.mobility;
          if (assessmentData.customValue !== undefined) record.customValue = assessmentData.customValue;
          if (assessmentData.notes) record.notes = assessmentData.notes;
          record.images = noteImages;
          record.score = score;
          record.pet.set(activePet);
        });
      });
      navigation.goBack();
    };

    // Get custom tracking settings from the pet
    const customTrackingSettings = activePet.customTrackingSettings ?? emptyCustomTrackingSettings;

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
