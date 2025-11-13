import { withActivePetAssessments } from '@/core/database/hoc';
import { Assessment } from '@/core/database/models/Assessment';
import { Pet } from '@/core/database/models/Pet';
import AssessmentsCalendar from '@/features/assessments/components/AssessmentsCalendar';
import { AllAssessmentsScreenNavigationProps } from '@/features/navigation/types';
import ExportPdf from '@/features/pdfExport/components/ExportPdf';
import { GradientBackground } from '@/shared/components/gradient-background';
import { compose } from '@nozbe/watermelondb/react';
import React from 'react';
import { ScrollView, StyleSheet } from 'react-native';
import { DateData } from 'react-native-calendars/src/types';
import { Divider, useTheme } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';

// The presentational component
const AllAssessmentsScreenComponent: React.FC<
  AllAssessmentsScreenNavigationProps & {
    activePet: Pet | undefined;
    assessments: Assessment[];
  }
> = ({navigation, activePet, assessments}) => {
  const theme = useTheme();

  const addOrEditAssessment = (dateData: DateData) => {
    const assessment = assessments?.find(m => m.date === dateData.dateString);
    if (assessment === undefined) {
      navigation.navigate('AddAssessment', {
        timestamp: dateData.timestamp,
      });
    } else {
      navigation.navigate('EditAssessment', {
        assessmentId: assessment.id,
      });
    }
  };

  return (
    <SafeAreaView
      edges={['bottom', 'left', 'right']}
      style={{
        backgroundColor: theme.colors.primaryContainer,
        ...styles.container,
      }}>
      <GradientBackground
        style={styles.gradient}>
        <ScrollView style={styles.scrollview}>
          <AssessmentsCalendar onCalendarDayPress={addOrEditAssessment} />
          <Divider style={styles.divider} bold={true} />
          <ExportPdf />
        </ScrollView>
      </GradientBackground>
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
  scrollview: {
    flex: 1,
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  calendar: {
    borderRadius: 10,
    padding: 10,
    margin: 10,
  },
  divider: {
    marginVertical: 20,
  },
});

const enhance = compose(
  withActivePetAssessments({
    sortBy: {column: 'date', direction: 'asc'},
  }),
);

// Export the enhanced component
export default enhance(AllAssessmentsScreenComponent);
