import React, { createContext, useContext, ReactNode, useMemo } from 'react';
import { database, petCollection, assessmentCollection } from './index';
import { Database } from '@nozbe/watermelondb';
import { Collection } from '@nozbe/watermelondb/Collection';
import { Pet } from './models/Pet';
import { Assessment } from './models/Assessment';

interface DatabaseContextType {
  database: typeof database;
  collections: {
    pets: Collection<Pet>;
    assessments: Collection<Assessment>;
  };
}

// Create a context with a default value
const DatabaseContext = createContext<DatabaseContextType>({
  database,
  collections: {
    pets: petCollection,
    assessments: assessmentCollection,
  }
});

export const useDatabaseContext = () => {
  const context = useContext(DatabaseContext);
  if (!context) {
    throw new Error('useDatabaseContext must be used within a DatabaseProvider');
  }
  return context;
};

interface DatabaseProviderProps {
  children: ReactNode;
}

export const DatabaseProvider: React.FC<DatabaseProviderProps> = ({ children }) => {
  // Use useMemo to ensure the value is stable
  const value = useMemo(() => ({
    database,
    collections: {
      pets: petCollection,
      assessments: assessmentCollection,
    },
  }), []);

  return (
    <DatabaseContext.Provider value={value}>
      {children}
    </DatabaseContext.Provider>
  );
};