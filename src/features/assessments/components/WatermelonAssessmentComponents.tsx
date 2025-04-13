import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { withObservables } from '@nozbe/watermelondb/react';
import { database, assessmentCollection } from '@/app/database';
import { Assessment } from '@/app/database/models/Assessment';
import { Pet } from '@/app/database/models/Pet';
import { Q } from '@nozbe/watermelondb';

// Component that displays assessments for a pet (without HOC applied)
const PetAssessmentsComponent = ({ pet, assessments }: { pet: Pet, assessments: Assessment[] }) => {
  if (!pet) {
    return (
      <View style={styles.container}>
        <Text style={styles.emptyText}>Pet not found</Text>
      </View>
    );
  }
  
  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Assessments for {pet.name} ({assessments.length})</Text>
      
      {assessments.map(assessment => (
        <View key={assessment.id} style={styles.assessmentItem}>
          <Text style={styles.assessmentDate}>Date: {assessment.date}</Text>
          <Text style={styles.scoreText}>Score: {assessment.score}</Text>
          
          <View style={styles.metricsContainer}>
            <View style={styles.metricItem}>
              <Text style={styles.metricLabel}>Hurt</Text>
              <Text style={styles.metricValue}>{assessment.hurt}</Text>
            </View>
            <View style={styles.metricItem}>
              <Text style={styles.metricLabel}>Hunger</Text>
              <Text style={styles.metricValue}>{assessment.hunger}</Text>
            </View>
            <View style={styles.metricItem}>
              <Text style={styles.metricLabel}>Hydration</Text>
              <Text style={styles.metricValue}>{assessment.hydration}</Text>
            </View>
            <View style={styles.metricItem}>
              <Text style={styles.metricLabel}>Hygiene</Text>
              <Text style={styles.metricValue}>{assessment.hygiene}</Text>
            </View>
            <View style={styles.metricItem}>
              <Text style={styles.metricLabel}>Happiness</Text>
              <Text style={styles.metricValue}>{assessment.happiness}</Text>
            </View>
            <View style={styles.metricItem}>
              <Text style={styles.metricLabel}>Mobility</Text>
              <Text style={styles.metricValue}>{assessment.mobility}</Text>
            </View>
            {assessment.customValue !== undefined && (
              <View style={styles.metricItem}>
                <Text style={styles.metricLabel}>Custom</Text>
                <Text style={styles.metricValue}>{assessment.customValue}</Text>
              </View>
            )}
          </View>
          
          {assessment.notes && (
            <View style={styles.notesContainer}>
              <Text style={styles.notesLabel}>Notes:</Text>
              <Text style={styles.notesText}>{assessment.notes}</Text>
            </View>
          )}
        </View>
      ))}
      
      {assessments.length === 0 && (
        <Text style={styles.emptyText}>No assessments found for this pet</Text>
      )}
    </ScrollView>
  );
};

// HOC that enhances the component with pet and its assessments
const enhancePetAssessments = withObservables(['petId'], ({ petId }: { petId: string }) => {
  const pet = petCollection.findAndObserve(petId);
  return {
    pet,
    assessments: pet.pipe(
      pet => pet ? pet.assessments.observe() : []
    )
  };
});

// The enhanced component with reactive data
export const PetAssessments = enhancePetAssessments(PetAssessmentsComponent);

// Component that displays assessments for a specific date (without HOC applied)
const DailyAssessmentsComponent = ({ date, assessments }: { date: string, assessments: Assessment[] }) => {
  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Assessments for {date} ({assessments.length})</Text>
      
      {assessments.map(assessment => (
        <View key={assessment.id} style={styles.assessmentItem}>
          <Text style={styles.petName}>Pet: {assessment.pet.name}</Text>
          <Text style={styles.scoreText}>Score: {assessment.score}</Text>
          
          <View style={styles.metricsContainer}>
            <View style={styles.metricItem}>
              <Text style={styles.metricLabel}>Hurt</Text>
              <Text style={styles.metricValue}>{assessment.hurt}</Text>
            </View>
            <View style={styles.metricItem}>
              <Text style={styles.metricLabel}>Hunger</Text>
              <Text style={styles.metricValue}>{assessment.hunger}</Text>
            </View>
            <View style={styles.metricItem}>
              <Text style={styles.metricLabel}>Hydration</Text>
              <Text style={styles.metricValue}>{assessment.hydration}</Text>
            </View>
            <View style={styles.metricItem}>
              <Text style={styles.metricLabel}>Hygiene</Text>
              <Text style={styles.metricValue}>{assessment.hygiene}</Text>
            </View>
            <View style={styles.metricItem}>
              <Text style={styles.metricLabel}>Happiness</Text>
              <Text style={styles.metricValue}>{assessment.happiness}</Text>
            </View>
            <View style={styles.metricItem}>
              <Text style={styles.metricLabel}>Mobility</Text>
              <Text style={styles.metricValue}>{assessment.mobility}</Text>
            </View>
          </View>
          
          {assessment.notes && (
            <View style={styles.notesContainer}>
              <Text style={styles.notesLabel}>Notes:</Text>
              <Text style={styles.notesText}>{assessment.notes}</Text>
            </View>
          )}
        </View>
      ))}
      
      {assessments.length === 0 && (
        <Text style={styles.emptyText}>No assessments found for this date</Text>
      )}
    </ScrollView>
  );
};

// HOC that enhances the component with assessments for a specific date
const enhanceDailyAssessments = withObservables(['date'], ({ date }: { date: string }) => ({
  assessments: assessmentCollection.query(Q.where('date', date)).observe(),
}));

// The enhanced component with reactive data
export const DailyAssessments = enhanceDailyAssessments(DailyAssessmentsComponent);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  petName: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  assessmentItem: {
    padding: 12,
    marginBottom: 12,
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
  },
  assessmentDate: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  scoreText: {
    fontSize: 18,
    fontWeight: 'bold',
    marginVertical: 8,
    color: '#2c7fb8',
  },
  metricsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginVertical: 8,
  },
  metricItem: {
    width: '33.33%',
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  metricLabel: {
    fontSize: 12,
    color: '#666',
  },
  metricValue: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  notesContainer: {
    marginTop: 8,
    padding: 8,
    backgroundColor: '#fff',
    borderRadius: 4,
  },
  notesLabel: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  notesText: {
    fontSize: 14,
  },
  emptyText: {
    fontSize: 16,
    fontStyle: 'italic',
    color: '#888',
    textAlign: 'center',
    marginTop: 20,
  },
});