import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  Image,
  ImageBackground,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Modal,
  Animated,
  GestureResponderEvent,
  LayoutChangeEvent,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { useGameStore } from '../store/gameStore';
import { getMonsterById, MONSTERS, getNextLevelXp } from '../constants/monsters';
import { IDLE_SYSTEMS, MULTI_TOUCH_MULTIPLIERS, getXpStorageCapacity, CLICK_POWER_DAMAGE } from '../constants/shop';
import { playMonsterSound } from '../utils/soundManager';
import HPBar from '../components/HPBar';
import FloatingText, { FloatingItem } from '../components/FloatingText';
import { t } from '../i18n';
import { COLORS, FONTS, RADIUS, SPACING } from '../constants/theme';

const HIT_TIKTIK_INTERVAL = 5;
const HIT_XP_INTERVAL = 10;

interface BubbleData {
  id: number;
  x: number;
  y: number;
}

let floatIdCounter = 0;

export default function MonsterScreen() {
  const lang = useGameStore((s) => s.language);
  const activeMonsterId = useGameStore((s) => s.activeMonsterId);
  const unlockedMonsters = useGameStore((s) => s.unlockedMonsters);
  const clickPower = useGameStore((s) => s.clickPower);
  const maxMultiTouch = useGameStore((s) => s.maxMultiTouch);
  const addTikTik = useGameStore((s) => s.addTikTik);
  const addXp = useGameStore((s) => s.addXp);
  const recordMonsterDefeated = useGameStore((s) => s.recordMonsterDefeated);
  const recordClicks = useGameStore((s) => s.recordClicks);
  const setActiveMonster = useGameStore((s) => s.setActiveMonster);
  const tikTik = useGameStore((s) => s.tikTik);
  const xp = useGameStore((s) => s.xp);
  const idleXpBuffer = useGameStore((s) => s.idleXpBuffer);
  const purchasedIdleSystems = useGameStore((s) => s.purchasedIdleSystems);
  const collectIdleXpBuffer = useGameStore((s) => s.collectIdleXpBuffer);
  const xpStorageLevel = useGameStore((s) => s.xpStorageLevel);
  const kutsalKilicUnlocked = useGameStore((s) => s.kutsalKilicUnlocked);
  const kutsalKilicPurchased = useGameStore((s) => s.kutsalKilicPurchased);

  const [showKutsalKilic, setShowKutsalKilic] = useState(false);

  const monster = getMonsterById(activeMonsterId);
  const bubbleSize = Math.max(20, Math.round(58 - (monster.bubbleCount - 1) * 3));

  const [hp, setHp] = useState(monster.maxHp);
  const [showMonsterPicker, setShowMonsterPicker] = useState(false);
  const [floatingTexts, setFloatingTexts] = useState<FloatingItem[]>([]);
  const [bubbles, setBubbles] = useState<BubbleData[]>([]);
  const [playAreaSize, setPlayAreaSize] = useState({ width: 0, height: 0 });
  const hitCounterRef = useRef(0);
  const kutsalHitCounterRef = useRef(0);
  const hpRef = useRef(monster.maxHp);
  const monsterScaleAnim = useRef(new Animated.Value(1)).current;
  const defeatAnim = useRef(new Animated.Value(1)).current;
  const processedTouchIds = useRef(new Set<number | string>());

  // Reset HP when monster changes
  useEffect(() => {
    const maxHp = getMonsterById(activeMonsterId).maxHp;
    hpRef.current = maxHp;
    setHp(maxHp);
    hitCounterRef.current = 0;
    kutsalHitCounterRef.current = 0;
  }, [activeMonsterId]);

  // HP regen
  useEffect(() => {
    const interval = setInterval(() => {
      if (hpRef.current <= 0 || hpRef.current >= monster.maxHp) return;
      const newHp = Math.min(monster.maxHp, hpRef.current + monster.hpRegenPerSec);
      hpRef.current = newHp;
      setHp(newHp);
    }, 1000);
    return () => clearInterval(interval);
  }, [monster.id]);

  // Spawn bubbles
  useEffect(() => {
    if (playAreaSize.width === 0) return;
    spawnBubbles();
    const interval = setInterval(spawnBubbles, 3000 + Math.random() * 2000);
    return () => clearInterval(interval);
  }, [monster.bubbleCount, playAreaSize]);

  const spawnBubbles = useCallback(() => {
    if (playAreaSize.width === 0) return;
    const count = monster.bubbleCount;
    const sz = Math.max(20, Math.round(58 - (count - 1) * 3));
    setBubbles(
      Array.from({ length: count }, (_, i) => ({
        id: i,
        x: sz / 2 + Math.random() * (playAreaSize.width - sz * 2),
        y: sz / 2 + Math.random() * (playAreaSize.height - sz * 2),
      }))
    );
  }, [monster.bubbleCount, playAreaSize]);

  // Save timestamp when leaving screen
  useFocusEffect(
    useCallback(() => {
      return () => {
        useGameStore.getState().saveTimestamp();
      };
    }, [])
  );

  const addFloating = (x: number, y: number, text: string, color?: string) => {
    const id = floatIdCounter++;
    setFloatingTexts((prev) => [...prev, { id, x, y, text, color }]);
  };

  const onPlayAreaLayout = (e: LayoutChangeEvent) => {
    const { width, height } = e.nativeEvent.layout;
    setPlayAreaSize({ width, height });
  };

  const touchMultiplier = MULTI_TOUCH_MULTIPLIERS[maxMultiTouch - 1] ?? 1;

  const onTouchStart = (e: GestureResponderEvent) => {
    const changedTouches = Array.from(e.nativeEvent.changedTouches);

    const processable = changedTouches;

    let clickCount = 0;

    for (const touch of processable) {
      if (processedTouchIds.current.has(touch.identifier)) continue;
      processedTouchIds.current.add(touch.identifier);

      const tx = touch.locationX;
      const ty = touch.locationY;

      // Check bubble hit
      const hitBubble = bubbles.find(
        (b) => tx >= b.x - bubbleSize / 2 && tx <= b.x + bubbleSize / 2 &&
               ty >= b.y - bubbleSize / 2 && ty <= b.y + bubbleSize / 2
      );

      if (hitBubble) {
        const newHp = Math.min(monster.maxHp, hpRef.current + monster.bubbleHeal);
        hpRef.current = newHp;
        setHp(newHp);
        addFloating(tx, ty, `+${monster.bubbleHeal} HP`, COLORS.PRIMARY);
      } else {
        clickCount++;
        hitCounterRef.current++;

        if (monster.id === 11 && !kutsalKilicPurchased) {
          addFloating(tx, ty, lang === 'tr' ? '⚔️ Kutsal Kılıç Gereklidir.' : '⚔️ Holy Sword Required.', '#B8E0FF');
          continue;
        }

        let dmg: number;
        let isKutsalHit = false;
        if (kutsalKilicPurchased) {
          kutsalHitCounterRef.current++;
          isKutsalHit = kutsalHitCounterRef.current % 11 === 0;
          dmg = (isKutsalHit ? 10000 : 1000) * touchMultiplier;
        } else {
          dmg = (CLICK_POWER_DAMAGE[clickPower - 1] ?? clickPower) * touchMultiplier;
        }

        const newHp = Math.max(0, hpRef.current - dmg);
        hpRef.current = newHp;
        setHp(newHp);

        playMonsterSound(monster.id);
        if (isKutsalHit) {
          addFloating(tx, ty, `⚔️ ${dmg}!`, '#B8E0FF');
        } else {
          addFloating(tx, ty, `-${dmg}`, COLORS.PRIMARY);
        }

        if (hitCounterRef.current % HIT_TIKTIK_INTERVAL === 0) {
          addTikTik(monster.hitRewardTikTik);
          addFloating(tx - 40, ty - 30, `+${monster.hitRewardTikTik} TT`, COLORS.GOLD);
        }
        if (hitCounterRef.current % HIT_XP_INTERVAL === 0) {
          addXp(monster.hitRewardXp);
          addFloating(tx + 20, ty - 30, `+${monster.hitRewardXp} XP`, COLORS.SECONDARY);
        }

        if (newHp === 0) {
          handleMonsterDefeated();
        }

        Animated.sequence([
          Animated.timing(monsterScaleAnim, { toValue: 0.92, duration: 60, useNativeDriver: true }),
          Animated.timing(monsterScaleAnim, { toValue: 1, duration: 100, useNativeDriver: true }),
        ]).start();
      }
    }

    if (clickCount > 0) {
      recordClicks(clickCount);
    }
  };

  const onTouchEnd = (e: GestureResponderEvent) => {
    for (const touch of e.nativeEvent.changedTouches) {
      processedTouchIds.current.delete(touch.identifier);
    }
  };

  const handleMonsterDefeated = () => {
    recordMonsterDefeated(monster.rewardTikTik, monster.rewardXp, monster.id);
    if (monster.id === 10) {
      setShowKutsalKilic(true);
      setTimeout(() => setShowKutsalKilic(false), 3500);
    } else {
      addFloating(
        playAreaSize.width / 2,
        playAreaSize.height / 3,
        `+${monster.rewardTikTik} TT!`,
        COLORS.GOLD
      );
    }

    Animated.sequence([
      Animated.timing(defeatAnim, { toValue: 1.3, duration: 150, useNativeDriver: true }),
      Animated.timing(defeatAnim, { toValue: 0, duration: 200, useNativeDriver: true }),
      Animated.timing(defeatAnim, { toValue: 1, duration: 50, useNativeDriver: true }),
    ]).start(() => {
      hpRef.current = monster.maxHp;
      setHp(monster.maxHp);
      hitCounterRef.current = 0;
      kutsalHitCounterRef.current = 0;
    });
  };

  const removeFloating = (id: number) => {
    setFloatingTexts((prev) => prev.filter((f) => f.id !== id));
  };

  const nextLevelXp = getNextLevelXp(unlockedMonsters.length);

  return (
    <View style={styles.container}>
      {/* Header info */}
      <View style={styles.header}>
        <View style={styles.headerStat}>
          <Text style={styles.statLabel}>TıkTık</Text>
          <Text style={styles.statValue}>{tikTik.toLocaleString()}</Text>
        </View>
        <TouchableOpacity style={styles.monsterSelectBtn} onPress={() => setShowMonsterPicker(true)}>
          <Text style={styles.monsterSelectText}>{t(lang, 'monster_select')}</Text>
        </TouchableOpacity>
        <View style={styles.headerStat}>
          <Text style={styles.statLabel}>XP</Text>
          <Text style={styles.statValue}>{xp.toLocaleString()}</Text>
        </View>
      </View>

      {/* Idle XP Buffer Bar */}
      {purchasedIdleSystems.length > 0 && (
        <TouchableOpacity
          style={styles.xpBufferContainer}
          onPress={collectIdleXpBuffer}
          activeOpacity={idleXpBuffer > 0 ? 0.7 : 1}
        >
          <Text style={styles.xpBufferLabel}>
            🔮 {lang === 'tr' ? 'XP Havuzu' : 'XP Pool'}
          </Text>
          {(() => {
              const cap = getXpStorageCapacity(xpStorageLevel);
              const buffered = Math.floor(idleXpBuffer);
              const full = buffered >= cap;
              return (
                <>
                  <View style={styles.xpBufferTrack}>
                    <View
                      style={[
                        styles.xpBufferFill,
                        { width: `${(Math.min(buffered, cap) / cap) * 100}%` as any },
                        full && styles.xpBufferFull,
                      ]}
                    />
                  </View>
                  <Text style={[styles.xpBufferValue, full && { color: COLORS.GOLD }]}>
                    {buffered} / {cap} XP
                    {full ? (lang === 'tr' ? ' — DOLU! 👆' : ' — FULL! 👆') : ''}
                  </Text>
                </>
              );
            })()}
        </TouchableOpacity>
      )}

      {/* Monster info row */}
      <View style={styles.monsterInfo}>
        <Text style={[styles.monsterName, { color: monster.color }]}>
          {monster.name}
        </Text>
        <Text style={styles.monsterLevel}>Lvl {monster.level}</Text>
      </View>

      {/* HP Bar */}
      <View style={styles.hpContainer}>
        <HPBar current={hp} max={monster.maxHp} />
      </View>

      {/* Play area */}
      <ImageBackground
        source={monster.bgImage ?? undefined}
        style={[styles.playArea, { borderColor: monster.color + '44', backgroundColor: monster.playBg, justifyContent: monster.imagePosition }]}
        imageStyle={styles.playAreaBgImage}
        onLayout={onPlayAreaLayout}
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
      >
        {/* Monster */}
        <Animated.View
          style={[styles.monsterWrapper, { transform: [{ scale: monsterScaleAnim }, { translateY: monster.imageOffsetY }] }]}
          pointerEvents="none"
        >
          <Animated.View style={{ transform: [{ scale: defeatAnim }] }}>
            {monster.image != null ? (
              <Image
                source={monster.image}
                style={[styles.monsterImage, { width: 360 * monster.imageScale, height: 360 * monster.imageScale }]}
                resizeMode="contain"
              />
            ) : (
              <Text style={styles.monsterEmoji}>{monster.emoji}</Text>
            )}
          </Animated.View>
        </Animated.View>

        {/* Bubbles */}
        {bubbles.map((b) => (
          <View
            key={b.id}
            style={[
              styles.bubble,
              {
                left: b.x - bubbleSize / 2,
                top: b.y - bubbleSize / 2,
                width: bubbleSize,
                height: bubbleSize,
              },
            ]}
            pointerEvents="none"
          >
            <Text style={[styles.bubbleEmoji, { fontSize: Math.round(bubbleSize * 0.65) }]}>
              {monster.bubbleEmoji}
            </Text>
          </View>
        ))}

        {/* Floating texts */}
        {floatingTexts.map((item) => (
          <FloatingText key={item.id} item={item} onDone={removeFloating} />
        ))}
      </ImageBackground>

      {/* Hint bar */}
      <View style={styles.hintBar}>
        <Text style={styles.hintText} numberOfLines={1}>
          {lang === 'tr'
            ? `Her 5 vuruşta +${monster.hitRewardTikTik} TT • Her 10 vuruşta +${monster.hitRewardXp} XP`
            : `Every 5 hits +${monster.hitRewardTikTik} TT • Every 10 hits +${monster.hitRewardXp} XP`}
        </Text>
        {(() => {
          const activeSys = [...IDLE_SYSTEMS].reverse().find((x) => purchasedIdleSystems.includes(x.id));
          return activeSys ? (
            <Text style={styles.hintIdle} numberOfLines={1}>
              {activeSys.emoji} {t(lang, activeSys.nameKey as any)}
            </Text>
          ) : null;
        })()}
      </View>

      {/* Click Power indicator */}
      <View style={styles.powerRow}>
        {kutsalKilicPurchased ? (
          <>
            <Text style={styles.powerLabel}>⚔️ </Text>
            <Text style={[styles.powerValue, { color: '#B8E0FF' }]}>{1000 * touchMultiplier}</Text>
            <Text style={styles.powerLabel}> / </Text>
            <Text style={[styles.powerValue, { color: COLORS.GOLD }]}>{10000 * touchMultiplier}</Text>
            {touchMultiplier > 1 && <Text style={styles.powerLabel}> ({touchMultiplier}x)</Text>}
          </>
        ) : (
          <>
            <Text style={styles.powerLabel}>⚡ {t(lang, 'shop_click_power')}: </Text>
            <Text style={styles.powerValue}>{(CLICK_POWER_DAMAGE[clickPower - 1] ?? clickPower) * touchMultiplier}</Text>
            {touchMultiplier > 1 && <Text style={styles.powerLabel}> ({touchMultiplier}x)</Text>}
          </>
        )}
      </View>

      {/* Monster Picker Modal */}
      <Modal visible={showMonsterPicker} transparent animationType="slide" onRequestClose={() => setShowMonsterPicker(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalSheet}>
            <Text style={styles.modalTitle}>{t(lang, 'monster_select')}</Text>
            <ScrollView>
              {MONSTERS.filter((m) => m.id !== 11 || unlockedMonsters.includes(11)).map((m) => {
                const unlocked = unlockedMonsters.includes(m.id);
                const active = m.id === activeMonsterId;
                return (
                  <TouchableOpacity
                    key={m.id}
                    style={[
                      styles.monsterRow,
                      active && { borderColor: m.color, borderWidth: 2 },
                      !unlocked && styles.lockedRow,
                    ]}
                    onPress={() => {
                      if (unlocked) {
                        setActiveMonster(m.id);
                        setShowMonsterPicker(false);
                      }
                    }}
                    activeOpacity={unlocked ? 0.7 : 1}
                  >
                    {unlocked && m.image != null ? (
                      <Image source={m.image} style={styles.monsterRowImage} resizeMode="contain" />
                    ) : (
                      <Text style={styles.monsterRowEmoji}>{unlocked ? m.emoji : '🔒'}</Text>
                    )}
                    <View style={styles.monsterRowInfo}>
                      <Text style={[styles.monsterRowName, { color: unlocked ? m.color : COLORS.TEXT_MUTED }]}>
                        {unlocked ? m.name : t(lang, 'ach_locked')}
                      </Text>
                      <Text style={styles.monsterRowSub}>
                        {unlocked
                          ? `HP: ${m.maxHp.toLocaleString()} • Lvl ${m.level}`
                          : t(lang, 'monster_locked', { xp: m.requiredXp.toLocaleString() })}
                      </Text>
                    </View>
                    {active && <Text style={[styles.activeTag, { color: m.color }]}>▶</Text>}
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
            <TouchableOpacity style={styles.modalClose} onPress={() => setShowMonsterPicker(false)}>
              <Text style={styles.modalCloseText}>✕</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Kutsal Kılıç victory overlay */}
      <Modal visible={showKutsalKilic} transparent animationType="fade">
        <View style={styles.kutsalOverlay}>
          <Text style={styles.kutsalEmoji}>⚔️</Text>
          <Text style={styles.kutsalTitle}>
            {lang === 'tr' ? 'KUTSAL KILIÇ AÇILDI!' : 'HOLY SWORD UNLOCKED!'}
          </Text>
          <Text style={styles.kutsalSub}>
            {lang === 'tr' ? 'Baş Melek yenildi!' : 'Archangel defeated!'}
          </Text>
          <Text style={styles.kutsalTikTik}>+1.500.000 TT</Text>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.BG_DARK,
    paddingTop: SPACING.SM,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.MD,
    paddingBottom: SPACING.SM,
  },
  headerStat: { alignItems: 'center', minWidth: 80 },
  statLabel: { fontSize: 11, color: COLORS.TEXT_MUTED, fontWeight: '600', textTransform: 'uppercase' },
  statValue: { fontSize: 18, fontWeight: '800', color: COLORS.GOLD },
  monsterSelectBtn: {
    backgroundColor: COLORS.BG_CARD,
    borderRadius: RADIUS.FULL,
    paddingHorizontal: SPACING.MD,
    paddingVertical: SPACING.XS,
    borderWidth: 1,
    borderColor: COLORS.BORDER,
  },
  monsterSelectText: { color: COLORS.TEXT_SECONDARY, fontSize: 13, fontWeight: '600' },
  monsterInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.SM,
    marginBottom: SPACING.SM,
  },
  monsterName: { fontSize: 22, fontWeight: '900' },
  monsterLevel: { fontSize: 14, color: COLORS.TEXT_SECONDARY, fontWeight: '600' },
  xpBufferContainer: {
    marginHorizontal: SPACING.MD,
    marginBottom: SPACING.SM,
    backgroundColor: COLORS.BG_CARD,
    borderRadius: RADIUS.MD,
    padding: SPACING.SM,
    borderWidth: 1,
    borderColor: COLORS.BORDER,
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.SM,
  },
  xpBufferLabel: { fontSize: 12, color: COLORS.PURPLE, fontWeight: '700', minWidth: 72 },
  xpBufferTrack: {
    flex: 1,
    height: 10,
    backgroundColor: COLORS.BG_ELEVATED,
    borderRadius: RADIUS.FULL,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: COLORS.BORDER,
  },
  xpBufferFill: {
    height: '100%',
    backgroundColor: COLORS.PURPLE,
    borderRadius: RADIUS.FULL,
  },
  xpBufferFull: { backgroundColor: COLORS.GOLD },
  xpBufferValue: { fontSize: 11, color: COLORS.TEXT_SECONDARY, fontWeight: '600', minWidth: 60, textAlign: 'right' },
  hpContainer: { paddingHorizontal: SPACING.MD, marginBottom: SPACING.SM },
  playArea: {
    flex: 1,
    marginHorizontal: SPACING.MD,
    borderRadius: RADIUS.LG,
    borderWidth: 1,
    overflow: 'hidden',
    backgroundColor: COLORS.BG_CARD,
    alignItems: 'center',
  },
  playAreaBgImage: {
    borderRadius: RADIUS.LG,
    opacity: 0.6,
  },
  monsterWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  monsterGlow: {
    position: 'absolute',
    width: 180,
    height: 180,
    borderRadius: 90,
  },
  monsterEmoji: {
    fontSize: 270,
    textShadowColor: 'rgba(0,0,0,0.5)',
    textShadowOffset: { width: 0, height: 4 },
    textShadowRadius: 10,
  },
  monsterImage: {
    width: 360,
    height: 360,
  },
  // imageScale monsters.ts'den okunur, inline style olarak uygulanır
  bubble: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  bubbleEmoji: {},
  hintBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.MD,
    paddingVertical: SPACING.XS,
  },
  hintText: { fontSize: 11, color: COLORS.SECONDARY, fontWeight: '600', flex: 1 },
  hintIdle: { fontSize: 11, color: COLORS.PURPLE, fontWeight: '700', marginLeft: SPACING.SM },
  powerRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingBottom: SPACING.SM,
  },
  powerLabel: { fontSize: 12, color: COLORS.TEXT_MUTED },
  powerValue: { fontSize: 14, color: COLORS.CYAN, fontWeight: '800' },
  // Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: COLORS.OVERLAY,
    justifyContent: 'flex-end',
  },
  modalSheet: {
    backgroundColor: COLORS.BG_CARD,
    borderTopLeftRadius: RADIUS.XL,
    borderTopRightRadius: RADIUS.XL,
    padding: SPACING.MD,
    maxHeight: '75%',
  },
  modalTitle: { ...FONTS.HEADING, textAlign: 'center', marginBottom: SPACING.MD },
  modalClose: {
    position: 'absolute',
    top: SPACING.MD,
    right: SPACING.MD,
    padding: SPACING.SM,
  },
  modalCloseText: { color: COLORS.TEXT_SECONDARY, fontSize: 18, fontWeight: '700' },
  monsterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.BG_CARD2,
    borderRadius: RADIUS.MD,
    padding: SPACING.MD,
    marginBottom: SPACING.SM,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  lockedRow: { opacity: 0.5 },
  monsterRowEmoji: { fontSize: 36, marginRight: SPACING.MD },
  monsterRowImage: { width: 48, height: 48, marginRight: SPACING.MD },
  monsterRowInfo: { flex: 1 },
  monsterRowName: { fontSize: 16, fontWeight: '800' },
  monsterRowSub: { fontSize: 12, color: COLORS.TEXT_MUTED, marginTop: 2 },
  activeTag: { fontSize: 20, fontWeight: '900' },
  kutsalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.88)',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.MD,
  },
  kutsalEmoji: { fontSize: 80 },
  kutsalTitle: {
    fontSize: 28,
    fontWeight: '900',
    color: '#B8E0FF',
    textAlign: 'center',
    letterSpacing: 1,
  },
  kutsalSub: { fontSize: 16, color: COLORS.TEXT_SECONDARY, fontWeight: '600' },
  kutsalTikTik: { fontSize: 22, fontWeight: '900', color: COLORS.GOLD },
});
