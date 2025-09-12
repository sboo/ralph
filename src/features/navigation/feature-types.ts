import { Pet } from "@core/database/models/Pet";
import { NativeStackNavigationOptions } from "@react-navigation/native-stack";

/**
 * Interface for the AppNavigator props
 */
export interface AppNavigatorProps {
  /** Color for the header background */
  headerColor: string;
  /** Current theme object */
  theme: any;
  /** Currently active pet */
  activePet?: Pet;
}

/**
 * Interface for the CustomNavigationBar props
 */
export interface CustomNavigationBarProps {
  /** Navigation prop from react-navigation */
  navigation: any;
  /** Current route information */
  route: any;
  /** Navigation options */
  options: any;
  /** Back button state */
  back?: boolean;
}

/**
 * Interface defining the core functionality provided by the navigation feature
 */
export interface NavigationFeatureAPI {
  /** Main app navigator component */
  AppNavigator: React.FC<AppNavigatorProps>;
  
  /** Create default screen options with custom navigation bar */
  createDefaultScreenOptions: () => any;
  
  /** Create header options for a specific screen */
  createHeaderOptions: (title: string, backgroundColor: string) => NativeStackNavigationOptions;
  
  /** Create home screen header options with dynamic color */
  createHomeHeaderOptions: (headerColor: string) => NativeStackNavigationOptions;
  
  /** Create options for screens without headers */
  createNoHeaderOptions: () => NativeStackNavigationOptions;
  
  /** Create assessment screen title with pet name */
  createAssessmentTitle: (title: string, petName?: string) => string;
}

/**
 * Re-export screen prop types to make them available from the navigation feature
 */
export type {
    AddAssessmentScreenNavigationProps, AddPetScreenNavigationProps, AllAssessmentsScreenNavigationProps, AllNotesNavigationProps, AssessmentSettingsScreenNavigationProps, CustomTrackingSettingsScreenNavigationProps, EditAssessmentScreenNavigationProps, EditPetScreenNavigationProps, HomeScreenNavigationProps, NotificationSettingsScreenNavigationProps, OnboardingScreenNavigationProps,
    SettingsScreenNavigationProps, WelcomeScreenNavigationProps
} from './types';

