import React, {useState} from 'react';
import {useTranslation} from 'react-i18next';
import {StyleSheet, ScrollView} from 'react-native';
import {Text, Button} from 'react-native-paper';
import RatingButtons from './RatingButtons';
import {Measurement} from '../models/Measurement';

interface Props {
  petName: string;
  date: Date;
  measurement?: Measurement | null;
  handleSubmit: (
    hurt: number,
    hunger: number,
    hydration: number,
    hygiene: number,
    happiness: number,
    mobility: number,
  ) => void;
}

const MeasurementItem: React.FC<Props> = ({
  petName,
  date,
  handleSubmit,
  measurement,
}) => {
  const {t} = useTranslation();
  const [hurt, setHurt] = useState<number | undefined>(measurement?.hurt);
  const [hunger, setHunger] = useState<number | undefined>(measurement?.hunger);
  const [hydration, setHydration] = useState<number | undefined>(
    measurement?.hydration,
  );
  const [hygiene, setHygiene] = useState<number | undefined>(
    measurement?.hygiene,
  );
  const [happiness, setHappiness] = useState<number | undefined>(
    measurement?.happiness,
  );
  const [mobility, setMoboility] = useState<number | undefined>(
    measurement?.mobility,
  );

  const areMetricsFilled = !(
    hurt === undefined ||
    hunger === undefined ||
    hydration === undefined ||
    hygiene === undefined ||
    happiness === undefined ||
    mobility === undefined
  );

  const onSubmit = () => {
    if (!areMetricsFilled) {
      return;
    }

    handleSubmit(hurt, hunger, hydration, hygiene, happiness, mobility);
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>{t('measurements:title')}</Text>
      <Text style={styles.label}>
        {t('date')}: {date.toLocaleDateString()}
      </Text>
      <Text style={styles.label}>{t('measurements:hurt')}</Text>
      <Text style={styles.info}>{t('measurements:hurtInfo', {petName})}</Text>
      <RatingButtons
        onRatingChange={value => setHurt(parseInt(value, 10))}
        initialRating={hurt?.toString() || ''}
      />

      <Text style={styles.label}>{t('measurements:hunger')}</Text>
      <Text style={styles.info}>{t('measurements:hungerInfo', {petName})}</Text>
      <RatingButtons
        onRatingChange={value => setHunger(parseInt(value, 10))}
        initialRating={hunger?.toString() || ''}
      />
      <Text style={styles.label}>{t('measurements:hydration')}</Text>
      <Text style={styles.info}>
        {t('measurements:hydrationInfo', {petName})}
      </Text>
      <RatingButtons
        onRatingChange={value => setHydration(parseInt(value, 10))}
        initialRating={hydration?.toString() || ''}
      />
      <Text style={styles.label}>{t('measurements:hygiene')}</Text>
      <Text style={styles.info}>
        {t('measurements:hygieneInfo', {petName})}
      </Text>
      <RatingButtons
        onRatingChange={value => setHygiene(parseInt(value, 10))}
        initialRating={hygiene?.toString() || ''}
      />
      <Text style={styles.label}>{t('measurements:happiness')}</Text>
      <Text style={styles.info}>
        {t('measurements:happinessInfo', {petName})}
      </Text>
      <RatingButtons
        onRatingChange={value => setHappiness(parseInt(value, 10))}
        initialRating={happiness?.toString() || ''}
      />
      <Text style={styles.label}>{t('measurements:mobility')}</Text>
      <Text style={styles.info}>
        {t('measurements:mobilityInfo', {petName})}
      </Text>
      <RatingButtons
        onRatingChange={value => setMoboility(parseInt(value, 10))}
        initialRating={mobility?.toString() || ''}
      />
      <Button
        disabled={!areMetricsFilled}
        onPress={onSubmit}
        mode={'contained'}>
        {t('buttons:submit')}
      </Button>
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

export default MeasurementItem;
