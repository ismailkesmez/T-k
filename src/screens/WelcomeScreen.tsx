import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Animated,
  Image,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useGameStore } from '../store/gameStore';
import { t } from '../i18n';
import { COLORS, FONTS, RADIUS, SPACING } from '../constants/theme';

const CHARACTER_IMAGES = {
  male: require('../../assets/characters/character_male.png'),
  female: require('../../assets/characters/character_female.png'),
};

export default function WelcomeScreen() {
  const [nickname, setNickname] = useState('');
  const [selectedGender, setSelectedGender] = useState<'male' | 'female' | null>(null);
  const [error, setError] = useState('');
  const setNicknameFn = useGameStore((s) => s.setNickname);
  const setGenderFn = useGameStore((s) => s.setGender);
  const lang = useGameStore((s) => s.language);
  const shake = React.useRef(new Animated.Value(0)).current;

  const handleStart = () => {
    if (!selectedGender) {
      setError(lang === 'tr' ? 'Lütfen bir karakter seçin.' : 'Please select a character.');
      return;
    }
    const trimmed = nickname.trim();
    if (!trimmed) {
      triggerShake();
      setError(t(lang, 'welcome_error_empty'));
      return;
    }
    if (trimmed.length < 2) {
      triggerShake();
      setError(t(lang, 'welcome_error_short'));
      return;
    }
    setGenderFn(selectedGender);
    setNicknameFn(trimmed);
  };

  const triggerShake = () => {
    Animated.sequence([
      Animated.timing(shake, { toValue: 10, duration: 60, useNativeDriver: true }),
      Animated.timing(shake, { toValue: -10, duration: 60, useNativeDriver: true }),
      Animated.timing(shake, { toValue: 8, duration: 60, useNativeDriver: true }),
      Animated.timing(shake, { toValue: -8, duration: 60, useNativeDriver: true }),
      Animated.timing(shake, { toValue: 0, duration: 60, useNativeDriver: true }),
    ]).start();
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <StatusBar style="light" />

      <View style={styles.logoContainer}>
        <Text style={styles.logoEmoji}>👾</Text>
        <Text style={styles.appName}>TıkTık</Text>
        <Text style={styles.version}>V0.5</Text>
        <Text style={styles.subtitle}>{t(lang, 'welcome_subtitle')}</Text>
      </View>

      {/* Gender Picker */}
      <View style={styles.genderRow}>
        {(['male', 'female'] as const).map((g) => {
          const selected = selectedGender === g;
          return (
            <TouchableOpacity
              key={g}
              style={[styles.genderCard, selected && styles.genderCardSelected]}
              onPress={() => { setSelectedGender(g); setError(''); }}
              activeOpacity={0.8}
            >
              <Image source={CHARACTER_IMAGES[g]} style={styles.genderImage} resizeMode="contain" />
              <Text style={[styles.genderLabel, selected && styles.genderLabelSelected]}>
                {g === 'male' ? (lang === 'tr' ? 'Erkek' : 'Male') : (lang === 'tr' ? 'Kadın' : 'Female')}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      <View style={styles.formContainer}>
        <Text style={styles.label}>{t(lang, 'welcome_nickname_label')}</Text>
        <Animated.View style={{ transform: [{ translateX: shake }] }}>
          <TextInput
            style={[styles.input, error ? styles.inputError : null]}
            placeholder={t(lang, 'welcome_nickname_placeholder')}
            placeholderTextColor={COLORS.TEXT_MUTED}
            value={nickname}
            onChangeText={(v) => {
              setNickname(v);
              setError('');
            }}
            maxLength={20}
            autoCapitalize="words"
            returnKeyType="done"
            onSubmitEditing={handleStart}
          />
        </Animated.View>
        {!!error && <Text style={styles.errorText}>{error}</Text>}

        <TouchableOpacity style={styles.startButton} onPress={handleStart} activeOpacity={0.8}>
          <Text style={styles.startText}>{t(lang, 'welcome_start')}</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.decorRow}>
        <Text style={styles.decorEmoji}>🟢</Text>
        <Text style={styles.decorEmoji}>🦇</Text>
        <Text style={styles.decorEmoji}>👺</Text>
        <Text style={styles.decorEmoji}>💀</Text>
        <Text style={styles.decorEmoji}>🐉</Text>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.BG_DARK,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: SPACING.XL,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: SPACING.XL,
  },
  logoEmoji: {
    fontSize: 80,
    marginBottom: SPACING.MD,
  },
  appName: {
    fontSize: 56,
    fontWeight: '900',
    color: COLORS.TEXT,
    letterSpacing: -1,
  },
  version: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.PRIMARY,
    backgroundColor: 'rgba(255,71,87,0.15)',
    paddingHorizontal: SPACING.SM,
    paddingVertical: 2,
    borderRadius: RADIUS.FULL,
    marginTop: SPACING.XS,
    overflow: 'hidden',
  },
  subtitle: {
    ...FONTS.BODY,
    marginTop: SPACING.SM,
    textAlign: 'center',
    color: COLORS.TEXT_SECONDARY,
  },
  genderRow: {
    flexDirection: 'row',
    gap: SPACING.MD,
    marginBottom: SPACING.XL,
  },
  genderCard: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: COLORS.BG_CARD,
    borderRadius: RADIUS.LG,
    paddingTop: SPACING.SM,
    paddingBottom: SPACING.MD,
    borderWidth: 2,
    borderColor: COLORS.BORDER,
  },
  genderCardSelected: {
    borderColor: COLORS.PRIMARY,
    backgroundColor: 'rgba(255,71,87,0.08)',
  },
  genderImage: {
    width: 120,
    height: 155,
  },
  genderLabel: {
    fontSize: 14,
    fontWeight: '800',
    color: COLORS.TEXT_SECONDARY,
    marginTop: SPACING.SM,
  },
  genderLabelSelected: {
    color: COLORS.PRIMARY,
  },
  formContainer: {
    width: '100%',
    alignItems: 'stretch',
  },
  label: {
    ...FONTS.SUBHEADING,
    marginBottom: SPACING.SM,
  },
  input: {
    backgroundColor: COLORS.BG_CARD,
    borderRadius: RADIUS.MD,
    borderWidth: 1.5,
    borderColor: COLORS.BORDER,
    color: COLORS.TEXT,
    fontSize: 18,
    fontWeight: '600',
    paddingHorizontal: SPACING.MD,
    paddingVertical: SPACING.MD,
    marginBottom: SPACING.SM,
  },
  inputError: {
    borderColor: COLORS.PRIMARY,
  },
  errorText: {
    color: COLORS.PRIMARY,
    fontSize: 13,
    marginBottom: SPACING.SM,
    marginLeft: 4,
  },
  startButton: {
    backgroundColor: COLORS.PRIMARY,
    borderRadius: RADIUS.MD,
    paddingVertical: SPACING.MD,
    alignItems: 'center',
    marginTop: SPACING.SM,
    shadowColor: COLORS.PRIMARY,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 8,
  },
  startText: {
    color: COLORS.TEXT,
    fontSize: 18,
    fontWeight: '900',
    letterSpacing: 1,
  },
  decorRow: {
    flexDirection: 'row',
    marginTop: SPACING.XL * 1.5,
    gap: SPACING.MD,
  },
  decorEmoji: {
    fontSize: 28,
  },
});
