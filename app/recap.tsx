import { useState } from 'react';
import { router } from 'expo-router';
import { Alert, Image, Modal, PanResponder, ScrollView, StyleProp, StyleSheet, Text, TouchableOpacity, View, ViewStyle } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as Sharing from 'expo-sharing';
import { useVideoPlayer, VideoView } from 'expo-video';
import { Button } from '@/components/ui/Button';
import { AwardCard } from '@/components/recap/AwardCard';
import { Colors, Radius, Spacing, Typography } from '@/constants/theme';
import { cardsById } from '@/data/cards';
import type { Mode } from '@/data/types';
import { useSessionStore } from '@/store/session';
import type { MediaMoment, Player, PlayedCard } from '@/store/session';

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
  chill: 'Good vibes all around',
  spicy: 'You brought the heat',
  wild: 'Chaos captured perfectly',
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
        size={15}
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

type MediaTileProps = {
  moment: MediaMoment;
  onPress: () => void;
  style?: StyleProp<ViewStyle>;
  moreCount?: number;
};

function VideoMomentContent({ uri }: { uri: string }) {
  const player = useVideoPlayer(uri, player => {
    player.loop = true;
    player.muted = true;
  });

  return (
    <View style={styles.mediaFill}>
      <VideoView
        player={player}
        style={styles.mediaFill}
        nativeControls={false}
        contentFit="cover"
        surfaceType="textureView"
      />
      <View style={styles.videoShade} />
      <View style={styles.videoPlayBadge}>
        <Ionicons name="play" size={18} color="#0A0908" />
      </View>
      <View style={styles.videoTypeBadge}>
        <Text style={styles.videoTypeText}>VIDEO</Text>
      </View>
    </View>
  );
}

function MediaMomentTile({ moment, onPress, style, moreCount }: MediaTileProps) {
  return (
    <TouchableOpacity style={[styles.mediaTile, style]} onPress={onPress} activeOpacity={0.88}>
      {moment.mediaType === 'video' ? (
        <VideoMomentContent uri={moment.uri} />
      ) : (
        <Image source={{ uri: moment.uri }} style={styles.mediaFill} resizeMode="cover" />
      )}
      {moreCount ? (
        <View style={styles.moreOverlay}>
          <Text style={styles.moreText}>+{moreCount}</Text>
        </View>
      ) : null}
    </TouchableOpacity>
  );
}

type MemoryWallProps = {
  mediaItems: MediaMoment[];
  onOpenMedia: (index: number) => void;
};

function MemoryWall({ mediaItems, onOpenMedia }: MemoryWallProps) {
  const visibleItems = mediaItems.slice(0, 5);
  const moreCount = Math.max(0, mediaItems.length - visibleItems.length);

  if (mediaItems.length === 0) {
    return (
      <View style={styles.memoryEmpty}>
        <View style={styles.memoryEmptyIcon}>
          <Ionicons name="camera-outline" size={24} color={Colors.accent} />
        </View>
        <Text style={styles.memoryEmptyTitle}>No moments captured yet</Text>
        <Text style={styles.memoryEmptyText}>
          Camera Moments will turn next night&apos;s recap into a wall worth scrolling.
        </Text>
      </View>
    );
  }

  if (visibleItems.length === 1) {
    return (
      <View style={styles.memorySingle}>
        <MediaMomentTile moment={visibleItems[0]} onPress={() => onOpenMedia(0)} style={styles.singleTile} />
      </View>
    );
  }

  if (visibleItems.length === 2) {
    return (
      <View style={styles.memoryPair}>
        {visibleItems.map((moment, i) => (
          <MediaMomentTile
            key={`${moment.uri}-${i}`}
            moment={moment}
            onPress={() => onOpenMedia(i)}
            style={styles.pairTile}
          />
        ))}
      </View>
    );
  }

  if (visibleItems.length === 3) {
    return (
      <View style={styles.memoryCollage}>
        <MediaMomentTile moment={visibleItems[0]} onPress={() => onOpenMedia(0)} style={styles.collageHeroTile} />
        <View style={styles.collageSideColumn}>
          {visibleItems.slice(1).map((moment, i) => (
            <MediaMomentTile
              key={`${moment.uri}-${i + 1}`}
              moment={moment}
              onPress={() => onOpenMedia(i + 1)}
              style={styles.columnTile}
            />
          ))}
        </View>
      </View>
    );
  }

  return (
    <View style={styles.memoryCollage}>
      <MediaMomentTile moment={visibleItems[0]} onPress={() => onOpenMedia(0)} style={styles.collageHeroTile} />
      <View style={styles.collageSide}>
        {visibleItems.slice(1, 5).map((moment, i) => {
          const isLastVisible = i === visibleItems.slice(1, 5).length - 1;
          const displayIndex = i + 1;
          const openIndex = isLastVisible && moreCount > 0 ? visibleItems.length : displayIndex;
          return (
            <MediaMomentTile
              key={`${moment.uri}-${displayIndex}`}
              moment={moment}
              onPress={() => onOpenMedia(openIndex)}
              style={styles.collageSmallTile}
              moreCount={isLastVisible ? moreCount : 0}
            />
          );
        })}
      </View>
    </View>
  );
}

