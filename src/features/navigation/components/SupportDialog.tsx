import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { StyleSheet, View } from 'react-native';
import { useIAP } from 'react-native-iap';
import { ActivityIndicator, Button, Dialog, IconButton, Text, useTheme } from 'react-native-paper';

interface SupportDialogProps {
  visible: boolean;
  onDismiss: () => void;
  onSupport: (sku: string) => void;
  loading: boolean;
}

const SupportDialog: React.FC<SupportDialogProps> = ({ visible, onDismiss, onSupport, loading }) => {
  const [selectedValue, setSelectedValue] = useState<string>('');
  const theme = useTheme();
  const { t } = useTranslation();
  const { products, getProducts } = useIAP();


  const supportOptions = [
    { icon: 'coffee', label: 'Coffee', sku: 'eu.sboo.ralph.coffee' },
    { icon: 'food-croissant', label: 'Croissant', sku: 'eu.sboo.ralph.croissant' },
    { icon: 'food-hot-dog', label: 'Sandwich', sku: 'eu.sboo.ralph.sandwich' },
    { icon: 'noodles', label: 'Lunch', sku: 'eu.sboo.ralph.lunch' }
  ];

  const getPrice = (sku: string) => {
    return products.find((product) => product.productId === sku)?.localizedPrice ?? 0;
  };

  useEffect(() => {
    const fechProducts = async () => {
      try {
        await getProducts({ skus: ['eu.sboo.ralph.coffee', 'eu.sboo.ralph.croissant', 'eu.sboo.ralph.sandwich', 'eu.sboo.ralph.lunch'] });
      } catch (error) {
        console.log(error);
      }
    };
   
   

    try {
      fechProducts().then(() => console.log('products: ', products));
    } catch (error) {
      console.log(error);
    }

  }, [getProducts]);

  const handleSupport = () => {
    onSupport(selectedValue);
  };

  return (
    <Dialog visible={visible} onDismiss={onDismiss}>
      <Dialog.Icon icon='hand-heart' />
      <Dialog.Title style={styles.dialogTitle}> {t('support_me')}</Dialog.Title>
      <Dialog.Content>
        <Text style={styles.dialogText} variant="bodyMedium">
        {t('support_me_text')}
        </Text>
        
        <View style={styles.sliderContainer}>          
          <View style={styles.markersContainer}>
            {supportOptions.map((option, index) => (
              <View 
                key={option.sku} 
                style={[
                  styles.markerItem,
                  selectedValue === option.sku && styles.selectedMarker
                ]}
              >
                <IconButton
                  size={24}
                  icon={option.icon}
                  mode='contained'
                  selected={selectedValue === option.sku}
                    onPress={() => setSelectedValue(option.sku)}
                />
                <Text style={[
                  styles.markerPrice,
                  selectedValue === option.sku && styles.selectedLabel
                ]}>
                  {getPrice(option.sku)}
                </Text>
              </View>
            ))}
          </View>
        </View>
      </Dialog.Content>
      <Dialog.Actions>
        {loading ? (
          <ActivityIndicator animating={true} />
        ) : (
          <>
            <Button onPress={onDismiss}>Cancel</Button>
            <Button disabled={selectedValue === ''} onPress={handleSupport}>Support</Button>
          </>
        )}
      </Dialog.Actions>
    </Dialog>
  );
};

const styles = StyleSheet.create({
  dialogTitle: {
    textAlign: 'center',
  },
  dialogText: {
    textAlign: 'center',
    marginBottom: 24,
  },
  sliderContainer: {
    padding: 16,
  },
  markersContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
  },
  markerItem: {
    alignItems: 'center',
    flex: 1,
  },
  selectedMarker: {
    transform: [{ scale: 1.1 }],
  },
  markerLabel: {
    fontSize: 12,
    marginTop: 4,
    color: 'gray',
  },
  markerPrice: {
    fontSize: 12,
    color: 'gray',
  },
  selectedLabel: {
    color: 'black',
    fontWeight: 'bold',
  },
});

export default SupportDialog;