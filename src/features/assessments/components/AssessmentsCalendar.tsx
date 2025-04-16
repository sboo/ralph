import { withActivePetAssessments } from '@/app/database/hoc';
import { Assessment } from '@/app/database/models/Assessment';
import { Pet } from '@/app/database/models/Pet';
import { compose } from '@nozbe/watermelondb/react';
import moment from 'moment';
import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { StyleSheet } from 'react-native';
import { Calendar, DateData, LocaleConfig } from 'react-native-calendars';
import { MarkedDates } from 'react-native-calendars/src/types';
import { Text, useTheme } from 'react-native-paper';

interface Props {
  onCalendarDayPress: (dateData: DateData) => void;
  activePet?: Pet;
  assessments?: Assessment[];
}

// The presentational component
const AssessmentsCalendarComponent: React.FC<Props> = ({
  onCalendarDayPress,
  activePet,
  assessments = []
}) => {
  const {i18n} = useTranslation();
  const theme = useTheme();
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

  const markedDates: MarkedDates = useMemo(() => {
    return (
      assessments?.reduce((acc, assessment) => {
        const date = assessment.date; // Using date directly from WatermelonDB Assessment
        acc[date] = {
          selected: true,
          selectedColor: getIconColor(assessment.score),
          marked: !!assessment.notes,
        };
        return acc;
      }, {} as MarkedDates) ?? ({} as MarkedDates)
    );
  }, [assessments]);

  return (
    <Calendar
      style={styles.calendar}
      onDayPress={onCalendarDayPress}
      markedDates={markedDates}
      maxDate={moment().format('YYYY-MM-DD')}
      enableSwipeMonths={true}
      firstDay={1}
      renderHeader={(date) => {
        return <Text variant='titleMedium'>{date.toString('MMMM yyyy')}</Text>;
      }}
    />
  );
};

const styles = StyleSheet.create({
  calendar: {
    borderRadius: 15,
    padding: 10,
  },
});


const enhance = compose(
  withActivePetAssessments({
    sortBy: { column: 'created_at', direction: 'asc' }
  })
);

// Export the enhanced component
export default enhance(AssessmentsCalendarComponent);