function buildHighlight(mode: Mode | null, played: PlayedCard[], mediaItems: MediaMoment[]) {
  const cameraOrChaos = played.filter(({ cardId }) => {
    const card = cardsById[cardId];
    return card?.type === 'camera' || card?.type === 'chaos';
  }).length;

  if (mode === 'wild') {
    const score = cameraOrChaos + mediaItems.length;
    const level = score >= 8 ? 'MAXIMUM' : score >= 4 ? 'HIGH' : 'RISING';
    return {
      icon: 'sparkles' as const,
      title: 'CHAOS LEVEL',
      value: level,
      detail: `${cameraOrChaos} chaos plays, ${mediaItems.length} saved moment${mediaItems.length !== 1 ? 's' : ''}`,
    };
  }

  if (mode === 'spicy') {
    return {
      icon: 'flame' as const,
      title: 'NIGHT ENERGY',
      value: played.length >= 10 ? 'HEATED' : 'WARMING UP',
      detail: `${played.filter(p => !p.skipped).length} completed card${played.filter(p => !p.skipped).length !== 1 ? 's' : ''}`,
    };
  }

  return {
    icon: 'moon' as const,
    title: 'BEST VIBE',
    value: mediaItems.length > 0 ? 'CAPTURED' : 'EASY FLOW',
    detail: `${played.length} card${played.length !== 1 ? 's' : ''} with ${mediaItems.length} saved moment${mediaItems.length !== 1 ? 's' : ''}`,
  };
}

function FullscreenVideo({ uri }: { uri: string }) {
  const player = useVideoPlayer(uri, player => {
    player.loop = false;
    player.play();
  });

  return (
    <VideoView
      player={player}
      style={styles.fullscreenMedia}
      nativeControls
      contentFit="contain"
      surfaceType="textureView"
    />
  );
}

type MediaViewerProps = {
  mediaItems: MediaMoment[];
  selectedIndex: number | null;
  onClose: () => void;
  onSelectIndex: (index: number) => void;
};

