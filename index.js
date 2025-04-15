/**
 * @format
 */

import React from 'react';
import {AppRegistry} from 'react-native';
import App from '@/app/App';
import {name as appName} from './app.json';
import '@/app/localization/i18n';
import notifee, {EventType} from '@notifee/react-native';

export default function Main() {
  return <App />;
}

AppRegistry.registerComponent(appName, () => Main);

notifee.onBackgroundEvent(async ({type, detail}) => {
  switch (type) {
    case EventType.PRESS:
      console.log('User pressed notification', detail.notification.id);
      break;
    case EventType.DISMISSED:
      console.log('User dismissed notification', detail.notification.id);
      break;
    case EventType.ACTION_PRESS:
      console.log('User pressed action button', detail.id, detail.pressAction);
      break;
    default:
      break;
  }
});
