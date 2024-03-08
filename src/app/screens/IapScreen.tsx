import React, {useEffect} from 'react';
import {View, Text, Button} from 'react-native';
import {requestPurchase, useIAP} from 'react-native-iap';

const IapScreen: React.FC = () => {
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
    console.log('currentPurchaseError', currentPurchaseError);
  }, [currentPurchaseError]);

  useEffect(() => {
    console.log('currentPurchase', currentPurchase);
  }, [currentPurchase]);

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
    </>
  );
};

export default IapScreen;
