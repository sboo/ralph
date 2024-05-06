import usePet from '@/features/pets/hooks/usePet';
import React, {useMemo} from 'react';
import {useTranslation} from 'react-i18next';
import {Calendar, DateData, LocaleConfig} from 'react-native-calendars';
import {useTheme} from 'react-native-paper';
import useAssessments from '../hooks/useAssessments';
import {MarkedDates} from 'react-native-calendars/src/types';
import moment from 'moment';
import {StyleSheet} from 'react-native';

interface Props {
  onCalendarDayPress: (dateData: DateData) => void;
}

const AssessmentsCalendar: React.FC<Props> = ({onCalendarDayPress}) => {
  const {i18n} = useTranslation();
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

  const markedDates: MarkedDates = useMemo(() => {
    return (
      lastAssessments?.reduce((acc, assessment) => {
        const date = moment(assessment.createdAt).format('YYYY-MM-DD');
        acc[date] = {
          selected: true,
          selectedColor: getIconColor(assessment.score),
        };
        return acc;
      }, {} as MarkedDates) ?? ({} as MarkedDates)
    );
  }, [lastAssessments]);

  return (
    <Calendar
      style={styles.calendar}
      onDayPress={onCalendarDayPress}
      markedDates={markedDates}
      maxDate={moment().format('YYYY-MM-DD')}
    />
  );
};

const styles = StyleSheet.create({
  calendar: {
    borderRadius: 15,
    padding: 10,
  },
});

export default AssessmentsCalendar;
