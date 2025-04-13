import React, { useState } from 'react';
import { View, Text, Button, ScrollView, StyleSheet, TextInput, Switch } from 'react-native';
import { Card, Divider } from 'react-native-paper';
import { DatabaseProvider, useDatabaseContext } from '@/app/database/context';
import { createPet, createAssessment } from '@/app/database/hooks';
import { PetList } from '@/features/pets/components/WatermelonPetComponents';
import { Pet } from '@/app/database/models/Pet';

// Form for creating a new pet
const NewPetForm = () => {
  const [name, setName] = useState('');
  const [species, setSpecies] = useState('');
  const [isActive, setIsActive] = useState(true);

  const handleCreatePet = async () => {
    if (!name || !species) return;
    
    try {
      await createPet({
        species,
        name,
        notificationsEnabled: false,
        showNotificationDot: false,
        isActive,
        assessmentFrequency: 'DAILY',
      });
      
      // Reset form
      setName('');
      setSpecies('');
      setIsActive(true);
    } catch (error) {
      console.error('Error creating pet:', error);
    }
  };

  return (
    <Card style={styles.formCard}>
      <Card.Title title="Add New Pet" />
      <Card.Content>
        <TextInput
          style={styles.input}
          placeholder="Pet Name"
          value={name}
          onChangeText={setName}
        />
        <TextInput
          style={styles.input}
          placeholder="Species"
          value={species}
          onChangeText={setSpecies}
        />
        <View style={styles.switchContainer}>
          <Text>Active:</Text>
          <Switch value={isActive} onValueChange={setIsActive} />
        </View>
        <Button title="Create Pet" onPress={handleCreatePet} disabled={!name || !species} />
      </Card.Content>
    </Card>
  );
};

// Form for creating a new assessment
const NewAssessmentForm = ({ pets }: { pets: Pet[] }) => {
  const [selectedPetId, setSelectedPetId] = useState<string | null>(null);
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [score, setScore] = useState('5');
  const [hurt, setHurt] = useState('5');
  const [hunger, setHunger] = useState('5');
  const [hydration, setHydration] = useState('5');
  const [hygiene, setHygiene] = useState('5');
  const [happiness, setHappiness] = useState('5');
  const [mobility, setMobility] = useState('5');
  const [notes, setNotes] = useState('');

  const handleCreateAssessment = async () => {
    if (!selectedPetId) return;

    try {
      const selectedPet = pets.find(pet => pet.id === selectedPetId);
      if (!selectedPet) return;

      await createAssessment({
        pet: selectedPet,
        date,
        score: parseInt(score),
        hurt: parseInt(hurt),
        hunger: parseInt(hunger),
        hydration: parseInt(hydration),
        hygiene: parseInt(hygiene),
        happiness: parseInt(happiness),
        mobility: parseInt(mobility),
        notes: notes || undefined,
        images: [],
      });

      // Reset form
      setScore('5');
      setHurt('5');
      setHunger('5');
      setHydration('5');
      setHygiene('5');
      setHappiness('5');
      setMobility('5');
      setNotes('');
    } catch (error) {
      console.error('Error creating assessment:', error);
    }
  };

  return (
    <Card style={styles.formCard}>
      <Card.Title title="Add New Assessment" />
      <Card.Content>
        <Text style={styles.selectLabel}>Select Pet:</Text>
        <ScrollView horizontal style={styles.petsSelector}>
          {pets.map(pet => (
            <Button
              key={pet.id}
              title={pet.name}
              onPress={() => setSelectedPetId(pet.id)}
              color={selectedPetId === pet.id ? '#2196F3' : '#888'}
            />
          ))}
        </ScrollView>

        <TextInput
          style={styles.input}
          placeholder="Date (YYYY-MM-DD)"
          value={date}
          onChangeText={setDate}
        />

        <Text style={styles.inputLabel}>Score (1-10): {score}</Text>
        <TextInput
          style={styles.input}
          keyboardType="numeric"
          value={score}
          onChangeText={setScore}
        />

        <View style={styles.metricsContainer}>
          <View style={styles.metricInput}>
            <Text>Hurt:</Text>
            <TextInput
              style={styles.smallInput}
              keyboardType="numeric"
              value={hurt}
              onChangeText={setHurt}
            />
          </View>
          <View style={styles.metricInput}>
            <Text>Hunger:</Text>
            <TextInput
              style={styles.smallInput}
              keyboardType="numeric"
              value={hunger}
              onChangeText={setHunger}
            />
          </View>
          <View style={styles.metricInput}>
            <Text>Hydration:</Text>
            <TextInput
              style={styles.smallInput}
              keyboardType="numeric"
              value={hydration}
              onChangeText={setHydration}
            />
          </View>
          <View style={styles.metricInput}>
            <Text>Hygiene:</Text>
            <TextInput
              style={styles.smallInput}
              keyboardType="numeric"
              value={hygiene}
              onChangeText={setHygiene}
            />
          </View>
          <View style={styles.metricInput}>
            <Text>Happiness:</Text>
            <TextInput
              style={styles.smallInput}
              keyboardType="numeric"
              value={happiness}
              onChangeText={setHappiness}
            />
          </View>
          <View style={styles.metricInput}>
            <Text>Mobility:</Text>
            <TextInput
              style={styles.smallInput}
              keyboardType="numeric"
              value={mobility}
              onChangeText={setMobility}
            />
          </View>
        </View>

        <TextInput
          style={[styles.input, styles.textArea]}
          placeholder="Notes"
          value={notes}
          onChangeText={setNotes}
          multiline
        />

        <Button 
          title="Create Assessment" 
          onPress={handleCreateAssessment} 
          disabled={!selectedPetId} 
        />
      </Card.Content>
    </Card>
  );
};

