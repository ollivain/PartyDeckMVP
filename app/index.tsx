import { StyleSheet, Text, View, type DimensionValue } from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Button } from '@/components/ui/Button';
import { Colors, Radius, Spacing, Typography } from '@/constants/theme';
import { useSessionStore } from '@/store/session';

type Speck = {
  top?: DimensionValue;
  bottom?: DimensionValue;
  left?: DimensionValue;
  right?: DimensionValue;
  size: number;
  opacity: number;
  rotate: number;
};

const SPECKS: Speck[] = [
  { top: '8%', left: '18%', size: 6, opacity: 0.18, rotate: 22 },
  { top: '14%', right: '24%', size: 4, opacity: 0.14, rotate: 40 },
  { top: '22%', left: '8%', size: 5, opacity: 0.12, rotate: -15 },
  { top: '30%', right: '12%', size: 7, opacity: 0.16, rotate: 18 },
  { top: '38%', left: '28%', size: 4, opacity: 0.10, rotate: 33 },
  { top: '46%', right: '32%', size: 5, opacity: 0.12, rotate: -25 },
  { top: '54%', left: '15%', size: 6, opacity: 0.15, rotate: 12 },
  { top: '60%', right: '8%', size: 4, opacity: 0.10, rotate: 28 },
  { bottom: '32%', left: '22%', size: 5, opacity: 0.13, rotate: -8 },
  { bottom: '24%', right: '18%', size: 6, opacity: 0.14, rotate: 20 },
];

export default function HomeScreen() {
  const reset = useSessionStore(s => s.reset);

  const handleStart = () => {
    reset();
    router.push('/game-type');
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Atmospheric background */}
      <View pointerEvents="none" style={StyleSheet.absoluteFill}>
        {/* Warm glow top-right */}
        <View style={styles.bgGlow} />
        {/* Secondary glow further down */}
        <View style={styles.bgGlow2} />
        {/* Confetti specks */}
        {SPECKS.map((s, i) => (
          <View
            key={i}
            style={[
              styles.speck,
              {
                top: s.top,
                bottom: s.bottom,
                left: s.left,
                right: s.right,
                width: s.size,
                height: s.size,
                opacity: s.opacity,
                transform: [{ rotate: `${s.rotate}deg` }],
              },
            ]}
          />
        ))}
      </View>

      <View style={styles.inner}>
        {/* Hero */}
        <View style={styles.hero}>
          <View style={styles.badge}>
            <Ionicons name="albums" size={12} color={Colors.accent} />
            <Text style={styles.badgeText}>PARTY GAME</Text>
          </View>

          <Text
            style={styles.title}
            numberOfLines={1}
            adjustsFontSizeToFit
            minimumFontScale={0.7}
          >
            <Text style={{ color: Colors.text }}>Nite</Text>
            <Text style={{ color: Colors.accent }}>Deck</Text>
          </Text>

          <View style={styles.divider} />

          <Text style={styles.tagline}>One phone.</Text>
          <Text style={styles.tagline}>One night.</Text>
          <Text style={styles.tagline}>Unlimited chaos.</Text>
        </View>

        {/* Footer CTA */}
        <View style={styles.footer}>
          <Button label="Let's Play →" onPress={handleStart} fullWidth />
          <Text style={styles.hint}>2+ players · any time · free</Text>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.bg,
  },
  bgGlow: {
    position: 'absolute',
    width: 500,
    height: 500,
    borderRadius: 250,
    backgroundColor: 'rgba(249, 115, 22, 0.045)',
    top: -200,
    right: -200,
  },
  bgGlow2: {
    position: 'absolute',
    width: 360,
    height: 360,
    borderRadius: 180,
    backgroundColor: 'rgba(249, 115, 22, 0.02)',
    top: 60,
    right: -160,
  },
  speck: {
    position: 'absolute',
    backgroundColor: Colors.accent,
    borderRadius: 1,
  },
  inner: {
    flex: 1,
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.xl,
    justifyContent: 'space-between',
  },
  hero: {
    flex: 1,
    justifyContent: 'center',
  },
  badge: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: Colors.accentBg,
    borderRadius: Radius.full,
    paddingVertical: 6,
    paddingHorizontal: 14,
    marginBottom: Spacing.xl,
    borderWidth: 1,
    borderColor: Colors.accentBorder,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.accent,
    letterSpacing: 1.5,
  },
  title: {
    fontSize: 72,
    fontWeight: '800',
    letterSpacing: -4,
    lineHeight: 74,
    marginBottom: Spacing.lg,
  },
  divider: {
    height: 2,
    width: 56,
    backgroundColor: Colors.accent,
    marginBottom: Spacing.lg,
    borderRadius: 1,
  },
  tagline: {
    fontSize: 22,
    fontWeight: '500',
    color: Colors.textMuted,
    lineHeight: 32,
    letterSpacing: -0.3,
  },
  footer: {
    gap: Spacing.md,
    alignItems: 'center',
  },
  hint: {
    ...Typography.small,
    color: Colors.textDim,
    letterSpacing: 0.3,
  },
});
