import React from 'react';
import {useTranslation} from 'react-i18next';
import {SafeAreaView, ScrollView, StyleSheet} from 'react-native';
import {Divider, useTheme} from 'react-native-paper';
import {AllAssessmentsScreenNavigationProps} from '@/features/navigation/types.tsx';
import LinearGradient from 'react-native-linear-gradient';
import ExportPdf from '@/features/pdfExport/components/ExportPdf';
import useAssessments from '@/features/assessments/hooks/useAssessments';
import usePet from '@/features/pets/hooks/usePet';
import {Calendar, LocaleConfig} from 'react-native-calendars';
import moment from 'moment';
import {DateData, MarkedDates} from 'react-native-calendars/src/types';

const AllAssessmentsScreen: React.FC<AllAssessmentsScreenNavigationProps> = ({
  navigation,
}) => {
  const {t, i18n} = useTranslation();
  const theme = useTheme();
  const {activePet} = usePet();
  const {lastAssessments} = useAssessments(activePet);
  LocaleConfig.defaultLocale = i18n.resolvedLanguage;

  const getIconColor = (score: number) => {
    if (score < 6) {
      return '#F44336';
    } else if (score < 15) {
      return '#F49503';
    } else if (score < 30) {
      return '#F0E106';
    } else if (score < 45) {
      return '#74D400';
    } else {
      return '#4CAF50';
    }
  };

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

  const markedDates: MarkedDates =
    lastAssessments?.reduce((acc, assessment) => {
      const date = moment(assessment.createdAt).format('YYYY-MM-DD');
      acc[date] = {
        selected: true,
        selectedColor: getIconColor(assessment.score),
      };
      return acc;
    }, {} as MarkedDates) ?? ({} as MarkedDates);

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
          <Calendar
            style={styles.calendar}
            theme={{
              arrowColor: theme.colors.primary,
            }}
            onDayPress={addOrEditAssessment}
            markedDates={markedDates}
            maxDate={moment().format('YYYY-MM-DD')}
          />
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
    padding: 20,
    justifyContent: 'flex-start',
    alignItems: 'stretch',
  },
  scrollview: {
    flex: 1,
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
