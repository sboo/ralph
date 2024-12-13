import {
  Appbar,
  Button,
  Dialog,
  Divider,
  Menu,
  Portal,
  Text,
  useTheme,
} from 'react-native-paper';
import { getHeaderTitle } from '@react-navigation/elements';
import React, { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { NativeStackHeaderProps } from '@react-navigation/native-stack';
import { requestPurchase, useIAP } from 'react-native-iap';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { STORAGE_KEYS } from '@/app/store/storageKeys.ts';
import { Linking, Platform, StyleSheet } from 'react-native';
import { event, EVENT_NAMES } from '@/features/events';
import SupportDialog from './SupportDialog';

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
  // if (coffeePurchased === 'false') {
  return (
    <Appbar.Action
      icon="coffee"
      color={theme.colors.onPrimary}
      onPress={onPress}
    />
  );
  // }
  // return null;
};

const CustomNavigationBar: React.FC<NativeStackHeaderProps> = ({
  navigation,
  route,
  options,
  back,
}) => {
  const theme = useTheme();
  const { t } = useTranslation();
  const title = getHeaderTitle(options, route.name);
  const [coffeePurchased, setCoffeePurchased] = React.useState<string | null>(
    'false',
  );
  const [thankYouVisible, setThankYouVisible] = React.useState(false);
  const [buyCoffeeVisible, setBuyCoffeeVisible] = React.useState(false);
  const [menuVisible, setMenuVisible] = React.useState(false);
  const [awaitingInAppPurchase, setAwaitingInAppPurchase] =
    React.useState(false);
  const onCoffeeButtonPress = async () => {
    if (coffeePurchased === 'true') {
      setThankYouVisible(true);
    } else {
      setBuyCoffeeVisible(true);
    }
  };

  useEffect(() => {
    const getCoffeeButtonPuchasedStatus = async () => {
      return await AsyncStorage.getItem(STORAGE_KEYS.COFFEE_PURCHASED);
    };
    getCoffeeButtonPuchasedStatus().then(purchased => {
      setCoffeePurchased(purchased);
    });

    const onCoffeePurchased = () => {
      setBuyCoffeeVisible(false);
      setAwaitingInAppPurchase(false);
      getCoffeeButtonPuchasedStatus().then(purchased => {
        setCoffeePurchased(purchased);
      });
    };

    event.on(EVENT_NAMES.COFFEE_PURCHASED, onCoffeePurchased);

    return () => {
      event.off(EVENT_NAMES.COFFEE_PURCHASED, onCoffeePurchased);
    };
  }, []);

  const openMenu = () => setMenuVisible(true);

  const closeMenu = () => setMenuVisible(false);

  const handlePurchase = async () => {
    setAwaitingInAppPurchase(true);
    try {
      if (Platform.OS === 'ios') {
        await requestPurchase({ sku: 'eu.sboo.ralph.coffee' });
      } else if (Platform.OS === 'android') {
        await requestPurchase({ skus: ['eu.sboo.ralph.coffee'] });
      }
    } catch (error) {
      console.log(error);
      setAwaitingInAppPurchase(false);
    }
  };

  return (
    <Appbar.Header style={options.headerStyle}>
      {back ? <Appbar.BackAction onPress={navigation.goBack} /> : null}
      <Appbar.Content title={title} />
      {!back ? (
        <Appbar.Action
          icon="information"
          color={theme.colors.onPrimary}
          onPress={() => Linking.openURL('https://ralph.pet')}
        />
      ) : null}
      {!back ? (
        <CoffeeButton
          coffeePurchased={coffeePurchased}
          onPress={onCoffeeButtonPress}
        />
      ) : null}
      {!back ? (
        <Menu
          style={styles.menu}
          visible={menuVisible}
          onDismiss={closeMenu}
          anchorPosition={'bottom'}
          anchor={
            <Appbar.Action
              icon="dots-vertical"
              color={theme.colors.onPrimary}
              onPress={openMenu}
            />
          }>
          <Menu.Item
            onPress={() => {
              closeMenu();
              navigation.navigate('EditPet');
            }}
            leadingIcon={'pencil-outline'}
            title={t('buttons:edit_pet')}
          />
          <Menu.Item
            onPress={() => {
              closeMenu();
              navigation.navigate('AddPet');
            }}
            leadingIcon={'plus-circle-outline'}
            title={t('buttons:add_pet')}
          />
          <Divider />
          <Menu.Item
            onPress={() => {
              closeMenu();
              navigation.navigate('Settings');
            }}
            leadingIcon="cog-outline"
            title={t('settings')}
          />
        </Menu>
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
        
        <SupportDialog
          visible={buyCoffeeVisible}
          onDismiss={() => setBuyCoffeeVisible(false)}
          onSupport={handlePurchase}
          loading={awaitingInAppPurchase}
        />
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
  menu: {
    marginTop: 20,
  },
});

export default CustomNavigationBar;
