import { DatabaseProvider } from '@/app/database/context';
import { MigrationProvider } from '@/app/legacy-realm/providers/MigrationProvider';
import { NotificationProvider } from '@/features/notifications';
import { PurchaseProvider } from '@/features/purchases';
import { ThemeProvider } from '@/features/themes';
import React, { ReactNode } from 'react';
import { withIAPContext } from 'react-native-iap';

interface AppProvidersProps {
  children: ReactNode;
}

/**
 * Root component that composes all providers together
 * Order matters - providers listed later have access to providers listed earlier
 */
const ProvidersComposition: React.FC<AppProvidersProps> = ({ children }) => (
  <DatabaseProvider>
    <MigrationProvider>
      <ThemeProvider>
        <NotificationProvider>
          <PurchaseProvider>
            {children}
          </PurchaseProvider>
        </NotificationProvider>
      </ThemeProvider>
    </MigrationProvider>
  </DatabaseProvider>
);

// Wrap the providers with IAP context
const AppProviders = withIAPContext(ProvidersComposition);

export default AppProviders;