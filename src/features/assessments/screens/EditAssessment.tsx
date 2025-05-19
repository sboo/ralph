import { database } from '@/core/database';
import { withActivePet } from '@/core/database/hoc';
import { Assessment } from '@/core/database/models/Assessment';
import { Pet } from '@/core/database/models/Pet';
import AssessmentItem from '@/features/assessments/components/AssessmentItem';
import {
  AssessmentData,
  calculateScore,
  storeImages,
} from '@/features/assessments/helpers/helperFunctions';
import { EditAssessmentScreenNavigationProps } from '@/features/navigation/types.tsx';
import { compose, withObservables } from '@nozbe/watermelondb/react';
import React from 'react';
import { StyleSheet } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { useTheme } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { emptyCustomTrackingSettings } from '../helpers/customTracking';

// The presentational component
const EditAssessmentComponent: React.FC<
  EditAssessmentScreenNavigationProps & {
    activePet: Pet | undefined;
    assessment: Assessment | undefined;
  }
> = ({route, navigation, activePet, assessment}) => {
  const scrollToNotes = route.params.scrollToNotes;
  const theme = useTheme();

  if (!activePet || !assessment) {
    navigation.goBack();
    return null;
  }

  const handleSubmit = async (assessmentData: AssessmentData) => {
    const score = calculateScore({
      date: assessment.date,
      hurt: assessmentData.hurt,
      hunger: assessmentData.hunger,
      hydration: assessmentData.hydration,
      hygiene: assessmentData.hygiene,
      happiness: assessmentData.happiness,
      mobility: assessmentData.mobility,
      customValue: assessmentData.customValue,
    });

    const noteImages = await storeImages(
      assessmentData.images,
      Array.from(assessment.images ?? []),
    );

    await database.write(async () => {
      await assessment.update((record: Assessment) => {
        record.hurt = assessmentData.hurt;
        record.hunger = assessmentData.hunger;
        record.hydration = assessmentData.hydration;
        record.hygiene = assessmentData.hygiene;
        record.happiness = assessmentData.happiness;
        record.mobility = assessmentData.mobility;
        if (assessmentData.customValue !== undefined)
          record.customValue = assessmentData.customValue;
        if (assessmentData.notes !== undefined)
          record.notes = assessmentData.notes;
        record.images = noteImages;
        record.score = score;
      });
    });
    navigation.goBack();
  };

  // Get custom tracking settings from the pet
  const customTrackingSettings =
    activePet.customTrackingSettings ?? emptyCustomTrackingSettings;

  return (
    <LinearGradient
      colors={[
        theme.colors.primaryContainer,
        theme.colors.background,
        theme.colors.primaryContainer,
      ]}
      locations={[0, 0.75, 1]}
      style={styles.gradient}>
      <SafeAreaView
          edges={['bottom', 'left', 'right']}
        style={{
          backgroundColor: theme.colors.primaryContainer,
          ...styles.container,
        }}>
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
      </SafeAreaView>
    </LinearGradient>
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

const enhance: (
  component: React.ComponentType<any>,
) => React.ComponentType<any> = compose(
  withActivePet,
  withObservables(['route'], ({route}) => {
    const assessmentId = route.params.assessmentId;
    // Get the assessment by ID
    const assessmentObservable = database
      .get<Assessment>('assessments')
      .findAndObserve(assessmentId);
    return {
      assessment: assessmentObservable,
    };
  }),
);

// Export the enhanced component
export default enhance(EditAssessmentComponent);
