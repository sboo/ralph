import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { withObservables } from '@nozbe/watermelondb/react';
import { database, petCollection } from '@/app/database';
import { Pet } from '@/app/database/models/Pet';

// Component that displays a list of pets (without HOC applied)
const PetListComponent = ({ pets }: { pets: Pet[] }) => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Pets ({pets.length})</Text>
      
      {pets.map(pet => (
        <View key={pet.id} style={styles.petItem}>
          <Text style={styles.petName}>{pet.name}</Text>
          <Text>Species: {pet.species}</Text>
          <Text>Status: {pet.isActive ? 'Active' : 'Inactive'}</Text>
        </View>
      ))}
      
      {pets.length === 0 && (
        <Text style={styles.emptyText}>No pets found</Text>
      )}
    </View>
  );
};

// HOC that enhances the component with observable pets data
const enhancePetList = withObservables([], () => ({
  pets: petCollection.query().observe(),
}));

// The enhanced component with reactive data
export const PetList = enhancePetList(PetListComponent);

// Component that displays a single pet (without HOC applied)
const PetDetailsComponent = ({ pet }: { pet: Pet }) => {
  if (!pet) {
    return (
      <View style={styles.container}>
        <Text style={styles.emptyText}>Pet not found</Text>
      </View>
    );
  }
  
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Pet Details</Text>
      <View style={styles.petDetails}>
        <Text style={styles.petName}>{pet.name}</Text>
        <Text>Species: {pet.species}</Text>
        <Text>Status: {pet.isActive ? 'Active' : 'Inactive'}</Text>
        <Text>Assessment Frequency: {pet.assessmentFrequency}</Text>
        <Text>Notifications: {pet.notificationsEnabled ? 'Enabled' : 'Disabled'}</Text>
        {pet.notificationsTime && (
          <Text>Notification Time: {pet.notificationsTime}</Text>
        )}
      </View>
    </View>
  );
};

// HOC that enhances the component with observable pet data
const enhancePetDetails = withObservables(['petId'], ({ petId }: { petId: string }) => ({
  pet: petCollection.findAndObserve(petId),
}));

// The enhanced component with reactive data
export const PetDetails = enhancePetDetails(PetDetailsComponent);

const styles = StyleSheet.create({
  container: {
    padding: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  petItem: {
    padding: 12,
    marginBottom: 8,
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
  },
  petDetails: {
    padding: 16,
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
  },
  petName: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 16,
    fontStyle: 'italic',
    color: '#888',
  },
});