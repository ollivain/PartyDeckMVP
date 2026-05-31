import { useCallback, useRef, useState } from 'react';
import { Alert, StyleSheet, Text, View } from 'react-native';
import { router, useFocusEffect } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import Animated, {
  Easing,
  runOnJS,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { GameCard } from '@/components/game/GameCard';
import { Button } from '@/components/ui/Button';
import { PressableScale } from '@/components/ui/PressableScale';
import { Colors, Radius, Spacing } from '@/constants/theme';
import { useSessionStore } from '@/store/session';
import { cardsById } from '@/data/cards';

type CardAdvanceAction = 'done' | 'skip';

export default function GameScreen() {
  const players = useSessionStore(s => s.players);
  const gameType = useSessionStore(s => s.gameType);
  const mode = useSessionStore(s => s.mode);
  const deck = useSessionStore(s => s.deck);
  const deckIndex = useSessionStore(s => s.deckIndex);
  const currentPlayerIndex = useSessionStore(s => s.currentPlayerIndex);
  const played = useSessionStore(s => s.played);
  const startedAt = useSessionStore(s => s.startedAt);
  const completeCard = useSessionStore(s => s.completeCard);
  const skipCard = useSessionStore(s => s.skipCard);
  const endGame = useSessionStore(s => s.endGame);
  const [isTransitioningCard, setIsTransitioningCard] = useState(false);
  const endAlertOpenRef = useRef(false);
  const reduceMotion = useReducedMotion();
  const cardOpacity = useSharedValue(1);
  const cardScale = useSharedValue(1);
  const cardTranslateY = useSharedValue(0);
  const currentPlayer = players.length > 0 ? players[currentPlayerIndex % players.length] : undefined;
  const currentCard = deck[deckIndex] ? cardsById[deck[deckIndex]] : undefined;
  const hasEnoughPlayers = players.length >= 2;
  const hasStarted = Boolean(startedAt);
  const isCameraCard = currentCard?.type === 'camera';
  const isDeckEmpty = hasStarted && deck.length > 0 && deckIndex >= deck.length;
  const invalidGameState =
    gameType !== 'classic' ||
    !hasEnoughPlayers ||
    !mode ||
    !hasStarted ||
    deck.length === 0 ||
    (!currentCard && !isDeckEmpty);
  const progress = deck.length > 0 ? deckIndex / deck.length : 0;

  const cardAnimatedStyle = useAnimatedStyle(() => ({
    opacity: cardOpacity.value,
    transform: [
      { translateY: cardTranslateY.value },
      { scale: cardScale.value },
    ],
  }));

  useFocusEffect(useCallback(() => {
    if (gameType !== 'classic') {
      router.replace('/game-type');
      return;
    }

    if (!hasEnoughPlayers) {
      router.replace('/players');
      return;
    }

    if (!mode) {
      router.replace('/mode');
      return;
    }

    if (!hasStarted || deck.length === 0 || (!currentCard && !isDeckEmpty)) {
      router.replace('/rules');
    }
  }, [currentCard, deck.length, gameType, hasEnoughPlayers, hasStarted, isDeckEmpty, mode]));

  const finishCardTransition = useCallback((action: CardAdvanceAction) => {
    if (action === 'done') {
      completeCard();
    } else {
      skipCard();
    }

    if (reduceMotion) {
      setIsTransitioningCard(false);
      return;
    }

    cardOpacity.value = 0;
    cardScale.value = 0.95;
    cardTranslateY.value = 26;
    cardOpacity.value = withTiming(1, { duration: 150, easing: Easing.out(Easing.cubic) });
    cardTranslateY.value = withTiming(0, { duration: 150, easing: Easing.out(Easing.cubic) });
    cardScale.value = withTiming(1, { duration: 150, easing: Easing.out(Easing.cubic) }, () => {
      runOnJS(setIsTransitioningCard)(false);
    });
  }, [cardOpacity, cardScale, cardTranslateY, completeCard, reduceMotion, skipCard]);

  const advanceWithTransition = (action: CardAdvanceAction) => {
    if (isTransitioningCard || isDeckEmpty) return;
    setIsTransitioningCard(true);

    if (reduceMotion) {
      finishCardTransition(action);
      return;
    }

    cardOpacity.value = withTiming(0, { duration: 90, easing: Easing.in(Easing.cubic) }, finished => {
      if (finished) {
        runOnJS(finishCardTransition)(action);
      } else {
        runOnJS(setIsTransitioningCard)(false);
      }
    });
    cardScale.value = withTiming(0.95, { duration: 90, easing: Easing.in(Easing.cubic) });
    cardTranslateY.value = withTiming(-24, { duration: 90, easing: Easing.in(Easing.cubic) });
  };

  const finishGame = () => {
    endGame();
    router.replace('/recap');
  };

  const handleEndGame = () => {
    if (endAlertOpenRef.current) return;

    endAlertOpenRef.current = true;
    Alert.alert(
      'End the night?',
      'Stop the game and see your Night Recap.',
      [
        {
          text: 'Keep playing',
          style: 'cancel',
          onPress: () => {
            endAlertOpenRef.current = false;
          },
        },
        { text: 'End Game', style: 'destructive', onPress: finishGame },
      ],
      {
        onDismiss: () => {
          endAlertOpenRef.current = false;
        },
      },
    );
  };

  const handleCamera = () => {
    router.push({ pathname: '/camera', params: { returnTo: '/game' } });
  };

  if (invalidGameState) {
    return null;
  }

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
          <PressableScale onPress={handleEndGame} style={styles.endBtn} hitSlop={8} pressedScale={0.97}>
            <Ionicons name="stop-circle-outline" size={18} color={Colors.textMuted} />
            <Text style={styles.endBtnText}>End</Text>
          </PressableScale>
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
        <Animated.View style={[styles.cardArea, cardAnimatedStyle]}>
          {currentCard && (
            <GameCard
              card={currentCard}
              mode={mode!}
              cardNumber={deckIndex + 1}
              totalCards={deck.length}
            />
          )}
        </Animated.View>

        {/* Camera FAB — self-sized, right-aligned between card and actions */}
        <View style={styles.cameraRow}>
          {isCameraCard && (
            <View style={styles.cameraHint}>
              <Text style={styles.cameraHintText}>Tap the camera to save this moment</Text>
            </View>
          )}
          <PressableScale
            onPress={handleCamera}
            style={[
              styles.cameraFab,
              {
                shadowColor: isCameraCard ? Colors.accent : modeCfg.primary,
                borderColor: isCameraCard ? Colors.accent : modeCfg.border,
              },
              isCameraCard && styles.cameraFabActive,
            ]}
            activeOpacity={0.75}
            hitSlop={8}
            pressedScale={0.94}
          >
            <Ionicons name="camera" size={22} color={isCameraCard ? Colors.accent : Colors.text} />
            {isCameraCard && <Text style={styles.cameraFabLabel}>Capture</Text>}
          </PressableScale>
        </View>

        {/* Actions */}
        <View style={styles.actions}>
          <PressableScale
            style={[styles.skipBtn, isTransitioningCard && styles.actionBtnDisabled]}
            onPress={() => advanceWithTransition('skip')}
            activeOpacity={0.74}
            disabled={isTransitioningCard}
            pressedScale={0.97}
          >
            <Ionicons name="play-skip-forward" size={16} color={Colors.textMuted} />
            <Text style={styles.skipText}>Skip</Text>
          </PressableScale>
          <PressableScale
            style={[styles.doneBtn, isTransitioningCard && styles.actionBtnDisabled]}
            onPress={() => advanceWithTransition('done')}
            activeOpacity={0.78}
            disabled={isTransitioningCard}
            pressedScale={0.95}
          >
            <Text style={styles.doneText}>Done</Text>
            <Ionicons name="checkmark" size={20} color="#0A0908" />
          </PressableScale>
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
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: Spacing.sm,
    marginBottom: Spacing.sm,
  },
  cameraHint: {
    maxWidth: 148,
    flexShrink: 1,
    paddingVertical: 7,
    paddingHorizontal: 12,
    borderRadius: Radius.full,
    borderWidth: 1,
    borderColor: Colors.accentBorder,
    backgroundColor: Colors.accentBg,
  },
  cameraHintText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.textMuted,
    lineHeight: 16,
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
  cameraFabActive: {
    width: 116,
    flexDirection: 'row',
    gap: 7,
    borderWidth: 1.5,
    backgroundColor: Colors.accentBg,
    shadowOpacity: 0.45,
    shadowRadius: 14,
    elevation: 8,
  },
  cameraFabLabel: {
    fontSize: 13,
    fontWeight: '800',
    color: Colors.accent,
    letterSpacing: 0.2,
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
  actionBtnDisabled: {
    opacity: 0.55,
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
