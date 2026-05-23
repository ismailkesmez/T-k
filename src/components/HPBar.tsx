import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { COLORS, RADIUS, FONTS } from '../constants/theme';

interface Props {
  current: number;
  max: number;
  color?: string;
  showLabel?: boolean;
}

export default function HPBar({ current, max, color = COLORS.PRIMARY, showLabel = true }: Props) {
  const animWidth = useRef(new Animated.Value(1)).current;
  const ratio = max > 0 ? Math.max(0, current / max) : 0;

  useEffect(() => {
    Animated.timing(animWidth, {
      toValue: ratio,
      duration: 120,
      useNativeDriver: false,
    }).start();
  }, [ratio]);

  const barColor = ratio > 0.5 ? COLORS.SECONDARY : ratio > 0.25 ? COLORS.GOLD : COLORS.PRIMARY;

  return (
    <View style={styles.container}>
      <View style={styles.track}>
        <Animated.View
          style={[
            styles.fill,
            { backgroundColor: barColor, width: animWidth.interpolate({ inputRange: [0, 1], outputRange: ['0%', '100%'] }) },
          ]}
        />
        {showLabel && (
          <Text style={styles.label}>
            {Math.floor(current).toLocaleString()} / {Math.floor(max).toLocaleString()}
          </Text>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { width: '100%' },
  track: {
    height: 22,
    backgroundColor: COLORS.BG_ELEVATED,
    borderRadius: RADIUS.FULL,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: COLORS.BORDER,
    justifyContent: 'center',
    alignItems: 'center',
  },
  fill: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    borderRadius: RADIUS.FULL,
  },
  label: {
    ...FONTS.CAPTION,
    fontSize: 11,
    fontWeight: '700',
    color: '#fff',
    textShadowColor: 'rgba(0,0,0,0.85)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
});
