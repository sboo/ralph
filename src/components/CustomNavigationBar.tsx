import {Appbar, Button, Dialog, Portal, Text} from 'react-native-paper';
import {getHeaderTitle} from '@react-navigation/elements';
import React, {useEffect} from 'react';
import {useTheme} from 'react-native-paper';
import {useTranslation} from 'react-i18next';
import {NativeStackHeaderProps} from '@react-navigation/native-stack';
import {requestPurchase, useIAP} from 'react-native-iap';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {STORAGE_KEYS} from '../support/storageKeys';
import {StyleSheet, Platform} from 'react-native';
import {EVENT_NAMES, event} from '../app/event';

interface CoffeeButtonProps {
  coffeePurchased: string | null;
  onPress: () => void;
}

const CoffeeButton: React.FC<CoffeeButtonProps> = ({
  coffeePurchased,
  onPress,
}) => {
  const theme = useTheme();

  if (coffeePurchased === 'true') {
    return (
      <Appbar.Action
        icon="heart"
        color={theme.colors.onPrimary}
        onPress={onPress}
      />
    );
  }
  if (coffeePurchased === 'false') {
    return (
      <Appbar.Action
        icon="coffee"
        color={theme.colors.onPrimary}
        onPress={onPress}
      />
    );
  }
  return null;
};

const CustomNavigationBar: React.FC<NativeStackHeaderProps> = ({
  navigation,
  route,
  options,
  back,
}) => {
  const theme = useTheme();
  const {t} = useTranslation();
  const title = getHeaderTitle(options, route.name);
  const [coffeePurchased, setCoffeePurchased] = React.useState<string | null>(
    'false',
  );
  const [thankYouVisible, setThankYouVisible] = React.useState(false);
  const [buyCoffeeVisible, setBuyCoffeeVisible] = React.useState(false);
  const {getProducts} = useIAP();

  const onCoffeeButtonPress = async () => {
    if (coffeePurchased === 'true') {
      setThankYouVisible(true);
    } else {
      setBuyCoffeeVisible(true);
    }
  };

  useEffect(() => {
    const fechProducts = async () => {
      await getProducts({skus: ['eu.sboo.ralph.coffee']});
    };
    const getCoffeeButtonPuchasedStatus = async () => {
      return await AsyncStorage.getItem(STORAGE_KEYS.COFFEE_PURCHASED);
    };
    getCoffeeButtonPuchasedStatus().then(purchased => {
      setCoffeePurchased(purchased);
    });

    const onCoffeePurchased = () => {
      getCoffeeButtonPuchasedStatus().then(purchased => {
        setCoffeePurchased(purchased);
      });
    };

    fechProducts();

    event.on(EVENT_NAMES.COFFEE_PURCHASED, onCoffeePurchased);

    return () => {
      event.off(EVENT_NAMES.COFFEE_PURCHASED, onCoffeePurchased);
    };
  }, [getProducts]);

  const handlePurchase = async () => {
    setBuyCoffeeVisible(false);
    if (Platform.OS === 'ios') {
      await requestPurchase({sku: 'eu.sboo.ralph.coffee'});
    } else if (Platform.OS === 'android') {
      await requestPurchase({skus: ['eu.sboo.ralph.coffee']});
    }
  };

  return (
    <Appbar.Header style={options.headerStyle}>
      {back ? <Appbar.BackAction onPress={navigation.goBack} /> : null}
      <Appbar.Content title={title} />
      {!back ? (
        <CoffeeButton
          coffeePurchased={coffeePurchased}
          onPress={onCoffeeButtonPress}
        />
      ) : null}
      {!back ? (
        <Appbar.Action
          icon="cog-outline"
          color={theme.colors.onPrimary}
          onPress={() => navigation.navigate('Settings')}
        />
      ) : null}
      <Portal>
        <Dialog
          visible={thankYouVisible}
          onDismiss={() => setThankYouVisible(false)}>
          <Dialog.Icon icon="heart" />
          <Dialog.Title style={styles.dialogTitle}>
            {t('thank_you')}
          </Dialog.Title>
          <Dialog.Content>
            <Text style={styles.dialogText} variant="bodyMedium">
              {t('thank_you_text')}
            </Text>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setThankYouVisible(false)}>
              {t('buttons:close')}
            </Button>
          </Dialog.Actions>
        </Dialog>
        <Dialog
          visible={buyCoffeeVisible}
          onDismiss={() => setBuyCoffeeVisible(false)}>
          <Dialog.Icon icon="coffee" />
          <Dialog.Title style={styles.dialogTitle}>
            {t('support_me')}
          </Dialog.Title>
          <Dialog.Content>
            <Text style={styles.dialogText} variant="bodyMedium">
              {t('support_me_text')}
            </Text>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setBuyCoffeeVisible(false)}>
              {t('buttons:cancel')}
            </Button>
            <Button onPress={handlePurchase}>{t('buttons:yes')}</Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
    </Appbar.Header>
  );
};

const styles = StyleSheet.create({
  dialogTitle: {
    textAlign: 'center',
  },
  dialogText: {
    textAlign: 'center',
  },
});

export default CustomNavigationBar;
