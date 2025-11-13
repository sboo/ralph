import { useIAPService } from '@/features/iap/iapService';
import React, { useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { StyleSheet, View } from 'react-native';
import { ActivityIndicator, Button, Dialog, IconButton, Portal, Text } from 'react-native-paper';

interface SupportRequestDialogProps {
  visible: boolean;
  onDismiss: () => void;
  onSupport: (sku: string) => void;
  loading: boolean;
}

const SupportRequestDialog: React.FC<SupportRequestDialogProps> = ({ 
  visible, 
  onDismiss, 
  onSupport, 
  loading 
}) => {
  const [selectedValue, setSelectedValue] = useState<string>('');
  const { t } = useTranslation();
  const { products } = useIAPService();

  const supportOptions = [
    { icon: 'coffee', label: 'Coffee', sku: 'eu.sboo.ralph.coffee' },
    { icon: 'food-croissant', label: 'Croissant', sku: 'eu.sboo.ralph.croissant' },
    { icon: 'food-hot-dog', label: 'Sandwich', sku: 'eu.sboo.ralph.sandwich' },
    { icon: 'noodles', label: 'Lunch', sku: 'eu.sboo.ralph.lunch' }
  ];

  const getPrice = useCallback((sku: string) => {
    return products.find((product) => product.id === sku)?.displayPrice ?? 0;
  }, [products]);

  const handleSupport = () => {
    onSupport(selectedValue);
  };

  const handleDismiss = () => {
    setSelectedValue('');
    onDismiss();
  };

  return (
    <Portal>
      <Dialog visible={visible} onDismiss={handleDismiss}>
        <Dialog.Icon icon='hand-heart' />
        <Dialog.Title style={styles.dialogTitle}>{t('support_request_title')}</Dialog.Title>
        <Dialog.Content>
          <Text style={styles.dialogText} variant="bodyMedium">
            {t('support_request_text')}
          </Text>
          
          <View style={styles.sliderContainer}>          
            <View style={styles.markersContainer}>
              {supportOptions.map((option) => (
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
            [
              <Button key="later" onPress={handleDismiss}>{t('buttons:maybe_later')}</Button>,
              <Button key="support" disabled={selectedValue === ''} onPress={handleSupport}>{t('buttons:support')}</Button>
            ]
          )}
        </Dialog.Actions>
      </Dialog>
    </Portal>
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
  markerPrice: {
    fontSize: 12,
    color: 'gray',
  },
  selectedLabel: {
    color: 'black',
    fontWeight: 'bold',
  },
});

export default SupportRequestDialog;
