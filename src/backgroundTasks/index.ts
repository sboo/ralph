import BackgroundFetch from 'react-native-background-fetch';
import notifee from '@notifee/react-native';
import {todaysMeasurementDone} from '../support/dailyMeasurementStatus';

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

const handleBackgroundTask = async (taskId: string) => {
  console.log('[BackgroundFetch] taskId', taskId);
  switch (taskId) {
    default:
    case TASK_IDS.REMINDER_TASK:
      console.log('Reminder task');
      const done = await todaysMeasurementDone();
      console.log('done', done);
      if (!done) {
        await displayReminderNotification();
      }
      break;
  }
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
      color: '#6495ed',
      timestamp: Date.now() - 800, // 8 minutes ago
      showTimestamp: true,
    },
  });
};

export const scheduleReminderTask = async () => {
  return BackgroundFetch.scheduleTask({
    taskId: TASK_IDS.REMINDER_TASK,
    delay: 5000,
    periodic: true,
  });
};

export enum TASK_IDS {
  REMINDER_TASK = 'eu.sboo.ralph.remindertask',
}
