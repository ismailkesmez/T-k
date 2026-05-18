import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useGameStore } from '../store/gameStore';
import {
  IDLE_SYSTEMS,
  getClickPowerCost,
  getMultiTouchCost,
  MAX_CLICK_POWER,
  MAX_MULTI_TOUCH,
  MULTI_TOUCH_MULTIPLIERS,
  XP_STORAGE_UPGRADES,
  getXpStorageCapacity,
  CLICK_POWER_DAMAGE,
} from '../constants/shop';
import { t } from '../i18n';
import { COLORS, FONTS, RADIUS, SPACING } from '../constants/theme';

type Tab = 'tiktik' | 'xp';

export default function ShopScreen() {
  const [activeTab, setActiveTab] = useState<Tab>('tiktik');

  const lang = useGameStore((s) => s.language);
  const tikTik = useGameStore((s) => s.tikTik);
  const xp = useGameStore((s) => s.xp);
  const level = useGameStore((s) => s.level);
  const clickPower = useGameStore((s) => s.clickPower);
  const maxMultiTouch = useGameStore((s) => s.maxMultiTouch);
  const purchasedIdleSystems = useGameStore((s) => s.purchasedIdleSystems);
  const kutsalKilicUnlocked = useGameStore((s) => s.kutsalKilicUnlocked);
  const kutsalKilicPurchased = useGameStore((s) => s.kutsalKilicPurchased);
  const xpStorageLevel = useGameStore((s) => s.xpStorageLevel);

  const upgradeClickPower = useGameStore((s) => s.upgradeClickPower);
  const upgradeMultiTouch = useGameStore((s) => s.upgradeMultiTouch);
  const purchaseIdleSystem = useGameStore((s) => s.purchaseIdleSystem);
  const purchaseKutsalKilic = useGameStore((s) => s.purchaseKutsalKilic);
  const purchaseXpStorage = useGameStore((s) => s.purchaseXpStorage);

  const clickPowerCost = getClickPowerCost(clickPower);
  const multiTouchCost = getMultiTouchCost(maxMultiTouch);

  const handleBuyClickPower = () => {
    const success = upgradeClickPower();
    if (!success) {
      Alert.alert('', t(lang, 'shop_not_enough_tiktik'));
    }
  };

  const handleBuyMultiTouch = () => {
    const success = upgradeMultiTouch();
    if (!success) {
      Alert.alert('', t(lang, 'shop_not_enough_tiktik'));
    }
  };

  const handleBuyIdleSystem = (id: string) => {
    const success = purchaseIdleSystem(id);
    if (!success) {
      Alert.alert('', t(lang, 'shop_not_enough_xp'));
    }
  };

  const handleBuyKutsalKilic = () => {
    const success = purchaseKutsalKilic();
    if (!success) {
      Alert.alert('', lang === 'tr'
        ? 'Gereksinimler: Seviye 100 + 1.000.000 TT + 100.000 XP'
        : 'Requirements: Level 100 + 1,000,000 TT + 100,000 XP');
    }
  };

  return (
    <View style={styles.container}>
      {/* Balance bar */}
      <View style={styles.balanceRow}>
        <View style={styles.balancePill}>
          <Text style={styles.balanceEmoji}>💰</Text>
          <Text style={styles.balanceValue}>{tikTik.toLocaleString()}</Text>
          <Text style={styles.balanceLabel}> TıkTık</Text>
        </View>
        <View style={styles.balancePill}>
          <Text style={styles.balanceEmoji}>⭐</Text>
          <Text style={styles.balanceValue}>{xp.toLocaleString()}</Text>
          <Text style={styles.balanceLabel}> XP</Text>
        </View>
      </View>

      {/* Tab switcher */}
      <View style={styles.tabRow}>
        {(['tiktik', 'xp'] as Tab[]).map((tab) => (
          <TouchableOpacity
            key={tab}
            style={[styles.tab, activeTab === tab && styles.tabActive]}
            onPress={() => setActiveTab(tab)}
          >
            <Text style={[styles.tabText, activeTab === tab && styles.tabTextActive]}>
              {tab === 'tiktik' ? t(lang, 'shop_tab_tiktik') : t(lang, 'shop_tab_xp')}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent}>
        {activeTab === 'tiktik' && (
          <>
            {/* Click Power */}
            <UpgradeCard
              emoji="⚡"
              title={t(lang, 'shop_click_power')}
              desc={(() => {
                const dmg = CLICK_POWER_DAMAGE[clickPower - 1] ?? clickPower;
                const nextDmg = clickPower < MAX_CLICK_POWER ? CLICK_POWER_DAMAGE[clickPower] ?? clickPower + 1 : null;
                return clickPower >= MAX_CLICK_POWER
                  ? (lang === 'tr' ? `Hasar: ${dmg} — Maksimum!` : `Damage: ${dmg} — Maxed!`)
                  : (lang === 'tr' ? `Hasar: ${dmg} → Sonraki: ${nextDmg}` : `Damage: ${dmg} → Next: ${nextDmg}`);
              })()}
              currentLevel={clickPower}
              maxLevel={MAX_CLICK_POWER}
              cost={clickPowerCost}
              costLabel={t(lang, 'shop_cost', { amount: clickPowerCost.toLocaleString() })}
              canAfford={tikTik >= clickPowerCost}
              isMaxed={clickPower >= MAX_CLICK_POWER}
              onBuy={handleBuyClickPower}
              lang={lang}
            />

            {/* Multi Touch (damage multiplier) */}
            {(() => {
              const currentMultiplier = MULTI_TOUCH_MULTIPLIERS[maxMultiTouch - 1] ?? 1;
              const nextMultiplier = MULTI_TOUCH_MULTIPLIERS[maxMultiTouch] ?? null;
              const isMaxed = maxMultiTouch >= MAX_MULTI_TOUCH;
              const desc = isMaxed
                ? (lang === 'tr' ? `Tıklama gücü ${currentMultiplier}x — Maksimum!` : `Click power ${currentMultiplier}x — Maxed!`)
                : (lang === 'tr'
                    ? `Şu an ${currentMultiplier}x → Sonraki: ${nextMultiplier}x`
                    : `Current ${currentMultiplier}x → Next: ${nextMultiplier}x`);
              return (
                <UpgradeCard
                  emoji="✋"
                  title={t(lang, 'shop_multi_touch')}
                  desc={desc}
                  currentLevel={maxMultiTouch}
                  maxLevel={MAX_MULTI_TOUCH}
                  cost={multiTouchCost}
                  costLabel={t(lang, 'shop_cost', { amount: multiTouchCost === Infinity ? '∞' : multiTouchCost.toLocaleString() })}
                  canAfford={tikTik >= multiTouchCost}
                  isMaxed={isMaxed}
                  onBuy={handleBuyMultiTouch}
                  lang={lang}
                />
              );
            })()}
          </>
        )}

        {activeTab === 'xp' && (
          <>
            {/* XP Depo Yükseltmeleri */}
            <Text style={styles.sectionTitle}>
              {lang === 'tr' ? '📦 XP Deposu' : '📦 XP Storage'}
            </Text>
            <Text style={styles.sectionSubtitle}>
              {lang === 'tr'
                ? `Mevcut kapasite: ${getXpStorageCapacity(xpStorageLevel).toLocaleString()} XP`
                : `Current capacity: ${getXpStorageCapacity(xpStorageLevel).toLocaleString()} XP`}
            </Text>
            {XP_STORAGE_UPGRADES.map((upgrade) => {
              const owned = xpStorageLevel >= upgrade.level;
              const unlocked = xpStorageLevel >= upgrade.level - 1;
              const canAffordIt = xp >= upgrade.xpCost;
              return (
                <View
                  key={upgrade.level}
                  style={[styles.storageCard, owned && styles.storageCardOwned, !unlocked && styles.storageCardLocked]}
                >
                  <Text style={styles.storageEmoji}>{owned ? '✅' : unlocked ? '📦' : '🔒'}</Text>
                  <View style={styles.storageInfo}>
                    <Text style={[styles.storageName, owned && { color: COLORS.SECONDARY }]}>
                      {upgrade.capacity.toLocaleString()} XP {lang === 'tr' ? 'Kapasite' : 'Capacity'}
                    </Text>
                    <Text style={styles.storageCost}>
                      {owned
                        ? (lang === 'tr' ? 'Sahip' : 'Owned')
                        : !unlocked
                        ? (lang === 'tr' ? 'Öncekini al' : 'Buy previous first')
                        : `${upgrade.xpCost.toLocaleString()} XP`}
                    </Text>
                  </View>
                  <TouchableOpacity
                    style={[
                      styles.buyBtn,
                      owned ? styles.buyBtnOwned
                        : !unlocked ? styles.buyBtnDisabled
                        : canAffordIt ? [styles.buyBtnActive, { backgroundColor: COLORS.PURPLE }]
                        : styles.buyBtnDisabled,
                    ]}
                    onPress={() => {
                      if (!owned && unlocked) {
                        const ok = purchaseXpStorage(upgrade.level);
                        if (!ok) Alert.alert('', t(lang, 'shop_not_enough_xp'));
                      }
                    }}
                    disabled={owned || !unlocked}
                  >
                    <Text style={styles.buyBtnText}>
                      {owned ? '✓' : lang === 'tr' ? 'Al' : 'Buy'}
                    </Text>
                  </TouchableOpacity>
                </View>
              );
            })}

            {/* Idle section header */}
            <Text style={styles.sectionTitle}>{t(lang, 'shop_idle_title')}</Text>
            <Text style={styles.sectionSubtitle}>{t(lang, 'shop_idle_subtitle')}</Text>

            {/* Kutsal Kılıç */}
            {kutsalKilicUnlocked && (
              <View style={[styles.kutsalCard, kutsalKilicPurchased && styles.kutsalCardOwned]}>
                <Text style={styles.kutsalEmoji}>⚔️</Text>
                <View style={styles.kutsalInfo}>
                  <Text style={styles.kutsalName}>
                    {lang === 'tr' ? 'Kutsal Kılıç' : 'Holy Sword'}
                  </Text>
                  <Text style={styles.kutsalDesc}>
                    {lang === 'tr'
                      ? 'Tıklama gücü 1000 olur. Her 11. vuruş 10.000 hasar verir.'
                      : 'Click power becomes 1000. Every 11th hit deals 10,000 damage.'}
                  </Text>
                  {!kutsalKilicPurchased && (
                    <Text style={styles.kutsalReq}>
                      {'Lv.100  •  1.000.000 TT  •  100.000 XP'}
                    </Text>
                  )}
                </View>
                <TouchableOpacity
                  style={[
                    styles.kutsalBtn,
                    kutsalKilicPurchased
                      ? styles.kutsalBtnOwned
                      : (level >= 100 && tikTik >= 1000000 && xp >= 100000)
                      ? styles.kutsalBtnActive
                      : styles.kutsalBtnDisabled,
                  ]}
                  onPress={() => !kutsalKilicPurchased && handleBuyKutsalKilic()}
                  disabled={kutsalKilicPurchased}
                >
                  <Text style={styles.kutsalBtnText}>
                    {kutsalKilicPurchased
                      ? (lang === 'tr' ? '✓ Aktif' : '✓ Active')
                      : (lang === 'tr' ? 'Satın Al' : 'Buy')}
                  </Text>
                </TouchableOpacity>
              </View>
            )}

            {IDLE_SYSTEMS.map((sys) => {
              const owned = purchasedIdleSystems.includes(sys.id);
              return (
                <View key={sys.id} style={[styles.idleCard, owned && styles.idleCardOwned]}>
                  <Text style={styles.idleEmoji}>{sys.emoji}</Text>
                  <View style={styles.idleInfo}>
                    <Text style={[styles.idleName, { color: sys.color }]}>
                      {t(lang, sys.nameKey as any)}
                    </Text>
                    <Text style={styles.idleDesc}>
                      {t(lang, sys.descKey as any)}
                    </Text>
                    <Text style={styles.idleCost}>
                      {t(lang, 'shop_xp_cost', { amount: sys.xpCost.toLocaleString() })}
                    </Text>
                  </View>
                  <TouchableOpacity
                    style={[
                      styles.buyBtn,
                      owned
                        ? styles.buyBtnOwned
                        : xp >= sys.xpCost
                        ? [styles.buyBtnActive, { backgroundColor: sys.color }]
                        : styles.buyBtnDisabled,
                    ]}
                    onPress={() => !owned && handleBuyIdleSystem(sys.id)}
                    disabled={owned}
                  >
                    <Text style={styles.buyBtnText}>
                      {owned ? t(lang, 'shop_already_owned') : t(lang, 'shop_buy')}
                    </Text>
                  </TouchableOpacity>
                </View>
              );
            })}
          </>
        )}
      </ScrollView>
    </View>
  );
}

interface UpgradeCardProps {
  emoji: string;
  title: string;
  desc: string;
  currentLevel: number;
  maxLevel: number;
  cost: number;
  costLabel: string;
  canAfford: boolean;
  isMaxed: boolean;
  onBuy: () => void;
  lang: string;
}

function UpgradeCard({
  emoji, title, desc, currentLevel, maxLevel, cost, costLabel,
  canAfford, isMaxed, onBuy, lang,
}: UpgradeCardProps) {
  const t2 = (key: string, vars?: Record<string, string | number>) => t(lang, key as any, vars);

  return (
    <View style={styles.upgradeCard}>
      <View style={styles.upgradeLeft}>
        <Text style={styles.upgradeEmoji}>{emoji}</Text>
        <View style={styles.upgradeInfo}>
          <Text style={styles.upgradeTitle}>{title}</Text>
          <Text style={styles.upgradeDesc}>{desc}</Text>
          <View style={styles.levelDots}>
            {Array.from({ length: maxLevel }).map((_, i) => (
              <View
                key={i}
                style={[
                  styles.levelDot,
                  i < currentLevel ? styles.levelDotFilled : styles.levelDotEmpty,
                ]}
              />
            ))}
          </View>
        </View>
      </View>
      <TouchableOpacity
        style={[
          styles.upgradeBtn,
          isMaxed ? styles.upgradeBtnMax : canAfford ? styles.upgradeBtnActive : styles.upgradeBtnDisabled,
        ]}
        onPress={!isMaxed ? onBuy : undefined}
        disabled={isMaxed}
      >
        <Text style={styles.upgradeBtnText}>{isMaxed ? t2('shop_max') : t2('shop_upgrade')}</Text>
        {!isMaxed && <Text style={styles.upgradeBtnCost}>{costLabel}</Text>}
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.BG_DARK },
  balanceRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: SPACING.MD,
    padding: SPACING.MD,
  },
  balancePill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.BG_CARD,
    borderRadius: RADIUS.FULL,
    paddingHorizontal: SPACING.MD,
    paddingVertical: SPACING.SM,
    borderWidth: 1,
    borderColor: COLORS.BORDER,
  },
  balanceEmoji: { fontSize: 16, marginRight: 4 },
  balanceValue: { fontSize: 18, fontWeight: '800', color: COLORS.GOLD },
  balanceLabel: { fontSize: 13, color: COLORS.TEXT_SECONDARY, fontWeight: '600' },
  tabRow: {
    flexDirection: 'row',
    marginHorizontal: SPACING.MD,
    backgroundColor: COLORS.BG_CARD,
    borderRadius: RADIUS.MD,
    padding: 3,
    marginBottom: SPACING.SM,
  },
  tab: {
    flex: 1,
    paddingVertical: SPACING.SM,
    alignItems: 'center',
    borderRadius: RADIUS.SM,
  },
  tabActive: { backgroundColor: COLORS.PRIMARY },
  tabText: { fontSize: 15, fontWeight: '700', color: COLORS.TEXT_MUTED },
  tabTextActive: { color: COLORS.TEXT },
  scroll: { flex: 1 },
  scrollContent: { paddingHorizontal: SPACING.MD, paddingBottom: SPACING.XL },
  upgradeCard: {
    backgroundColor: COLORS.BG_CARD,
    borderRadius: RADIUS.LG,
    padding: SPACING.MD,
    marginBottom: SPACING.MD,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.BORDER,
  },
  upgradeLeft: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: SPACING.SM },
  upgradeEmoji: { fontSize: 36 },
  upgradeInfo: { flex: 1 },
  upgradeTitle: { ...FONTS.SUBHEADING },
  upgradeDesc: { ...FONTS.BODY, marginTop: 2 },
  levelDots: { flexDirection: 'row', gap: 4, marginTop: 6, flexWrap: 'wrap' },
  levelDot: { width: 8, height: 8, borderRadius: 4 },
  levelDotFilled: { backgroundColor: COLORS.PRIMARY },
  levelDotEmpty: { backgroundColor: COLORS.BG_ELEVATED },
  upgradeBtn: {
    borderRadius: RADIUS.MD,
    paddingHorizontal: SPACING.MD,
    paddingVertical: SPACING.SM,
    alignItems: 'center',
    minWidth: 90,
  },
  upgradeBtnActive: { backgroundColor: COLORS.PRIMARY },
  upgradeBtnDisabled: { backgroundColor: COLORS.BG_ELEVATED },
  upgradeBtnMax: { backgroundColor: COLORS.SECONDARY + '33', borderWidth: 1, borderColor: COLORS.SECONDARY },
  upgradeBtnText: { color: COLORS.TEXT, fontWeight: '800', fontSize: 13 },
  upgradeBtnCost: { color: COLORS.GOLD, fontSize: 11, fontWeight: '600', marginTop: 2 },
  sectionTitle: { ...FONTS.HEADING, marginBottom: SPACING.XS },
  sectionSubtitle: { ...FONTS.BODY, marginBottom: SPACING.MD },
  idleCard: {
    backgroundColor: COLORS.BG_CARD,
    borderRadius: RADIUS.LG,
    padding: SPACING.MD,
    marginBottom: SPACING.MD,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.BORDER,
  },
  idleCardOwned: { borderColor: COLORS.SECONDARY, borderWidth: 1.5 },
  idleEmoji: { fontSize: 40, marginRight: SPACING.MD },
  idleInfo: { flex: 1 },
  idleName: { fontSize: 15, fontWeight: '800' },
  idleDesc: { fontSize: 12, color: COLORS.TEXT_SECONDARY, marginTop: 2 },
  idleCost: { fontSize: 12, color: COLORS.PURPLE, fontWeight: '700', marginTop: 4 },
  buyBtn: {
    borderRadius: RADIUS.MD,
    paddingHorizontal: SPACING.MD,
    paddingVertical: SPACING.SM,
    minWidth: 80,
    alignItems: 'center',
  },
  buyBtnActive: {},
  buyBtnDisabled: { backgroundColor: COLORS.BG_ELEVATED },
  buyBtnOwned: { backgroundColor: COLORS.SECONDARY + '22', borderWidth: 1, borderColor: COLORS.SECONDARY },
  buyBtnText: { color: COLORS.TEXT, fontWeight: '800', fontSize: 12 },
  storageCard: {
    backgroundColor: COLORS.BG_CARD,
    borderRadius: RADIUS.LG,
    padding: SPACING.MD,
    marginBottom: SPACING.SM,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.BORDER,
  },
  storageCardOwned: { borderColor: COLORS.SECONDARY, borderWidth: 1.5 },
  storageCardLocked: { opacity: 0.5 },
  storageEmoji: { fontSize: 30, marginRight: SPACING.MD },
  storageInfo: { flex: 1 },
  storageName: { fontSize: 14, fontWeight: '800', color: COLORS.TEXT },
  storageCost: { fontSize: 12, color: COLORS.PURPLE, fontWeight: '700', marginTop: 2 },
  kutsalCard: {
    backgroundColor: COLORS.BG_CARD,
    borderRadius: RADIUS.LG,
    padding: SPACING.MD,
    marginBottom: SPACING.MD,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#B8E0FF55',
  },
  kutsalCardOwned: { borderColor: '#B8E0FF', backgroundColor: 'rgba(184,224,255,0.08)' },
  kutsalEmoji: { fontSize: 40, marginRight: SPACING.MD },
  kutsalInfo: { flex: 1 },
  kutsalName: { fontSize: 15, fontWeight: '900', color: '#B8E0FF' },
  kutsalDesc: { fontSize: 12, color: COLORS.TEXT_SECONDARY, marginTop: 2 },
  kutsalReq: { fontSize: 11, color: COLORS.GOLD, fontWeight: '700', marginTop: 4 },
  kutsalBtn: {
    borderRadius: RADIUS.MD,
    paddingHorizontal: SPACING.MD,
    paddingVertical: SPACING.SM,
    minWidth: 80,
    alignItems: 'center',
  },
  kutsalBtnActive: { backgroundColor: '#B8E0FF', },
  kutsalBtnDisabled: { backgroundColor: COLORS.BG_ELEVATED },
  kutsalBtnOwned: { backgroundColor: 'rgba(184,224,255,0.2)', borderWidth: 1, borderColor: '#B8E0FF' },
  kutsalBtnText: { color: COLORS.BG_DARK, fontWeight: '900', fontSize: 12 },
});
