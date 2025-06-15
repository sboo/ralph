import { STORAGE_KEYS } from '@/core/store/storageKeys';
import { event, EVENT_NAMES } from '@/features/events';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useIAP } from 'expo-iap';
import { ProductPurchase, PurchaseError } from 'expo-iap/build/ExpoIap.types';
import { useEffect, useState } from 'react';
import { Platform } from 'react-native';

// Valid product IDs for IAP
const VALID_PRODUCT_IDS = [
  'eu.sboo.ralph.coffee',
  'eu.sboo.ralph.sandwich',
  'eu.sboo.ralph.lunch',
  'eu.sboo.ralph.croissant',
];

export const useIAPService = () => {
  const {
    connected,
    currentPurchase,
    currentPurchaseError,
    finishTransaction,
    getProducts,
    products,
    getAvailablePurchases,
    availablePurchases,
    requestPurchase,
  } = useIAP();

  const [isLoading, setIsLoading] = useState(true);
  const [processingPurchase, setProcessingPurchase] = useState(false);

  // Initialize IAP when connected
  useEffect(() => {
    if (!connected) return;

    console.log('IAP connected');

    const initializeIAP = async () => {
      console.log('Initializing IAP...');
      try {
        setIsLoading(true);
        await getProducts(VALID_PRODUCT_IDS);
        await getAvailablePurchases(VALID_PRODUCT_IDS);
        setIsLoading(false);
      } catch (error) {
        console.error('Error initializing IAP:', error);
        setIsLoading(false);
      }
    };

    initializeIAP();
  }, [connected, getProducts, getAvailablePurchases]);

  // Handle successful purchases
  useEffect(() => {
    const receipt = currentPurchase?.transactionReceipt;
    if (receipt) {
      AsyncStorage.setItem(STORAGE_KEYS.COFFEE_PURCHASED, 'true').then(() => {
        event.emit(EVENT_NAMES.COFFEE_PURCHASED, 'true');
        return finishTransaction({
          purchase: currentPurchase,
          isConsumable: false,
        });
      });
    }
  }, [currentPurchase, finishTransaction]);

  useEffect(() => {
    if (currentPurchaseError) {
      console.warn('currentPurchaseError', currentPurchaseError);
      event.emit(EVENT_NAMES.COFFEE_PURCHASED, 'false');
    }
  }, [currentPurchaseError]);

  const handlePurchase = async (sku: string) => {
    if (!connected) {
      return;
    }
    try {
      setProcessingPurchase(true);
      await requestPurchase({
        request: Platform.OS === 'android' ? {skus: [sku]} : {sku: sku},
      });
    } catch (error) {
      if (error instanceof PurchaseError) {
        console.error(`[${error.code}]: ${error.message}`, error);
      } else {
        console.error('handleBuyProduct', error);
      }
    } finally {
      setProcessingPurchase(false);
    }
  };

  const restorePurchases = async () => {
    if (!connected) {
      return;
    }

    console.log('Restoring purchases...');
    try {
      console.log('Available purchases to restore:', availablePurchases);

      if (!availablePurchases || availablePurchases.length === 0) {
        console.log('No purchases available to restore');
      }

      // Extract product IDs from the available purchases
      const purchasedProductIds: string[] = [];

      availablePurchases.forEach((purchase: ProductPurchase) => {
        if (VALID_PRODUCT_IDS.includes(purchase.id)) {
          purchasedProductIds.push(purchase.id);
        }
      });

      console.log('Purchased product IDs:', purchasedProductIds);
      const hasActivePurchase = purchasedProductIds.length > 0;
      await AsyncStorage.setItem(
        STORAGE_KEYS.COFFEE_PURCHASED,
        String(hasActivePurchase),
      );
      event.emit(EVENT_NAMES.COFFEE_PURCHASED, hasActivePurchase);
    } catch (error) {
      console.error('Error restoring purchases:', error);
    }
  };

  // Check purchases on component mount
  useEffect(() => {
    if (isLoading) return;
    restorePurchases();
  }, [isLoading]);

  return {
    connected,
    products,
    isLoading,
    handlePurchase,
    restorePurchases,
    processingPurchase,
  };
};
