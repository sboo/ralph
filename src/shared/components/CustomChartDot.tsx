import PulsatingCircle from '@/shared/components/PulsatingCircle.tsx';
import React, { useMemo } from 'react';
import { useTheme } from 'react-native-paper';
import { Circle, G } from 'react-native-svg';

interface CustomDotProps {
  value: number;
  index: number;
  x: number;
  y: number;
  paused?: boolean;
  dotType?: string;
  onPress?: () => void;  // Add onPress prop
}

const CustomDot: React.FC<CustomDotProps> = ({
  value,
  index,
  x,
  y,
  dotType,
  paused = false,
  onPress,  // Destructure onPress prop
}) => {
  const theme = useTheme();

  const getDotColor = (type: string | undefined) => {
    switch (type) {
      case 'filler':
        return 'white';
      case 'empty':
        return theme.colors.error;
      case 'average':
      default:
        return theme.colors.onSecondaryContainer;
    }
  };

  const dotConfig = useMemo(() => ({
    size: dotType === 'filler' ? 3 : 6,
    strokeWidth: dotType === 'filler' ? 4 : 6,
    fillColor: getDotColor(dotType),
    borderColor: dotType === 'filler' ? theme.colors.onSecondaryContainer : "white"
  }), [dotType, theme.colors.onSecondaryContainer]);

  const shouldPulsate = !paused && (value === null || dotType === 'empty');

  const renderPulsatingDot = () => (
    <G onPressIn={onPress}>
      <PulsatingCircle
        key={index}
        color={theme.colors.error}
        size={10}
        x={x}
        y={y}
        paused={paused}
      />
    </G>
  );

  const renderStaticDot = () => (
    <G onPressIn={onPress}>
      {/* White border circle */}
      <Circle
        key={`${index}-border`}
        cx={x}
        cy={y}
        r={dotConfig.size + dotConfig.strokeWidth / 2}
        fill={dotConfig.borderColor}
      />
      {/* Inner colored circle */}
      <Circle
        key={index}
        cx={x}
        cy={y}
        r={dotConfig.size}
        fill={dotConfig.fillColor}
      />
    </G>
  );

  return (
    <>
      {shouldPulsate ? renderPulsatingDot() : renderStaticDot()}
    </>
  );
};

export default React.memo(CustomDot);