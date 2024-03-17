import type {NativeStackScreenProps} from '@react-navigation/native-stack';

export type RootStackParamList = {
  Welcome: undefined;
  Settings: undefined;
  Home: undefined;
  AddMeasurement: {timestamp: number};
  EditMeasurement: {measurementId: string};
  AllMeasurements: undefined;
  DebugScreen: undefined;
};

export type WelcomeScreenNavigationProps = NativeStackScreenProps<
  RootStackParamList,
  'Welcome'
>;

export type SettingsScreenNavigationProps = NativeStackScreenProps<
  RootStackParamList,
  'Settings'
>;

export type HomeScreenNavigationProps = NativeStackScreenProps<
  RootStackParamList,
  'Home'
>;

export type AddMeasurementScreenNavigationProps = NativeStackScreenProps<
  RootStackParamList,
  'AddMeasurement'
>;

export type EditMeasurementScreenNavigationProps = NativeStackScreenProps<
  RootStackParamList,
  'EditMeasurement'
>;

export type AllMeasurementsScreenNavigationProps = NativeStackScreenProps<
  RootStackParamList,
  'AllMeasurements'
>;
