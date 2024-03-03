import React from 'react';
import {Circle} from 'react-native-svg';
import {useTheme} from 'react-native-paper';
import PulsatingCircle from './PulsatingCircle';

interface CustomDotProps {
  value: number;
  index: number;
  x: number;
  y: number;
  scores: (number | null)[];
}
const CustomDot = ({value, index, x, y, scores}: CustomDotProps) => {
  const theme = useTheme();
  const firstNonNullScoreIndex = scores.findIndex(score => score !== null);

  // Pulsate the last dot if it's null or the first null dot after the last non-null dot
  if (
    value === null &&
    ((firstNonNullScoreIndex >= 0 && index > firstNonNullScoreIndex) ||
      index === 6)
  ) {
    return (
      <PulsatingCircle
        key={index}
        color={theme.colors.error}
        size={10}
        x={x}
        y={y}
      />
    );
  }
  return (
    <Circle
      key={index}
      cx={x}
      cy={y}
      r={4}
      fill={theme.colors.onSecondaryContainer}
    />
  );
};

export default CustomDot;
