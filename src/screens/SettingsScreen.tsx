import React, { useState, useRef } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, Modal,
  Alert, TextInput, ScrollView, Switch,
} from 'react-native';
import { useGameStore } from '../store/gameStore';
import { ACHIEVEMENTS } from '../constants/achievements';
import { LEVEL_XP_THRESHOLDS, getLevelFromXp } from '../constants/monsters';
import { WEAPONS } from '../constants/shop';
import { t } from '../i18n';
import { COLORS, FONTS, RADIUS, SPACING } from '../constants/theme';

// TR, EN, TR, EN, EN, EN — 10 saniye içinde
const ADMIN_SEQUENCE = ['tr', 'en', 'tr', 'en', 'en', 'en'] as const;
const ADMIN_PASSWORD = '1234234';
const SEQ_TIMEOUT_MS = 10000;

export default function SettingsScreen() {
  const lang = useGameStore((s) => s.language);
  const setLanguage = useGameStore((s) => s.setLanguage);
  const resetGame = useGameStore((s) => s.resetGame);
  const soundEnabled = useGameStore((s) => s.soundEnabled);
  const setSoundEnabled = useGameStore((s) => s.setSoundEnabled);

  const [showResetModal, setShowResetModal] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showAdminPanel, setShowAdminPanel] = useState(false);
  const [passwordInput, setPasswordInput] = useState('');
  const [passwordError, setPasswordError] = useState(false);
  const [adminLevel, setAdminLevel] = useState('');
  const [adminXp, setAdminXp] = useState('');
  const [adminTikTik, setAdminTikTik] = useState('');
  const [adminClickPower, setAdminClickPower] = useState('');
  const [adminSlimeUse, setAdminSlimeUse] = useState('');

  const slimeSwordUseCount = useGameStore((s) => s.slimeSwordUseCount);

  const seqStepRef = useRef(0);
  const seqStartTimeRef = useRef(0);

  // ─── Gizli sekans ──────────────────────────────────────────────────────────
  const handleLangPress = (l: 'tr' | 'en') => {
    setLanguage(l);

    const now = Date.now();

    if (seqStepRef.current > 0 && now - seqStartTimeRef.current > SEQ_TIMEOUT_MS) {
      seqStepRef.current = 0;
    }

    if (seqStepRef.current === 0) {
      seqStartTimeRef.current = now;
    }

    if (l === ADMIN_SEQUENCE[seqStepRef.current]) {
      seqStepRef.current++;
      if (seqStepRef.current === ADMIN_SEQUENCE.length) {
        seqStepRef.current = 0;
        setShowPasswordModal(true);
      }
    } else {
      // Yanlış tuş — baştan başla; ama bu tuş sekansın başıysa 1. adıma geç
      seqStepRef.current = l === ADMIN_SEQUENCE[0] ? 1 : 0;
      if (seqStepRef.current === 1) seqStartTimeRef.current = now;
    }
  };

  // ─── Şifre ─────────────────────────────────────────────────────────────────
  const handlePasswordSubmit = () => {
    if (passwordInput === ADMIN_PASSWORD) {
      setPasswordInput('');
      setPasswordError(false);
      setShowPasswordModal(false);
      setShowAdminPanel(true);
    } else {
      setPasswordError(true);
      setPasswordInput('');
    }
  };

  const closePasswordModal = () => {
    setShowPasswordModal(false);
    setPasswordInput('');
    setPasswordError(false);
  };

  // ─── Admin işlemleri ────────────────────────────────────────────────────────
  const handleSetLevel = () => {
    const lvl = parseInt(adminLevel, 10);
    if (isNaN(lvl) || lvl < 1 || lvl > 100) {
      Alert.alert('', 'Geçerli bir seviye girin (1 – 100)');
      return;
    }
    const xpForLevel = LEVEL_XP_THRESHOLDS[lvl - 1] ?? 0;
    useGameStore.setState({ level: lvl, xp: xpForLevel });
    setAdminLevel('');
    Alert.alert('✓', `Seviye ${lvl} olarak ayarlandı`);
  };

  const handleSetXp = () => {
    const xpVal = parseInt(adminXp, 10);
    if (isNaN(xpVal) || xpVal < 0) {
      Alert.alert('', 'Geçerli bir XP değeri girin');
      return;
    }
    const lvl = getLevelFromXp(xpVal);
    useGameStore.setState({ xp: xpVal, level: lvl });
    setAdminXp('');
    Alert.alert('✓', `XP ${xpVal.toLocaleString()} olarak ayarlandı`);
  };

  const handleSetTikTik = () => {
    const tt = parseInt(adminTikTik, 10);
    if (isNaN(tt) || tt < 0) {
      Alert.alert('', 'Geçerli bir TıkTık değeri girin');
      return;
    }
    useGameStore.setState({ tikTik: tt });
    setAdminTikTik('');
    Alert.alert('✓', `TıkTık ${tt.toLocaleString()} olarak ayarlandı`);
  };

  const handleSetClickPower = () => {
    const cp = parseInt(adminClickPower, 10);
    if (isNaN(cp) || cp < 1) {
      Alert.alert('', 'Geçerli bir tıklama gücü girin (min 1)');
      return;
    }
    useGameStore.setState({ clickPower: cp });
    setAdminClickPower('');
    Alert.alert('✓', `Tıklama gücü ${cp} olarak ayarlandı`);
  };

  const handleSetSlimeUse = () => {
    const val = parseInt(adminSlimeUse, 10);
    if (isNaN(val) || val < 0) {
      Alert.alert('', 'Geçerli bir sayı girin (min 0)');
      return;
    }
    useGameStore.setState({ slimeSwordUseCount: val });
    setAdminSlimeUse('');
    const stage = val >= 200 ? 'Mutlak Slime Kılıcı' : val >= 100 ? 'Çifte Slime Kılıcı' : 'Slime Kılıcı';
    Alert.alert('✓', `Kullanım sayısı ${val} → ${stage}`);
  };

  const handleUnlockAllMonsters = () => {
    useGameStore.setState({ unlockedMonsters: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20] });
    Alert.alert('✓', 'Tüm canavarlar açıldı!');
  };

  const handleUnlockAllWeapons = () => {
    const allWeaponIds = WEAPONS.map((w) => w.id);
    useGameStore.setState({
      silahTuccariPurchased: true,
      purchasedWeapons: allWeaponIds,
      kutsalKilicPurchased: true,
      kutsalKilicUnlocked: true,
    });
    Alert.alert('✓', 'Tüm silahlar açıldı!');
  };

  const handleUnlockAllAchievements = () => {
    const s = useGameStore.getState();
    const allUnlocked = ACHIEVEMENTS.map((a) => {
      const existing = s.unlockedAchievements.find((u) => u.id === a.id);
      return existing ?? { id: a.id, claimed: false };
    });
    useGameStore.setState({ unlockedAchievements: allUnlocked });
    Alert.alert('🏆', 'Tüm başarılar açıldı!');
  };

  const handleReset = () => {
    resetGame();
    setShowResetModal(false);
  };

  // ─── Render ────────────────────────────────────────────────────────────────
  return (
    <View style={styles.container}>
      {/* Dil */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>{t(lang, 'settings_language')}</Text>
        <View style={styles.langRow}>
          {(['tr', 'en'] as const).map((l) => (
            <TouchableOpacity
              key={l}
              style={[styles.langBtn, lang === l && styles.langBtnActive]}
              onPress={() => handleLangPress(l)}
            >
              <Text style={styles.langFlag}>{l === 'tr' ? '🇹🇷' : '🇬🇧'}</Text>
              <Text style={[styles.langText, lang === l && styles.langTextActive]}>
                {l === 'tr' ? t(lang, 'settings_language_tr') : t(lang, 'settings_language_en')}
              </Text>
              {lang === l && <Text style={styles.checkmark}>✓</Text>}
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Ses */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>{t(lang, 'settings_sound' as any)}</Text>
        <View style={styles.soundRow}>
          <Text style={styles.soundLabel}>
            {soundEnabled ? t(lang, 'settings_sound_on' as any) : t(lang, 'settings_sound_off' as any)}
          </Text>
          <Switch
            value={soundEnabled}
            onValueChange={setSoundEnabled}
            trackColor={{ false: COLORS.BORDER, true: COLORS.PRIMARY + '88' }}
            thumbColor={soundEnabled ? COLORS.PRIMARY : COLORS.TEXT_MUTED}
          />
        </View>
      </View>

      {/* Tehlikeli Bölge */}
      <View style={[styles.section, styles.dangerSection]}>
        <Text style={[styles.sectionTitle, { color: COLORS.PRIMARY }]}>
          {lang === 'tr' ? 'Tehlikeli Bölge' : 'Danger Zone'}
        </Text>
        <View style={styles.resetCard}>
          <View style={styles.resetInfo}>
            <Text style={styles.resetTitle}>{t(lang, 'settings_reset')}</Text>
            <Text style={styles.resetDesc}>{t(lang, 'settings_reset_desc')}</Text>
          </View>
          <TouchableOpacity style={styles.resetBtn} onPress={() => setShowResetModal(true)}>
            <Text style={styles.resetBtnText}>{t(lang, 'settings_reset')}</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Uygulama bilgisi */}
      <View style={styles.appInfo}>
        <Text style={styles.appName}>TıkTık</Text>
        <Text style={styles.appVersion}>{t(lang, 'settings_version')} V0.5</Text>
        <Text style={styles.appBy}>{t(lang, 'settings_by')} Kesmez</Text>
      </View>

      {/* ── Reset Modal ─────────────────────────────────────────────────────── */}
      <Modal visible={showResetModal} transparent animationType="fade" onRequestClose={() => setShowResetModal(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <Text style={styles.modalWarning}>⚠️</Text>
            <Text style={styles.modalTitle}>{t(lang, 'settings_reset_confirm_title')}</Text>
            <Text style={styles.modalMsg}>{t(lang, 'settings_reset_confirm_msg')}</Text>
            <View style={styles.modalButtons}>
              <TouchableOpacity style={[styles.modalBtn, styles.modalBtnCancel]} onPress={() => setShowResetModal(false)}>
                <Text style={styles.modalBtnCancelText}>{t(lang, 'settings_reset_cancel')}</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.modalBtn, styles.modalBtnReset]} onPress={handleReset}>
                <Text style={styles.modalBtnResetText}>{t(lang, 'settings_reset_confirm')}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* ── Şifre Modal ──────────────────────────────────────────────────────── */}
      <Modal visible={showPasswordModal} transparent animationType="fade" onRequestClose={closePasswordModal}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <Text style={styles.modalWarning}>🔐</Text>
            <Text style={styles.modalTitle}>Yönetici Şifresi</Text>
            <TextInput
              style={[styles.adminInput, { marginTop: SPACING.SM }, passwordError && styles.adminInputError]}
              value={passwordInput}
              onChangeText={(v) => { setPasswordInput(v); setPasswordError(false); }}
              placeholder="Şifre girin..."
              placeholderTextColor={COLORS.TEXT_MUTED}
              secureTextEntry
              keyboardType="numeric"
              maxLength={10}
              autoFocus
            />
            {passwordError && (
              <Text style={styles.passwordErrorText}>Yanlış şifre!</Text>
            )}
            <View style={[styles.modalButtons, { marginTop: SPACING.MD }]}>
              <TouchableOpacity style={[styles.modalBtn, styles.modalBtnCancel]} onPress={closePasswordModal}>
                <Text style={styles.modalBtnCancelText}>İptal</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.modalBtn, styles.modalBtnReset]} onPress={handlePasswordSubmit}>
                <Text style={styles.modalBtnResetText}>Giriş</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* ── Yönetici Paneli Modal ────────────────────────────────────────────── */}
      <Modal visible={showAdminPanel} transparent animationType="slide" onRequestClose={() => setShowAdminPanel(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.adminPanel}>
            <Text style={styles.adminTitle}>🔧 Yönetici Paneli</Text>

            <ScrollView showsVerticalScrollIndicator={false}>
              {/* Seviye */}
              <Text style={styles.adminLabel}>Seviye</Text>
              <View style={styles.adminRow}>
                <TextInput
                  style={styles.adminInput}
                  value={adminLevel}
                  onChangeText={setAdminLevel}
                  placeholder="1 – 100"
                  placeholderTextColor={COLORS.TEXT_MUTED}
                  keyboardType="numeric"
                  maxLength={3}
                />
                <TouchableOpacity style={styles.adminSetBtn} onPress={handleSetLevel}>
                  <Text style={styles.adminSetBtnText}>Ayarla</Text>
                </TouchableOpacity>
              </View>

              {/* XP */}
              <Text style={styles.adminLabel}>XP</Text>
              <View style={styles.adminRow}>
                <TextInput
                  style={styles.adminInput}
                  value={adminXp}
                  onChangeText={setAdminXp}
                  placeholder="0"
                  placeholderTextColor={COLORS.TEXT_MUTED}
                  keyboardType="numeric"
                  maxLength={10}
                />
                <TouchableOpacity style={styles.adminSetBtn} onPress={handleSetXp}>
                  <Text style={styles.adminSetBtnText}>Ayarla</Text>
                </TouchableOpacity>
              </View>

              {/* TıkTık */}
              <Text style={styles.adminLabel}>TıkTık Puanı</Text>
              <View style={styles.adminRow}>
                <TextInput
                  style={styles.adminInput}
                  value={adminTikTik}
                  onChangeText={setAdminTikTik}
                  placeholder="0"
                  placeholderTextColor={COLORS.TEXT_MUTED}
                  keyboardType="numeric"
                  maxLength={10}
                />
                <TouchableOpacity style={styles.adminSetBtn} onPress={handleSetTikTik}>
                  <Text style={styles.adminSetBtnText}>Ayarla</Text>
                </TouchableOpacity>
              </View>

              {/* Tıklama Gücü */}
              <Text style={styles.adminLabel}>Tıklama Gücü</Text>
              <View style={styles.adminRow}>
                <TextInput
                  style={styles.adminInput}
                  value={adminClickPower}
                  onChangeText={setAdminClickPower}
                  placeholder="örn. 9999"
                  placeholderTextColor={COLORS.TEXT_MUTED}
                  keyboardType="numeric"
                  maxLength={8}
                />
                <TouchableOpacity style={styles.adminSetBtn} onPress={handleSetClickPower}>
                  <Text style={styles.adminSetBtnText}>Ayarla</Text>
                </TouchableOpacity>
              </View>

              {/* Slime Kılıcı Evrim */}
              <Text style={styles.adminLabel}>
                🫧 Slime Kılıcı Kullanım Sayısı
              </Text>
              <Text style={styles.adminStageBadge}>
                {slimeSwordUseCount >= 200
                  ? `✕ Mutlak (${slimeSwordUseCount})`
                  : slimeSwordUseCount >= 100
                  ? `🫧🫧 Çifte (${slimeSwordUseCount})`
                  : `🫧 Slime (${slimeSwordUseCount})`}
              </Text>
              <View style={styles.adminRow}>
                <TextInput
                  style={styles.adminInput}
                  value={adminSlimeUse}
                  onChangeText={setAdminSlimeUse}
                  placeholder="0 / 100 / 200"
                  placeholderTextColor={COLORS.TEXT_MUTED}
                  keyboardType="numeric"
                  maxLength={5}
                />
                <TouchableOpacity style={styles.adminSetBtn} onPress={handleSetSlimeUse}>
                  <Text style={styles.adminSetBtnText}>Ayarla</Text>
                </TouchableOpacity>
              </View>

              {/* Canavarlar & Başarılar */}
              <View style={styles.adminDivider} />
              <TouchableOpacity style={styles.adminAchBtn} onPress={handleUnlockAllMonsters}>
                <Text style={styles.adminAchBtnText}>👾 Tüm Canavarları Aç</Text>
              </TouchableOpacity>
              <View style={{ height: SPACING.SM }} />
              <TouchableOpacity style={styles.adminAchBtn} onPress={handleUnlockAllWeapons}>
                <Text style={styles.adminAchBtnText}>⚔️ Tüm Silahları Aç</Text>
              </TouchableOpacity>
              <View style={{ height: SPACING.SM }} />
              <TouchableOpacity style={styles.adminAchBtn} onPress={handleUnlockAllAchievements}>
                <Text style={styles.adminAchBtnText}>🏆 Tüm Başarıları Aç</Text>
              </TouchableOpacity>
            </ScrollView>

            <TouchableOpacity style={styles.adminCloseBtn} onPress={() => setShowAdminPanel(false)}>
              <Text style={styles.adminCloseBtnText}>Kapat</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.BG_DARK, padding: SPACING.MD },
  section: {
    backgroundColor: COLORS.BG_CARD,
    borderRadius: RADIUS.LG,
    padding: SPACING.MD,
    marginBottom: SPACING.MD,
    borderWidth: 1,
    borderColor: COLORS.BORDER,
  },
  dangerSection: { borderColor: COLORS.PRIMARY + '44' },
  sectionTitle: { ...FONTS.SUBHEADING, marginBottom: SPACING.MD },
  soundRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.BG_ELEVATED,
    borderRadius: RADIUS.MD,
    paddingHorizontal: SPACING.MD,
    paddingVertical: SPACING.SM,
    borderWidth: 1,
    borderColor: COLORS.BORDER,
  },
  soundLabel: { fontSize: 15, fontWeight: '700', color: COLORS.TEXT },
  langRow: { flexDirection: 'row', gap: SPACING.SM },
  langBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.SM,
    backgroundColor: COLORS.BG_ELEVATED,
    borderRadius: RADIUS.MD,
    padding: SPACING.MD,
    borderWidth: 1.5,
    borderColor: 'transparent',
  },
  langBtnActive: { borderColor: COLORS.PRIMARY, backgroundColor: 'rgba(255,71,87,0.1)' },
  langFlag: { fontSize: 24 },
  langText: { flex: 1, fontSize: 15, fontWeight: '700', color: COLORS.TEXT_SECONDARY },
  langTextActive: { color: COLORS.TEXT },
  checkmark: { color: COLORS.PRIMARY, fontWeight: '900', fontSize: 16 },
  resetCard: { flexDirection: 'row', alignItems: 'center', gap: SPACING.MD },
  resetInfo: { flex: 1 },
  resetTitle: { ...FONTS.SUBHEADING, color: COLORS.PRIMARY },
  resetDesc: { ...FONTS.BODY, marginTop: 2 },
  resetBtn: {
    backgroundColor: COLORS.PRIMARY,
    borderRadius: RADIUS.MD,
    paddingHorizontal: SPACING.MD,
    paddingVertical: SPACING.SM,
  },
  resetBtnText: { color: COLORS.TEXT, fontWeight: '800', fontSize: 13 },
  appInfo: { marginTop: 'auto', alignItems: 'center', paddingBottom: SPACING.XL },
  appName: { fontSize: 28, fontWeight: '900', color: COLORS.TEXT_MUTED },
  appVersion: { fontSize: 13, color: COLORS.TEXT_MUTED, marginTop: 4 },
  appBy: { fontSize: 12, color: COLORS.TEXT_MUTED + '80', marginTop: 2 },
  // ── Genel Modal ──
  modalOverlay: {
    flex: 1,
    backgroundColor: COLORS.OVERLAY,
    alignItems: 'center',
    justifyContent: 'center',
    padding: SPACING.XL,
  },
  modalBox: {
    backgroundColor: COLORS.BG_CARD,
    borderRadius: RADIUS.XL,
    padding: SPACING.XL,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: COLORS.PRIMARY,
    width: '100%',
  },
  modalWarning: { fontSize: 48, marginBottom: SPACING.SM },
  modalTitle: { ...FONTS.HEADING, textAlign: 'center', marginBottom: SPACING.SM },
  modalMsg: { ...FONTS.BODY, textAlign: 'center', marginBottom: SPACING.XL },
  modalButtons: { flexDirection: 'row', gap: SPACING.MD, width: '100%' },
  modalBtn: { flex: 1, borderRadius: RADIUS.MD, paddingVertical: SPACING.MD, alignItems: 'center' },
  modalBtnCancel: { backgroundColor: COLORS.BG_ELEVATED },
  modalBtnReset: { backgroundColor: COLORS.PRIMARY },
  modalBtnCancelText: { color: COLORS.TEXT_SECONDARY, fontWeight: '700', fontSize: 15 },
  modalBtnResetText: { color: COLORS.TEXT, fontWeight: '900', fontSize: 15 },
  // ── Şifre ──
  passwordErrorText: { color: COLORS.PRIMARY, fontWeight: '700', fontSize: 13, marginTop: SPACING.SM },
  // ── Admin Panel ──
  adminPanel: {
    backgroundColor: COLORS.BG_CARD,
    borderRadius: RADIUS.XL,
    padding: SPACING.LG,
    borderWidth: 2,
    borderColor: '#B8E0FF44',
    width: '100%',
    maxHeight: '85%',
    flexShrink: 1,
  },
  adminTitle: {
    fontSize: 20,
    fontWeight: '900',
    color: '#B8E0FF',
    textAlign: 'center',
    marginBottom: SPACING.LG,
  },
  adminLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.TEXT_MUTED,
    textTransform: 'uppercase',
    marginTop: SPACING.MD,
    marginBottom: SPACING.XS,
    letterSpacing: 0.8,
  },
  adminStageBadge: {
    fontSize: 13,
    fontWeight: '800',
    color: '#A29BFE',
    marginBottom: SPACING.XS,
  },
  adminRow: { flexDirection: 'row', alignItems: 'center', gap: SPACING.SM },
  adminInput: {
    flex: 1,
    backgroundColor: COLORS.BG_ELEVATED,
    borderRadius: RADIUS.MD,
    borderWidth: 1,
    borderColor: COLORS.BORDER,
    color: COLORS.TEXT,
    fontSize: 15,
    fontWeight: '700',
    paddingHorizontal: SPACING.MD,
    paddingVertical: SPACING.SM,
  },
  adminInputError: { borderColor: COLORS.PRIMARY },
  adminSetBtn: {
    backgroundColor: COLORS.PRIMARY,
    borderRadius: RADIUS.MD,
    paddingHorizontal: SPACING.MD,
    paddingVertical: SPACING.SM,
  },
  adminSetBtnText: { color: COLORS.TEXT, fontWeight: '800', fontSize: 13 },
  adminDivider: { height: 1, backgroundColor: COLORS.BORDER, marginVertical: SPACING.LG },
  adminAchBtn: {
    backgroundColor: COLORS.GOLD + '22',
    borderRadius: RADIUS.MD,
    borderWidth: 1.5,
    borderColor: COLORS.GOLD,
    padding: SPACING.MD,
    alignItems: 'center',
  },
  adminAchBtnText: { color: COLORS.GOLD, fontWeight: '900', fontSize: 15 },
  adminCloseBtn: {
    backgroundColor: COLORS.BG_ELEVATED,
    borderRadius: RADIUS.MD,
    padding: SPACING.MD,
    alignItems: 'center',
    marginTop: SPACING.MD,
  },
  adminCloseBtnText: { color: COLORS.TEXT_SECONDARY, fontWeight: '700', fontSize: 14 },
});
