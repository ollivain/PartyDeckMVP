import { useEffect } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Screen } from '@/components/ui/Screen';
import { Button } from '@/components/ui/Button';
import { Colors, Radius, Spacing, Typography } from '@/constants/theme';
import { useSessionStore } from '@/store/session';

const RULES = [
  'All cards are optional.',
  'Skip anything, anytime.',
  'Only capture people who are okay with it.',
  'Keep it fun, not forced.',
] as const;

const RULE_ICONS = ['checkmark-circle-outline', 'play-skip-forward-outline', 'camera-outline', 'sparkles-outline'] as const;

export default function RulesScreen() {
  const mode = useSessionStore(s => s.mode);
  const startGame = useSessionStore(s => s.startGame);
  const modeCfg = mode ? Colors.modes[mode] : null;

  useEffect(() => {
    if (!mode) {
      router.replace('/mode');
    }
  }, [mode]);

  const handleStart = () => {
    if (!mode) return;
    startGame();
    router.push('/game');
  };

  return (
    <Screen scroll contentStyle={styles.content}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} hitSlop={8} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={20} color={Colors.textMuted} />
        </TouchableOpacity>
        <Text style={styles.stepLabel}>STEP 3 OF 3</Text>
      </View>

      <View style={styles.titleBlock}>
        <Text style={styles.kicker}>HOUSE RULES</Text>
        <Text style={styles.title}>Before the night starts</Text>
      </View>

      <View style={[styles.rulesPanel, modeCfg && { borderColor: modeCfg.borderSelected }]}>
        {modeCfg ? (
          <View style={[styles.modePill, { backgroundColor: modeCfg.bg, borderColor: modeCfg.borderSelected }]}>
            <Text style={[styles.modePillText, { color: modeCfg.primary }]}>{modeCfg.name.toUpperCase()}</Text>
          </View>
        ) : null}

        <View style={styles.ruleList}>
          {RULES.map((rule, index) => (
            <View key={rule} style={[styles.ruleRow, index === RULES.length - 1 && styles.ruleRowLast]}>
              <View
                style={[
                  styles.ruleIcon,
                  modeCfg && { backgroundColor: modeCfg.bg, borderColor: modeCfg.borderSelected },
                ]}
              >
                <Ionicons name={RULE_ICONS[index]} size={18} color={modeCfg?.primary ?? Colors.accent} />
              </View>
              <Text style={styles.ruleText}>{rule}</Text>
            </View>
          ))}
        </View>
      </View>

      <View style={styles.footer}>
        <Button label="Start the night" onPress={handleStart} fullWidth disabled={!mode} />
        <Button label="Back" onPress={() => router.back()} variant="ghost" fullWidth />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: {
    justifyContent: 'space-between',
  },
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
    marginBottom: Spacing.xxl,
  },
  kicker: {
    ...Typography.label,
    color: Colors.accent,
    marginBottom: Spacing.sm,
  },
  title: {
    ...Typography.h1,
    color: Colors.text,
  },
  rulesPanel: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.xxl,
    borderWidth: 1.5,
    borderColor: Colors.accentBorder,
    padding: Spacing.md,
    marginBottom: Spacing.lg,
  },
  modePill: {
    alignSelf: 'flex-start',
    borderRadius: Radius.full,
    borderWidth: 1,
    paddingVertical: 6,
    paddingHorizontal: 12,
    marginBottom: Spacing.sm,
  },
  modePillText: {
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 1,
  },
  ruleList: {
    gap: 0,
  },
  ruleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderSubtle,
  },
  ruleRowLast: {
    borderBottomWidth: 0,
  },
  ruleIcon: {
    width: 38,
    height: 38,
    borderRadius: Radius.full,
    backgroundColor: Colors.accentBg,
    borderWidth: 1,
    borderColor: Colors.accentBorder,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ruleText: {
    flex: 1,
    fontSize: 16,
    fontWeight: '700',
    color: Colors.text,
    lineHeight: 22,
  },
  footer: {
    gap: Spacing.sm,
    paddingTop: Spacing.lg,
    paddingBottom: Spacing.md,
  },
});
