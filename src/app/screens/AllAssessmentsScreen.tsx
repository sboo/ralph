import React from 'react';
import {SafeAreaView, ScrollView, StyleSheet} from 'react-native';
import {Divider, useTheme} from 'react-native-paper';
import {AllAssessmentsScreenNavigationProps} from '@/features/navigation/types.tsx';
import LinearGradient from 'react-native-linear-gradient';
import ExportPdf from '@/features/pdfExport/components/ExportPdf';
import useAssessments from '@/features/assessments/hooks/useAssessments';
import usePet from '@/features/pets/hooks/usePet';
import {DateData} from 'react-native-calendars/src/types';
import AssessmentsCalendar from '@/features/assessments/components/AssessmentsCalendar';

const AllAssessmentsScreen: React.FC<AllAssessmentsScreenNavigationProps> = ({
  navigation,
}) => {
  const theme = useTheme();
  const {activePet} = usePet();
  const {lastAssessments} = useAssessments(activePet);

  const addOrEditAssessment = (dateData: DateData) => {
    const assessment = lastAssessments?.find(
      m => m.date === dateData.dateString,
    );
    if (assessment === undefined) {
      navigation.navigate('AddAssessment', {
        timestamp: dateData.timestamp,
      });
    } else {
      navigation.navigate('EditAssessment', {
        assessmentId: assessment._id.toHexString(),
      });
    }
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
        <ScrollView style={styles.scrollview}>
          <AssessmentsCalendar onCalendarDayPress={addOrEditAssessment} />
          <Divider style={styles.divider} bold={true} />
          <ExportPdf />
        </ScrollView>
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

export default AllAssessmentsScreen;
