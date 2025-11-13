import CustomNavigationBar from "@/features/navigation/components/CustomNavigationBar";
import { NativeStackNavigationOptions } from "@react-navigation/native-stack";

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
  const isTransparent = backgroundColor === 'transparent';
  return {
    title,
    headerTransparent: isTransparent,
    headerStyle: { backgroundColor },
  };
};

/**
 * Create home screen header options with dynamic color based on active pet
 */
export const createHomeHeaderOptions = (headerColor: string): NativeStackNavigationOptions => {
  const isTransparent = headerColor === 'transparent';
  return {
    title: '',
    headerTransparent: isTransparent,
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