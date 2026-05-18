import React, { useEffect, useRef } from 'react';
import { Animated, Text, StyleSheet } from 'react-native';
import { COLORS } from '../constants/theme';

export interface FloatingItem {
  id: number;
  x: number;
  y: number;
  text: string;
  color?: string;
}

interface Props {
  item: FloatingItem;
  onDone: (id: number) => void;
}

export default function FloatingText({ item, onDone }: Props) {
  const opacity = useRef(new Animated.Value(1)).current;
  const translateY = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(opacity, { toValue: 0, duration: 900, useNativeDriver: true }),
      Animated.timing(translateY, { toValue: -70, duration: 900, useNativeDriver: true }),
    ]).start(() => onDone(item.id));
  }, []);

  return (
    <Animated.Text
      style={[
        styles.text,
        {
          left: item.x - 30,
          top: item.y - 20,
          opacity,
          transform: [{ translateY }],
          color: item.color ?? COLORS.GOLD,
        },
      ]}
    >
      {item.text}
    </Animated.Text>
  );
}

const styles = StyleSheet.create({
  text: {
    position: 'absolute',
    fontWeight: '900',
    fontSize: 22,
    textShadowColor: 'rgba(0,0,0,0.8)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
    zIndex: 100,
    pointerEvents: 'none',
  } as any,
});
