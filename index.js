/**
 * @format
 */

import React from 'react';
import {AppRegistry} from 'react-native';
import App from './src/app/App';
import {name as appName} from './app.json';
import {RealmProvider} from '@realm/react';
import {schemas} from './src/models';
import './src/localization/i18n';
import BackgroundFetch from 'react-native-background-fetch';
import {handleBackgroundTask} from './src/backgroundTasks';
import notifee, { EventType } from '@notifee/react-native';


export default function Main() {
  return (
    <RealmProvider schema={schemas}>
      <App />
    </RealmProvider>
  );
}

AppRegistry.registerComponent(appName, () => Main);

/// BackgroundFetch Android Headless Event Receiver.
/// Called when the Android app is terminated.
///
const backgroundFetchHeadlessTask = async event => {
  if (event.timeout) {
    console.log('[BackgroundFetch] 💀 HeadlessTask TIMEOUT: ', event.taskId);
    BackgroundFetch.finish(event.taskId);
    return;
  }

  console.log('[BackgroundFetch] 💀 HeadlessTask start: ', event.taskId);

  // Persist a new Event into AsyncStorage.  It will appear in the view when app is next booted.
  handleBackgroundTask(event.taskId);
  // Required:  Signal to native code that your task is complete.
  // If you don't do this, your app could be terminated and/or assigned
  // battery-blame for consuming too much time in background.
  BackgroundFetch.finish(event.taskId);
};

/// Now register the handler.
BackgroundFetch.registerHeadlessTask(backgroundFetchHeadlessTask);

notifee.onBackgroundEvent(async ({type, detail}) => {
  switch (type) {
    case EventType.PRESS:
      console.log('User pressed notification', detail.id);
      break;
    case EventType.DISMISSED:
      console.log('User dismissed notification', detail.id);
      break;
    case EventType.ACTION_PRESS:
      console.log('User pressed action button', detail.id, detail.pressAction);
      break;
    default:
      break;
  }
});
