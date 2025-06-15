import { useIAPService } from '@/features/iap/iapService';
import React, { ReactNode, useEffect } from 'react';

interface PurchaseProviderProps {
  children: ReactNode;
}

/**
 * PurchaseProvider manages in-app purchase functionality
 */
export const PurchaseProvider: React.FC<PurchaseProviderProps> = ({
  children,
}) => {
  const {connected} = useIAPService();

  useEffect(() => {
    // Log IAP connection status (you might want to handle reconnection if needed)
    if (connected) {
      console.log('IAP connection established');
    }
  }, [connected]);

  return <>{children}</>;
};
