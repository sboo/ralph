import React from 'react';
import {SafeAreaView, ScrollView, StyleSheet} from 'react-native';
import {Divider, useTheme} from 'react-native-paper';
import {AllAssessmentsScreenNavigationProps} from '@/features/navigation/types.tsx';
import LinearGradient from 'react-native-linear-gradient';
import ExportPdf from '@/features/pdfExport/components/ExportPdf';
import {DateData} from 'react-native-calendars/src/types';
import AssessmentsCalendar from '@/features/assessments/components/AssessmentsCalendar';
import { withObservables } from '@nozbe/watermelondb/react';
import { database } from '@/app/database';
import { Q } from '@nozbe/watermelondb';
import { Pet } from '@/app/database/models/Pet';
import { Assessment } from '@/app/database/models/Assessment';
import { map, switchMap } from 'rxjs/operators';
import { Observable } from 'rxjs';

// The presentational component
const AllAssessmentsScreenComponent: React.FC<AllAssessmentsScreenNavigationProps & {
  activePet: Pet | undefined,
  assessments: Assessment[]
}> = ({
  navigation,
  activePet,
  assessments
}) => {
  const theme = useTheme();

  const addOrEditAssessment = (dateData: DateData) => {
    const assessment = assessments?.find(
      m => m.date === dateData.dateString,
    );
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

// Connect the component with WatermelonDB observables
const enhance = withObservables([], () => {
  // Get active pet
  const activePetObservable = database
    .get<Pet>('pets')
    .query(Q.where('is_active', true))
    .observe()
    .pipe(map(pets => pets.length > 0 ? pets[0] : undefined));

  // Create assessments observable that depends on the active pet (sorted by date descending)
  const assessmentsObservable = activePetObservable.pipe(
    switchMap(pet => {
      if (!pet) {
        return new Observable<Assessment[]>(subscriber => subscriber.next([]));
      }
      return database
        .get<Assessment>('assessments')
        .query(Q.where('pet_id', pet.id), Q.sortBy('date', 'desc'))
        .observe();
    })
  );

  return {
    activePet: activePetObservable,
    assessments: assessmentsObservable
  };
});

// Export the enhanced component
export default enhance(AllAssessmentsScreenComponent);
