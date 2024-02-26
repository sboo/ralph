/**
 * @format
 */

import {AppRegistry} from 'react-native';
import {PaperProvider} from 'react-native-paper';
import App from './src/app/App';
import {name as appName} from './app.json';
import React from 'react';

export default function Main() {
  return (
    <PaperProvider>
      <App />
    </PaperProvider>
  );
}

AppRegistry.registerComponent(appName, () => Main);
