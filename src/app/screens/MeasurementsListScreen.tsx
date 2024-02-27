import React, {useState, useEffect} from 'react';
import {useTranslation} from 'react-i18next';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
} from 'react-native';
import {NavigationProp, ParamListBase} from '@react-navigation/native';
import {useQuery} from '@realm/react';
import {Measurement} from '../../models/Measurement';

interface Props {
  navigation: NavigationProp<ParamListBase>;
}

const MeasurementsListScreen: React.FC<Props> = ({navigation}) => {
  const {t} = useTranslation();
  const measurements = useQuery(Measurement, collection =>
    collection.sorted('createdAt', true),
  );

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Measurements</Text>
      {measurements.map((measurement, index) => (
        <View key={index} style={styles.measurementItem}>
          <Text>Date: {measurement.createdAt.toDateString()}</Text>
          <Text>Score: {measurement.score}</Text>
        </View>
      ))}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  measurementItem: {
    marginBottom: 15,
    padding: 10,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 5,
  },
});

export default MeasurementsListScreen;
