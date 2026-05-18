import 'react-native-gesture-handler';
import React, { useEffect } from 'react';
import { AppState, AppStateStatus, View, Text, ScrollView } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { StatusBar } from 'expo-status-bar';
import AppNavigator from './src/navigation/AppNavigator';
import { useGameStore, loadPersistedState, saveState } from './src/store/gameStore';
import { IDLE_SYSTEMS } from './src/constants/shop';
import { preloadSounds, unloadSounds } from './src/utils/soundManager';

interface EBState { error: Error | null }
class ErrorBoundary extends React.Component<{ children: React.ReactNode }, EBState> {
  state: EBState = { error: null };
  static getDerivedStateFromError(e: Error) { return { error: e }; }
  render() {
    if (this.state.error) {
      return (
        <View style={{ flex: 1, backgroundColor: '#0f0c29', justifyContent: 'center', padding: 24 }}>
          <Text style={{ color: '#FF4757', fontSize: 18, fontWeight: 'bold', marginBottom: 12 }}>
            Hata:
          </Text>
          <ScrollView>
            <Text style={{ color: '#fff', fontSize: 13 }}>{this.state.error.message}</Text>
            <Text style={{ color: '#aaa', fontSize: 11, marginTop: 8 }}>{this.state.error.stack}</Text>
          </ScrollView>
        </View>
      );
    }
    return this.props.children;
  }
}

function AppInner() {
  const saveTimestamp = useGameStore((s) => s.saveTimestamp);
  const calculateOfflineProgress = useGameStore((s) => s.calculateOfflineProgress);
  const checkDailyStreak = useGameStore((s) => s.checkDailyStreak);

  useEffect(() => {
    loadPersistedState().then(() => {
      calculateOfflineProgress();
      checkDailyStreak();
    });
    preloadSounds().catch(() => {});

    const saveInterval = setInterval(saveState, 10000);

    const idleInterval = setInterval(() => {
      const s = useGameStore.getState();
      if (s.purchasedIdleSystems.length === 0) return;
      const activeSys = [...IDLE_SYSTEMS].reverse().find((x) => s.purchasedIdleSystems.includes(x.id));
      if (activeSys) s.addIdleXpBuffer(activeSys.xpPerSec);
    }, 1000);

    const subscription = AppState.addEventListener('change', (nextState: AppStateStatus) => {
      if (nextState === 'background' || nextState === 'inactive') {
        saveTimestamp();
        saveState();
      }
      if (nextState === 'active') {
        calculateOfflineProgress();
      }
    });

    return () => {
      clearInterval(saveInterval);
      clearInterval(idleInterval);
      subscription.remove();
      unloadSounds();
    };
  }, []);

  return (
    <>
      <StatusBar style="light" />
      <AppNavigator />
    </>
  );
}

export default function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <ErrorBoundary>
        <AppInner />
      </ErrorBoundary>
    </GestureHandlerRootView>
  );
}
