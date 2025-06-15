import { STORAGE_KEYS } from '@/core/store/storageKeys';
import { event, EVENT_NAMES } from '@/features/events';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useIAP } from 'expo-iap';
import React, { ReactNode, useCallback, useEffect, useState } from 'react';

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
    connected,
    currentPurchase,
    currentPurchaseError,
    finishTransaction,
    getProducts,
    products,
    getAvailablePurchases,
    availablePurchases,
  } = useIAP();

  // Local state
  const [isLoading, setIsLoading] = useState(true)
  
  // Initialize IAP when connected
  useEffect(() => {
    if (!connected) return

    const initializeIAP = async () => {
      console.log('Initializing IAP...')
      try {
        setIsLoading(true)
        await getProducts(VALID_PRODUCT_IDS)
        await getAvailablePurchases(VALID_PRODUCT_IDS)
        setIsLoading(false)
      } catch (error) {
        console.error('Error initializing IAP:', error)
        setIsLoading(false)
      }
    }

    initializeIAP()
  }, [connected, getProducts, getAvailablePurchases])

  // Initialize IAP and check for existing purchases
  const checkPurchases = useCallback(async () => {
    try {
      const validPurchases = availablePurchases.filter(purchase =>
        VALID_PRODUCT_IDS.includes(purchase.id)
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
  }, [VALID_PRODUCT_IDS, availablePurchases]);

  // Check purchases on component mount
  useEffect(() => {
    if (isLoading) return;
    checkPurchases();
  }, [isLoading]);

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