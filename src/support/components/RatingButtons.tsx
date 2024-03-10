import React, {useState, useEffect} from 'react';
import {StyleSheet, View} from 'react-native';
import {SegmentedButtons} from 'react-native-paper';

interface Props {
  initialRating: string;
  onRatingChange?: (rating: string) => void;
}

const RatingButtons: React.FC<Props> = ({initialRating, onRatingChange}) => {
  const [selectedRating, setSelectedRating] = useState<string>(initialRating);

  useEffect(() => {
    setSelectedRating(initialRating);
  }, [initialRating]);

  const handlePress = (rating: string) => {
    setSelectedRating(rating);
    if (onRatingChange) {
      onRatingChange(rating);
    }
  };

  return (
    <View style={styles.container}>
      <SegmentedButtons
        value={selectedRating}
        onValueChange={handlePress}
        buttons={[
          {
            value: '0',
            label: 'Bad',
            icon: 'emoticon-sad-outline',
          },
          {
            value: '5',
            label: 'Good',
            icon: 'emoticon-happy-outline',
          },
          {
            value: '10',
            label: 'Excellent',
            icon: 'emoticon-excited-outline',
          },
        ]}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingBottom: 20,
  },
});

export default RatingButtons;
