import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useGameStore } from '../store/gameStore';
import { t } from '../i18n';
import { COLORS, RADIUS } from '../constants/theme';

import MonsterScreen from '../screens/MonsterScreen';
import ShopScreen from '../screens/ShopScreen';
import ProfileScreen from '../screens/ProfileScreen';
import AchievementsScreen from '../screens/AchievementsScreen';
import SettingsScreen from '../screens/SettingsScreen';
import WelcomeScreen from '../screens/WelcomeScreen';

const Tab = createBottomTabNavigator();

function TabIcon({ emoji, focused }: { emoji: string; focused: boolean }) {
  return (
    <View style={[iconStyles.wrapper, focused && iconStyles.wrapperActive]}>
      <Text style={[iconStyles.emoji, focused && iconStyles.emojiActive]}>{emoji}</Text>
    </View>
  );
}

const iconStyles = StyleSheet.create({
  wrapper: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  wrapperActive: {
    backgroundColor: COLORS.PRIMARY + '22',
  },
  emoji: { fontSize: 20, opacity: 0.5 },
  emojiActive: { opacity: 1 },
});

export default function AppNavigator() {
  const nickname = useGameStore((s) => s.nickname);
  const lang = useGameStore((s) => s.language);
  const unlockedAchievements = useGameStore((s) => s.unlockedAchievements);

  const claimableCount = unlockedAchievements.filter((a) => !a.claimed).length;

  if (!nickname) {
    return (
      <NavigationContainer>
        <WelcomeScreen />
      </NavigationContainer>
    );
  }

  return (
    <NavigationContainer>
      <Tab.Navigator
        initialRouteName="Monster"
        screenOptions={{
          headerStyle: { backgroundColor: COLORS.BG_DARK, borderBottomWidth: 0, elevation: 0 },
          headerTintColor: COLORS.TEXT,
          headerTitleStyle: { fontWeight: '900', fontSize: 18 },
          tabBarStyle: {
            backgroundColor: COLORS.BG_CARD,
            borderTopColor: COLORS.BORDER,
            borderTopWidth: 1,
            height: 60,
            paddingBottom: 6,
          },
          tabBarActiveTintColor: COLORS.PRIMARY,
          tabBarInactiveTintColor: COLORS.TEXT_MUTED,
          tabBarLabelStyle: { fontSize: 10, fontWeight: '700' },
        }}
      >
        <Tab.Screen
          name="Shop"
          component={ShopScreen}
          options={{
            title: t(lang, 'nav_shop'),
            tabBarLabel: t(lang, 'nav_shop'),
            tabBarIcon: ({ focused }) => <TabIcon emoji="🛒" focused={focused} />,
          }}
        />
        <Tab.Screen
          name="Profile"
          component={ProfileScreen}
          options={{
            title: t(lang, 'nav_profile'),
            tabBarLabel: t(lang, 'nav_profile'),
            tabBarIcon: ({ focused }) => <TabIcon emoji="👤" focused={focused} />,
          }}
        />
        <Tab.Screen
          name="Monster"
          component={MonsterScreen}
          options={{
            title: 'TıkTık',
            tabBarLabel: t(lang, 'nav_monster'),
            tabBarIcon: ({ focused }) => (
              <View style={{ alignItems: 'center' }}>
                <View
                  style={{
                    width: 52,
                    height: 52,
                    borderRadius: 26,
                    backgroundColor: COLORS.PRIMARY,
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: -8,
                    shadowColor: COLORS.PRIMARY,
                    shadowOffset: { width: 0, height: 4 },
                    shadowOpacity: 0.5,
                    shadowRadius: 8,
                    elevation: 8,
                    borderWidth: 3,
                    borderColor: COLORS.BG_CARD,
                  }}
                >
                  <Text style={{ fontSize: 26 }}>👾</Text>
                </View>
              </View>
            ),
          }}
        />
        <Tab.Screen
          name="Achievements"
          component={AchievementsScreen}
          options={{
            title: t(lang, 'nav_achievements'),
            tabBarLabel: t(lang, 'nav_achievements'),
            tabBarIcon: ({ focused }) => <TabIcon emoji="🏆" focused={focused} />,
            tabBarBadge: claimableCount > 0 ? claimableCount : undefined,
          }}
        />
        <Tab.Screen
          name="Settings"
          component={SettingsScreen}
          options={{
            title: t(lang, 'nav_settings'),
            tabBarLabel: t(lang, 'nav_settings'),
            tabBarIcon: ({ focused }) => <TabIcon emoji="⚙️" focused={focused} />,
          }}
        />
      </Tab.Navigator>
    </NavigationContainer>
  );
}