function FullscreenMediaViewer({ mediaItems, selectedIndex, onClose, onSelectIndex }: MediaViewerProps) {
  const insets = useSafeAreaInsets();
  const [isSharing, setIsSharing] = useState(false);
  const selectedMoment = selectedIndex === null ? null : mediaItems[selectedIndex];
  const canGoPrev = selectedIndex !== null && selectedIndex > 0;
  const canGoNext = selectedIndex !== null && selectedIndex < mediaItems.length - 1;

  const goPrev = () => {
    if (selectedIndex !== null && canGoPrev) {
      onSelectIndex(selectedIndex - 1);
    }
  };

  const goNext = () => {
    if (selectedIndex !== null && canGoNext) {
      onSelectIndex(selectedIndex + 1);
    }
  };

  const panResponder = PanResponder.create({
    onMoveShouldSetPanResponder: (_, gestureState) =>
      Math.abs(gestureState.dx) > 24 && Math.abs(gestureState.dx) > Math.abs(gestureState.dy) * 1.4,
    onPanResponderRelease: (_, gestureState) => {
      if (gestureState.dx <= -56) {
        goNext();
      } else if (gestureState.dx >= 56) {
        goPrev();
      }
    },
  });

  const shareActiveMoment = async () => {
    if (!selectedMoment || isSharing) return;

    try {
      setIsSharing(true);
      const isAvailable = await Sharing.isAvailableAsync();

      if (!isAvailable) {
        Alert.alert('Sharing unavailable', 'Sharing is not available on this device.');
        return;
      }

      // TODO: Future sharing polish can add Share All Memories and a branded recap poster.
      await Sharing.shareAsync(selectedMoment.uri, {
        dialogTitle: 'Share NiteDeck moment',
        mimeType: selectedMoment.mediaType === 'video' ? 'video/*' : 'image/*',
        UTI: selectedMoment.mediaType === 'video' ? 'public.movie' : 'public.image',
      });
    } catch {
      Alert.alert('Share failed', 'This moment could not be shared. Try again from the recap.');
    } finally {
      setIsSharing(false);
    }
  };

  return (
    <Modal
      visible={Boolean(selectedMoment)}
      transparent
      animationType="fade"
      statusBarTranslucent
      onRequestClose={onClose}
    >
      <View style={styles.viewerBackdrop}>
        <SafeAreaView style={styles.viewerSafe}>
          <View style={[styles.viewerTopBar, { paddingTop: Math.max(insets.top + Spacing.sm, Spacing.xl) }]}>
            <TouchableOpacity onPress={onClose} style={styles.viewerCloseBtn} activeOpacity={0.8}>
              <Ionicons name="close" size={24} color={Colors.text} />
            </TouchableOpacity>
            {selectedMoment && selectedIndex !== null ? (
              <View style={styles.viewerCounterPill}>
                <Text style={styles.viewerCounterText}>
                  {selectedIndex + 1} / {mediaItems.length}
                </Text>
              </View>
            ) : null}
            <TouchableOpacity
              onPress={shareActiveMoment}
              disabled={!selectedMoment || isSharing}
              style={[styles.viewerShareBtn, (!selectedMoment || isSharing) && styles.viewerShareBtnDisabled]}
              activeOpacity={0.8}
            >
              <Ionicons name="share-outline" size={18} color={Colors.text} />
              <Text style={styles.viewerShareText}>Share</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.viewerContent} {...panResponder.panHandlers}>
            {selectedMoment?.mediaType === 'photo' ? (
              <Image
                key={selectedMoment.uri}
                source={{ uri: selectedMoment.uri }}
                style={styles.fullscreenMedia}
                resizeMode="contain"
              />
            ) : selectedMoment?.mediaType === 'video' ? (
              <FullscreenVideo key={selectedMoment.uri} uri={selectedMoment.uri} />
            ) : null}

            {mediaItems.length > 1 ? (
              <>
                <TouchableOpacity
                  onPress={goPrev}
                  disabled={!canGoPrev}
                  style={[styles.viewerNavBtn, styles.viewerNavLeft, !canGoPrev && styles.viewerNavBtnDisabled]}
                  activeOpacity={0.75}
                >
                  <Ionicons name="chevron-back" size={28} color={Colors.text} />
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={goNext}
                  disabled={!canGoNext}
                  style={[styles.viewerNavBtn, styles.viewerNavRight, !canGoNext && styles.viewerNavBtnDisabled]}
                  activeOpacity={0.75}
                >
                  <Ionicons name="chevron-forward" size={28} color={Colors.text} />
                </TouchableOpacity>
              </>
            ) : null}
          </View>
        </SafeAreaView>
      </View>
    </Modal>
  );
}

