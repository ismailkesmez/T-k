import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useGameStore } from '../store/gameStore';
import { getMonsterById, getNextLevelXp, LEVEL_XP_THRESHOLDS } from '../constants/monsters';
import { t } from '../i18n';
import { COLORS, FONTS, RADIUS, SPACING } from '../constants/theme';

export default function ProfileScreen() {
  const lang = useGameStore((s) => s.language);
  const nickname = useGameStore((s) => s.nickname);
  const level = useGameStore((s) => s.level);
  const xp = useGameStore((s) => s.xp);
  const tikTik = useGameStore((s) => s.tikTik);
  const totalClicks = useGameStore((s) => s.totalClicks);
  const totalMonstersDefeated = useGameStore((s) => s.totalMonstersDefeated);
  const totalTikTikEarned = useGameStore((s) => s.totalTikTikEarned);
  const unlockedMonsters = useGameStore((s) => s.unlockedMonsters);
  const clickPower = useGameStore((s) => s.clickPower);
  const maxMultiTouch = useGameStore((s) => s.maxMultiTouch);
  const activeMonsterId = useGameStore((s) => s.activeMonsterId);
  const dailyStreak = useGameStore((s) => s.dailyStreak);
  const activeMonster = getMonsterById(activeMonsterId);

  const currentLevelXp = LEVEL_XP_THRESHOLDS[level - 1] ?? 0;
  const nextLevelXp = getNextLevelXp(level);
  const xpInLevel = xp - currentLevelXp;
  const xpNeeded = nextLevelXp - currentLevelXp;
  const xpProgress = xpNeeded > 0 ? Math.min(1, xpInLevel / xpNeeded) : 1;
  const isMaxLevel = level >= LEVEL_XP_THRESHOLDS.length;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Profile card */}
      <View style={styles.profileCard}>
        <View style={[styles.avatarCircle, { borderColor: activeMonster.color }]}>
          <Text style={styles.avatarEmoji}>{activeMonster.emoji}</Text>
        </View>
        <Text style={styles.nickname}>{nickname}</Text>
        <View style={styles.levelBadge}>
          <Text style={styles.levelBadgeText}>{t(lang, 'profile_level', { level })}</Text>
        </View>
      </View>

      {/* Daily Streak */}
      {(() => {
        const bonusPct = Math.min(dailyStreak - 1, 10) * 10;
        return (
          <View style={styles.streakRow}>
            <Text style={styles.streakEmoji}>🔥</Text>
            <Text style={styles.streakText}>
              {lang === 'tr'
                ? `${dailyStreak}. Gün Serisi`
                : `Day ${dailyStreak} Streak`}
            </Text>
            <Text style={styles.streakBonus}>
              {bonusPct > 0 ? `+${bonusPct}% TT` : lang === 'tr' ? 'Bonus yok' : 'No bonus'}
            </Text>
          </View>
        );
      })()}

      {/* XP progress */}
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Text style={styles.cardTitle}>⭐ XP</Text>
          <Text style={styles.cardValue}>{xp.toLocaleString()}</Text>
        </View>
        <View style={styles.xpTrack}>
          <View style={[styles.xpFill, { width: `${Math.round(xpProgress * 100)}%` }]} />
        </View>
        <Text style={styles.xpLabel}>
          {isMaxLevel
            ? 'MAX LEVEL'
            : t(lang, 'profile_xp_progress', {
                current: xpInLevel.toLocaleString(),
                next: xpNeeded.toLocaleString(),
              })}
        </Text>
      </View>

      {/* TıkTık balance */}
      <View style={[styles.card, styles.tikTikCard]}>
        <Text style={styles.tikTikEmoji}>💰</Text>
        <View>
          <Text style={styles.tikTikLabel}>{t(lang, 'profile_balance')}</Text>
          <Text style={styles.tikTikValue}>{tikTik.toLocaleString()} TıkTık</Text>
        </View>
      </View>

      {/* Stats */}
      <Text style={styles.sectionTitle}>{t(lang, 'profile_stats')}</Text>
      <View style={styles.statsGrid}>
        <StatBox
          emoji="👆"
          label={t(lang, 'profile_total_clicks')}
          value={totalClicks.toLocaleString()}
          color={COLORS.PRIMARY}
        />
        <StatBox
          emoji="💀"
          label={t(lang, 'profile_monsters_defeated')}
          value={totalMonstersDefeated.toLocaleString()}
          color={COLORS.PURPLE}
        />
        <StatBox
          emoji="💰"
          label={t(lang, 'profile_total_tiktik')}
          value={totalTikTikEarned.toLocaleString()}
          color={COLORS.GOLD}
        />
        <StatBox
          emoji="🔓"
          label={lang === 'tr' ? 'Açık Canavar' : 'Unlocked Monsters'}
          value={`${unlockedMonsters.length} / 10`}
          color={COLORS.SECONDARY}
        />
        <StatBox
          emoji="⚡"
          label={t(lang, 'shop_click_power')}
          value={`${clickPower} / 10`}
          color={COLORS.CYAN}
        />
        <StatBox
          emoji="✋"
          label={t(lang, 'shop_multi_touch')}
          value={`${maxMultiTouch}x`}
          color={COLORS.PURPLE}
        />
      </View>
    </ScrollView>
  );
}

