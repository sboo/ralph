import { getValidReminderTimestamp } from '@/support/helpers/DateTimeHelpers';
import { AssessmentFrequency } from '@core/database/models/Pet';
import notifee, {
    RepeatFrequency,
    TimestampTrigger,
    TriggerType
} from '@notifee/react-native';
import i18next from 'i18next';

const NOTIFICATION_PREFIX = 'eu.sboo.ralph.reminder_';

export const getNotificationId = (petId: string) => {
  return `${NOTIFICATION_PREFIX}${petId}`;
};

export const createTriggerNotification = async (
    petId: string,
    petName: string,
    reminderTime: Date,
    assessmentFrequency: AssessmentFrequency,
) => {
    const channelGroupId = await notifee.createChannelGroup({
      id: 'reminders',
      name: i18next.t('measurements:reminders'),
    });

    const channelId = await notifee.createChannel({
      id: petId,
      groupId: channelGroupId,
      name: petName,
    });

    const reminderTimestamp = getValidReminderTimestamp(reminderTime, assessmentFrequency);

    // Create a time-based trigger
    const trigger: TimestampTrigger = {
      type: TriggerType.TIMESTAMP,
      timestamp: reminderTimestamp,
      repeatFrequency: assessmentFrequency == 'WEEKLY' ? RepeatFrequency.WEEKLY : RepeatFrequency.DAILY,
    };

    await notifee.createTriggerNotification(
      {
        id: getNotificationId(petId),
        title: i18next.t('measurements:notificationTitle', {
          petName: petName,
        }),
        body: i18next.t('measurements:notificationBody', {
          petName: petName,
        }),
        android: {
          channelId: channelId,
          smallIcon: 'ic_small_icon',
          pressAction: {
            id: 'default',
          },
        },
      },
      trigger,
    );
  };