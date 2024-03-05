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

import {todaysMeasurementDone} from './src/support/dailyMeasurementStatus';

todaysMeasurementDone().then(result => {
  console.log('dailyMeasurementStatus', result);
});

export default function Main() {
  return (
    <RealmProvider schema={schemas}>
      <App />
    </RealmProvider>
  );
}

AppRegistry.registerComponent(appName, () => Main);
