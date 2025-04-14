import React from 'react';
import AssessmentItem from '@/features/assessments/components/AssessmentItem';
import {useTheme} from 'react-native-paper';
import {EditAssessmentScreenNavigationProps} from '@/features/navigation/types.tsx';
import {SafeAreaView, StyleSheet} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { withObservables } from '@nozbe/watermelondb/react';
import { database } from '@/app/database';
import { Q } from '@nozbe/watermelondb';
import { Pet } from '@/app/database/models/Pet';
import { Assessment } from '@/app/database/models/Assessment';
import { map } from 'rxjs/operators';
import { calculateScore } from '@/features/assessments/helpers/helperFunctions';

// The presentational component
const EditAssessmentComponent: React.FC<EditAssessmentScreenNavigationProps & {
  activePet: Pet | undefined,
  assessment: Assessment | undefined
}> = ({
  route,
  navigation,
  activePet,
  assessment
}) => {
  const scrollToNotes = route.params.scrollToNotes;
  const theme = useTheme();

  if (!activePet || !assessment) {
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

    const score = calculateScore({
      date: assessment.date,
      hurt,
      hunger,
      hydration,
      hygiene,
      happiness,
      mobility,
      customValue,
    });

    await database.write(async () => {
      await assessment.update(record => {
        record.hurt = hurt;
        record.hunger = hunger;
        record.hydration = hydration;
        record.hygiene = hygiene;
        record.happiness = happiness;
        record.mobility = mobility;
        if (customValue !== undefined) record.customValue = customValue;
        if (notes !== undefined) record.notes = notes;
        if (images) record.images = images;
        record.score = score;
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
          date={new Date(assessment.date)}
          petName={activePet.name}
          petSpecies={activePet.species}
          assessment={assessment}
          customTracking={customTrackingSettings}
          onCancel={() => navigation.goBack()}
          onSubmit={handleSubmit}
          scrollToNotes={scrollToNotes}
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
const enhance = withObservables(['route'], ({ route }) => {
  const assessmentId = route.params.assessmentId;
  
  // Get active pet
  const activePetObservable = database
    .get<Pet>('pets')
    .query(Q.where('is_active', true))
    .observe()
    .pipe(map(pets => pets.length > 0 ? pets[0] : undefined));

  // Get the assessment by ID
  const assessmentObservable = database
    .get<Assessment>('assessments')
    .findAndObserve(assessmentId);

  return {
    activePet: activePetObservable,
    assessment: assessmentObservable,
  };
});

// Export the enhanced component
export default enhance(EditAssessmentComponent);
