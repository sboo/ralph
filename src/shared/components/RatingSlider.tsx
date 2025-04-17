import { getValueColor } from '@/shared/helpers/ColorHelper';
import { Slider } from '@miblanchard/react-native-slider';
import React, { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { useTheme } from 'react-native-paper';
import { getTooltipContent, OptionText } from '../helpers/TooltipHelper';
import RatingSliderToolTip from './RatingSliderToolTip';

interface Props {
  initialRating: number | undefined;
  onRatingChange?: (rating: number) => void;
  optionTexts: OptionText[];
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
  const [sliderValue, setSliderValue] = useState<number | undefined>(
    initialRating !== undefined ? initialRating / 2.5 : undefined,
  );
  const [sliding, setSliding] = useState(false);
  useEffect(() => {
    if (initialRating !== undefined) {
      setSelectedRating(initialRating);
    }
  }, [initialRating]);


  const onSlidingComplete = (value: number[]) => {
    setSliding(false);
    const rating = Math.round(value[0] / 2.5) * 2.5;
    if (onRatingChange) {
      onRatingChange(value[0] * 2.5);
    }
  };

  const onSlidingStart = () => {
    setSliding(true);
  };

  const onValueChange = (value: number[]) => {
    setSliderValue(value[0]);
    setSelectedRating(value[0] * 2.5);
  };

  // eslint-disable-next-line react/no-unstable-nested-components
  const Tooltip = () => {
    if (!sliding) {
      return null;
    }
    
    const tooltipContent = getTooltipContent(selectedRating, optionTexts);
        return (
            <RatingSliderToolTip
                color={getValueColor(
                    theme.colors.outline,
                    selectedRating !== undefined ? selectedRating : 5,
                )}
                {...tooltipContent}
            />
        );
  };

  return (
    <View style={styles.container}>
      <Tooltip />
      <Slider
        value={sliderValue !== undefined ? sliderValue : 2}
        onValueChange={value => onValueChange(value)}
        onSlidingStart={onSlidingStart}
        onSlidingComplete={value => onSlidingComplete(value)}
        minimumValue={0}
        maximumValue={4}
        step={1}
        thumbTintColor={theme.colors.onSurface}
        minimumTrackTintColor={getValueColor(
          theme.colors.outline,
          selectedRating,
        )}
        maximumTrackTintColor={getValueColor(
          theme.colors.outline,
          selectedRating,
        )}
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
