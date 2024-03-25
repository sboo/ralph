import React, {useEffect, useRef} from 'react';
import {Animated, StyleSheet} from 'react-native';

interface PulsatingCircleProps {
  color?: string;
  size?: number;
  x: number;
  y: number;
  paused?: boolean;
}

const PulsatingCircle = ({
  color = 'red',
  size = 10,
  x,
  y,
  paused,
}: PulsatingCircleProps) => {
  const pulseAnim = useRef(new Animated.Value(1)).current; // Initial scale

  useEffect(() => {
    if (!paused) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 2,
            duration: 300,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: true,
          }),
        ]),
      ).start();
    } else {
      pulseAnim.setValue(1.5);
    }
  }, [pulseAnim, paused]);

  return (
    <Animated.View
      style={{
        top: y - size / 2,
        left: x - size / 2,
        width: size,
        height: size,
        borderRadius: size / 2,
        backgroundColor: color,
        transform: [{scale: pulseAnim}],
        ...styles.container,
      }}
    />
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
  },
});

export default PulsatingCircle;
