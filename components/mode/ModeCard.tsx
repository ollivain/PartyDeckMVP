import { StyleSheet, Text, View } from 'react-native';
import { Colors, Radius, Spacing } from '@/constants/theme';
import { PressableScale } from '@/components/ui/PressableScale';
import type { Mode } from '@/data/types';

const INTENSITY: Record<Mode, number> = { chill: 1, spicy: 2, wild: 3 };
const INTENSITY_LABEL: Record<Mode, string> = {
  chill: 'Low key',
  spicy: 'Getting personal',
  wild: 'Full chaos',
};

type ModeCardProps = {
  mode: Mode;
  selected: boolean;
  onPress: () => void;
};

export function ModeCard({ mode, selected, onPress }: ModeCardProps) {
  const cfg = Colors.modes[mode];
  const level = INTENSITY[mode];

  return (
    <PressableScale
      onPress={onPress}
      activeOpacity={0.8}
      pressedScale={0.985}
      style={[
        styles.card,
        selected
          ? {
              backgroundColor: cfg.bgSelected,
              borderColor: cfg.borderSelected,
              borderWidth: 1.5,
            }
          : {
              backgroundColor: Colors.surface,
              borderColor: Colors.border,
              borderWidth: 1,
            },
      ]}
    >
      {/* Left accent bar when selected */}
      {selected && (
        <View style={[styles.accentBar, { backgroundColor: cfg.primary }]} />
      )}

      {/* Emoji container */}
      <View style={[
        styles.emojiBox,
        selected
          ? { backgroundColor: cfg.bg }
          : { backgroundColor: Colors.surface2 },
      ]}>
        <Text style={styles.emoji}>{cfg.emoji}</Text>
      </View>

      {/* Text */}
      <View style={styles.text}>
        <Text style={[styles.name, { color: selected ? cfg.primary : Colors.text }]}>
          {cfg.name}
        </Text>
        <Text style={[styles.desc, selected && { color: Colors.textMuted }]}>
          {cfg.description}
        </Text>
        <Text style={[styles.intensityLabel, selected && { color: cfg.primary }]}>
          {INTENSITY_LABEL[mode]}
        </Text>
      </View>

      {/* Right side: dots or checkmark */}
      <View style={styles.right}>
        {selected ? (
          <View style={[styles.check, { backgroundColor: cfg.primary }]}>
            <Text style={styles.checkText}>✓</Text>
          </View>
        ) : (
          <View style={styles.dots}>
            {[0, 1, 2].map(i => (
              <View
                key={i}
                style={[
                  styles.dot,
                  { backgroundColor: i < level ? cfg.primary : Colors.surface2 },
                ]}
              />
            ))}
          </View>
        )}
      </View>
    </PressableScale>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    borderRadius: Radius.xl,
    padding: Spacing.lg,
    alignItems: 'center',
    gap: Spacing.md,
    overflow: 'hidden',
  },
  accentBar: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 3,
  },
  emojiBox: {
    width: 52,
    height: 52,
    borderRadius: Radius.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emoji: {
    fontSize: 26,
  },
  text: {
    flex: 1,
    gap: 3,
  },
  name: {
    fontSize: 17,
    fontWeight: '700',
    letterSpacing: -0.2,
    color: Colors.text,
  },
  desc: {
    fontSize: 13,
    color: Colors.textDim,
    lineHeight: 18,
  },
  intensityLabel: {
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 0.5,
    color: Colors.textDim,
    marginTop: 2,
  },
  right: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  dots: {
    gap: 5,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: Radius.full,
  },
  check: {
    width: 30,
    height: 30,
    borderRadius: Radius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkText: {
    fontSize: 16,
    color: '#0A0908',
    fontWeight: '800',
  },
});
