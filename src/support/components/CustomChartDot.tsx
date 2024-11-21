import React from 'react';
import {Circle, G} from 'react-native-svg';
import {useTheme} from 'react-native-paper';
import {TouchableWithoutFeedback} from 'react-native';
import PulsatingCircle from '@/support/components/PulsatingCircle.tsx';

interface CustomDotProps {
  value: number;
  index: number;
  x: number;
  y: number;
  paused?: boolean;
  dotType?: string;
  onDotPress?: (index: number, value: number) => void;
}

const CustomDot = ({
  value,
  index,
  x,
  y,
  dotType,
  paused = false,
  onDotPress,
}: CustomDotProps) => {
  const theme = useTheme();
  
  const handlePress = () => {
    if (onDotPress) {
      onDotPress(index, value);
    }
  };

  // Pulsate the last dot if it's null or the first null dot after the last non-null dot
  if (
    !paused &&
    (value === null || dotType === 'empty')
  ) {
    return (
      <TouchableWithoutFeedback onPress={handlePress}>
        <G>
          <PulsatingCircle
            key={index}
            color={theme.colors.error}
            size={10}
            x={x}
            y={y}
          />
        </G>
      </TouchableWithoutFeedback>
    );
  }

  const dotSize = dotType === 'filler' ? 3 : 5;
  const strokeWidth = dotType === 'filler' ? 4 : 5;

  return (
    <TouchableWithoutFeedback onPress={handlePress}>
      <G>
        {/* White border circle */}
        <Circle
          key={`${index}-border`}
          cx={x}
          cy={y}
          r={dotSize + strokeWidth/2}
          fill={
            dotType === 'filler'
              ? theme.colors.onSecondaryContainer
              : "white"
          }
        />
        {/* Inner colored circle */}
        <Circle
          key={index}
          cx={x}
          cy={y}
          r={dotSize}
          fill={
            dotType === 'filler'
              ? "white"
              : theme.colors.onSecondaryContainer
          }
        />
      </G>
    </TouchableWithoutFeedback>
  );
};

export default CustomDot;