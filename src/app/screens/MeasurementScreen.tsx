import React, {useState, useEffect} from 'react';
import {useTranslation} from 'react-i18next';
import {Text, Button, StyleSheet, ScrollView} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {STORAGE_KEYS} from '../../support/storageKeys';
import {NavigationProp, ParamListBase} from '@react-navigation/native';
import Slider from '@react-native-community/slider';

interface Props {
  navigation: NavigationProp<ParamListBase>;
}

const MeasurementScreen: React.FC<Props>  = ({navigation}) => {
  const {t} = useTranslation();
  const [hurt, setHurt] = useState('');
  const [hunger, setHunger] = useState('');
  const [hydration, setHydration] = useState('');
  const [hygiene, setHygiene] = useState('');
  const [happiness, setHappiness] = useState('');
  const [mobility, setMoboility] = useState('');

  const [petName, setPetName] = useState('');

  useEffect(() => {
    const fetchDogName = async () => {
      const name = await AsyncStorage.getItem(STORAGE_KEYS.PET_NAME);
      if (name !== null) {
        setPetName(name);
      }
    };

    fetchDogName();
  }, []);

  const handleSubmit = async () => {
    const metrics = {hunger, hydration, hygiene, happiness, mobility};
    const date = new Date().toISOString().split('T')[0]; // Simple date format YYYY-MM-DD
    console.log(metrics, date);

    // try {
    //   await AsyncStorage.setItem(`metrics_${date}`, JSON.stringify(metrics));
    //   navigation.goBack();
    // } catch (e) {
    //   // Error saving data
    //   console.log(e);
    // }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Record Today's Quality of Life</Text>
      <Text style={styles.titleInfo}> Unacceptable, 10 = Excellent</Text>
      <Text style={styles.label}>
        {t('measurements.hurt')}: {hurt}
      </Text>
      <Text style={styles.info}>{t('measurements.hurtInfo', {petName})}</Text>
      <Slider
        style={styles.slider}
        minimumValue={1}
        maximumValue={10}
        step={1}
        value={parseInt(hurt, 10)}
        onValueChange={value => setHurt(value.toString())}
      />
      <Text style={styles.label}>
        {t('measurements.hunger')}: {hunger}
      </Text>
      <Text style={styles.info}>{t('measurements.hungerInfo', {petName})}</Text>
      <Slider
        style={styles.slider}
        minimumValue={1}
        maximumValue={10}
        step={1}
        value={parseInt(hunger, 10)}
        onValueChange={value => setHunger(value.toString())}
      />
      <Text style={styles.label}>
        {t('measurements.hydration')}: {hydration}
      </Text>
      <Text style={styles.info}>
        {t('measurements.hydrationInfo', {petName})}
      </Text>
      <Slider
        style={styles.slider}
        minimumValue={1}
        maximumValue={10}
        step={1}
        value={parseInt(hydration, 10)}
        onValueChange={value => setHydration(value.toString())}
      />
      <Text style={styles.label}>
        {t('measurements.hygiene')}: {hygiene}
      </Text>
      <Text style={styles.info}>
        {t('measurements.hygieneInfo', {petName})}
      </Text>
      <Slider
        style={styles.slider}
        minimumValue={1}
        maximumValue={10}
        step={1}
        value={parseInt(hygiene, 10)}
        onValueChange={value => setHygiene(value.toString())}
      />
      <Text style={styles.label}>
        {t('measurements.happiness')}: {happiness}
      </Text>
      <Text style={styles.info}>
        {t('measurements.happinessInfo', {petName})}
      </Text>
      <Slider
        style={styles.slider}
        minimumValue={1}
        maximumValue={10}
        step={1}
        value={parseInt(happiness, 10)}
        onValueChange={value => setHappiness(value.toString())}
      />
      <Text style={styles.label}>
        {t('measurements.mobility')}: {mobility}
      </Text>
      <Text style={styles.info}>
        {t('measurements.mobilityInfo', {petName})}
      </Text>
      <Slider
        style={styles.slider}
        minimumValue={1}
        maximumValue={10}
        step={1}
        value={parseInt(mobility, 10)}
        onValueChange={value => setMoboility(value.toString())}
      />
      <Button title="Submit" onPress={handleSubmit} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  info: {
    fontSize: 14,
    fontWeight: 'normal',
    fontStyle: 'italic',
    marginBottom: 8,
  },
  slider: {
    marginBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 0,
  },
  titleInfo: {
    fontSize: 14,
    fontWeight: 'normal',
    fontStyle: 'italic',
    marginBottom: 20,
  },
  input: {
    height: 40,
    marginBottom: 12,
    borderWidth: 1,
    padding: 10,
    borderRadius: 5,
  },
});

export default MeasurementScreen;
