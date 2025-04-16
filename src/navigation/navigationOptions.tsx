import { NativeStackNavigationOptions } from "@react-navigation/native-stack";
import { Theme } from "@react-navigation/native";
import CustomNavigationBar from "@/features/navigation/components/CustomNavigationBar";
import { Pet } from "@/app/database/models/Pet";

/**
 * Create default screen options with custom navigation bar
 */
export const createDefaultScreenOptions = () => {
  return {
    header: (props: any) => <CustomNavigationBar {...props} />,
  };
};

/**
 * Create header options for a specific screen
 */
export const createHeaderOptions = (
  title: string, 
  backgroundColor: string
): NativeStackNavigationOptions => {
  return {
    title,
    headerStyle: { backgroundColor },
  };
};

/**
 * Create home screen header options with dynamic color based on active pet
 */
export const createHomeHeaderOptions = (headerColor: string): NativeStackNavigationOptions => {
  return {
    title: '',
    headerStyle: { backgroundColor: headerColor },
  };
};

/**
 * Create options for screens without headers
 */
export const createNoHeaderOptions = (): NativeStackNavigationOptions => {
  return {
    headerShown: false,
  };
};

/**
 * Create assessment screen title with pet name
 */
export const createAssessmentTitle = (
  title: string, 
  petName?: string
): string => {
  return petName ? `${title} - ${petName}` : title;
};