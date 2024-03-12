import React, {useState, useEffect} from 'react';
import {StyleSheet, View} from 'react-native';
import {SegmentedButtons} from 'react-native-paper';
import {useTranslation} from 'react-i18next';

interface Props {
  initialRating: string;
  onRatingChange?: (rating: string) => void;
}

const RatingButtons: React.FC<Props> = ({initialRating, onRatingChange}) => {
  const {t} = useTranslation();
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
            label: t('buttons:bad'),
            icon: 'emoticon-sad-outline',
          },
          {
            value: '5',
            label: t('buttons:good'),
            icon: 'emoticon-happy-outline',
          },
          {
            value: '10',
            label: t('buttons:excellent'),
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
