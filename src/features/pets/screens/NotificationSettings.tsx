import { event, EVENT_NAMES } from '@/features/events';
import { NotificationSettingsScreenNavigationProps } from '@/features/navigation/types';
import { GradientBackground } from '@/shared/components/gradient-background';
import { timeToDateObject } from '@/shared/helpers/DateTimeHelpers';
import { getCalendars } from 'expo-localization';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ScrollView, StyleSheet, View } from 'react-native';
import DatePicker from 'react-native-date-picker';
import {
  Avatar,
  Button,
  Card,
  List,
  Switch,
  Text,
  useTheme,
} from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';

const NotificationSettings: React.FC<
  NotificationSettingsScreenNavigationProps
> = ({route, navigation}) => {
  const {t} = useTranslation();
  const theme = useTheme();
  const {notificationsEnabled, notificationTime} = route.params;
  const [remindersEnabled, setRemindersEnabled] =
    useState(notificationsEnabled);
  const [reminderTime, setReminderTime] = useState<Date>(
    timeToDateObject(notificationTime),
  );
  const [timePickerOpen, setTimePickerOpen] = useState(false);
  const [hour12, setHour12] = useState<boolean>(false);

  useEffect(() => {
    const calendars = getCalendars();
    const uses24Hour = calendars[0]?.uses24hourClock ?? false;
  setHour12(!uses24Hour);

  }, []);

  const handleRemindersToggled = (remindersEnabled: boolean) => {
    event.emit(EVENT_NAMES.REMINDERS_TOGGLED, remindersEnabled);
    setRemindersEnabled(remindersEnabled);
  };

  const handleReminderTime = (reminderTime: Date) => {
    event.emit(EVENT_NAMES.REMINDER_TIME_CHANGED, reminderTime);
    setReminderTime(reminderTime);
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
        <ScrollView style={styles.scrollView}>
          <Card
            mode="contained"
            style={{backgroundColor: theme.colors.surface, ...styles.card}}>
            <Card.Content style={styles.cardContent}>
              <Avatar.Icon
                icon="bell"
                size={50}
                style={{backgroundColor: theme.colors.tertiary}}
              />
              <Text style={styles.cardTitle} variant="headlineMedium">
                {t('settings:notifications')}
              </Text>
              <Text style={styles.cardText}>
                {t('settings:notificationsDescription')}
              </Text>
            </Card.Content>
          </Card>

          <List.Section>
            <List.Item
              title={t('settings:enableNotificationsLabel')}
              right={() => (
                <Switch
                  value={remindersEnabled}
                  onValueChange={handleRemindersToggled}
                />
              )}
            />
            {remindersEnabled && (
              <List.Item
                title={t('settings:reminderTimeLabel')}
                right={() => (
                  <Button
                    mode="outlined"
                    onPress={() => setTimePickerOpen(true)}>
                    {reminderTime.toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit',
                      hour12: hour12,
                    })}
                  </Button>
                )}
              />
            )}
          </List.Section>

          <DatePicker
            modal
            mode="time"
            minuteInterval={15}
            open={timePickerOpen}
            date={reminderTime}
            onConfirm={date => {
              setTimePickerOpen(false);
              handleReminderTime(date);
            }}
            onCancel={() => setTimePickerOpen(false)}
          />
        </ScrollView>
        <View style={styles.buttons}>
          <Button mode={'contained'} onPress={() => navigation.goBack()}>
            {t('buttons:done')}
          </Button>
        </View>
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
  scrollView: {
    flex: 1,
    paddingHorizontal: 20,
  },
  card: {
    marginBottom: 20,
  },
  cardContent: {
    flexDirection: 'column',
    gap: 10,
    alignItems: 'center',
    margin: 20,
  },
  cardTitle: {
    textAlign: 'center',
  },
  cardText: {
    textAlign: 'center',
  },
  buttons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.1)',
  },
});

export default NotificationSettings;
