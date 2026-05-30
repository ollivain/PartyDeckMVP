import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Screen } from '@/components/ui/Screen';
import { Button } from '@/components/ui/Button';
import { PressableScale } from '@/components/ui/PressableScale';
import { Colors, Radius, Spacing, Typography } from '@/constants/theme';
import { useSessionStore } from '@/store/session';
import type { GameType } from '@/data/types';

type GameOption = {
  id: GameType;
  title: string;
  description: string;
  icon: keyof typeof Ionicons.glyphMap;
  comingSoon?: boolean;
};

const GAME_OPTIONS: GameOption[] = [
  {
    id: 'classic',
    title: 'NiteDeck Classic',
    description: 'Group prompts, camera moments and chaotic recaps.',
    icon: 'albums',
  },
  {
    id: 'truth-or-dare',
    title: 'Truth or Dare',
    description: 'Pick Truth or Dare each turn. Chill, Spicy or Wild.',
    icon: 'help-buoy',
  },
];

export default function GameTypeScreen() {
  const setGameType = useSessionStore(s => s.setGameType);

  const handleSelect = (gameType: GameType) => {
    setGameType(gameType);
    router.push('/players');
  };

  return (
    <Screen scroll>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} hitSlop={8} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={20} color={Colors.textMuted} />
        </TouchableOpacity>
        <Text style={styles.stepLabel}>STEP 1 OF 4</Text>
      </View>

      <View style={styles.titleBlock}>
        <Text style={styles.title}>
          <Text style={{ color: Colors.text }}>Choose your </Text>
          <Text style={{ color: Colors.accent }}>game</Text>
        </Text>
        <Text style={styles.subtitle}>Pick the original group deck or a round of Truth or Dare.</Text>
      </View>

      <View style={styles.optionList}>
        {GAME_OPTIONS.map(option => {
          const disabled = Boolean(option.comingSoon);
          const isClassic = option.id === 'classic';

          return (
            <PressableScale
              key={option.id}
              onPress={() => handleSelect(option.id)}
              disabled={disabled}
              activeOpacity={0.82}
              pressedScale={0.985}
              style={[
                styles.optionCard,
                isClassic && styles.optionCardPrimary,
                disabled && styles.optionCardDisabled,
              ]}
            >
              {isClassic && <View style={styles.accentBar} />}

              <View style={[styles.iconBox, isClassic && styles.iconBoxPrimary]}>
                <Ionicons
                  name={option.icon}
                  size={24}
                  color={isClassic ? Colors.accent : Colors.textDim}
                />
              </View>

              <View style={styles.optionText}>
                <View style={styles.optionTitleRow}>
                  <Text style={[styles.optionTitle, isClassic && { color: Colors.accent }]}>
                    {option.title}
                  </Text>
                  {option.comingSoon ? (
                    <View style={styles.soonPill}>
                      <Text style={styles.soonText}>COMING SOON</Text>
                    </View>
                  ) : null}
                </View>
                <Text style={styles.optionDescription}>{option.description}</Text>
                {isClassic ? (
                  <Text style={styles.optionMeta}>Original NiteDeck flow</Text>
                ) : (
                  <Text style={styles.optionMeta}>New MVP mode</Text>
                )}
              </View>

              <View style={styles.rightIcon}>
                <Ionicons
                  name="chevron-forward"
                  size={20}
                  color={isClassic ? Colors.accent : Colors.textMuted}
                />
              </View>
            </PressableScale>
          );
        })}
      </View>

      <View style={styles.footer}>
        <Button label="Continue with Classic" onPress={() => handleSelect('classic')} fullWidth />
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
  optionList: {
    gap: Spacing.md,
    marginBottom: Spacing.xl,
  },
  optionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    borderRadius: Radius.xl,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.surface,
    padding: Spacing.lg,
    overflow: 'hidden',
  },
  optionCardPrimary: {
    borderWidth: 1.5,
    borderColor: Colors.accentBorder,
    backgroundColor: Colors.accentBg,
  },
  optionCardDisabled: {
    opacity: 0.62,
  },
  accentBar: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 3,
    backgroundColor: Colors.accent,
  },
  iconBox: {
    width: 52,
    height: 52,
    borderRadius: Radius.lg,
    backgroundColor: Colors.surface2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconBoxPrimary: {
    backgroundColor: Colors.surface,
  },
  optionText: {
    flex: 1,
    gap: 4,
  },
  optionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  optionTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: Colors.text,
    letterSpacing: -0.2,
  },
  soonPill: {
    borderRadius: Radius.full,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingVertical: 4,
    paddingHorizontal: 8,
    backgroundColor: Colors.surface2,
  },
  soonText: {
    fontSize: 9,
    fontWeight: '900',
    color: Colors.textDim,
    letterSpacing: 0.7,
  },
  optionDescription: {
    fontSize: 13,
    color: Colors.textMuted,
    lineHeight: 18,
  },
  optionMeta: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.textDim,
    letterSpacing: 0.5,
    marginTop: 2,
  },
  rightIcon: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  footer: {
    paddingTop: Spacing.lg,
    paddingBottom: Spacing.md,
  },
});