// Component that includes both pets and forms
const WatermelonDBTestContent = () => {
  const [activeTab, setActiveTab] = useState('pets');
  const [pets, setPets] = useState<Pet[]>([]);
  const { collections } = useDatabaseContext();

  // Fetch pets when the component mounts
  React.useEffect(() => {
    const subscription = collections.pets.query().observe().subscribe(
      (results) => {
        setPets(results);
      },
      (error) => {
        console.error('Error fetching pets:', error);
      }
    );

    return () => subscription.unsubscribe();
  }, [collections.pets]);

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.header}>WatermelonDB Integration Demo</Text>
      
      <View style={styles.tabsContainer}>
        <Button 
          title="Pets" 
          onPress={() => setActiveTab('pets')}
          color={activeTab === 'pets' ? '#2196F3' : '#888'}
        />
        <Button 
          title="Add Pet" 
          onPress={() => setActiveTab('addPet')}
          color={activeTab === 'addPet' ? '#2196F3' : '#888'}
        />
        <Button 
          title="Add Assessment" 
          onPress={() => setActiveTab('addAssessment')}
          color={activeTab === 'addAssessment' ? '#2196F3' : '#888'}
        />
      </View>
      
      <Divider style={styles.divider} />
      
      {activeTab === 'pets' && <PetList />}
      {activeTab === 'addPet' && <NewPetForm />}
      {activeTab === 'addAssessment' && <NewAssessmentForm pets={pets} />}
    </ScrollView>
  );
};

// Wrap the component with the DatabaseProvider
const WatermelonDBIntegration = () => {
  return (
    <DatabaseProvider>
      <WatermelonDBTestContent />
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
  tabsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 16,
  },
  divider: {
    marginBottom: 20,
  },
  formCard: {
    marginBottom: 16,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    padding: 10,
    borderRadius: 5,
    marginBottom: 16,
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  switchContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  petsSelector: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  selectLabel: {
    marginBottom: 8,
    fontWeight: 'bold',
  },
  inputLabel: {
    marginBottom: 8,
  },
  metricsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 16,
  },
  metricInput: {
    width: '33%',
    padding: 5,
  },
  smallInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    padding: 8,
    borderRadius: 5,
    width: '80%',
  },
});

export default WatermelonDBIntegration;