import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Modal, Image } from 'react-native';
import { useGameStore } from '../store/gameStore';
import { getMonsterById, getNextLevelXp, LEVEL_XP_THRESHOLDS } from '../constants/monsters';
import { WEAPONS, getEquipmentSlots, EQUIPMENT_SLOT_UNLOCK_LEVELS, EnhancedWeapon, SLIME_SWORD_EVOLUTION_COUNT, SLIME_SWORD_FINAL_COUNT, SLIME_SWORD_FUSION_COUNT } from '../constants/shop';

const CHARACTER_IMAGES = {
  male: require('../../assets/characters/character_male.png'),
  female: require('../../assets/characters/character_female.png'),
};
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
  const purchasedWeapons = useGameStore((s) => s.purchasedWeapons);
  const equippedWeapons = useGameStore((s) => s.equippedWeapons);
  const enhancedWeapons = useGameStore((s) => s.enhancedWeapons);
  const equipWeapon = useGameStore((s) => s.equipWeapon);
  const unequipWeapon = useGameStore((s) => s.unequipWeapon);
  const slimeSwordUseCount = useGameStore((s) => s.slimeSwordUseCount);
  const slimeKralDefeated = useGameStore((s) => s.slimeKralDefeated);
  const slimeKilledWithMutlakCount = useGameStore((s) => s.slimeKilledWithMutlakCount);
  const gender = useGameStore((s) => s.gender);

  const [showEquipModal, setShowEquipModal] = useState(false);

  const activeMonster = getMonsterById(activeMonsterId);
  const slots = getEquipmentSlots(level);

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
        {gender ? (
          <View style={[styles.avatarPortrait, { borderColor: gender === 'male' ? '#6C5CE7' : '#FD79A8' }]}>
            <Image source={CHARACTER_IMAGES[gender]} style={styles.avatarPortraitImage} resizeMode="cover" />
          </View>
        ) : (
          <View style={[styles.avatarCircle, { borderColor: activeMonster.color }]}>
            <Text style={styles.avatarEmoji}>{activeMonster.emoji}</Text>
          </View>
        )}
        <Text style={styles.nickname}>{nickname}</Text>

        {/* Level + Equipment row */}
        <View style={styles.levelEquipRow}>
          <View style={styles.levelBadge}>
            <Text style={styles.levelBadgeText}>{t(lang, 'profile_level', { level })}</Text>
          </View>
          <TouchableOpacity style={styles.equipCard} onPress={() => setShowEquipModal(true)} activeOpacity={0.8}>
            <Text style={styles.equipCardEmoji}>⚔️</Text>
            <View>
              <Text style={styles.equipCardTitle}>{lang === 'tr' ? 'Ekipmanlar' : 'Equipment'}</Text>
              <Text style={styles.equipCardSub}>
                {equippedWeapons.length}/{slots} {lang === 'tr' ? 'aktif' : 'active'}
              </Text>
            </View>
          </TouchableOpacity>
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
          value={`${unlockedMonsters.length} / 20`}
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

      {/* Equipment Modal */}
      <Modal
        visible={showEquipModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowEquipModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalSheet}>
            {/* Header */}
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>⚔️ {lang === 'tr' ? 'Ekipmanlar' : 'Equipment'}</Text>
              <TouchableOpacity onPress={() => setShowEquipModal(false)} style={styles.modalCloseBtn}>
                <Text style={styles.modalCloseText}>✕</Text>
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: SPACING.LG }}>
            {/* Slot overview */}
            <Text style={styles.modalSectionLabel}>
              {lang === 'tr' ? `Aktif Slotlar  ${equippedWeapons.length}/${slots}` : `Active Slots  ${equippedWeapons.length}/${slots}`}
            </Text>
            <View style={styles.slotsRow}>
              {EQUIPMENT_SLOT_UNLOCK_LEVELS.map((reqLevel, i) => {
                const unlocked = level >= reqLevel;
                const equippedId = equippedWeapons[i];
                const baseWeapon = equippedId ? WEAPONS.find((w) => w.id === equippedId) : null;
                const enh = equippedId ? enhancedWeapons.find((e) => e.instanceId === equippedId) : null;
                const weapon = baseWeapon ?? (enh ? WEAPONS.find((w) => w.id === enh.baseWeaponId) : null);
                const displayName = weapon
                  ? t(lang, weapon.nameKey as any) + (enh ? ` +${enh.enhancement}` : '')
                  : null;
                return (
                  <View
                    key={i}
                    style={[
                      styles.slot,
                      !unlocked ? styles.slotLocked : weapon ? styles.slotFilled : styles.slotEmpty,
                    ]}
                  >
                    {!unlocked ? (
                      <>
                        <Text style={styles.slotLockEmoji}>🔒</Text>
                        <Text style={styles.slotLockLevel}>Lv.{reqLevel}</Text>
                      </>
                    ) : weapon ? (
                      <>
                        <Text style={styles.slotWeaponEmoji}>{weapon.emoji}</Text>
                        <Text style={styles.slotWeaponName} numberOfLines={2}>{displayName}</Text>
                        <TouchableOpacity
                          style={styles.slotRemoveBtn}
                          onPress={() => unequipWeapon(equippedId!)}
                        >
                          <Text style={styles.slotRemoveBtnText}>
                            {lang === 'tr' ? 'Çıkar' : 'Remove'}
                          </Text>
                        </TouchableOpacity>
                      </>
                    ) : (
                      <Text style={styles.slotPlus}>+</Text>
                    )}
                  </View>
                );
              })}
            </View>

            {/* Inventory */}
            <Text style={styles.modalSectionLabel}>
              {lang === 'tr' ? 'Envanter' : 'Inventory'}
            </Text>
            {purchasedWeapons.length === 0 && enhancedWeapons.length === 0 ? (
              <View style={styles.emptyInventory}>
                <Text style={styles.emptyInventoryText}>
                  {lang === 'tr'
                    ? 'Henüz silah yok.\nMağaza → Seçilmişler → Silah Tüccarı'
                    : 'No weapons yet.\nShop → Chosen → Weapon Merchant'}
                </Text>
              </View>
            ) : (
              <>
                {purchasedWeapons.map((wId) => {
                  const weapon = WEAPONS.find((w) => w.id === wId);
                  if (!weapon) return null;
                  const isEquipped = equippedWeapons.includes(wId);
                  const canEquip = !isEquipped && equippedWeapons.length < slots;
                  const noSlots = !isEquipped && slots === 0;
                  return (
                    <View key={wId} style={[styles.inventoryRow, isEquipped && styles.inventoryRowEquipped]}>
                      <Text style={styles.inventoryEmoji}>{weapon.emoji}</Text>
                      <View style={{ flex: 1 }}>
                        <Text style={styles.inventoryName}>
                          {wId === 'slime_sword'
                            ? t(lang, ((slimeKralDefeated && slimeKilledWithMutlakCount >= SLIME_SWORD_FUSION_COUNT) ? 'weapon_slime_sword_fusion' : slimeSwordUseCount >= SLIME_SWORD_FINAL_COUNT ? 'weapon_slime_sword_final' : slimeSwordUseCount >= SLIME_SWORD_EVOLUTION_COUNT ? 'weapon_slime_sword_evolved' : 'weapon_slime_sword') as any)
                            : t(lang, weapon.nameKey as any)}
                        </Text>
                        <Text style={styles.inventoryBonus}>
                          {wId === 'slime_sword'
                            ? t(lang, ((slimeKralDefeated && slimeKilledWithMutlakCount >= SLIME_SWORD_FUSION_COUNT) ? 'weapon_slime_sword_fusion_desc' : slimeSwordUseCount >= SLIME_SWORD_FINAL_COUNT ? 'weapon_slime_sword_final_desc' : slimeSwordUseCount >= SLIME_SWORD_EVOLUTION_COUNT ? 'weapon_slime_sword_evolved_desc' : 'weapon_slime_sword_desc') as any)
                            : t(lang, weapon.descKey as any)}
                        </Text>
                        {wId === 'slime_sword' && slimeSwordUseCount < SLIME_SWORD_FINAL_COUNT && (
                          <Text style={styles.inventoryBonus}>
                            {lang === 'tr'
                              ? `${slimeSwordUseCount}/${slimeSwordUseCount >= SLIME_SWORD_EVOLUTION_COUNT ? SLIME_SWORD_FINAL_COUNT : SLIME_SWORD_EVOLUTION_COUNT} kullanım`
                              : `${slimeSwordUseCount}/${slimeSwordUseCount >= SLIME_SWORD_EVOLUTION_COUNT ? SLIME_SWORD_FINAL_COUNT : SLIME_SWORD_EVOLUTION_COUNT} uses`}
                          </Text>
                        )}
                        {wId === 'slime_sword' && slimeSwordUseCount >= SLIME_SWORD_FINAL_COUNT && !(slimeKralDefeated && slimeKilledWithMutlakCount >= SLIME_SWORD_FUSION_COUNT) && (
                          <Text style={styles.inventoryBonus}>
                            {slimeKralDefeated
                              ? (lang === 'tr' ? `${slimeKilledWithMutlakCount}/${SLIME_SWORD_FUSION_COUNT} Slime öldürme` : `${slimeKilledWithMutlakCount}/${SLIME_SWORD_FUSION_COUNT} Slime kills`)
                              : (lang === 'tr' ? '✨ Slime Kral\'ı yen — füzyon kilidi açılır' : '✨ Defeat Slime King — fusion unlock')}
                          </Text>
                        )}
                        {isEquipped && <Text style={styles.equippedTag}>{lang === 'tr' ? '✓ Kuşanıldı' : '✓ Equipped'}</Text>}
                        {noSlots && <Text style={styles.noSlotTag}>{lang === 'tr' ? '⚠ Lv.5 gerekir' : '⚠ Requires Lv.5'}</Text>}
                      </View>
                      <TouchableOpacity
                        style={[styles.equipToggleBtn, isEquipped ? styles.unequipBtnStyle : canEquip ? styles.equipBtnActive : styles.equipBtnLocked]}
                        onPress={() => (isEquipped ? unequipWeapon(wId) : equipWeapon(wId))}
                        disabled={!isEquipped && !canEquip}
                      >
                        <Text style={styles.equipToggleBtnText}>
                          {isEquipped ? (lang === 'tr' ? 'Çıkar' : 'Remove') : canEquip ? (lang === 'tr' ? 'Kuşan' : 'Equip') : (lang === 'tr' ? 'Dolu' : 'Full')}
                        </Text>
                      </TouchableOpacity>
                    </View>
                  );
                })}
                {enhancedWeapons.map((enh) => {
                  const weapon = WEAPONS.find((w) => w.id === enh.baseWeaponId);
                  if (!weapon) return null;
                  const isEquipped = equippedWeapons.includes(enh.instanceId);
                  const canEquip = !isEquipped && equippedWeapons.length < slots;
                  const noSlots = !isEquipped && slots === 0;
                  const isSlimeSword = weapon.id === 'slime_sword';
                  const slimeStage = isSlimeSword
                    ? ((slimeKralDefeated && slimeKilledWithMutlakCount >= SLIME_SWORD_FUSION_COUNT) ? 3
                      : slimeSwordUseCount >= SLIME_SWORD_FINAL_COUNT ? 2
                      : slimeSwordUseCount >= SLIME_SWORD_EVOLUTION_COUNT ? 1 : 0)
                    : 0;
                  const slimeNameKey = slimeStage === 3 ? 'weapon_slime_sword_fusion' : slimeStage === 2 ? 'weapon_slime_sword_final' : slimeStage === 1 ? 'weapon_slime_sword_evolved' : 'weapon_slime_sword';
                  const slimeDescKey = slimeStage === 3 ? 'weapon_slime_sword_fusion_desc' : slimeStage === 2 ? 'weapon_slime_sword_final_desc' : slimeStage === 1 ? 'weapon_slime_sword_evolved_desc' : 'weapon_slime_sword_desc';
                  const baseName = isSlimeSword ? t(lang, slimeNameKey as any) : t(lang, weapon.nameKey as any);
                  const displayName = `${baseName} +${enh.enhancement}`;
                  return (
                    <View key={enh.instanceId} style={[styles.inventoryRow, isEquipped && styles.inventoryRowEquipped]}>
                      <Text style={styles.inventoryEmoji}>{weapon.emoji}</Text>
                      <View style={{ flex: 1 }}>
                        <Text style={styles.inventoryName}>{displayName}</Text>
                        <Text style={styles.inventoryBonus}>
                          {isSlimeSword
                            ? t(lang, slimeDescKey as any)
                            : t(lang, weapon.descKey as any)}
                        </Text>
                        {isSlimeSword && slimeSwordUseCount < SLIME_SWORD_FINAL_COUNT && (
                          <Text style={styles.inventoryBonus}>
                            {lang === 'tr'
                              ? `${slimeSwordUseCount}/${slimeSwordUseCount >= SLIME_SWORD_EVOLUTION_COUNT ? SLIME_SWORD_FINAL_COUNT : SLIME_SWORD_EVOLUTION_COUNT} kullanım`
                              : `${slimeSwordUseCount}/${slimeSwordUseCount >= SLIME_SWORD_EVOLUTION_COUNT ? SLIME_SWORD_FINAL_COUNT : SLIME_SWORD_EVOLUTION_COUNT} uses`}
                          </Text>
                        )}
                        {isSlimeSword && slimeSwordUseCount >= SLIME_SWORD_FINAL_COUNT && slimeStage < 3 && (
                          <Text style={styles.inventoryBonus}>
                            {slimeKralDefeated
                              ? (lang === 'tr' ? `${slimeKilledWithMutlakCount}/${SLIME_SWORD_FUSION_COUNT} Slime öldürme` : `${slimeKilledWithMutlakCount}/${SLIME_SWORD_FUSION_COUNT} Slime kills`)
                              : (lang === 'tr' ? '✨ Slime Kral\'ı yen — füzyon kilidi açılır' : '✨ Defeat Slime King — fusion unlock')}
                          </Text>
                        )}
                        {isEquipped && <Text style={styles.equippedTag}>{lang === 'tr' ? '✓ Kuşanıldı' : '✓ Equipped'}</Text>}
                        {noSlots && <Text style={styles.noSlotTag}>{lang === 'tr' ? '⚠ Lv.5 gerekir' : '⚠ Requires Lv.5'}</Text>}
                      </View>
                      <TouchableOpacity
                        style={[styles.equipToggleBtn, isEquipped ? styles.unequipBtnStyle : canEquip ? styles.equipBtnActive : styles.equipBtnLocked]}
                        onPress={() => (isEquipped ? unequipWeapon(enh.instanceId) : equipWeapon(enh.instanceId))}
                        disabled={!isEquipped && !canEquip}
                      >
                        <Text style={styles.equipToggleBtnText}>
                          {isEquipped ? (lang === 'tr' ? 'Çıkar' : 'Remove') : canEquip ? (lang === 'tr' ? 'Kuşan' : 'Equip') : (lang === 'tr' ? 'Dolu' : 'Full')}
                        </Text>
                      </TouchableOpacity>
                    </View>
                  );
                })}
              </>
            )}
            </ScrollView>
          </View>
        </View>
      </Modal>
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
  avatarPortrait: {
    width: 100,
    height: 130,
    borderRadius: RADIUS.LG,
    borderWidth: 3,
    overflow: 'hidden',
    marginBottom: SPACING.MD,
  },
  avatarPortraitImage: {
    width: '100%',
    height: '100%',
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

  levelEquipRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.SM,
    marginTop: SPACING.SM,
  },
  levelBadge: {
    backgroundColor: COLORS.PRIMARY,
    borderRadius: RADIUS.FULL,
    paddingHorizontal: SPACING.MD,
    paddingVertical: 4,
  },
  levelBadgeText: { color: COLORS.TEXT, fontWeight: '800', fontSize: 14 },

  equipCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: COLORS.BG_ELEVATED,
    borderRadius: RADIUS.FULL,
    paddingHorizontal: SPACING.MD,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: '#E1705566',
  },
  equipCardEmoji: { fontSize: 16 },
  equipCardTitle: { fontSize: 13, fontWeight: '800', color: '#E17055' },
  equipCardSub: { fontSize: 10, color: COLORS.TEXT_MUTED, fontWeight: '600' },

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

  // ── Equipment Modal ──
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'flex-end',
  },
  modalSheet: {
    backgroundColor: COLORS.BG_CARD,
    borderTopLeftRadius: RADIUS.XL,
    borderTopRightRadius: RADIUS.XL,
    padding: SPACING.LG,
    borderTopWidth: 2,
    borderColor: '#E1705544',
    maxHeight: '85%',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: SPACING.MD,
  },
  modalTitle: { fontSize: 20, fontWeight: '900', color: '#E17055' },
  modalCloseBtn: { padding: SPACING.SM },
  modalCloseText: { color: COLORS.TEXT_SECONDARY, fontSize: 18, fontWeight: '700' },
  modalSectionLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.TEXT_MUTED,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: SPACING.SM,
    marginTop: SPACING.XS,
  },

  // Slots
  slotsRow: {
    flexDirection: 'row',
    gap: SPACING.SM,
    marginBottom: SPACING.LG,
  },
  slot: {
    flex: 1,
    minHeight: 100,
    borderRadius: RADIUS.MD,
    alignItems: 'center',
    justifyContent: 'center',
    padding: SPACING.SM,
    borderWidth: 1.5,
    gap: 4,
  },
  slotEmpty: {
    borderColor: COLORS.BORDER,
    borderStyle: 'dashed',
    backgroundColor: COLORS.BG_ELEVATED,
  },
  slotFilled: {
    borderColor: '#E17055',
    backgroundColor: 'rgba(225,112,85,0.08)',
  },
  slotLocked: {
    borderColor: COLORS.BORDER,
    backgroundColor: COLORS.BG_ELEVATED,
    opacity: 0.45,
  },
  slotPlus: { fontSize: 28, color: COLORS.TEXT_MUTED, fontWeight: '300' },
  slotLockEmoji: { fontSize: 22 },
  slotLockLevel: { fontSize: 11, color: COLORS.TEXT_MUTED, fontWeight: '700' },
  slotWeaponEmoji: { fontSize: 28 },
  slotWeaponName: { fontSize: 10, color: COLORS.TEXT, fontWeight: '700', textAlign: 'center' },
  slotRemoveBtn: {
    backgroundColor: 'rgba(225,112,85,0.3)',
    borderRadius: RADIUS.SM,
    paddingHorizontal: 8,
    paddingVertical: 3,
    marginTop: 2,
  },
  slotRemoveBtnText: { fontSize: 10, color: '#E17055', fontWeight: '800' },

  // Inventory
  inventoryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.BG_ELEVATED,
    borderRadius: RADIUS.MD,
    padding: SPACING.MD,
    marginBottom: SPACING.SM,
    borderWidth: 1,
    borderColor: COLORS.BORDER,
    gap: SPACING.MD,
  },
  inventoryRowEquipped: {
    borderColor: '#E17055',
    backgroundColor: 'rgba(225,112,85,0.06)',
  },
  inventoryEmoji: { fontSize: 34 },
  inventoryName: { fontSize: 14, fontWeight: '800', color: COLORS.TEXT },
  inventoryBonus: { fontSize: 12, color: '#E17055', fontWeight: '700', marginTop: 2 },
  equippedTag: { fontSize: 11, color: COLORS.SECONDARY, fontWeight: '700', marginTop: 2 },
  noSlotTag: { fontSize: 11, color: COLORS.GOLD, fontWeight: '700', marginTop: 2 },
  equipToggleBtn: {
    borderRadius: RADIUS.MD,
    paddingHorizontal: SPACING.MD,
    paddingVertical: SPACING.SM,
    minWidth: 68,
    alignItems: 'center',
  },
  equipBtnActive: { backgroundColor: '#E17055' },
  unequipBtnStyle: { backgroundColor: COLORS.BG_CARD, borderWidth: 1, borderColor: '#E17055' },
  equipBtnLocked: { backgroundColor: COLORS.BG_CARD, borderWidth: 1, borderColor: COLORS.BORDER },
  equipToggleBtnText: { color: COLORS.TEXT, fontWeight: '800', fontSize: 12 },
  emptyInventory: {
    padding: SPACING.LG,
    alignItems: 'center',
    backgroundColor: COLORS.BG_ELEVATED,
    borderRadius: RADIUS.MD,
    borderWidth: 1,
    borderColor: COLORS.BORDER,
  },
  emptyInventoryText: {
    fontSize: 13,
    color: COLORS.TEXT_MUTED,
    textAlign: 'center',
    lineHeight: 20,
  },
});
