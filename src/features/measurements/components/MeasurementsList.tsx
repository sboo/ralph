import React from 'react';
import {FlatList, StyleSheet, Text, View} from 'react-native';
import {Realm} from '@realm/react';
import {Measurement} from '@/app/models/Measurement.ts';

type Props = {
  measurements: Realm.Results<Measurement & Realm.Object>;
};

export const MeasurementsList: React.FC<Props> = ({measurements}) => {
  if (measurements.length > 0) {
    return (
      <View style={styles.listContainer}>
        <FlatList
          data={measurements}
          keyExtractor={task => task._id.toString()}
          renderItem={({item}) => (
            <Text>
              {item.createdAt.toDateString()}: {item.score}
            </Text>
          )}
        />
      </View>
    );
  } else {
    return (
      <View style={styles.listContainer}>
        <Text>No data</Text>
      </View>
    );
  }
};

const styles = StyleSheet.create({
  listContainer: {
    flex: 1,
    justifyContent: 'center',
  },
});

export default MeasurementsList;
