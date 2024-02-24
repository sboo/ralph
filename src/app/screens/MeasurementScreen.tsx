import React, {useState, useEffect} from 'react';
import {useTranslation} from 'react-i18next';
import {Text, Button, StyleSheet, ScrollView} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {STORAGE_KEYS} from '../../support/storageKeys';
import {NavigationProp, ParamListBase} from '@react-navigation/native';
import Slider from '@react-native-community/slider';
import {Measurement} from '../../support/models/measurements';

interface Props {
  navigation: NavigationProp<ParamListBase>;
}

const MeasurementScreen: React.FC<Props> = ({navigation}) => {
  const {t} = useTranslation();
  const [hurt, setHurt] = useState<number | undefined>(undefined);
  const [hunger, setHunger] = useState<number | undefined>(undefined);
  const [hydration, setHydration] = useState<number | undefined>(undefined);
  const [hygiene, setHygiene] = useState<number | undefined>(undefined);
  const [happiness, setHappiness] = useState<number | undefined>(undefined);
  const [mobility, setMoboility] = useState<number | undefined>(undefined);
  const [moreGoodDays, setMoreGoodDays] = useState<number | undefined>(
    undefined,
  );

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

  const metrics = {
    hurt,
    hunger,
    hydration,
    hygiene,
    happiness,
    mobility,
    moreGoodDays,
  };

  const isMetricsFilled = Object.values(metrics).every(
    value => value !== undefined,
  );

  const handleSubmit = async () => {
    if (isMetricsFilled) {
      const date = new Date().toISOString().split('T')[0];
      const score = Object.values(metrics).reduce(
        (acc, value) => acc! + (value as number),
        0,
      );

      const measurements: Measurement = {
        date,
        score: score || 0,
        hurt: hurt || 0,
        hunger: hunger || 0,
        hydration: hydration || 0,
        hygiene: hygiene || 0,
        happiness: happiness || 0,
        mobility: mobility || 0,
        moreGoodDays: moreGoodDays || 0,
      };

      try {
        await AsyncStorage.setItem(
          `metrics_${date}`,
          JSON.stringify(measurements),
        );
        navigation.goBack();
      } catch (e) {
        // Error saving data
        console.log(e);
      }
    } else {
      // Handle case when metrics are not filled
      console.log('Please fill in all metrics');
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>{t('measurements.title')}</Text>
      <Text style={styles.titleInfo}>{t('measurements.info')}</Text>
      <Text style={styles.label}>
        {t('measurements.hurt')}: {hurt}
      </Text>
      <Text style={styles.info}>{t('measurements.hurtInfo', {petName})}</Text>
      <Slider
        style={styles.slider}
        minimumValue={1}
        maximumValue={10}
        step={1}
        value={hurt}
        onValueChange={value => setHurt(value)}
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
        value={hunger}
        onValueChange={value => setHunger(value)}
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
        value={hydration}
        onValueChange={value => setHydration(value)}
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
        value={hygiene}
        onValueChange={value => setHygiene(value)}
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
        value={happiness}
        onValueChange={value => setHappiness(value)}
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
        value={mobility}
        onValueChange={value => setMoboility(value)}
      />
      <Text style={styles.label}>
        {t('measurements.moreGoodDays')}: {moreGoodDays}
      </Text>
      <Text style={styles.info}>
        {t('measurements.moreGoodDaysInfo', {petName})}
      </Text>
      <Slider
        style={styles.slider}
        minimumValue={1}
        maximumValue={10}
        step={1}
        value={moreGoodDays}
        onValueChange={value => setMoreGoodDays(value)}
      />
      <Button
        disabled={!isMetricsFilled}
        title={t('buttons.submit')}
        onPress={handleSubmit}
      />
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
