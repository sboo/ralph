import React from 'react';
import {useTranslation} from 'react-i18next';
import {View, Text, StyleSheet, ScrollView} from 'react-native';
import {useQuery} from '@realm/react';
import {Measurement} from '../../models/Measurement';
import {AllMeasurementsScreenNavigationProps} from '../navigation/types';
import {List} from 'react-native-paper';

const AllMeasurementsScreen: React.FC<
  AllMeasurementsScreenNavigationProps
> = () => {
  const {t} = useTranslation();
  const measurements = useQuery(Measurement, collection =>
    collection.sorted('createdAt', true),
  );

  const getIcon = (score: number) => {
    if (score < 30) {
      return 'emoticon-sad-outline';
    } else if (score < 50) {
      return 'emoticon-neutral-outline';
    } else {
      return 'emoticon-happy-outline';
    }
  };
  const getIconColor = (score: number) => {
    if (score < 30) {
      return '#FF0000';
    } else if (score < 50) {
      return '#FFA500';
    } else {
      return '#008000';
    }
  };

  return (
    <ScrollView style={styles.container}>
      {measurements.map((measurement, index) => (
        <List.Item
          key={index}
          title={measurement.createdAt.toLocaleDateString()}
          description={`${t('measurements:score')}: ${measurement.score}`}
          // eslint-disable-next-line react/no-unstable-nested-components
          left={() => (
            <List.Icon
              color={getIconColor(measurement.score)}
              icon={getIcon(measurement.score)}
            />
          )}
          // eslint-disable-next-line react/no-unstable-nested-components
          right={() => <List.Icon color="#afafaf" icon="pencil" />}
        />
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

export default AllMeasurementsScreen;