function StatBox({ emoji, label, value, color }: { emoji: string; label: string; value: string; color: string }) {
  return (
    <View style={[statStyles.box, { borderColor: color + '44' }]}>
      <Text style={statStyles.emoji}>{emoji}</Text>
      <Text style={[statStyles.value, { color }]}>{value}</Text>
      <Text style={statStyles.label}>{label}</Text>
    </View>
  );
}

const statStyles = StyleSheet.create({
  box: {
    width: '47%',
    backgroundColor: COLORS.BG_CARD,
    borderRadius: RADIUS.MD,
    padding: SPACING.MD,
    alignItems: 'center',
    borderWidth: 1,
    marginBottom: SPACING.SM,
  },
  emoji: { fontSize: 28, marginBottom: SPACING.XS },
  value: { fontSize: 22, fontWeight: '900' },
  label: { fontSize: 11, color: COLORS.TEXT_MUTED, textAlign: 'center', marginTop: 2 },
});

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.BG_DARK },
  content: { padding: SPACING.MD, paddingBottom: SPACING.XL },
  profileCard: {
    backgroundColor: COLORS.BG_CARD,
    borderRadius: RADIUS.XL,
    padding: SPACING.XL,
    alignItems: 'center',
    marginBottom: SPACING.MD,
    borderWidth: 1,
    borderColor: COLORS.BORDER,
  },
  avatarCircle: {
    width: 96,
    height: 96,
    borderRadius: 48,
    borderWidth: 3,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.BG_ELEVATED,
    marginBottom: SPACING.MD,
  },
  avatarEmoji: { fontSize: 52 },
  nickname: { ...FONTS.HEADING, fontSize: 28 },
  levelBadge: {
    backgroundColor: COLORS.PRIMARY,
    borderRadius: RADIUS.FULL,
    paddingHorizontal: SPACING.MD,
    paddingVertical: 4,
    marginTop: SPACING.SM,
  },
  levelBadgeText: { color: COLORS.TEXT, fontWeight: '800', fontSize: 14 },
  card: {
    backgroundColor: COLORS.BG_CARD,
    borderRadius: RADIUS.LG,
    padding: SPACING.MD,
    marginBottom: SPACING.MD,
    borderWidth: 1,
    borderColor: COLORS.BORDER,
  },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: SPACING.SM },
  cardTitle: { ...FONTS.SUBHEADING },
  cardValue: { fontSize: 22, fontWeight: '900', color: COLORS.PURPLE },
  xpTrack: {
    height: 14,
    backgroundColor: COLORS.BG_ELEVATED,
    borderRadius: RADIUS.FULL,
    overflow: 'hidden',
    marginBottom: SPACING.XS,
  },
  xpFill: {
    height: '100%',
    backgroundColor: COLORS.PURPLE,
    borderRadius: RADIUS.FULL,
  },
  xpLabel: { fontSize: 12, color: COLORS.TEXT_MUTED, textAlign: 'center' },
  streakRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.BG_CARD,
    borderRadius: RADIUS.LG,
    padding: SPACING.MD,
    marginBottom: SPACING.MD,
    borderWidth: 1,
    borderColor: '#FF6B3555',
    gap: SPACING.SM,
  },
  streakEmoji: { fontSize: 24 },
  streakText: { flex: 1, fontSize: 15, fontWeight: '800', color: COLORS.TEXT },
  streakBonus: { fontSize: 15, fontWeight: '900', color: '#FF6B35' },
  tikTikCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.MD,
    backgroundColor: 'rgba(255,215,0,0.08)',
    borderColor: COLORS.GOLD + '55',
  },
  tikTikEmoji: { fontSize: 40 },
  tikTikLabel: { fontSize: 12, color: COLORS.TEXT_MUTED, textTransform: 'uppercase', fontWeight: '700' },
  tikTikValue: { fontSize: 24, fontWeight: '900', color: COLORS.GOLD },
  sectionTitle: { ...FONTS.SUBHEADING, marginBottom: SPACING.SM },
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
});
