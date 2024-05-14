import {event, EVENT_NAMES} from '@/features/events';
import AsyncStorage from '@react-native-async-storage/async-storage';
import React, {useCallback, useEffect, useState} from 'react';
import {View, Text, Button, Alert} from 'react-native';
import {requestPurchase, useIAP} from 'react-native-iap';
import {Divider} from 'react-native-paper';
import {STORAGE_KEYS} from '../store/storageKeys';
import {useQuery} from '@realm/react';
import {Pet} from '@/app/models/Pet';
import usePet from '@/features/pets/hooks/usePet';
import useTips, {Tip} from '@/features/tips/hooks/useTips';
import Tips from '@/features/tips/components/Tips';

const DebugScreen: React.FC = () => {
  const {
    connected,
    products,
    promotedProductsIOS,
    subscriptions,
    purchaseHistory,
    availablePurchases,
    currentPurchase,
    currentPurchaseError,
    initConnectionError,
    finishTransaction,
    getProducts,
    getSubscriptions,
    getAvailablePurchases,
    getPurchaseHistory,
  } = useIAP();

  const handlePurchase = async (sku: string) => {
    await requestPurchase({skus: [sku]});
  };

  useEffect(() => {
    console.log('currentPurchase', currentPurchase);
  }, [currentPurchase]);

  useEffect(() => {
    console.log('initConnectionError', initConnectionError);
  }, [initConnectionError]);

  const unpurchase = async () => {
    await AsyncStorage.setItem(STORAGE_KEYS.COFFEE_PURCHASED, 'false');
    event.emit(EVENT_NAMES.COFFEE_PURCHASED, false);
  };

  const restorePurchases = useCallback(async () => {
    let purchased = false;
    try {
      await getPurchaseHistory();
      purchased =
        purchaseHistory.findIndex(p => p.productId === 'eu.sboo.ralph.coffee') >
        -1;
      await AsyncStorage.setItem(
        STORAGE_KEYS.COFFEE_PURCHASED,
        purchased ? 'true' : 'false',
      );
      event.emit(EVENT_NAMES.COFFEE_PURCHASED, purchased);
    } catch (e) {
      console.log(e);
    }
  }, [getPurchaseHistory, purchaseHistory]);

  const {activePet} = usePet();

  return (
    <>
      <Button
        title="Get the products"
        onPress={() => getProducts({skus: ['eu.sboo.ralph.coffee']})}
      />

      {products.map(product => (
        <View key={product.productId}>
          <Text>{product.productId}</Text>

          <Button
            title="Buy"
            onPress={() => handlePurchase(product.productId)}
          />
        </View>
      ))}
      <Divider />
      <Button title="Get purchase history" onPress={getPurchaseHistory} />
      {purchaseHistory.map(purchase => (
        <View key={purchase.productId}>
          <Text>{purchase.productId}</Text>
          <Button
            title="display purchase info"
            onPress={() => Alert.alert(JSON.stringify(purchase))}
          />
        </View>
      ))}
      <Divider />
      <Button title="Restore purchases" onPress={restorePurchases} />
      <Divider />
      <Button title="set to unpurchased" onPress={unpurchase} />
      <Divider />
      <Text>Active Pet:</Text>
      <Text>Name: {activePet?.name}</Text>
      <Text>Species: {activePet?.species}</Text>
      <Text>isActive: {activePet?.isActive ? 'yes' : 'no'}</Text>
      <Text>notificationsEnabled: {activePet?.notificationsEnabled ? 'yes' : 'no'}</Text>
      <Text>pausedAt: {activePet?.pausedAt?.toISOString()}</Text>
      <Divider />
      <View style={{padding: 20}}>
        {activePet ? <Tips activePet={activePet} /> : null}
      </View>
    </>
  );
};

export default DebugScreen;
