import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useGameStore } from '../store/gameStore';
import { ACHIEVEMENTS } from '../constants/achievements';
import { t } from '../i18n';
import { COLORS, FONTS, RADIUS, SPACING } from '../constants/theme';

export default function AchievementsScreen() {
  const lang = useGameStore((s) => s.language);
  const unlockedAchievements = useGameStore((s) => s.unlockedAchievements);
  const claimAchievement = useGameStore((s) => s.claimAchievement);

  const claimed = unlockedAchievements.filter((a) => a.claimed).length;
  const claimable = unlockedAchievements.filter((a) => !a.claimed).length;

  return (
    <View style={styles.container}>
      {/* Summary */}
      <View style={styles.summaryRow}>
        <View style={styles.summaryPill}>
          <Text style={styles.summaryValue}>{claimed}</Text>
          <Text style={styles.summaryLabel}>{lang === 'tr' ? 'Tamamlanan' : 'Completed'}</Text>
        </View>
        <View style={[styles.summaryPill, claimable > 0 && styles.summaryPillAlert]}>
          <Text style={[styles.summaryValue, claimable > 0 && { color: COLORS.GOLD }]}>{claimable}</Text>
          <Text style={styles.summaryLabel}>{lang === 'tr' ? 'Alınmayı Bekliyor' : 'Ready to Claim'}</Text>
        </View>
        <View style={styles.summaryPill}>
          <Text style={styles.summaryValue}>{ACHIEVEMENTS.length}</Text>
          <Text style={styles.summaryLabel}>{lang === 'tr' ? 'Toplam' : 'Total'}</Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.list}>
        {ACHIEVEMENTS.map((ach) => {
          const state = unlockedAchievements.find((u) => u.id === ach.id);
          const isUnlocked = !!state;
          const isClaimed = state?.claimed ?? false;

          return (
            <View
              key={ach.id}
              style={[
                styles.card,
                isClaimed && styles.cardClaimed,
                isUnlocked && !isClaimed && styles.cardUnlocked,
              ]}
            >
              {/* Status icon */}
              <View
                style={[
                  styles.statusBadge,
                  isClaimed
                    ? styles.statusClaimed
                    : isUnlocked
                    ? styles.statusUnlocked
                    : styles.statusLocked,
                ]}
              >
                <Text style={styles.statusIcon}>
                  {isClaimed ? '✓' : isUnlocked ? '!' : '🔒'}
                </Text>
              </View>

              {/* Info */}
              <View style={styles.cardInfo}>
                <Text
                  style={[
                    styles.achName,
                    !isUnlocked && styles.achNameLocked,
                    isClaimed && styles.achNameClaimed,
                  ]}
                >
                  {isUnlocked ? t(lang, ach.nameKey as any) : t(lang, 'ach_locked')}
                </Text>
                <Text style={styles.achDesc}>
                  {isUnlocked
                    ? t(lang, ach.descKey as any)
                    : '???'}
                </Text>
                {isUnlocked && (
                  <Text style={styles.achReward}>
                    {t(lang, 'ach_reward', {
                      tikTik: ach.rewardTikTik.toLocaleString(),
                      xp: ach.rewardXp,
                    })}
                  </Text>
                )}
              </View>

              {/* Claim button */}
              {isUnlocked && !isClaimed && (
                <TouchableOpacity
                  style={styles.claimBtn}
                  onPress={() => claimAchievement(ach.id)}
                >
                  <Text style={styles.claimBtnText}>{t(lang, 'ach_claim')}</Text>
                </TouchableOpacity>
              )}
              {isClaimed && (
                <Text style={styles.claimedLabel}>{t(lang, 'ach_claimed')}</Text>
              )}
            </View>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.BG_DARK },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: SPACING.SM,
    padding: SPACING.MD,
  },
  summaryPill: {
    flex: 1,
    backgroundColor: COLORS.BG_CARD,
    borderRadius: RADIUS.MD,
    padding: SPACING.SM,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.BORDER,
  },
  summaryPillAlert: { borderColor: COLORS.GOLD },
  summaryValue: { fontSize: 22, fontWeight: '900', color: COLORS.TEXT },
  summaryLabel: { fontSize: 10, color: COLORS.TEXT_MUTED, textAlign: 'center', marginTop: 2 },
  list: { paddingHorizontal: SPACING.MD, paddingBottom: SPACING.XL },
  card: {
    backgroundColor: COLORS.BG_CARD,
    borderRadius: RADIUS.LG,
    padding: SPACING.MD,
    marginBottom: SPACING.SM,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.BORDER,
    opacity: 0.6,
  },
  cardUnlocked: {
    opacity: 1,
    borderColor: COLORS.GOLD,
    borderWidth: 1.5,
  },
  cardClaimed: {
    opacity: 1,
    borderColor: COLORS.SECONDARY + '55',
  },
  statusBadge: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.SM,
  },
  statusLocked: { backgroundColor: COLORS.BG_ELEVATED },
  statusUnlocked: { backgroundColor: COLORS.GOLD },
  statusClaimed: { backgroundColor: COLORS.SECONDARY },
  statusIcon: { fontSize: 18, fontWeight: '900', color: COLORS.TEXT },
  cardInfo: { flex: 1 },
  achName: { fontSize: 15, fontWeight: '800', color: COLORS.TEXT },
  achNameLocked: { color: COLORS.TEXT_MUTED },
  achNameClaimed: { color: COLORS.SECONDARY },
  achDesc: { fontSize: 12, color: COLORS.TEXT_SECONDARY, marginTop: 2 },
  achReward: { fontSize: 11, color: COLORS.GOLD, marginTop: 4, fontWeight: '700' },
  claimBtn: {
    backgroundColor: COLORS.GOLD,
    borderRadius: RADIUS.MD,
    paddingHorizontal: SPACING.SM,
    paddingVertical: SPACING.SM,
    minWidth: 60,
    alignItems: 'center',
  },
  claimBtnText: { color: COLORS.BG_DARK, fontWeight: '900', fontSize: 12 },
  claimedLabel: { fontSize: 11, color: COLORS.SECONDARY, fontWeight: '700' },
});
