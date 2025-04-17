import { event, EVENT_NAMES } from '@/features/events';
import { STORAGE_KEYS } from '@core/store/storageKeys';
import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { ReactNode, useCallback, useEffect } from 'react';
import { getAvailablePurchases, getProducts, initConnection, useIAP } from 'react-native-iap';

interface PurchaseProviderProps {
  children: ReactNode;
}

// Valid product IDs for IAP
const VALID_PRODUCT_IDS = [
  'eu.sboo.ralph.coffee',
  'eu.sboo.ralph.sandwich',
  'eu.sboo.ralph.lunch',
  'eu.sboo.ralph.croissant',
];

/**
 * PurchaseProvider manages in-app purchase functionality
 */
export const PurchaseProvider: React.FC<PurchaseProviderProps> = ({ children }) => {
  const {
    purchaseHistory,
    currentPurchase,
    currentPurchaseError,
    finishTransaction,
    getPurchaseHistory,
  } = useIAP();

  // Initialize IAP and check for existing purchases
  const checkPurchases = useCallback(async () => {
    try {
      // First ensure IAP connection is initialized
      const isConnected = await initConnection();

      // Get products first to ensure store connection
      const products = await getProducts({ skus: VALID_PRODUCT_IDS });

      // Get all active purchases
      const purchases = await getAvailablePurchases();

      const validPurchases = purchases.filter(purchase =>
        VALID_PRODUCT_IDS.includes(purchase.productId)
      );

      const hasActivePurchase = validPurchases.length > 0;
      await AsyncStorage.setItem(
        STORAGE_KEYS.COFFEE_PURCHASED,
        String(hasActivePurchase)
      );

      event.emit(EVENT_NAMES.COFFEE_PURCHASED, hasActivePurchase);
    } catch (error: any) {
      // Handle specific error cases
      if (error.code === 'E_NOT_PREPARED') {
        console.log('IAP not prepared, retrying connection...');
        try {
          await initConnection();
          await checkPurchases(); // Retry after initialization
        } catch (retryError) {
          console.log('Retry failed:', retryError);
        }
      } else if (error.code === 'E_USER_CANCELLED') {
        console.log('User cancelled the purchase check');
      } else {
        console.log('Error checking purchases:', {
          code: error.code,
          message: error.message,
          details: error.details,
        });
      }
    }
  }, [getPurchaseHistory, purchaseHistory]);

  // Check purchases on component mount
  useEffect(() => {
    checkPurchases();
  }, []);

  // Handle purchase errors
  useEffect(() => {
    if (currentPurchaseError) {
      console.warn('currentPurchaseError', currentPurchaseError);
      event.emit(EVENT_NAMES.COFFEE_PURCHASED, 'false');
    }
  }, [currentPurchaseError]);

  // Handle successful purchases
  useEffect(() => {
    const receipt = currentPurchase?.transactionReceipt;
    if (receipt) {
      AsyncStorage.setItem(STORAGE_KEYS.COFFEE_PURCHASED, 'true')
        .then(() => {
          event.emit(EVENT_NAMES.COFFEE_PURCHASED, 'true');
          return finishTransaction({ purchase: currentPurchase, isConsumable: false });
        });
    }
  }, [currentPurchase, finishTransaction]);

  return <>{children}</>;
};

export default PurchaseProvider;