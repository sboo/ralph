/**
 * @format
 */

import React from 'react';
import {AppRegistry} from 'react-native';
import {PaperProvider} from 'react-native-paper';
import App from './src/app/App';
import {name as appName} from './app.json';
import {RealmProvider} from '@realm/react';
import {schemas} from './src/models';
import './src/localization/i18n';

export default function Main() {
  return (
    <PaperProvider>
      <RealmProvider schema={schemas}>
        <App />
      </RealmProvider>
    </PaperProvider>
  );
}

AppRegistry.registerComponent(appName, () => Main);
