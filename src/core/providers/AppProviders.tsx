import { DatabaseProvider } from '@core/database/context';
import React, { ReactNode } from 'react';
import { initialWindowMetrics, SafeAreaProvider } from 'react-native-safe-area-context';
import { MigrationProvider } from './MigrationProvider';
import { NotificationProvider } from './NotificationProvider';
import { PurchaseProvider } from './PurchaseProvider';
import { ThemeProvider } from './ThemeProvider';

interface AppProvidersProps {
  children: ReactNode;
}

/**
 * Root component that composes all providers together
 * Order matters - providers listed later have access to providers listed earlier
 */
const AppProviders: React.FC<AppProvidersProps> = ({ children }) => (
  <DatabaseProvider>
    <MigrationProvider>
      <ThemeProvider>
        <NotificationProvider>
          <PurchaseProvider>
            <SafeAreaProvider initialMetrics={initialWindowMetrics}>
            {children}
            </SafeAreaProvider>
          </PurchaseProvider>
        </NotificationProvider>
      </ThemeProvider>
    </MigrationProvider>
  </DatabaseProvider>
);

export default AppProviders;