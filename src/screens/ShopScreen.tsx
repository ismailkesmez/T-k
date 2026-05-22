import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  TextInput,
  Modal,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useGameStore } from '../store/gameStore';
import { getMonsterById } from '../constants/monsters';
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
  TIKGUN_LEVELS,
  getTikGunPerHit,
  getDovizciRates,
  DOVIZCI_COST_TIKTIK,
  DOVIZCI_COST_XP,
  SILAH_TUCCARI_COST_TIKTIK,
  SILAH_TUCCARI_COST_XP,
  WEAPONS,
} from '../constants/shop';
import { t } from '../i18n';
import { COLORS, FONTS, RADIUS, SPACING } from '../constants/theme';

type Tab = 'tiktik' | 'xp' | 'secilmisler';

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
  const tikGunLevel = useGameStore((s) => s.tikGunLevel);
  const goblinKralDefeatedCount = useGameStore((s) => s.goblinKralDefeatedCount);
  const dovizciPurchased = useGameStore((s) => s.dovizciPurchased);
  const silahTuccariPurchased = useGameStore((s) => s.silahTuccariPurchased);
  const purchasedWeapons = useGameStore((s) => s.purchasedWeapons);
  const miniEjderhaDefeatedCount = useGameStore((s) => s.miniEjderhaDefeatedCount);
  const slimeDefeatedCount = useGameStore((s) => s.slimeDefeatedCount);
  const melekDefeatedCount = useGameStore((s) => s.melekDefeatedCount);

  const upgradeClickPower = useGameStore((s) => s.upgradeClickPower);
  const upgradeMultiTouch = useGameStore((s) => s.upgradeMultiTouch);
  const purchaseIdleSystem = useGameStore((s) => s.purchaseIdleSystem);
  const purchaseKutsalKilic = useGameStore((s) => s.purchaseKutsalKilic);
  const purchaseXpStorage = useGameStore((s) => s.purchaseXpStorage);
  const upgradeTikGun = useGameStore((s) => s.upgradeTikGun);
  const purchaseDovizci = useGameStore((s) => s.purchaseDovizci);
  const convertXpToTikTik = useGameStore((s) => s.convertXpToTikTik);
  const convertTikTikToXp = useGameStore((s) => s.convertTikTikToXp);
  const purchaseSilahTuccari = useGameStore((s) => s.purchaseSilahTuccari);
  const purchaseWeapon = useGameStore((s) => s.purchaseWeapon);

  const [xpConvertInput, setXpConvertInput] = useState('');
  const [ttConvertInput, setTtConvertInput] = useState('');
  const [showDovizciModal, setShowDovizciModal] = useState(false);
  const [showSilahModal, setShowSilahModal] = useState(false);

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

  const handleUpgradeTikGun = () => {
    const success = upgradeTikGun();
    if (!success) {
      const nextLevel = tikGunLevel + 1;
      const upgrade = TIKGUN_LEVELS[nextLevel - 1];
      if (upgrade?.requiresGoblinKral && goblinKralDefeatedCount < 5) {
        Alert.alert('', lang === 'tr'
          ? `Goblin Kral 5 kez yenilmeli (${goblinKralDefeatedCount}/5)`
          : `Defeat Goblin King 5 times (${goblinKralDefeatedCount}/5)`);
      } else {
        Alert.alert('', t(lang, 'shop_not_enough_tiktik'));
      }
    }
  };

  const handleBuySilahTuccari = () => {
    const ok = purchaseSilahTuccari();
    if (!ok) Alert.alert('', lang === 'tr'
      ? `Gereksinimler: ${SILAH_TUCCARI_COST_TIKTIK.toLocaleString()} TT + ${SILAH_TUCCARI_COST_XP} XP`
      : `Requirements: ${SILAH_TUCCARI_COST_TIKTIK.toLocaleString()} TT + ${SILAH_TUCCARI_COST_XP} XP`);
  };

  const handleBuyWeapon = (weaponId: string) => {
    const ok = purchaseWeapon(weaponId);
    if (!ok) Alert.alert('', t(lang, 'shop_not_enough_tiktik'));
  };

  const handleBuyDovizci = () => {
    const ok = purchaseDovizci();
    if (!ok) Alert.alert('', lang === 'tr'
      ? `Gereksinimler: ${DOVIZCI_COST_TIKTIK.toLocaleString()} TT + ${DOVIZCI_COST_XP} XP`
      : `Requirements: ${DOVIZCI_COST_TIKTIK.toLocaleString()} TT + ${DOVIZCI_COST_XP} XP`);
  };

  const handleConvertXpToTikTik = () => {
    const amount = parseInt(xpConvertInput, 10);
    if (isNaN(amount) || amount <= 0) { Alert.alert('', lang === 'tr' ? 'Geçerli bir miktar gir' : 'Enter a valid amount'); return; }
    const rates = getDovizciRates(level);
    const ok = convertXpToTikTik(amount);
    if (ok) {
      Alert.alert('✓', lang === 'tr'
        ? `${amount} XP → ${(amount * rates.xpToTikTik).toLocaleString()} TıkTık`
        : `${amount} XP → ${(amount * rates.xpToTikTik).toLocaleString()} TıkTık`);
      setXpConvertInput('');
    } else {
      Alert.alert('', lang === 'tr' ? 'Yetersiz XP' : 'Not enough XP');
    }
  };

  const handleConvertTikTikToXp = () => {
    const amount = parseInt(ttConvertInput, 10);
    if (isNaN(amount) || amount <= 0) { Alert.alert('', lang === 'tr' ? 'Geçerli bir miktar gir' : 'Enter a valid amount'); return; }
    const rates = getDovizciRates(level);
    if (!rates.tikTikToXp) return;
    const xpGain = Math.floor(amount / rates.tikTikToXp);
    const ok = convertTikTikToXp(amount);
    if (ok) {
      Alert.alert('✓', lang === 'tr'
        ? `${amount.toLocaleString()} TT → ${xpGain.toLocaleString()} XP`
        : `${amount.toLocaleString()} TT → ${xpGain.toLocaleString()} XP`);
      setTtConvertInput('');
    } else {
      Alert.alert('', lang === 'tr' ? 'Yetersiz TıkTık' : 'Not enough TıkTık');
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
        {(['tiktik', 'xp', 'secilmisler'] as Tab[]).map((tab) => (
          <TouchableOpacity
            key={tab}
            style={[styles.tab, activeTab === tab && styles.tabActive]}
            onPress={() => setActiveTab(tab)}
          >
            <Text style={[styles.tabText, activeTab === tab && styles.tabTextActive]}>
              {tab === 'tiktik' ? t(lang, 'shop_tab_tiktik') : tab === 'xp' ? t(lang, 'shop_tab_xp') : (lang === 'tr' ? 'Seçilmişler' : 'Chosen')}
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

            {/* TıkGun */}
            {(() => {
              const isMaxed = tikGunLevel >= TIKGUN_LEVELS.length;
              const currentPerHit = getTikGunPerHit(tikGunLevel);
              const nextUpgrade = TIKGUN_LEVELS[tikGunLevel]; // tikGunLevel = index of next
              const isLocked = !isMaxed && nextUpgrade?.requiresGoblinKral && goblinKralDefeatedCount < 5;
              const cost = nextUpgrade?.cost ?? 0;
              const nextPerHit = nextUpgrade?.tikTikPerHit ?? 0;
              const desc = isMaxed
                ? (lang === 'tr' ? `Her vuruş ${currentPerHit} TT — Maksimum!` : `${currentPerHit} TT per hit — Maxed!`)
                : tikGunLevel === 0
                ? (lang === 'tr' ? `Her vuruşta otomatik TT kazan` : `Earn TT automatically on every hit`)
                : (lang === 'tr' ? `Her vuruş ${currentPerHit} TT → Sonraki: ${nextPerHit} TT` : `${currentPerHit} TT per hit → Next: ${nextPerHit} TT`);
              return (
                <UpgradeCard
                  emoji="🔫"
                  title={lang === 'tr' ? 'TıkGun' : 'ClickGun'}
                  desc={desc}
                  currentLevel={tikGunLevel}
                  maxLevel={TIKGUN_LEVELS.length}
                  cost={cost}
                  costLabel={isLocked
                    ? (lang === 'tr' ? `👺 Goblin Kral (${goblinKralDefeatedCount}/5)` : `👺 Goblin King (${goblinKralDefeatedCount}/5)`)
                    : t(lang, 'shop_cost', { amount: cost.toLocaleString() })}
                  canAfford={!isLocked && tikTik >= cost}
                  isMaxed={isMaxed}
                  isLocked={isLocked}
                  onBuy={handleUpgradeTikGun}
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


            {IDLE_SYSTEMS.map((sys, idx) => {
              const owned = purchasedIdleSystems.includes(sys.id);
              const isLocked = idx > 0 && !purchasedIdleSystems.includes(IDLE_SYSTEMS[idx - 1].id);
              return (
                <View key={sys.id} style={[styles.idleCard, owned && styles.idleCardOwned, isLocked && styles.idleCardLocked]}>
                  <Text style={styles.idleEmoji}>{isLocked ? '🔒' : sys.emoji}</Text>
                  <View style={styles.idleInfo}>
                    <Text style={[styles.idleName, { color: isLocked ? COLORS.TEXT_MUTED : sys.color }]}>
                      {isLocked ? (lang === 'tr' ? 'Kilitli' : 'Locked') : t(lang, sys.nameKey as any)}
                    </Text>
                    <Text style={styles.idleDesc}>
                      {isLocked
                        ? (lang === 'tr' ? `Önce ${t(lang, IDLE_SYSTEMS[idx - 1].nameKey as any)} al` : `Buy ${t(lang, IDLE_SYSTEMS[idx - 1].nameKey as any)} first`)
                        : t(lang, sys.descKey as any)}
                    </Text>
                    <Text style={styles.idleCost}>
                      {t(lang, 'shop_xp_cost', { amount: sys.xpCost.toLocaleString() })}
                    </Text>
                  </View>
                  <TouchableOpacity
                    style={[
                      styles.buyBtn,
                      owned ? styles.buyBtnOwned
                        : isLocked ? styles.buyBtnDisabled
                        : xp >= sys.xpCost ? [styles.buyBtnActive, { backgroundColor: sys.color }]
                        : styles.buyBtnDisabled,
                    ]}
                    onPress={() => !owned && !isLocked && handleBuyIdleSystem(sys.id)}
                    disabled={owned || isLocked}
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

        {activeTab === 'secilmisler' && (() => {
          const rates = getDovizciRates(level);
          const rateLabel = `1 XP = ${rates.xpToTikTik} TT${rates.tikTikToXp ? `  •  ${rates.tikTikToXp} TT = 1 XP` : ''}`;
          return (
            <>
              {/* ── Dövizci Kart ── */}
              <TouchableOpacity
                style={styles.dovizciCard}
                onPress={() => dovizciPurchased && setShowDovizciModal(true)}
                activeOpacity={dovizciPurchased ? 0.7 : 1}
              >
                <View style={styles.dovizciHeader}>
                  <Text style={styles.dovizciEmoji}>💱</Text>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.dovizciName}>{lang === 'tr' ? 'Dövizci' : 'Exchanger'}</Text>
                    <Text style={styles.dovizciDesc}>
                      {lang === 'tr' ? 'Seviyene göre XP ile TıkTık arasında dönüşüm yap' : 'Convert between XP and TıkTık based on your level'}
                    </Text>
                    {dovizciPurchased && (
                      <Text style={styles.dovizciRateValue}>{rateLabel}</Text>
                    )}
                  </View>
                  {!dovizciPurchased ? (
                    <TouchableOpacity
                      style={[styles.dovizciBtn, (tikTik >= DOVIZCI_COST_TIKTIK && xp >= DOVIZCI_COST_XP) ? styles.dovizciBtnActive : styles.dovizciBtnDisabled]}
                      onPress={handleBuyDovizci}
                    >
                      <Text style={styles.dovizciBtnText}>{lang === 'tr' ? 'Satın Al' : 'Buy'}</Text>
                    </TouchableOpacity>
                  ) : (
                    <View style={styles.dovizciBtnOwned}>
                      <Text style={styles.dovizciBtnOwnedText}>{'›'}</Text>
                    </View>
                  )}
                </View>
                {!dovizciPurchased && (
                  <Text style={styles.dovizciCost}>
                    {`${DOVIZCI_COST_TIKTIK.toLocaleString()} TıkTık  +  ${DOVIZCI_COST_XP} XP`}
                  </Text>
                )}
              </TouchableOpacity>

              {/* ── Silah Tüccarı Kart ── */}
              <TouchableOpacity
                style={styles.silahCard}
                onPress={() => silahTuccariPurchased && setShowSilahModal(true)}
                activeOpacity={silahTuccariPurchased ? 0.7 : 1}
              >
                <View style={styles.dovizciHeader}>
                  <Text style={styles.silahEmoji}>⚔️</Text>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.silahName}>{lang === 'tr' ? 'Silah Tüccarı' : 'Weapon Merchant'}</Text>
                    <Text style={styles.dovizciDesc}>
                      {lang === 'tr' ? 'Güçlü silahlar satın al, hasarını artır' : 'Buy powerful weapons, increase your damage'}
                    </Text>
                  </View>
                  {!silahTuccariPurchased ? (
                    <TouchableOpacity
                      style={[styles.dovizciBtn, (tikTik >= SILAH_TUCCARI_COST_TIKTIK && xp >= SILAH_TUCCARI_COST_XP) ? styles.silahBtnActive : styles.dovizciBtnDisabled]}
                      onPress={handleBuySilahTuccari}
                    >
                      <Text style={styles.silahBtnText}>{lang === 'tr' ? 'Satın Al' : 'Buy'}</Text>
                    </TouchableOpacity>
                  ) : (
                    <View style={styles.dovizciBtnOwned}>
                      <Text style={styles.dovizciBtnOwnedText}>{'›'}</Text>
                    </View>
                  )}
                </View>
                {!silahTuccariPurchased && (
                  <Text style={styles.dovizciCost}>
                    {`${SILAH_TUCCARI_COST_TIKTIK.toLocaleString()} TıkTık  +  ${SILAH_TUCCARI_COST_XP} XP`}
                  </Text>
                )}
              </TouchableOpacity>

              {/* ── Silahlar Modal ── */}
              <Modal
                visible={showSilahModal}
                transparent
                animationType="slide"
                onRequestClose={() => setShowSilahModal(false)}
              >
                <View style={styles.dovizciModalOverlay}>
                  <View style={styles.dovizciModalSheet}>
                    <View style={styles.dovizciModalHeader}>
                      <Text style={[styles.dovizciModalTitle, { color: '#E17055' }]}>⚔️ {lang === 'tr' ? 'Silahlar' : 'Weapons'}</Text>
                      <TouchableOpacity onPress={() => setShowSilahModal(false)} style={styles.dovizciModalCloseBtn}>
                        <Text style={styles.dovizciModalCloseText}>✕</Text>
                      </TouchableOpacity>
                    </View>
                    {WEAPONS.map((weapon) => {
                      const owned = purchasedWeapons.includes(weapon.id) ||
                        (weapon.id === 'kutsal_kilic' && kutsalKilicPurchased);
                      const levelOk = !weapon.requiresLevel || level >= weapon.requiresLevel;
                      const getDefeatedCount = (mid: number) =>
                        mid === 1  ? slimeDefeatedCount
                        : mid === 10 ? melekDefeatedCount
                        : mid === 14 ? miniEjderhaDefeatedCount
                        : 0;
                      const defeatsOk = !weapon.requiresMonsterDefeats ||
                        getDefeatedCount(weapon.requiresMonsterDefeats.monsterId) >= weapon.requiresMonsterDefeats.count;
                      const unlocked = levelOk && defeatsOk;
                      const canAfford = (weapon.cost === 0 || tikTik >= weapon.cost) &&
                        (!weapon.xpCost || xp >= weapon.xpCost);
                      const lockLabel = !levelOk
                        ? (lang === 'tr' ? `Lv.${weapon.requiresLevel} gerekli` : `Requires Lv.${weapon.requiresLevel}`)
                        : !defeatsOk
                        ? `${t(lang, getMonsterById(weapon.requiresMonsterDefeats!.monsterId).nameKey as any)} ${getDefeatedCount(weapon.requiresMonsterDefeats!.monsterId)}/${weapon.requiresMonsterDefeats!.count}`
                        : '';
                      const costLabel = weapon.xpCost
                        ? `${weapon.cost.toLocaleString()} TT + ${weapon.xpCost.toLocaleString()} XP`
                        : weapon.cost === 0
                        ? (lang === 'tr' ? 'Ücretsiz' : 'Free')
                        : `${weapon.cost.toLocaleString()} TT`;
                      return (
                        <View key={weapon.id} style={[styles.weaponRow, owned && styles.weaponRowOwned, !unlocked && { opacity: 0.5 }]}>
                          <Text style={styles.weaponEmoji}>{owned || unlocked ? weapon.emoji : '🔒'}</Text>
                          <View style={{ flex: 1 }}>
                            <Text style={styles.weaponName}>{t(lang, weapon.nameKey as any)}</Text>
                            <Text style={styles.weaponDesc}>{t(lang, weapon.descKey as any)}</Text>
                            {!owned && !unlocked && (
                              <Text style={[styles.weaponCost, { color: COLORS.TEXT_MUTED }]}>{lockLabel}</Text>
                            )}
                            {!owned && unlocked && (
                              <Text style={styles.weaponCost}>{costLabel}</Text>
                            )}
                            {owned && <Text style={[styles.weaponCost, { color: COLORS.SECONDARY }]}>{lang === 'tr' ? '✓ Sahip' : '✓ Owned'}</Text>}
                          </View>
                          <TouchableOpacity
                            style={[styles.weaponBtn,
                              owned ? styles.weaponBtnOwned
                                : !unlocked ? styles.weaponBtnDisabled
                                : canAfford ? styles.weaponBtnActive
                                : styles.weaponBtnDisabled,
                            ]}
                            onPress={() => !owned && unlocked && handleBuyWeapon(weapon.id)}
                            disabled={owned || !unlocked}
                          >
                            <Text style={styles.weaponBtnText}>
                              {owned ? '✓' : !unlocked ? '🔒' : lang === 'tr' ? 'Al' : 'Buy'}
                            </Text>
                          </TouchableOpacity>
                        </View>
                      );
                    })}
                    <View style={[styles.dovizciBalanceRow, { marginTop: 16 }]}>
                      <Text style={styles.dovizciBalanceText}>💰 {tikTik.toLocaleString()} TT</Text>
                      <Text style={styles.dovizciBalanceText}>⭐ {xp.toLocaleString()} XP</Text>
                    </View>
                  </View>
                </View>
              </Modal>

              {/* ── Dövizci Modal ── */}
              <Modal
                visible={showDovizciModal}
                transparent
                animationType="slide"
                onRequestClose={() => setShowDovizciModal(false)}
              >
                <KeyboardAvoidingView
                  style={styles.dovizciModalOverlay}
                  behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                >
                  <View style={styles.dovizciModalSheet}>
                    {/* Başlık */}
                    <View style={styles.dovizciModalHeader}>
                      <Text style={styles.dovizciModalTitle}>💱 {lang === 'tr' ? 'Dövizci' : 'Exchanger'}</Text>
                      <TouchableOpacity onPress={() => setShowDovizciModal(false)} style={styles.dovizciModalCloseBtn}>
                        <Text style={styles.dovizciModalCloseText}>✕</Text>
                      </TouchableOpacity>
                    </View>

                    {/* Aktif oran */}
                    <View style={styles.dovizciRateRow}>
                      <Text style={styles.dovizciRateLabel}>
                        {lang === 'tr' ? `Seviye ${level}  —  ` : `Level ${level}  —  `}
                      </Text>
                      <Text style={styles.dovizciRateValue}>{rateLabel}</Text>
                    </View>

                    {/* XP → TıkTık */}
                    <Text style={styles.dovizciSectionLabel}>
                      {lang === 'tr' ? 'XP → TıkTık' : 'XP → TıkTık'}
                    </Text>
                    <View style={styles.dovizciRow}>
                      <TextInput
                        style={styles.dovizciInput}
                        value={xpConvertInput}
                        onChangeText={setXpConvertInput}
                        placeholder={lang === 'tr' ? 'XP miktarı' : 'XP amount'}
                        placeholderTextColor={COLORS.TEXT_MUTED}
                        keyboardType="numeric"
                        maxLength={12}
                      />
                      <TouchableOpacity style={styles.dovizciConvertBtn} onPress={handleConvertXpToTikTik}>
                        <Text style={styles.dovizciConvertBtnText}>
                          {xpConvertInput && !isNaN(parseInt(xpConvertInput))
                            ? `→ ${(parseInt(xpConvertInput) * rates.xpToTikTik).toLocaleString()} TT`
                            : '→ TT'}
                        </Text>
                      </TouchableOpacity>
                    </View>

                    {/* TıkTık → XP (seviye 15+) */}
                    {rates.tikTikToXp != null && (
                      <>
                        <Text style={styles.dovizciSectionLabel}>
                          {lang === 'tr' ? 'TıkTık → XP' : 'TıkTık → XP'}
                        </Text>
                        <View style={styles.dovizciRow}>
                          <TextInput
                            style={styles.dovizciInput}
                            value={ttConvertInput}
                            onChangeText={setTtConvertInput}
                            placeholder={lang === 'tr' ? 'TıkTık miktarı' : 'TıkTık amount'}
                            placeholderTextColor={COLORS.TEXT_MUTED}
                            keyboardType="numeric"
                            maxLength={12}
                          />
                          <TouchableOpacity
                            style={[styles.dovizciConvertBtn, { backgroundColor: COLORS.SECONDARY + 'CC' }]}
                            onPress={handleConvertTikTikToXp}
                          >
                            <Text style={styles.dovizciConvertBtnText}>
                              {ttConvertInput && !isNaN(parseInt(ttConvertInput))
                                ? `→ ${Math.floor(parseInt(ttConvertInput) / rates.tikTikToXp).toLocaleString()} XP`
                                : '→ XP'}
                            </Text>
                          </TouchableOpacity>
                        </View>
                      </>
                    )}

                    {/* Bakiye */}
                    <View style={styles.dovizciBalanceRow}>
                      <Text style={styles.dovizciBalanceText}>💰 {tikTik.toLocaleString()} TT</Text>
                      <Text style={styles.dovizciBalanceText}>⭐ {xp.toLocaleString()} XP</Text>
                    </View>
                  </View>
                </KeyboardAvoidingView>
              </Modal>
            </>
          );
        })()}
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
  isLocked?: boolean;
  onBuy: () => void;
  lang: string;
}

function UpgradeCard({
  emoji, title, desc, currentLevel, maxLevel, cost, costLabel,
  canAfford, isMaxed, isLocked = false, onBuy, lang,
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
          isMaxed ? styles.upgradeBtnMax
            : isLocked ? styles.upgradeBtnLocked
            : canAfford ? styles.upgradeBtnActive
            : styles.upgradeBtnDisabled,
        ]}
        onPress={!isMaxed && !isLocked ? onBuy : undefined}
        disabled={isMaxed || isLocked}
      >
        <Text style={styles.upgradeBtnText}>{isMaxed ? t2('shop_max') : isLocked ? '🔒' : t2('shop_upgrade')}</Text>
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
  upgradeBtnLocked: { backgroundColor: COLORS.BG_ELEVATED, borderWidth: 1, borderColor: COLORS.GOLD + '66' },
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
  idleCardLocked: { opacity: 0.45 },
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

  // ── Dövizci ──
  dovizciCard: {
    backgroundColor: COLORS.BG_CARD,
    borderRadius: RADIUS.LG,
    padding: SPACING.MD,
    marginBottom: SPACING.MD,
    borderWidth: 1.5,
    borderColor: '#F9CA2455',
  },
  dovizciHeader: { flexDirection: 'row', alignItems: 'center', gap: SPACING.MD, marginBottom: SPACING.SM },
  dovizciEmoji: { fontSize: 40 },
  dovizciName: { fontSize: 16, fontWeight: '900', color: '#F9CA24' },
  dovizciDesc: { fontSize: 12, color: COLORS.TEXT_SECONDARY, marginTop: 2 },
  dovizciCost: { fontSize: 12, color: COLORS.GOLD, fontWeight: '700', textAlign: 'center', marginBottom: SPACING.SM },
  dovizciBtn: { borderRadius: RADIUS.MD, paddingHorizontal: SPACING.MD, paddingVertical: SPACING.SM, minWidth: 80, alignItems: 'center' },
  dovizciBtnActive: { backgroundColor: '#F9CA24' },
  dovizciBtnDisabled: { backgroundColor: COLORS.BG_ELEVATED },
  dovizciBtnText: { color: COLORS.BG_DARK, fontWeight: '900', fontSize: 13 },
  dovizciBtnOwned: { backgroundColor: 'rgba(249,202,36,0.2)', borderWidth: 1, borderColor: '#F9CA24', borderRadius: RADIUS.MD, paddingHorizontal: SPACING.MD, paddingVertical: SPACING.SM },
  dovizciBtnOwnedText: { color: '#F9CA24', fontWeight: '900', fontSize: 14 },
  dovizciRateRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.BG_ELEVATED, borderRadius: RADIUS.MD, padding: SPACING.SM, marginBottom: SPACING.MD, flexWrap: 'wrap' },
  dovizciRateLabel: { fontSize: 12, color: COLORS.TEXT_MUTED, fontWeight: '600' },
  dovizciRateValue: { fontSize: 12, color: '#F9CA24', fontWeight: '800' },
  dovizciSectionLabel: { fontSize: 11, fontWeight: '700', color: COLORS.TEXT_MUTED, textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: SPACING.XS, marginTop: SPACING.SM },
  dovizciRow: { flexDirection: 'row', alignItems: 'center', gap: SPACING.SM, marginBottom: SPACING.XS },
  dovizciInput: {
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
  dovizciConvertBtn: {
    backgroundColor: '#F9CA2499',
    borderRadius: RADIUS.MD,
    paddingHorizontal: SPACING.MD,
    paddingVertical: SPACING.SM,
    minWidth: 100,
    alignItems: 'center',
  },
  dovizciConvertBtnText: { color: COLORS.BG_DARK, fontWeight: '900', fontSize: 12 },

  dovizciModalOverlay: {
    flex: 1,
    backgroundColor: COLORS.OVERLAY,
    justifyContent: 'flex-end',
  },
  dovizciModalSheet: {
    backgroundColor: COLORS.BG_CARD,
    borderTopLeftRadius: RADIUS.XL,
    borderTopRightRadius: RADIUS.XL,
    padding: SPACING.LG,
    borderTopWidth: 2,
    borderColor: '#F9CA2444',
  },
  dovizciModalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: SPACING.MD,
  },
  dovizciModalTitle: { fontSize: 20, fontWeight: '900', color: '#F9CA24' },
  dovizciModalCloseBtn: { padding: SPACING.SM },
  dovizciModalCloseText: { color: COLORS.TEXT_SECONDARY, fontSize: 18, fontWeight: '700' },
  dovizciBalanceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: SPACING.LG,
    paddingTop: SPACING.MD,
    borderTopWidth: 1,
    borderColor: COLORS.BORDER,
  },
  dovizciBalanceText: { fontSize: 13, color: COLORS.GOLD, fontWeight: '700' },

  // ── Silah Tüccarı ──
  silahCard: {
    backgroundColor: COLORS.BG_CARD,
    borderRadius: RADIUS.LG,
    padding: SPACING.MD,
    marginBottom: SPACING.MD,
    borderWidth: 1.5,
    borderColor: '#E1705555',
  },
  silahEmoji: { fontSize: 40 },
  silahName: { fontSize: 16, fontWeight: '900', color: '#E17055' },
  silahBtnActive: { backgroundColor: '#E17055' },
  silahBtnText: { color: COLORS.TEXT, fontWeight: '900', fontSize: 13 },
  weaponRow: {
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
  weaponRowOwned: { borderColor: '#E17055', borderWidth: 1.5 },
  weaponEmoji: { fontSize: 36 },
  weaponName: { fontSize: 14, fontWeight: '800', color: COLORS.TEXT },
  weaponDesc: { fontSize: 12, color: '#E17055', fontWeight: '700', marginTop: 2 },
  weaponCost: { fontSize: 12, color: COLORS.GOLD, fontWeight: '700', marginTop: 2 },
  weaponBtn: {
    borderRadius: RADIUS.MD,
    paddingHorizontal: SPACING.MD,
    paddingVertical: SPACING.SM,
    minWidth: 60,
    alignItems: 'center',
  },
  weaponBtnActive: { backgroundColor: '#E17055' },
  weaponBtnDisabled: { backgroundColor: COLORS.BG_CARD },
  weaponBtnOwned: { backgroundColor: 'rgba(225,112,85,0.2)', borderWidth: 1, borderColor: '#E17055' },
  weaponBtnText: { color: COLORS.TEXT, fontWeight: '800', fontSize: 13 },
});
