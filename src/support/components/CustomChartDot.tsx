import React, { useCallback, useMemo } from 'react';
import { Circle, G } from 'react-native-svg';
import { useTheme } from 'react-native-paper';
import { TouchableWithoutFeedback } from 'react-native';
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

const TOUCH_TARGET_RADIUS = 20;

const CustomDot: React.FC<CustomDotProps> = ({
  value,
  index,
  x,
  y,
  dotType,
  paused = false,
  onDotPress,
}) => {
  const theme = useTheme();

  const handlePress = useCallback(() => {
    onDotPress?.(index, value);
  }, [onDotPress, index, value]);

  const getDotColor = (type: string | undefined) => {
    switch (type) {
      case 'filler':
        return 'white';
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
    <G>
      <Circle
        cx={x}
        cy={y}
        r={TOUCH_TARGET_RADIUS}
        fill="transparent"
      />
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
    <G>
      <Circle
        cx={x}
        cy={y}
        r={TOUCH_TARGET_RADIUS}
        fill="transparent"
      />
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
    <TouchableWithoutFeedback onPress={handlePress}>
      {shouldPulsate ? renderPulsatingDot() : renderStaticDot()}
    </TouchableWithoutFeedback>
  );
};

export default React.memo(CustomDot);