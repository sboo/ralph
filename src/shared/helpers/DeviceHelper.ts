import * as Device from 'expo-device';
import { Platform } from 'react-native';
import { EdgeInsets } from 'react-native-safe-area-context';

/**
 * Determines if the device has modern navigation (notch on iOS or gesture navigation on Android)
 * 
 * This function provides a better detection method than just checking for notches, as it also
 * accounts for Android devices with gesture navigation enabled.
 * 
 * @param insets - Safe area insets from useSafeAreaInsets()
 * @returns true if device has notch (iOS) or gesture navigation enabled (Android)
 */
export const hasModernNavigation = (insets: EdgeInsets): boolean => {
  if (Platform.OS === 'ios') {
    // iOS devices with notches typically have top safe area > 44 points
    // iPhone X and newer: 47-50 points (depending on orientation)
    // iPhone 8 and older: 20 points (status bar only)
    // Using 40 as threshold to account for any edge cases
    return Device.deviceType === Device.DeviceType.PHONE && insets.top > 40;
  } else if (Platform.OS === 'android') {
    // Android devices with gesture navigation have very small or no bottom insets
    // Gesture navigation: 0-16px typically (depending on manufacturer)
    // Traditional nav bar: 48px+ typically
    // Using 24 as threshold to be more reliable across different manufacturers
    return Device.deviceType === Device.DeviceType.PHONE && insets.bottom <= 24;
  }
  
  return false;
};

/**
 * Specifically checks if the device is an iPhone with a notch or Dynamic Island
 * 
 * @param insets - Safe area insets from useSafeAreaInsets()
 * @returns true if device is iPhone with notch/Dynamic Island (iPhone X and newer)
 */
export const hasNotch = (insets: EdgeInsets): boolean => {
  return Platform.OS === 'ios' && 
         Device.deviceType === Device.DeviceType.PHONE && 
         insets.top > 40;
};

/**
 * Specifically checks if Android device has gesture navigation enabled
 * 
 * @param insets - Safe area insets from useSafeAreaInsets()
 * @returns true if Android device has gesture navigation enabled
 */
export const hasGestureNavigation = (insets: EdgeInsets): boolean => {
  return Platform.OS === 'android' && 
         Device.deviceType === Device.DeviceType.PHONE && 
         insets.bottom <= 24;
};

/**
 * Checks if the device has traditional navigation (no notch on iOS or nav bar on Android)
 * 
 * @param insets - Safe area insets from useSafeAreaInsets()
 * @returns true if device has traditional navigation
 */
export const hasTraditionalNavigation = (insets: EdgeInsets): boolean => {
  return !hasModernNavigation(insets);
};

/**
 * Gets the appropriate styling based on device navigation type
 * Useful for components that need different styling for modern vs traditional navigation
 * 
 * @param insets - Safe area insets from useSafeAreaInsets()
 * @returns object with boolean flags for different navigation types
 */
export const getDeviceNavigationType = (insets: EdgeInsets) => {
  const modernNav = hasModernNavigation(insets);
  
  return {
    hasModernNavigation: modernNav,
    hasTraditionalNavigation: !modernNav,
    hasNotch: hasNotch(insets),
    hasGestureNavigation: hasGestureNavigation(insets),
    isIOS: Platform.OS === 'ios',
    isAndroid: Platform.OS === 'android',
    isPhone: Device.deviceType === Device.DeviceType.PHONE,
    isTablet: Device.deviceType === Device.DeviceType.TABLET,
  };
};
