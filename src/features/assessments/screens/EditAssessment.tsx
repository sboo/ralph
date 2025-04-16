import { database } from '@/app/database';
import { withActivePet } from '@/app/database/hoc';
import { Assessment } from '@/app/database/models/Assessment';
import { Pet } from '@/app/database/models/Pet';
import AssessmentItem from '@/features/assessments/components/AssessmentItem';
import { calculateScore, storeImages } from '@/features/assessments/helpers/helperFunctions';
import { EditAssessmentScreenNavigationProps } from '@/features/navigation/types.tsx';
import { compose, withObservables } from '@nozbe/watermelondb/react';
import React from 'react';
import { SafeAreaView, StyleSheet } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { useTheme } from 'react-native-paper';

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

    const noteImages = await storeImages(
      images,
      Array.from(assessment.images ?? []),
    );

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
        record.images = noteImages;
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

const enhance: (component: React.ComponentType<any>) => React.ComponentType<any> = compose(
  withActivePet,
  withObservables(['route'], ({ route }) => {
    const assessmentId = route.params.assessmentId;
    // Get the assessment by ID
    const assessmentObservable = database
      .get<Assessment>('assessments')
      .findAndObserve(assessmentId);
    return {
      assessment: assessmentObservable,
    };
  })
);

// Export the enhanced component
export default enhance(EditAssessmentComponent);
