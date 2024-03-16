import BackgroundFetch from 'react-native-background-fetch';
import notifee from '@notifee/react-native';
import {todaysMeasurementDone} from '@/features/measurements/helpers/dailyMeasurementStatus.ts';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {STORAGE_KEYS} from '@/app/store/storageKeys.ts';
import moment from 'moment';
import i18next from 'i18next';

/// Configure BackgroundFetch.
///
export const initBackgroundFetch = async () => {
  const status: number = await BackgroundFetch.configure(
    //config
    {
      minimumFetchInterval: 15, // <-- minutes (15 is minimum allowed)
      stopOnTerminate: false,
      enableHeadless: true,
      startOnBoot: true,
      // Android options
      forceAlarmManager: false, // <-- Set true to bypass JobScheduler.
      requiredNetworkType: BackgroundFetch.NETWORK_TYPE_NONE, // Default
      requiresCharging: false, // Default
      requiresDeviceIdle: false, // Default
      requiresBatteryNotLow: false, // Default
      requiresStorageNotLow: false, // Default
    },
    //onEvent,
    async (taskId: string) => {
      console.log('[BackgroundFetch] taskId', taskId);
      // Create an Event record.
      await handleBackgroundTask(taskId);
      // Finish.
      BackgroundFetch.finish(taskId);
    },
    //onTimeout,
    (taskId: string) => {
      // Oh No!  Our task took too long to complete and the OS has signalled
      // that this task must be finished immediately.
      console.log('[Fetch] TIMEOUT taskId:', taskId);
      BackgroundFetch.finish(taskId);
    },
  );
  console.log('[BackgroundFetch] configure status:', status);
};

export const startBackgroundTasks = () => {
  BackgroundFetch.start();
};

export const stopBackgroundTasks = () => {
  BackgroundFetch.stop();
};

export const handleBackgroundTask = async (taskId: string) => {
  console.log('[BackgroundFetch] taskId', taskId);
  switch (taskId) {
    default:
    case TASK_IDS.REMINDER_TASK:
      const done = await todaysMeasurementDone();
      const alreadyReminded = await todaysReminderShown();

      const now = new Date();
      const hours = now.getHours();

      if (!done && !alreadyReminded && hours >= 20) {
        await displayReminderNotification();
        await AsyncStorage.setItem(
          STORAGE_KEYS.LAST_REMINDER_DATE,
          new Date().getTime().toString(),
        );
      }
      break;
  }
};

const todaysReminderShown = async () => {
  const lastReminderTimestamp = await AsyncStorage.getItem(
    STORAGE_KEYS.LAST_REMINDER_DATE,
  );
  if (lastReminderTimestamp === null) {
    return false;
  }

  try {
    const lastReminderDate = new Date(Number(lastReminderTimestamp));
    return (
      moment(lastReminderDate).format('YYYY-MM-DD') ===
      moment().format('YYYY-MM-DD')
    );
  } catch (error) {
    console.error(error);
    return false;
  }
};

const displayReminderNotification = async () => {
  const fetchPetName = async () => {
    const petName = await AsyncStorage.getItem(STORAGE_KEYS.PET_NAME);
    return petName;
  };

  const channelId = await notifee.createChannel({
    id: 'reminders',
    name: i18next.t('measurements:reminders'),
  });
  await notifee.displayNotification({
    id: 'eu.sboo.ralph.reminder',
    title: i18next.t('measurements:notificatationTitle'),
    body: i18next.t('measurements:notificationBody', {
      petName: await fetchPetName(),
    }),
    android: {
      channelId,
      smallIcon: 'ic_small_icon',
      pressAction: {
        id: 'default',
      },
      color: '#6495ed',
      timestamp: Date.now() - 800, // 8 minutes ago
      showTimestamp: true,
    },
  });
};

export const scheduleReminderTask = async () => {
  return BackgroundFetch.scheduleTask({
    taskId: TASK_IDS.REMINDER_TASK,
    delay: 100000,
    periodic: true,
    forceAlarmManager: false,
  });
};

export enum TASK_IDS {
  REMINDER_TASK = 'eu.sboo.ralph.remindertask',
}
