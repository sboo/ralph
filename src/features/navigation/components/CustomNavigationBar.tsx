import { STORAGE_KEYS } from '@/core/store/storageKeys';
import { event, EVENT_NAMES } from '@/features/events';
import { useIAPService } from '@/features/iap/iapService';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getHeaderTitle } from '@react-navigation/elements';
import { NativeStackHeaderProps } from '@react-navigation/native-stack';
import React, { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Linking, StyleSheet } from 'react-native';
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
        color={theme.colors.onPrimaryContainer}
        onPress={onPress}
      />
    );
  }
  // if (coffeePurchased === 'false') {
  return (
    <Appbar.Action
      icon="hand-heart"
      color={theme.colors.onPrimaryContainer}
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

  const onCoffeeButtonPress = async () => {
    if (coffeePurchased === 'true') {
      setThankYouVisible(true);
    } else {
      setBuyCoffeeVisible(true);
    }
  };

  const { handlePurchase, processingPurchase } = useIAPService();

  useEffect(() => {
    const getCoffeeButtonPuchasedStatus = async () => {
      return await AsyncStorage.getItem(STORAGE_KEYS.COFFEE_PURCHASED);
    };

    // Get initial status
    getCoffeeButtonPuchasedStatus().then(purchased => {
      setCoffeePurchased(purchased);
    });

    const onCoffeePurchased = (purchased: boolean | string) => {
      setBuyCoffeeVisible(false);

      getCoffeeButtonPuchasedStatus().then(status => {
        setCoffeePurchased(status);
      });
    };

    event.on(EVENT_NAMES.COFFEE_PURCHASED, onCoffeePurchased);

    return () => {
      event.off(EVENT_NAMES.COFFEE_PURCHASED, onCoffeePurchased);
    };
  }, []);

  const openMenu = () => setMenuVisible(true);

  const closeMenu = () => setMenuVisible(false);

  const handleSupportPurchase = async (sku: string) => {
    setBuyCoffeeVisible(false);
    try {
      await handlePurchase(sku);
      setThankYouVisible(true);
    } catch (error) {
      console.error('Purchase failed:', error);
    }
  }

  const isTransparent = options.headerTransparent;

  return (
    <Appbar.Header 
      style={options.headerStyle}
      elevated={!isTransparent}
    >
      {back ? <Appbar.BackAction onPress={navigation.goBack} /> : null}
      <Appbar.Content title={title} />
      {!back ? (
        <Appbar.Action
          icon="information"
          color={theme.colors.onPrimaryContainer}
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
              color={theme.colors.onPrimaryContainer}
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
          onSupport={handleSupportPurchase}
          loading={processingPurchase}
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
