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
  const assessment = useObject(Measurement, _id);
  const theme = useTheme();
  const {activePet} = usePet();
  const {editAssessment} = useAssessments(activePet);

  if (!activePet) {
    navigation.goBack();
    return;
  }

  const handleSubmit = (
    hurt: number,
    hunger: number,
    hydration: number,
    hygiene: number,
    happiness: number,
    mobility: number,
    notes?: string,
  ) => {
    if (assessment) {
      editAssessment(assessment, {
        date: assessment!.createdAt,
        hurt,
        hunger,
        hydration,
        hygiene,
        happiness,
        mobility,
        notes,
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
    padding: 20,
    justifyContent: 'flex-start',
    alignItems: 'stretch',
  },
});

export default EditAssessment;
