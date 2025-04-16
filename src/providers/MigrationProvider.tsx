import { migrateFromRealm } from '@/app/database/migration-utility';
import MigrationScreen from '@/features/home/screens/MigrationScreen';
import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { ReactNode, useEffect, useState } from 'react';

interface MigrationProviderProps {
  children: ReactNode;
}

// Migration key for AsyncStorage
const REALM_MIGRATION_COMPLETE_KEY = 'ralph_realm_to_watermelon_migration_complete';

/**
 * MigrationProvider handles database migration logic
 */
export const MigrationProvider: React.FC<MigrationProviderProps> = ({ children }) => {
  const [isMigrating, setIsMigrating] = useState<boolean>(false);
  const [migrationComplete, setMigrationComplete] = useState<boolean | null>(null);

  // Function to check and run migration if needed
  const checkAndRunMigration = async () => {
    try {
      // Check if migration has already been run
      const migrationCompleteFromStorage = await AsyncStorage.getItem(REALM_MIGRATION_COMPLETE_KEY);
      
      if (migrationCompleteFromStorage === 'true') {
        console.log('Migration from Realm to WatermelonDB already completed.');
        setMigrationComplete(true);
        return;
      }

      // If not, run the migration
      console.log('Starting migration from Realm to WatermelonDB...');
      setIsMigrating(true);
      
      const result = await migrateFromRealm();

      if (result.success) {
        // Mark migration as complete in AsyncStorage
        await AsyncStorage.setItem(REALM_MIGRATION_COMPLETE_KEY, 'true');
        setMigrationComplete(true);
        console.log('Migration completed and marked as done.');
      } else {
        console.error('Migration failed:', result.message);
        setMigrationComplete(false);
        // We don't mark as complete so it will try again next time
      }
    } catch (error) {
      console.error('Error during migration process:', error);
      setMigrationComplete(false);
    } finally {
      setIsMigrating(false);
    }
  };

  // Run migration check on component mount
  useEffect(() => {
    checkAndRunMigration();
  }, []);

  if (isMigrating || migrationComplete === null) {
    return <MigrationScreen />;
  }

  return <>{children}</>;
};

export default MigrationProvider;