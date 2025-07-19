import { assessmentDateToLocalDate } from '@/shared/helpers/DateTimeHelpers';
import { useTranslation } from 'react-i18next';
import { StyleSheet } from 'react-native';
import { Button, Dialog, List, Portal } from 'react-native-paper';
import { WeeklyDialogProps } from '../types';

const WeeklyAssessmentDialog: React.FC<WeeklyDialogProps> = ({
  visible,
  onDismiss,
  dates,
  onDateSelect,
}) => {
  const {t} = useTranslation();


  console.log('WeeklyAssessmentDialog dates:', dates);

  return (
    <Portal>
      <Dialog visible={visible} onDismiss={onDismiss}>
        <Dialog.Content>
          {dates.map(date => (
            <List.Section key={date}>
              <List.Item
                onPress={() => {
                  onDateSelect(date);
                  onDismiss();
                }}
                title={assessmentDateToLocalDate(date).toLocaleDateString(
                  undefined,
                  {
                    weekday: 'long',
                    // year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  },
                )}
                left={() => <List.Icon icon="calendar" />}
                right={() => <List.Icon icon="chevron-right" />}
              />
            </List.Section>
          ))}
        </Dialog.Content>
        <Dialog.Actions>
          <Button onPress={onDismiss}>{t('buttons:cancel')}</Button>
        </Dialog.Actions>
      </Dialog>
    </Portal>
  );
};

export default WeeklyAssessmentDialog;

const styles = StyleSheet.create({
  dialogDate: {
    paddingVertical: 12,
    fontSize: 16,
  },
});