export default function RecapScreen() {
  const players = useSessionStore(s => s.players);
  const mode = useSessionStore(s => s.mode);
  const played = useSessionStore(s => s.played);
  const startedAt = useSessionStore(s => s.startedAt);
  const endedAt = useSessionStore(s => s.endedAt);
  const mediaUris = useSessionStore(s => s.mediaUris);
  const mediaMoments = useSessionStore(s => s.mediaMoments);
  const reset = useSessionStore(s => s.reset);
  const [selectedMediaIndex, setSelectedMediaIndex] = useState<number | null>(null);

  const duration = startedAt && endedAt ? endedAt - startedAt : 0;
  const totalCompleted = played.filter(p => !p.skipped).length;
  const totalSkipped = played.filter(p => p.skipped).length;
  const modeCfg = mode ? Colors.modes[mode] : null;
  const heroSub = mode ? HERO_SUBTITLES[mode] : '';
  const mediaItems: MediaMoment[] = mediaMoments.length > 0
    ? mediaMoments
    : mediaUris.map((uri, i) => ({ uri, mediaType: 'photo', createdAt: i }));
  const highlight = buildHighlight(mode, played, mediaItems);
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

  const openMedia = (index: number) => {
    if (index >= 0 && index < mediaItems.length) {
      setSelectedMediaIndex(index);
    }
  };

  const closeMedia = () => setSelectedMediaIndex(null);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scroll}
        contentInsetAdjustmentBehavior="automatic"
      >
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

        <View style={[styles.heroCard, modeCfg && { borderColor: modeCfg.borderSelected }]}>
          <Text style={[styles.kicker, modeCfg && { color: modeCfg.primary }]}>NIGHT RECAP</Text>
          <View style={styles.heroRow}>
            <Text style={styles.heroNum} numberOfLines={1} adjustsFontSizeToFit>{totalCompleted}</Text>
            <Text style={[styles.heroUnit, modeCfg && { color: modeCfg.primary }]}>
              {totalCompleted === 1 ? 'card' : 'cards'}
            </Text>
          </View>
          <Text style={styles.heroSub}>{heroSub}</Text>
          {duration > 0 && (
            <View style={styles.durationRow}>
              <Ionicons name="time-outline" size={14} color={Colors.textDim} />
              <Text style={styles.duration}>{formatDuration(duration)}</Text>
            </View>
          )}
        </View>

        <View style={styles.statRow}>
          <StatTile icon="albums-outline" value={played.length} label="CARDS" />
          <StatTile icon="play-skip-forward" value={totalSkipped} label="SKIPS" highlight={totalSkipped > 0} />
          <StatTile icon="people" value={players.length} label="PLAYERS" />
          <StatTile icon="time-outline" value={duration > 0 ? formatDuration(duration) : '-'} label="TIME" />
        </View>

        <View style={styles.memorySection}>
          <View style={styles.sectionRow}>
            <View>
              <Text style={[styles.sectionLabel, modeCfg && { color: modeCfg.primary }]}>MEMORY WALL</Text>
              <Text style={styles.sectionHint}>
                {mediaItems.length > 0 ? 'The moments that made the night' : 'Ready for next time'}
              </Text>
            </View>
            <View style={styles.mediaCountPill}>
              <Text style={styles.mediaCountText}>
                {mediaItems.length > 0
                  ? `${mediaItems.length} moment${mediaItems.length !== 1 ? 's' : ''}`
                  : 'EMPTY'}
              </Text>
            </View>
          </View>

          <MemoryWall mediaItems={mediaItems} onOpenMedia={openMedia} />
        </View>

        <View style={[styles.highlightCard, modeCfg && { borderColor: modeCfg.borderSelected }]}>
          <View style={[styles.highlightIcon, modeCfg && { backgroundColor: modeCfg.bg, borderColor: modeCfg.borderSelected }]}>
            <Ionicons name={highlight.icon} size={18} color={modeCfg?.primary ?? Colors.accent} />
          </View>
          <View style={styles.highlightCopy}>
            <Text style={[styles.highlightTitle, modeCfg && { color: modeCfg.primary }]}>{highlight.title}</Text>
            <Text style={styles.highlightValue}>{highlight.value}</Text>
            <Text style={styles.highlightDetail}>{highlight.detail}</Text>
          </View>
        </View>

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

        <View style={styles.footer}>
          <Button label="Play Again →" onPress={handlePlayAgain} fullWidth />
        </View>
      </ScrollView>
      <FullscreenMediaViewer
        mediaItems={mediaItems}
        selectedIndex={selectedMediaIndex}
        onClose={closeMedia}
        onSelectIndex={setSelectedMediaIndex}
      />
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
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.md,
  },
  backBtn: {
    width: 38,
    height: 38,
    borderRadius: Radius.full,
    backgroundColor: Colors.surface2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 7,
    paddingHorizontal: Spacing.md,
    borderRadius: Radius.full,
    borderWidth: 1,
  },
  modeEmoji: {
    fontSize: 13,
  },
  modeBadgeText: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1.3,
  },
  heroCard: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.xxl,
    borderWidth: 1,
    borderColor: Colors.borderSubtle,
    padding: Spacing.lg,
    overflow: 'hidden',
  },
  kicker: {
    ...Typography.label,
    color: Colors.accent,
    marginBottom: Spacing.xs,
  },
  heroRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: Spacing.sm,
  },
  heroNum: {
    fontSize: 76,
    fontWeight: '900',
    color: Colors.text,
    lineHeight: 78,
  },
  heroUnit: {
    fontSize: 32,
    fontWeight: '900',
    color: Colors.accent,
    marginBottom: 9,
  },
  heroSub: {
    fontSize: 17,
    fontWeight: '600',
    color: Colors.textMuted,
    marginTop: Spacing.sm,
  },
  durationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginTop: Spacing.sm,
  },
  duration: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.textDim,
  },
  statRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginTop: Spacing.md,
  },
  statTile: {
    flex: 1,
    backgroundColor: Colors.surface,
    borderRadius: Radius.md,
    paddingVertical: 10,
    paddingHorizontal: 6,
    borderWidth: 1,
    borderColor: Colors.borderSubtle,
    alignItems: 'center',
    gap: 4,
  },
  statNum: {
    fontSize: 18,
    fontWeight: '900',
    color: Colors.text,
  },
  statLabel: {
    fontSize: 9,
    fontWeight: '800',
    color: Colors.textMuted,
    letterSpacing: 0.6,
    textAlign: 'center',
  },
  memorySection: {
    marginTop: Spacing.xl,
    backgroundColor: Colors.surface,
    borderRadius: Radius.xxl,
    borderWidth: 1,
    borderColor: Colors.borderSubtle,
    padding: Spacing.md,
  },
  section: {
    marginTop: Spacing.xl,
  },
  sectionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.md,
    marginBottom: Spacing.md,
  },
  sectionLabel: {
    ...Typography.label,
    color: Colors.textMuted,
    marginBottom: 2,
  },
  sectionHint: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.textDim,
  },
  mediaCountPill: {
    backgroundColor: Colors.accentBg,
    borderRadius: Radius.full,
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderWidth: 1,
    borderColor: Colors.accentBorder,
  },
  mediaCountText: {
    fontSize: 10,
    fontWeight: '800',
    color: Colors.accent,
    letterSpacing: 0.4,
  },
  memorySingle: {
    minHeight: 300,
  },
  singleTile: {
    flex: 1,
  },
  memoryPair: {
    flexDirection: 'row',
    gap: Spacing.sm,
    minHeight: 224,
  },
  pairTile: {
    flex: 1,
  },
  memoryCollage: {
    flexDirection: 'row',
    gap: Spacing.sm,
    minHeight: 292,
  },
  collageHeroTile: {
    flex: 1.25,
  },
  collageSide: {
    flex: 1,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  collageSideColumn: {
    flex: 1,
    gap: Spacing.sm,
  },
  columnTile: {
    flex: 1,
  },
  collageSmallTile: {
    width: '47.5%',
    flexGrow: 1,
    minHeight: 136,
  },
  mediaTile: {
    borderRadius: Radius.xl,
    overflow: 'hidden',
    backgroundColor: Colors.surface2,
    borderWidth: 1,
    borderColor: Colors.borderSubtle,
  },
  mediaFill: {
    ...StyleSheet.absoluteFillObject,
  },
  videoShade: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.18)',
  },
  videoPlayBadge: {
    position: 'absolute',
    left: 10,
    top: 10,
    width: 34,
    height: 34,
    borderRadius: Radius.full,
    backgroundColor: Colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  videoTypeBadge: {
    position: 'absolute',
    right: 8,
    bottom: 8,
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: Radius.full,
    backgroundColor: 'rgba(0,0,0,0.66)',
    borderWidth: 1,
    borderColor: Colors.accentBorder,
  },
  videoTypeText: {
    fontSize: 9,
    fontWeight: '900',
    color: Colors.accent,
    letterSpacing: 0.7,
  },
  moreOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.62)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  moreText: {
    fontSize: 24,
    fontWeight: '900',
    color: Colors.text,
  },
  memoryEmpty: {
    minHeight: 224,
    borderRadius: Radius.xl,
    borderWidth: 1,
    borderColor: Colors.borderSubtle,
    borderStyle: 'dashed',
    backgroundColor: Colors.bg,
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.xl,
    gap: Spacing.sm,
  },
  memoryEmptyIcon: {
    width: 54,
    height: 54,
    borderRadius: Radius.full,
    backgroundColor: Colors.accentBg,
    borderWidth: 1,
    borderColor: Colors.accentBorder,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.xs,
  },
  memoryEmptyTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: Colors.text,
  },
  memoryEmptyText: {
    fontSize: 13,
    lineHeight: 19,
    color: Colors.textMuted,
    textAlign: 'center',
  },
  highlightCard: {
    marginTop: Spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    backgroundColor: Colors.surface,
    borderRadius: Radius.xl,
    borderWidth: 1,
    borderColor: Colors.borderSubtle,
    padding: Spacing.md,
  },
  highlightIcon: {
    width: 44,
    height: 44,
    borderRadius: Radius.full,
    borderWidth: 1,
    borderColor: Colors.accentBorder,
    backgroundColor: Colors.accentBg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  highlightCopy: {
    flex: 1,
    gap: 2,
  },
  highlightTitle: {
    fontSize: 10,
    fontWeight: '900',
    color: Colors.accent,
    letterSpacing: 1.2,
  },
  highlightValue: {
    fontSize: 20,
    fontWeight: '900',
    color: Colors.text,
  },
  highlightDetail: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.textMuted,
  },
  awardRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
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
    fontWeight: '700',
    color: Colors.text,
  },
  rankRight: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  rankCount: {
    fontSize: 18,
    fontWeight: '900',
    color: Colors.text,
  },
  rankUnit: {
    fontSize: 13,
    color: Colors.textMuted,
  },
  viewerBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.96)',
  },
  viewerSafe: {
    flex: 1,
  },
  viewerTopBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.sm,
    paddingBottom: Spacing.sm,
  },
  viewerCloseBtn: {
    width: 44,
    height: 44,
    borderRadius: Radius.full,
    backgroundColor: 'rgba(255,255,255,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.14)',
  },
  viewerCounterPill: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: Radius.full,
    backgroundColor: Colors.surface2,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  viewerCounterText: {
    fontSize: 12,
    fontWeight: '800',
    color: Colors.textMuted,
    letterSpacing: 0.4,
  },
  viewerShareBtn: {
    minWidth: 82,
    height: 44,
    borderRadius: Radius.full,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.14)',
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 6,
    paddingHorizontal: 12,
  },
  viewerShareBtnDisabled: {
    opacity: 0.5,
  },
  viewerShareText: {
    fontSize: 12,
    fontWeight: '800',
    color: Colors.text,
  },
  viewerContent: {
    flex: 1,
    paddingHorizontal: Spacing.sm,
    paddingBottom: Spacing.lg,
  },
  fullscreenMedia: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  viewerNavBtn: {
    position: 'absolute',
    top: '44%',
    width: 48,
    height: 64,
    borderRadius: Radius.full,
    backgroundColor: 'rgba(0,0,0,0.34)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  viewerNavLeft: {
    left: Spacing.sm,
  },
  viewerNavRight: {
    right: Spacing.sm,
  },
  viewerNavBtnDisabled: {
    opacity: 0.22,
  },
  footer: {
    marginTop: Spacing.xl,
  },
});
