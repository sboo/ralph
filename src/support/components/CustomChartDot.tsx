import React from 'react';
import {Circle} from 'react-native-svg';
import {useTheme} from 'react-native-paper';
import PulsatingCircle from '@/support/components/PulsatingCircle.tsx';

interface CustomDotProps {
  value: number;
  index: number;
  x: number;
  y: number;
  scores: (number | null)[];
  paused?: boolean;
  dotType?: string;
}
const CustomDot = ({
  value,
  index,
  x,
  y,
  scores,
  dotType,
  paused = false,
}: CustomDotProps) => {
  const theme = useTheme();
  const firstNonNullScoreIndex = scores.findIndex(score => score !== null);

  // Pulsate the last dot if it's null or the first null dot after the last non-null dot
  if (
    !paused &&
    (value === null || dotType === 'empty' )&&
    ((firstNonNullScoreIndex >= 0 && index > firstNonNullScoreIndex) ||
      index === scores.length - 1)
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
  const dotSize = dotType === 'filler' ? 3 : 5;
  const strokeWidth = dotType === 'filler' ? 4 : 5;

  return (
    <>
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
    </>
  );
};

export default CustomDot;
