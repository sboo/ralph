import BackgroundFetch from 'react-native-background-fetch';
import notifee from '@notifee/react-native';
import {todaysMeasurementDone} from '../support/dailyMeasurementStatus';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {STORAGE_KEYS} from '../support/storageKeys';

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

      const now = new Date();
      const hours = now.getHours();

      if (!done && !todaysReminderShown() && hours >= 20) {
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
  const lastReminderDate = new Date(lastReminderTimestamp);
  return (
    lastReminderDate.toISOString().split('T')[0] ===
    new Date().toISOString().split('T')[0]
  );
};

const displayReminderNotification = async () => {
  const channelId = await notifee.createChannel({
    id: 'default',
    name: 'Default Channel',
  });
  await notifee.displayNotification({
    id: '1234',
    title: `<p style="color: white;"><b>John  sent a message</span></p></b></p>`,
    body: "Dont forget today's measurement! 🌟",
    android: {
      channelId,
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
  });
};

export enum TASK_IDS {
  REMINDER_TASK = 'eu.sboo.ralph.remindertask',
}
