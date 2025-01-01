import React, { useEffect, useRef } from 'react';
import Svg, { Circle } from 'react-native-svg';
import { Animated, Easing } from 'react-native';

interface PulsatingCircleProps {
  color?: string;
  size?: number;
  x: number;
  y: number;
  paused?: boolean;
}

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

const PulsatingCircle: React.FC<PulsatingCircleProps> = ({
  color = 'red',
  size = 10,
  x,
  y,
  paused,
}) => {
  const animatedValue = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (paused) {
      animatedValue.stopAnimation();
      return;
    }

    const animate = () => {
      Animated.sequence([
        // Quick expansion
        Animated.timing(animatedValue, {
          toValue: 1,
          duration: 200,
          easing: Easing.ease,
          useNativeDriver: true,
        }),
     
        // Return to normal
        Animated.timing(animatedValue, {
          toValue: 0,
          duration: 600,
          easing: Easing.ease,
          useNativeDriver: true,
        }),
      ]).start(() => {
        // Add a pause between beats
        setTimeout(animate, 500);
      });
    };

    animate();

    return () => {
      animatedValue.stopAnimation();
    };
  }, [paused, animatedValue]);

  const radius = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [size / 2, size],
  });



  return (
    <AnimatedCircle
      cx={x}
      cy={y}
      r={radius}
      fill={color}
      
    />
  );
};

export default PulsatingCircle;