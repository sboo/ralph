import React, { useEffect, useState } from 'react';
import { View, Text, Button, ScrollView, StyleSheet, TouchableOpacity, SafeAreaView, ActivityIndicator } from 'react-native';
import { database } from '../../app/database';
import { DatabaseProvider, useDatabaseContext } from '../../app/database/context';
import { migrateFromRealm } from '../../app/database/migration-utility';
import { withObservables } from '@nozbe/watermelondb/react';
import { createPet, usePetsCollection, useActivePets, usePetAssessments } from '../../app/database/hooks';
import { Pet } from '../../app/database/models/Pet';
import { Assessment } from '../../app/database/models/Assessment';
import { useNavigation } from '@react-navigation/native';
import { Card, Divider } from 'react-native-paper';

// Define the migration result type
interface MigrationResult {
  success: boolean;
  message: string;
  error?: unknown;
}

// Component to display assessments for a pet
const PetAssessments = ({ pet }: { pet: Pet }) => {
  const [expanded, setExpanded] = useState(false);
  const [assessments, setAssessments] = useState<Assessment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!pet) return;

    const subscription = pet.assessments.observe().subscribe(
      (results) => {
        setAssessments(results);
        setLoading(false);
      },
      (error) => {
        console.error('Error fetching assessments:', error);
        setLoading(false);
      }
    );

    return () => subscription.unsubscribe();
  }, [pet]);

  if (!expanded) {
    return (
      <TouchableOpacity onPress={() => setExpanded(true)}>
        <Text style={styles.viewAssessments}>View {assessments.length} Assessments</Text>
      </TouchableOpacity>
    );
  }

  return (
    <View style={styles.assessmentsContainer}>
      <TouchableOpacity onPress={() => setExpanded(false)}>
        <Text style={styles.hideAssessments}>Hide Assessments</Text>
      </TouchableOpacity>
      
      {loading ? (
        <ActivityIndicator size="small" />
      ) : assessments.length > 0 ? (
        assessments.map(assessment => (
          <View key={assessment.id} style={styles.assessmentItem}>
            <Text style={styles.assessmentDate}>Date: {assessment.date}</Text>
            <Text>Score: {assessment.score}</Text>
            <Text>Hurt: {assessment.hurt}, Hunger: {assessment.hunger}, Hydration: {assessment.hydration}</Text>
            <Text>Hygiene: {assessment.hygiene}, Happiness: {assessment.happiness}, Mobility: {assessment.mobility}</Text>
            {assessment.notes && <Text>Notes: {assessment.notes}</Text>}
          </View>
        ))
      ) : (
        <Text style={styles.emptyText}>No assessments found for this pet</Text>
      )}
    </View>
  );
};

// Component to display pets with assessments
const PetsList = () => {
  const [pets, setPets] = useState<Pet[]>([]);
  const [loading, setLoading] = useState(true);
  const { collections } = useDatabaseContext();

  useEffect(() => {
    const subscription = collections.pets.query().observe().subscribe(
      (results) => {
        setPets(results);
        setLoading(false);
      },
      (error) => {
        console.error('Error fetching pets:', error);
        setLoading(false);
      }
    );

    return () => subscription.unsubscribe();
  }, [collections.pets]);

  if (loading) {
    return <ActivityIndicator size="large" color="#0000ff" />;
  }

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Pets from WatermelonDB ({pets.length}):</Text>
      
      {pets.length > 0 ? (
        pets.map(pet => (
          <Card key={pet.id} style={styles.petCard}>
            <Card.Content>
              <View style={styles.petHeader}>
                <Text style={styles.petName}>{pet.name}</Text>
                <Text style={[styles.activeStatus, 
                  {backgroundColor: pet.isActive ? '#d4edda' : '#f8d7da',
                   color: pet.isActive ? '#155724' : '#721c24'}]}>
                  {pet.isActive ? 'Active' : 'Inactive'}
                </Text>
              </View>
              
              <Text>Species: {pet.species}</Text>
              <Text>Assessment Frequency: {pet.assessmentFrequency}</Text>
              <Text>Notifications: {pet.notificationsEnabled ? 'Enabled' : 'Disabled'}</Text>
              
              <Divider style={styles.divider} />
              
              <PetAssessments pet={pet} />
            </Card.Content>
          </Card>
        ))
      ) : (
        <Text style={styles.emptyText}>No pets found in WatermelonDB</Text>
      )}
    </ScrollView>
  );
};

