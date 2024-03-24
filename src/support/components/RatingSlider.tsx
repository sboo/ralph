import React, {useEffect, useState} from 'react';
import {Slider} from '@miblanchard/react-native-slider';
import {StyleSheet, View} from 'react-native';
import RatingSliderToolTip from './RatingSliderToolTip';
import {useTheme} from 'react-native-paper';

interface Props {
  initialRating: number | undefined;
  onRatingChange?: (rating: number) => void;
  optionTexts: OptionText[];
}

interface OptionText {
  value: number;
  label: string;
  description: string;
}

const RatingSlider: React.FC<Props> = ({
  initialRating,
  onRatingChange,
  optionTexts,
}) => {
  const theme = useTheme();
  const [selectedRating, setSelectedRating] = useState<number | undefined>(
    initialRating,
  );
  const [sliding, setSliding] = useState(false);
  useEffect(() => {
    if (initialRating !== undefined) {
      setSelectedRating(initialRating);
    }
  }, [initialRating]);

  const emoticons = [
    {
      value: 0,
      icon: 'emoticon-sad-outline',
    },
    {
      value: 2.5,
      icon: 'emoticon-confused-outline',
    },
    {
      value: 5,
      icon: 'emoticon-neutral-outline',
    },
    {
      value: 7.5,
      icon: 'emoticon-happy-outline',
    },
    {
      value: 10,
      icon: 'emoticon-excited-outline',
    },
  ];

  const getSelectedLabel = () => {
    if (selectedRating === undefined) {
      return {
        label: '',
        description: '',
        icon: 'emoticon-neutral-outline',
      };
    }
    const rating = Math.round(selectedRating / 2.5) * 2.5;
    const emoticon = emoticons.find(v => v.value === rating);
    const texts = optionTexts.find(v => v.value === rating);
    return {...texts, icon: emoticon?.icon};
  };

  const onSlidingComplete = (value: number[]) => {
    setSliding(false);
    const rating = Math.round(value[0] / 2.5) * 2.5;
    if (onRatingChange) {
      onRatingChange(rating);
    }
  };

  const onSlidingStart = () => {
    setSliding(true);
  };

  const onValueChange = (value: number[]) => {
    setSelectedRating(value[0]);
  };

  const getValueColor = (value: number | undefined) => {
    if (value === undefined) {
      return theme.colors.backdrop;
    }
    const rating = Math.round(value / 2.5) * 2.5;
    switch (rating) {
      case 0:
        return '#F44336';
      case 2.5:
        return '#F49503';
      default:
      case 5:
        return '#F0E106';
      case 7.5:
        return '#74D400';
      case 10:
        return '#4CAF50';
    }
  };

  // eslint-disable-next-line react/no-unstable-nested-components
  const Tooltip = () => {
    if (!sliding) {
      return null;
    }
    return (
      <RatingSliderToolTip
        color={getValueColor(selectedRating !== undefined ? selectedRating : 5)}
        {...getSelectedLabel()}
      />
    );
  };

  return (
    <View style={styles.container}>
      <Tooltip />
      <Slider
        value={selectedRating !== undefined ? selectedRating : 5}
        onValueChange={value => onValueChange(value)}
        onSlidingStart={onSlidingStart}
        onSlidingComplete={value => onSlidingComplete(value)}
        minimumValue={0}
        maximumValue={10}
        minimumTrackTintColor={getValueColor(selectedRating)}
        maximumTrackTintColor={getValueColor(selectedRating)}
        trackStyle={styles.track}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  track: {
    height: 15,
    borderRadius: 15,
  },
});

export default RatingSlider;
