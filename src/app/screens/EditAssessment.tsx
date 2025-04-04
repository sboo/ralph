import React from 'react';
import AssessmentItem from '@/features/assessments/components/AssessmentItem';
import {useObject} from '@realm/react';
import {useTheme} from 'react-native-paper';
import {Measurement} from '@/app/models/Measurement';
import {BSON} from 'realm';
import {EditAssessmentScreenNavigationProps} from '@/features/navigation/types.tsx';
import {SafeAreaView, StyleSheet} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import usePet from '@/features/pets/hooks/usePet';
import useAssessments from '@/features/assessments/hooks/useAssessments';

const EditAssessment: React.FC<EditAssessmentScreenNavigationProps> = ({
  route,
  navigation,
}) => {
  const _id = BSON.ObjectId.createFromHexString(route.params.assessmentId);
  const scrollToNotes = route.params.scrollToNotes;
  const assessment = useObject(Measurement, _id);
  const theme = useTheme();
  const {activePet} = usePet();
  const {editAssessment, customTrackingSettings} = useAssessments(activePet);

  if (!activePet) {
    navigation.goBack();
    return;
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
    if (assessment) {
      await editAssessment(assessment, {
        date: assessment!.createdAt,
        hurt,
        hunger,
        hydration,
        hygiene,
        happiness,
        mobility,
        customValue,
        notes,
        images,
      });
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
        <AssessmentItem
          date={assessment!.createdAt}
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

export default EditAssessment;
