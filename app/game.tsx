import { Alert, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { GameCard } from '@/components/game/GameCard';
import { Button } from '@/components/ui/Button';
import { Colors, Radius, Spacing } from '@/constants/theme';
import { useSessionStore } from '@/store/session';
import { cardsById } from '@/data/cards';

export default function GameScreen() {
  const players = useSessionStore(s => s.players);
  const mode = useSessionStore(s => s.mode);
  const deck = useSessionStore(s => s.deck);
  const deckIndex = useSessionStore(s => s.deckIndex);
  const currentPlayerIndex = useSessionStore(s => s.currentPlayerIndex);
  const played = useSessionStore(s => s.played);
  const completeCard = useSessionStore(s => s.completeCard);
  const skipCard = useSessionStore(s => s.skipCard);
  const endGame = useSessionStore(s => s.endGame);

  const currentPlayer = players[currentPlayerIndex];
  const currentCard = deck[deckIndex] ? cardsById[deck[deckIndex]] : undefined;
  const isDeckEmpty = deckIndex >= deck.length;
  const progress = deck.length > 0 ? deckIndex / deck.length : 0;

  const finishGame = () => {
    endGame();
    router.replace('/recap');
  };

  const handleEndGame = () => {
    Alert.alert('End the night?', 'Stop the game and see your Night Recap.', [
      { text: 'Keep playing', style: 'cancel' },
      { text: 'End Game', style: 'destructive', onPress: finishGame },
    ]);
  };

  const handleCamera = () => {
    router.push('/camera');
  };

  if (isDeckEmpty) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.emptyState}>
          <Text style={styles.emptyEmoji}>🎴</Text>
          <Text style={styles.emptyTitle}>Deck is empty!</Text>
          <Text style={styles.emptySubtitle}>
            You crushed {played.length} card{played.length !== 1 ? 's' : ''}.{'\n'}Time for the recap.
          </Text>
          <View style={styles.emptyBtn}>
            <Button label="See Night Recap →" onPress={finishGame} fullWidth />
          </View>
        </View>
      </SafeAreaView>
    );
  }

  const modeCfg = Colors.modes[mode!];

  return (
    <SafeAreaView style={styles.container}>
      {/* Top bar */}
      <View style={styles.topBar}>
        <View style={styles.playerPill}>
          <View style={[styles.dot, { backgroundColor: modeCfg.primary }]} />
          <Text style={styles.playerName} numberOfLines={1}>
            {currentPlayer?.name ?? '?'}
          </Text>
          <Text style={styles.turnSuffix}>{'’s turn'}</Text>
        </View>
        <View style={styles.topActions}>
          <TouchableOpacity onPress={handleEndGame} style={styles.endBtn} hitSlop={8}>
            <Ionicons name="stop-circle-outline" size={18} color={Colors.textMuted} />
            <Text style={styles.endBtnText}>End</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Segmented progress bar */}
      <View style={styles.progressTrack}>
        {Array.from({ length: 7 }, (_, i) => {
          const filled = Math.max(1, Math.ceil(progress * 7));
          return (
            <View
              key={i}
              style={[
                styles.progressSegment,
                i < filled
                  ? { backgroundColor: modeCfg.primary }
                  : { backgroundColor: Colors.surface2 },
              ]}
            />
          );
        })}
      </View>

      {/* Card → camera FAB row → actions, all in normal flex flow */}
      <View style={styles.content}>
        <View style={styles.cardArea}>
          {currentCard && (
            <GameCard
              card={currentCard}
              mode={mode!}
              cardNumber={deckIndex + 1}
              totalCards={deck.length}
            />
          )}
        </View>

        {/* Camera FAB — self-sized, right-aligned between card and actions */}
        <View style={styles.cameraRow}>
          <TouchableOpacity
            onPress={handleCamera}
            style={[styles.cameraFab, { shadowColor: modeCfg.primary, borderColor: modeCfg.border }]}
            activeOpacity={0.75}
            hitSlop={8}
          >
            <Ionicons name="camera" size={22} color={Colors.text} />
          </TouchableOpacity>
        </View>

        {/* Actions */}
        <View style={styles.actions}>
          <TouchableOpacity style={styles.skipBtn} onPress={skipCard} activeOpacity={0.7}>
            <Ionicons name="play-skip-forward" size={16} color={Colors.textMuted} />
            <Text style={styles.skipText}>Skip</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.doneBtn} onPress={completeCard} activeOpacity={0.8}>
            <Text style={styles.doneText}>Done</Text>
            <Ionicons name="checkmark" size={20} color="#0A0908" />
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.bg,
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.xl,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: Spacing.md,
    marginBottom: Spacing.md,
  },
  playerPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface2,
    borderRadius: Radius.full,
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    gap: 6,
    maxWidth: '60%',
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: Radius.full,
  },
  playerName: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.text,
    flexShrink: 1,
  },
  turnSuffix: {
    fontSize: 15,
    color: Colors.textMuted,
  },
  topActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  endBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    borderRadius: Radius.md,
    backgroundColor: Colors.surface2,
    height: 38,
  },
  endBtnText: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.textMuted,
  },
  progressTrack: {
    flexDirection: 'row',
    gap: 4,
    height: 4,
    marginBottom: Spacing.lg,
  },
  progressSegment: {
    flex: 1,
    height: 4,
    borderRadius: Radius.full,
  },
  content: {
    flex: 1,
  },
  cardArea: {
    flex: 1,
    marginBottom: Spacing.sm,
  },
  cameraRow: {
    alignSelf: 'flex-end',
    marginBottom: Spacing.sm,
  },
  cameraFab: {
    width: 56,
    height: 56,
    borderRadius: Radius.lg,
    borderWidth: 1,
    backgroundColor: Colors.surface2,
    alignItems: 'center',
    justifyContent: 'center',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 5,
  },
  actions: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  skipBtn: {
    flex: 3,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    height: 60,
    borderRadius: Radius.xl,
    borderWidth: 1.5,
    borderColor: Colors.border,
    backgroundColor: Colors.surface,
  },
  skipText: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.textMuted,
  },
  doneBtn: {
    flex: 5,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    height: 60,
    borderRadius: Radius.xl,
    backgroundColor: Colors.accent,
  },
  doneText: {
    fontSize: 17,
    fontWeight: '800',
    color: '#0A0908',
    letterSpacing: -0.3,
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.lg,
  },
  emptyEmoji: {
    fontSize: 64,
  },
  emptyTitle: {
    fontSize: 34,
    fontWeight: '700',
    color: Colors.text,
    letterSpacing: -1,
  },
  emptySubtitle: {
    fontSize: 16,
    color: Colors.textMuted,
    textAlign: 'center',
    lineHeight: 24,
  },
  emptyBtn: {
    width: '100%',
    marginTop: Spacing.sm,
  },
});
