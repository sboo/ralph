import { STORAGE_KEYS } from '@/core/store/storageKeys';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useCallback, useEffect, useState } from 'react';

const ONE_WEEK_IN_MS = 7 * 24 * 60 * 60 * 1000; // 7 days in milliseconds

export const useSupportRequest = () => {
  const [shouldShowDialog, setShouldShowDialog] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const checkShouldShowDialog = useCallback(async () => {
    try {
      setIsLoading(true);
      
      // Check if user has already purchased
      const coffeePurchased = await AsyncStorage.getItem(STORAGE_KEYS.COFFEE_PURCHASED);
      if (coffeePurchased === 'true') {
        setShouldShowDialog(false);
        setIsLoading(false);
        return;
      }

      // Check if dialog has already been shown
      const dialogShown = await AsyncStorage.getItem(STORAGE_KEYS.SUPPORT_DIALOG_SHOWN);
      if (dialogShown === 'true') {
        setShouldShowDialog(false);
        setIsLoading(false);
        return;
      }

      // Get or set first install date
      let firstInstallDate = await AsyncStorage.getItem(STORAGE_KEYS.FIRST_INSTALL_DATE);
      if (!firstInstallDate) {
        // First time opening the app
        const now = new Date().getTime().toString();
        await AsyncStorage.setItem(STORAGE_KEYS.FIRST_INSTALL_DATE, now);
        setShouldShowDialog(false);
        setIsLoading(false);
        return;
      }

      // Check if 1 week has passed
      const installTimestamp = parseInt(firstInstallDate, 10);
      const now = new Date().getTime();
      const timePassed = now - installTimestamp;

      if (timePassed >= ONE_WEEK_IN_MS) {
        setShouldShowDialog(true);
      } else {
        setShouldShowDialog(false);
      }
      
      setIsLoading(false);
    } catch (error) {
      console.error('Error checking support dialog status:', error);
      setShouldShowDialog(false);
      setIsLoading(false);
    }
  }, []);

  const markDialogAsShown = useCallback(async () => {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.SUPPORT_DIALOG_SHOWN, 'true');
      setShouldShowDialog(false);
    } catch (error) {
      console.error('Error marking support dialog as shown:', error);
    }
  }, []);

  useEffect(() => {
    checkShouldShowDialog();
  }, [checkShouldShowDialog]);

  return {
    shouldShowDialog,
    isLoading,
    markDialogAsShown,
    recheckShouldShow: checkShouldShowDialog,
  };
};
