/**
 * @format
 */

import React from 'react';
import {AppRegistry} from 'react-native';
import {PaperProvider, MD3LightTheme as DefaultTheme,} from 'react-native-paper';
import App from './src/app/App';
import {name as appName} from './app.json';
import {RealmProvider} from '@realm/react';
import {schemas} from './src/models';
import './src/localization/i18n';
import colors from './src/lightTheme.json';

const theme = {
  ...DefaultTheme,
  colors: colors, // Copy it from the color codes scheme and then use it here
};

export default function Main() {
  return (
    <PaperProvider theme={theme}>
      <RealmProvider schema={schemas}>
        <App />
      </RealmProvider>
    </PaperProvider>
  );
}

AppRegistry.registerComponent(appName, () => Main);
