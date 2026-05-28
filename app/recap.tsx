import { Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Button } from '@/components/ui/Button';
import { AwardCard } from '@/components/recap/AwardCard';
import { Colors, Radius, Spacing, Typography } from '@/constants/theme';
import { useSessionStore } from '@/store/session';
import type { Player, PlayedCard } from '@/store/session';
import type { Mode } from '@/data/types';

function formatDuration(ms: number): string {
  const s = Math.floor(ms / 1000);
  const m = Math.floor(s / 60);
  const h = Math.floor(m / 60);
  if (h > 0) return `${h}h ${m % 60}m`;
  if (m > 0) return `${m}m`;
  return `${s}s`;
}

type Award = { emoji: string; title: string; playerName: string; subtitle?: string };

function computeAwards(players: Player[], played: PlayedCard[]): Award[] {
  if (!players.length || !played.length) return [];

  const stats = players.map(p => ({
    player: p,
    completed: played.filter(c => c.playerId === p.id && !c.skipped).length,
    skips: played.filter(c => c.playerId === p.id && c.skipped).length,
    total: played.filter(c => c.playerId === p.id).length,
  }));

  const awards: Award[] = [];

  const topCompleted = [...stats].sort((a, b) => b.completed - a.completed)[0];
  if (topCompleted.completed > 0) {
    awards.push({
      emoji: '🐾',
      title: 'Party Animal',
      playerName: topCompleted.player.name,
      subtitle: `${topCompleted.completed} completed`,
    });
  }

  const ironWill = stats
    .filter(s => s.skips === 0 && s.total > 0)
    .sort((a, b) => b.total - a.total)[0];
  if (ironWill && players.length > 1) {
    awards.push({
      emoji: '🔥',
      title: 'Iron Will',
      playerName: ironWill.player.name,
      subtitle: 'Zero skips',
    });
  }

  const topSkips = [...stats].sort((a, b) => b.skips - a.skips)[0];
  if (topSkips.skips > 0 && awards.length < 2) {
    awards.push({
      emoji: '🌪️',
      title: 'Most Chaotic',
      playerName: topSkips.player.name,
      subtitle: `${topSkips.skips} skip${topSkips.skips !== 1 ? 's' : ''}`,
    });
  }

  return awards;
}

const MEDALS = ['🥇', '🥈', '🥉'];

const HERO_SUBTITLES: Record<Mode, string> = {
  chill: 'Smooth night, well played 🌊',
  spicy: 'You brought the heat 🔥',
  wild: 'Total chaos achieved 🌀',
};

type StatTileProps = {
  icon: keyof typeof Ionicons.glyphMap;
  value: string | number;
  label: string;
  highlight?: boolean;
};

function StatTile({ icon, value, label, highlight }: StatTileProps) {
  return (
    <View style={styles.statTile}>
      <Ionicons
        name={icon}
        size={18}
        color={highlight ? Colors.modes.spicy.primary : Colors.accent}
      />
      <Text
        style={[styles.statNum, highlight && { color: Colors.modes.spicy.primary }]}
        numberOfLines={1}
        adjustsFontSizeToFit
      >
        {value}
      </Text>
      <Text style={styles.statLabel} numberOfLines={1}>{label}</Text>
    </View>
  );
}