// Test component to verify WatermelonDB setup
const WatermelonTestContent = () => {
  const [migrationStatus, setMigrationStatus] = useState<MigrationResult | null>(null);
  const [isMigrating, setIsMigrating] = useState(false);
  const [dbReady, setDbReady] = useState(false);
  const [petsCount, setPetsCount] = useState<number | null>(null);
  const [assessmentsCount, setAssessmentsCount] = useState<number | null>(null);
  const { collections } = useDatabaseContext();

  // Count existing pets and assessments
  useEffect(() => {
    const countRecords = async () => {
      try {
        const pets = await collections.pets.query().fetchCount();
        const assessments = await collections.assessments.query().fetchCount();
        
        setPetsCount(pets);
        setAssessmentsCount(assessments);
        
        // If we already have data, consider the DB ready
        if (pets > 0) {
          setDbReady(true);
        }
      } catch (error) {
        console.error('Error counting records:', error);
      }
    };
    
    countRecords();
  }, [collections, migrationStatus]);

  // Start migration from Realm to WatermelonDB
  const startMigration = async () => {
    setIsMigrating(true);
    try {
      const result = await migrateFromRealm();
      setMigrationStatus(result);
      if (result.success) {
        setDbReady(true);
      }
    } catch (error: unknown) {
      setMigrationStatus({
        success: false,
        message: `Migration failed: ${error instanceof Error ? error.message : String(error)}`,
        error
      });
    } finally {
      setIsMigrating(false);
    }
  };

  const testCreatePet = async () => {
    try {
      await createPet({
        species: 'Cat',
        name: 'Test WatermelonDB Cat',
        notificationsEnabled: false,
        showNotificationDot: false,
        isActive: true,
        assessmentFrequency: 'DAILY',
      });
      
      // Refresh counts
      const pets = await collections.pets.query().fetchCount();
      setPetsCount(pets);
    } catch (error) {
      console.error('Error creating test pet:', error);
    }
  };

  const resetDatabase = async () => {
    try {
      await database.write(async () => {
        // Delete all assessments first (due to foreign key constraints)
        const allAssessments = await collections.assessments.query().fetch();
        for (const assessment of allAssessments) {
          await assessment.destroyPermanently();
        }
        
        // Then delete all pets
        const allPets = await collections.pets.query().fetch();
        for (const pet of allPets) {
          await pet.destroyPermanently();
        }
      });
      
      // Reset counts
      setPetsCount(0);
      setAssessmentsCount(0);
      setDbReady(false);
      setMigrationStatus(null);
    } catch (error) {
      console.error('Error resetting database:', error);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.header}>WatermelonDB Migration Test</Text>
      
      <View style={styles.countsContainer}>
        <View style={styles.countItem}>
          <Text style={styles.countLabel}>Pets</Text>
          <Text style={styles.countValue}>{petsCount !== null ? petsCount : '...'}</Text>
        </View>
        <View style={styles.countItem}>
          <Text style={styles.countLabel}>Assessments</Text>
          <Text style={styles.countValue}>{assessmentsCount !== null ? assessmentsCount : '...'}</Text>
        </View>
      </View>
      
      {!dbReady && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Data Migration</Text>
          <Text style={styles.sectionDescription}>
            This will migrate your data from Realm database to WatermelonDB.
            No data will be lost during this process.
          </Text>
          
          <Button 
            title={isMigrating ? "Migrating..." : "Start Migration from Realm"} 
            onPress={startMigration}
            disabled={isMigrating}
          />
          
          {migrationStatus && (
            <View style={styles.statusContainer}>
              <Text style={[
                styles.statusText, 
                {color: migrationStatus.success ? 'green' : 'red'}
              ]}>
                {migrationStatus.message}
              </Text>
            </View>
          )}
        </View>
      )}
      
      {dbReady && (
        <>
          <View style={styles.actionsContainer}>
            <Button 
              title="Create Test Pet" 
              onPress={testCreatePet}
            />
            <Button 
              title="Reset Database" 
              onPress={resetDatabase}
              color="red"
            />
          </View>
          
          <PetsList />
        </>
      )}
    </SafeAreaView>
  );
};

// Wrap the component with the DatabaseProvider
const WatermelonTest = () => {
  return (
    <DatabaseProvider>
      <WatermelonTestContent />
    </DatabaseProvider>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#fff',
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  countsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 20,
    padding: 10,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
  },
  countItem: {
    alignItems: 'center',
  },
  countLabel: {
    fontSize: 16,
    color: '#6c757d',
  },
  countValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#343a40',
  },
  section: {
    marginBottom: 20,
    padding: 16,
    borderRadius: 8,
    backgroundColor: '#f5f5f5',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  sectionDescription: {
    marginBottom: 15,
    color: '#666',
  },
  statusContainer: {
    marginTop: 16,
    padding: 12,
    borderRadius: 6,
    backgroundColor: '#fff',
  },
  statusText: {
    fontSize: 16,
  },
  actionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  petCard: {
    marginBottom: 15,
    elevation: 4,
  },
  petHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  petName: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  activeStatus: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    fontSize: 12,
    fontWeight: 'bold',
  },
  divider: {
    marginVertical: 12,
  },
  viewAssessments: {
    color: '#007bff',
    marginTop: 8,
  },
  hideAssessments: {
    color: '#6c757d',
    marginBottom: 8,
  },
  assessmentsContainer: {
    marginTop: 5,
  },
  assessmentItem: {
    padding: 8,
    marginVertical: 4,
    backgroundColor: '#f8f9fa',
    borderRadius: 4,
  },
  assessmentDate: {
    fontWeight: 'bold',
  },
  emptyText: {
    fontSize: 16,
    fontStyle: 'italic',
    color: '#888',
    marginTop: 10,
  },
});

export default WatermelonTest;