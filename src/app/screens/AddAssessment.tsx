import React, {useState} from 'react';
import AssessmentItem from '@/features/assessments/components/AssessmentItem';
import {useTheme} from 'react-native-paper';
import {AddAssessmentScreenNavigationProps} from '@/features/navigation/types.tsx';
import LinearGradient from 'react-native-linear-gradient';
import {SafeAreaView, StyleSheet} from 'react-native';
import usePet from '@/features/pets/hooks/usePet';
import useAssessments from '@/features/assessments/hooks/useAssessments';

const AddAssessment: React.FC<AddAssessmentScreenNavigationProps> = ({
  route,
  navigation,
}) => {
  const [date] = useState(new Date(route.params.timestamp));

  const theme = useTheme();
  const {activePet} = usePet();
  const {addAssessment, customTrackingSettings} = useAssessments(activePet);

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
    await addAssessment({
      date,
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

export default AddAssessment;
