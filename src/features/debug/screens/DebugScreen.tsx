import { database } from '@/app/database';
import { Pet } from '@/app/database/models/Pet';
import { STORAGE_KEYS } from '@/app/store/storageKeys';
import { event, EVENT_NAMES } from '@/features/events';
import Tips from '@/features/tips/components/Tips';
import { Q } from '@nozbe/watermelondb';
import { withObservables } from '@nozbe/watermelondb/react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { useCallback, useEffect } from 'react';
import { Alert, Button, Text, View } from 'react-native';
import { requestPurchase, useIAP } from 'react-native-iap';
import { Divider } from 'react-native-paper';
import { map } from 'rxjs/operators';

// The presentational component
const DebugScreenComponent: React.FC<{
  activePet: Pet | undefined
}> = ({ 
  activePet 
}) => {
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
    try {
      await requestPurchase({skus: [sku]});
    } catch (error) {
      console.log(error);
    }
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

// Connect the component with WatermelonDB observables
const enhance = withObservables([], () => ({
  activePet: database
    .get<Pet>('pets')
    .query(Q.where('is_active', true))
    .observe()
    .pipe(map(pets => pets.length > 0 ? pets[0] : undefined))
}));

// Export the enhanced component
export default enhance(DebugScreenComponent);
