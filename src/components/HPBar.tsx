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
      {showLabel && (
        <Text style={styles.label}>
          {current} / {max}
        </Text>
      )}
      <View style={styles.track}>
        <Animated.View
          style={[
            styles.fill,
            { backgroundColor: barColor, width: animWidth.interpolate({ inputRange: [0, 1], outputRange: ['0%', '100%'] }) },
          ]}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { width: '100%' },
  label: {
    ...FONTS.CAPTION,
    textAlign: 'center',
    marginBottom: 4,
    color: COLORS.TEXT_SECONDARY,
  },
  track: {
    height: 12,
    backgroundColor: COLORS.BG_ELEVATED,
    borderRadius: RADIUS.FULL,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: COLORS.BORDER,
  },
  fill: {
    height: '100%',
    borderRadius: RADIUS.FULL,
  },
});
