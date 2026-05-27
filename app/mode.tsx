import { useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Screen } from '@/components/ui/Screen';
import { Button } from '@/components/ui/Button';
import { ModeCard } from '@/components/mode/ModeCard';
import { Colors, Radius, Spacing, Typography } from '@/constants/theme';
import { useSessionStore } from '@/store/session';
import type { Mode } from '@/data/types';

const MODES: Mode[] = ['chill', 'spicy', 'wild'];

export default function ModeScreen() {
  const setMode = useSessionStore(s => s.setMode);
  const startGame = useSessionStore(s => s.startGame);
  const [selected, setSelected] = useState<Mode | null>(null);

  const handleSelect = (mode: Mode) => {
    setSelected(mode);
    setMode(mode);
  };

  const handleStart = () => {
    if (!selected) return;
    startGame();
    router.push('/game');
  };

  return (
    <Screen scroll>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} hitSlop={8} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={20} color={Colors.textMuted} />
        </TouchableOpacity>
        <Text style={styles.stepLabel}>STEP 2 OF 2</Text>
      </View>

      <View style={styles.titleBlock}>
        <Text style={styles.title}>
          <Text style={{ color: Colors.text }}>Pick your </Text>
          <Text style={{ color: Colors.accent }}>vibe</Text>
        </Text>
        <Text style={styles.subtitle}>Choose how wild tonight gets</Text>
      </View>

      <View style={styles.modeList}>
        {MODES.map(mode => (
          <ModeCard
            key={mode}
            mode={mode}
            selected={selected === mode}
            onPress={() => handleSelect(mode)}
          />
        ))}
      </View>

      <View style={styles.footer}>
        <Button
          label="Let's Play →"
          onPress={handleStart}
          fullWidth
          disabled={!selected}
        />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: Spacing.md,
    marginBottom: Spacing.xl,
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: Radius.full,
    backgroundColor: Colors.surface2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepLabel: {
    ...Typography.label,
    color: Colors.textDim,
  },
  titleBlock: {
    marginBottom: Spacing.xl,
  },
  title: {
    ...Typography.h1,
    color: Colors.text,
    marginBottom: Spacing.sm,
  },
  subtitle: {
    ...Typography.body,
    color: Colors.textMuted,
  },
  modeList: {
    gap: Spacing.md,
    marginBottom: Spacing.xl,
  },
  footer: {
    paddingBottom: Spacing.md,
  },
});