export default function RecapScreen() {
  const players = useSessionStore(s => s.players);
  const mode = useSessionStore(s => s.mode);
  const played = useSessionStore(s => s.played);
  const startedAt = useSessionStore(s => s.startedAt);
  const endedAt = useSessionStore(s => s.endedAt);
  const mediaUris = useSessionStore(s => s.mediaUris);
  const reset = useSessionStore(s => s.reset);

  const duration = startedAt && endedAt ? endedAt - startedAt : 0;
  const totalCompleted = played.filter(p => !p.skipped).length;
  const totalSkipped = played.filter(p => p.skipped).length;
  const modeCfg = mode ? Colors.modes[mode] : null;
  const heroSub = mode ? HERO_SUBTITLES[mode] : '';

  const awards = computeAwards(players, played);

  const playerStats = players
    .map(p => ({
      player: p,
      completed: played.filter(c => c.playerId === p.id && !c.skipped).length,
      skips: played.filter(c => c.playerId === p.id && c.skipped).length,
    }))
    .sort((a, b) => b.completed - a.completed);

  const handlePlayAgain = () => {
    reset();
    router.navigate('/');
  };

  const handleBack = () => {
    reset();
    router.navigate('/');
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>

        {/* Top row: back + mode pill */}
        <View style={styles.topRow}>
          <TouchableOpacity onPress={handleBack} hitSlop={8} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={20} color={Colors.textMuted} />
          </TouchableOpacity>
          {modeCfg && (
            <View style={[styles.modeBadge, { backgroundColor: modeCfg.bg, borderColor: modeCfg.borderSelected }]}>
              <Text style={styles.modeEmoji}>{modeCfg.emoji}</Text>
              <Text style={[styles.modeBadgeText, { color: modeCfg.primary }]}>
                {modeCfg.name.toUpperCase()}
              </Text>
            </View>
          )}
        </View>

        {/* Intro / hero */}
        <Text style={styles.kicker}>NIGHT RECAP</Text>
        <View style={styles.heroRow}>
          <Text style={styles.heroNum} numberOfLines={1} adjustsFontSizeToFit>{totalCompleted}</Text>
          <Text style={styles.heroUnit}>{totalCompleted === 1 ? 'card' : 'cards'}</Text>
        </View>
        <Text style={styles.heroSub}>{heroSub}</Text>
        {duration > 0 && (
          <View style={styles.durationRow}>
            <Ionicons name="time-outline" size={14} color={Colors.textDim} />
            <Text style={styles.duration}>{formatDuration(duration)}</Text>
          </View>
        )}

        {/* Session stats — 4 tiles in one row */}
        <View style={[styles.section, { marginTop: Spacing.xl }]}>
          <Text style={styles.sectionLabel}>SESSION STATS</Text>
          <View style={styles.statRow}>
            <StatTile icon="albums-outline" value={played.length} label="CARDS" />
            <StatTile icon="play-skip-forward" value={totalSkipped} label="SKIPS" highlight={totalSkipped > 0} />
            <StatTile icon="people" value={players.length} label="PLAYERS" />
            <StatTile icon="time-outline" value={duration > 0 ? formatDuration(duration) : '—'} label="TIME" />
          </View>
        </View>

        {/* Player Awards */}
        {awards.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>PLAYER AWARDS</Text>
            <View style={styles.awardRow}>
              {awards.slice(0, 2).map((award, i) => (
                <AwardCard key={i} {...award} />
              ))}
            </View>
          </View>
        )}

        {/* Final Standings */}
        {players.length > 1 && (
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>FINAL STANDINGS</Text>
            <View style={styles.rankCard}>
              {playerStats.map((stat, i) => (
                <View
                  key={stat.player.id}
                  style={[
                    styles.rankRow,
                    i === playerStats.length - 1 && styles.rankRowLast,
                  ]}
                >
                  <Text style={styles.rankMedal}>{MEDALS[i] ?? `${i + 1}`}</Text>
                  <Text style={styles.rankName} numberOfLines={1}>{stat.player.name}</Text>
                  <View style={styles.rankRight}>
                    <Text style={[
                      styles.rankCount,
                      i === 0 && { color: Colors.accent },
                    ]}>
                      {stat.completed}
                    </Text>
                    <Text style={styles.rankUnit}> done</Text>
                  </View>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Media Moments */}
        <View style={styles.section}>
          <View style={styles.sectionRow}>
            <Text style={[styles.sectionLabel, { marginBottom: 0 }]}>MEDIA MOMENTS</Text>
            {mediaUris.length > 0 ? (
              <View style={styles.mediaCountPill}>
                <Text style={styles.mediaCountText}>{mediaUris.length}</Text>
              </View>
            ) : (
              <View style={styles.comingSoonPill}>
                <Text style={styles.comingSoonText}>SOON</Text>
              </View>
            )}
          </View>

          {mediaUris.length > 0 ? (
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.thumbRow}
            >
              {mediaUris.map((uri, i) => (
                <View key={i} style={styles.thumbWrap}>
                  <Image
                    source={{ uri }}
                    style={styles.thumb}
                    resizeMode="cover"
                  />
                </View>
              ))}
            </ScrollView>
          ) : (
            <View style={styles.mediaGrid}>
              {[0, 1, 2, 3].map(i => (
                <View key={i} style={styles.mediaSlot}>
                  <Ionicons name="camera-outline" size={20} color={Colors.textDim} />
                </View>
              ))}
            </View>
          )}
        </View>

        {/* Play Again */}
        <View style={styles.footer}>
          <Button label="Play Again →" onPress={handlePlayAgain} fullWidth />
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.bg,
  },
  scroll: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.xxxl,
  },

  // Top row
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
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
  modeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 6,
    paddingHorizontal: Spacing.md,
    borderRadius: Radius.full,
    borderWidth: 1,
  },
  modeEmoji: {
    fontSize: 13,
  },
  modeBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1.3,
  },

  // Hero
  kicker: {
    ...Typography.label,
    color: Colors.textMuted,
    marginBottom: Spacing.sm,
  },
  heroRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: Spacing.sm,
  },
  heroNum: {
    fontSize: 88,
    fontWeight: '900',
    color: Colors.text,
    letterSpacing: -4,
    lineHeight: 90,
  },
  heroUnit: {
    fontSize: 38,
    fontWeight: '800',
    color: Colors.accent,
    letterSpacing: -1.5,
    marginBottom: 10,
  },
  heroSub: {
    fontSize: 17,
    fontWeight: '500',
    color: Colors.textMuted,
    marginTop: Spacing.sm,
    letterSpacing: -0.2,
  },
  durationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginTop: Spacing.sm,
  },
  duration: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.textDim,
  },

  // Sections
  section: {
    marginTop: Spacing.xl,
  },
  sectionLabel: {
    ...Typography.label,
    color: Colors.textMuted,
    marginBottom: Spacing.md,
  },
  sectionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginBottom: Spacing.md,
  },

  // Stat row — 4 in a line
  statRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  statTile: {
    flex: 1,
    backgroundColor: Colors.surface,
    borderRadius: Radius.lg,
    paddingVertical: Spacing.md,
    paddingHorizontal: 8,
    borderWidth: 1,
    borderColor: Colors.borderSubtle,
    alignItems: 'center',
    gap: 6,
  },
  statNum: {
    fontSize: 22,
    fontWeight: '800',
    color: Colors.text,
    letterSpacing: -1,
  },
  statLabel: {
    fontSize: 10,
    fontWeight: '600',
    color: Colors.textMuted,
    letterSpacing: 0.6,
    textAlign: 'center',
  },

  // Awards row
  awardRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },

  // Leaderboard
  rankCard: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.xl,
    borderWidth: 1,
    borderColor: Colors.borderSubtle,
    overflow: 'hidden',
  },
  rankRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderSubtle,
  },
  rankRowLast: {
    borderBottomWidth: 0,
  },
  rankMedal: {
    fontSize: 20,
    width: 32,
  },
  rankName: {
    flex: 1,
    fontSize: 15,
    fontWeight: '600',
    color: Colors.text,
    letterSpacing: -0.2,
  },
  rankRight: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  rankCount: {
    fontSize: 18,
    fontWeight: '800',
    color: Colors.text,
    letterSpacing: -0.5,
  },
  rankUnit: {
    fontSize: 13,
    color: Colors.textMuted,
  },

  // Media moments — thumbnails
  thumbRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
    paddingRight: Spacing.sm,
  },
  thumbWrap: {
    width: 100,
    height: 100,
    borderRadius: Radius.lg,
    overflow: 'hidden',
    backgroundColor: Colors.surface2,
  },
  thumb: {
    width: 100,
    height: 100,
  },
  mediaCountPill: {
    backgroundColor: Colors.accentBg,
    borderRadius: Radius.full,
    paddingVertical: 3,
    paddingHorizontal: 10,
    borderWidth: 1,
    borderColor: Colors.accentBorder,
  },
  mediaCountText: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.accent,
    letterSpacing: 0.3,
  },

  // Media moments — placeholder
  comingSoonPill: {
    backgroundColor: Colors.surface2,
    borderRadius: Radius.full,
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  comingSoonText: {
    fontSize: 9,
    fontWeight: '700',
    color: Colors.textDim,
    letterSpacing: 1.2,
  },
  mediaGrid: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  mediaSlot: {
    flex: 1,
    aspectRatio: 0.95,
    backgroundColor: Colors.surface,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: Colors.borderSubtle,
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Footer
  footer: {
    marginTop: Spacing.xl,
  },
});
