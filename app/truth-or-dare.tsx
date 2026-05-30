import { useEffect, useRef } from 'react';
import { Alert, StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Button } from '@/components/ui/Button';
import { PressableScale } from '@/components/ui/PressableScale';
import { Colors, Radius, Spacing, Typography } from '@/constants/theme';
import { truthOrDareCardsById } from '@/data/truthOrDare';
import type { TruthOrDareCard, TruthOrDareChoice } from '@/data/types';
import { useSessionStore } from '@/store/session';

function cardFontSize(len: number): number {
  if (len > 150) return 19;
  if (len > 90) return 22;
  return 25;
}

type TruthOrDarePromptCardProps = {
  card: TruthOrDareCard;
  cardNumber: number;
  totalCards: number;
};

function TruthOrDarePromptCard({ card, cardNumber, totalCards }: TruthOrDarePromptCardProps) {
  const cfg = Colors.modes[card.mode];
  const fontSize = cardFontSize(card.text.length);
  const dots = card.intensity ?? (card.choice === 'truth' ? 2 : 3);
  const choiceIcon = card.choice === 'truth' ? 'chatbubble-ellipses' : 'flash';

  return (
    <View style={[styles.promptCard, { borderColor: cfg.primary }]}>
      <View style={styles.cardTopRow}>
        <View style={[styles.typeTag, { borderColor: cfg.primary }]}>
          <Ionicons name={choiceIcon} size={12} color={cfg.primary} />
          <Text style={[styles.typeLabel, { color: cfg.primary }]}>{card.label}</Text>
        </View>
        <View style={styles.typeDots}>
          {[0, 1, 2].map(i => (
            <View
              key={i}
              style={[
                styles.typeDot,
                { backgroundColor: i < dots ? cfg.primary : Colors.surface2 },
              ]}
            />
          ))}
        </View>
      </View>

      <View style={styles.textWrap}>
        <Text style={[styles.cardText, { fontSize, lineHeight: fontSize * 1.45 }]}>
          {card.text}
        </Text>
      </View>

      <View style={styles.cardFooter}>
        <View style={[styles.modeChip, { borderColor: cfg.primary }]}>
          <Text style={[styles.modeName, { color: cfg.primary }]}>{cfg.emoji}  {cfg.name}</Text>
        </View>
        <Text style={styles.counter}>{cardNumber}/{totalCards}</Text>
      </View>
    </View>
  );
}

export default function TruthOrDareScreen() {
  const players = useSessionStore(s => s.players);
  const gameType = useSessionStore(s => s.gameType);
  const mode = useSessionStore(s => s.mode);
  const startedAt = useSessionStore(s => s.startedAt);
  const currentPlayerIndex = useSessionStore(s => s.currentPlayerIndex);
  const played = useSessionStore(s => s.played);
  const truthDeck = useSessionStore(s => s.truthOrDareTruthDeck);
  const dareDeck = useSessionStore(s => s.truthOrDareDareDeck);
  const truthIndex = useSessionStore(s => s.truthOrDareTruthIndex);
  const dareIndex = useSessionStore(s => s.truthOrDareDareIndex);
  const pendingChoice = useSessionStore(s => s.pendingTruthOrDareChoice);
  const pendingCardId = useSessionStore(s => s.pendingTruthOrDareCardId);
  const chooseCard = useSessionStore(s => s.chooseTruthOrDareCard);
  const completeCard = useSessionStore(s => s.completeTruthOrDareCard);
  const skipCard = useSessionStore(s => s.skipTruthOrDareCard);
  const endGame = useSessionStore(s => s.endGame);
  const endAlertOpenRef = useRef(false);

  const hasEnoughPlayers = players.length >= 2;
  const hasStarted = Boolean(startedAt);
  const currentPlayer = players.length > 0 ? players[currentPlayerIndex % players.length] : undefined;
  const currentCard = pendingCardId ? truthOrDareCardsById[pendingCardId] : undefined;
  const totalCards = truthDeck.length + dareDeck.length;
  const truthRemaining = Math.max(0, truthDeck.length - truthIndex);
  const dareRemaining = Math.max(0, dareDeck.length - dareIndex);
  const isDeckEmpty = hasStarted && totalCards > 0 && truthRemaining === 0 && dareRemaining === 0 && !pendingCardId;
  const invalidGameState =
    gameType !== 'truth-or-dare' ||
    !hasEnoughPlayers ||
    !mode ||
    !hasStarted ||
    totalCards === 0 ||
    (pendingCardId !== null && !currentCard);
  const modeCfg = mode ? Colors.modes[mode] : null;
  const progress = totalCards > 0 ? played.length / totalCards : 0;

  useEffect(() => {
    if (!gameType) {
      router.replace('/game-type');
      return;
    }

    if (gameType !== 'truth-or-dare') {
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

    if (!hasStarted || totalCards === 0 || (pendingCardId !== null && !currentCard)) {
      router.replace('/rules');
    }
  }, [currentCard, gameType, hasEnoughPlayers, hasStarted, mode, pendingCardId, totalCards]);

  const finishGame = () => {
    endGame();
    router.replace('/recap');
  };

  const handleEndGame = () => {
    if (endAlertOpenRef.current) return;

    endAlertOpenRef.current = true;
    Alert.alert(
      'End Truth or Dare?',
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

  const handleChoice = (choice: TruthOrDareChoice) => {
    const didChoose = chooseCard(choice);
    if (!didChoose) {
      Alert.alert('No cards left', `No ${choice} cards are left for this vibe.`);
    }
  };

  if (invalidGameState) {
    return null;
  }

  if (isDeckEmpty) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.emptyState}>
          <Text style={styles.emptyEmoji}>?</Text>
          <Text style={styles.emptyTitle}>Truth or Dare complete!</Text>
          <Text style={styles.emptySubtitle}>
            You played {played.length} card{played.length !== 1 ? 's' : ''}.{'\n'}Time for the recap.
          </Text>
          <View style={styles.emptyBtn}>
            <Button label="See Night Recap ->" onPress={finishGame} fullWidth />
          </View>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.topBar}>
        <View style={styles.playerPill}>
          {modeCfg ? <View style={[styles.dot, { backgroundColor: modeCfg.primary }]} /> : null}
          <Text style={styles.playerName} numberOfLines={1}>
            {currentPlayer?.name ?? '?'}
          </Text>
          <Text style={styles.turnSuffix}>{'s turn'}</Text>
        </View>
        <PressableScale onPress={handleEndGame} style={styles.endBtn} hitSlop={8} pressedScale={0.97}>
          <Ionicons name="stop-circle-outline" size={18} color={Colors.textMuted} />
          <Text style={styles.endBtnText}>End</Text>
        </PressableScale>
      </View>

      <View style={styles.progressTrack}>
        {Array.from({ length: 7 }, (_, i) => {
          const filled = Math.max(1, Math.ceil(progress * 7));
          return (
            <View
              key={i}
              style={[
                styles.progressSegment,
                i < filled && modeCfg
                  ? { backgroundColor: modeCfg.primary }
                  : { backgroundColor: Colors.surface2 },
              ]}
            />
          );
        })}
      </View>

      <View style={styles.content}>
        {!pendingCardId ? (
          <View style={styles.choicePanel}>
            <View style={styles.choiceHeader}>
              <Text style={styles.kicker}>TRUTH OR DARE</Text>
              <Text style={styles.choiceTitle}>What will it be?</Text>
              <Text style={styles.choiceSubtitle}>
                Choose for {currentPlayer?.name ?? 'this player'}, then play the card.
              </Text>
            </View>

            <View style={styles.choiceButtons}>
              <PressableScale
                onPress={() => handleChoice('truth')}
                disabled={truthRemaining === 0}
                activeOpacity={0.82}
                pressedScale={0.985}
                style={[
                  styles.choiceCard,
                  modeCfg && { borderColor: modeCfg.borderSelected },
                  truthRemaining === 0 && styles.choiceCardDisabled,
                ]}
              >
                <Ionicons name="chatbubble-ellipses" size={28} color={modeCfg?.primary ?? Colors.accent} />
                <Text style={[styles.choiceName, modeCfg && { color: modeCfg.primary }]}>Truth</Text>
                <Text style={styles.choiceMeta}>{truthRemaining} left</Text>
              </PressableScale>

              <PressableScale
                onPress={() => handleChoice('dare')}
                disabled={dareRemaining === 0}
                activeOpacity={0.82}
                pressedScale={0.985}
                style={[
                  styles.choiceCard,
                  modeCfg && { borderColor: modeCfg.borderSelected },
                  dareRemaining === 0 && styles.choiceCardDisabled,
                ]}
              >
                <Ionicons name="flash" size={28} color={modeCfg?.primary ?? Colors.accent} />
                <Text style={[styles.choiceName, modeCfg && { color: modeCfg.primary }]}>Dare</Text>
                <Text style={styles.choiceMeta}>{dareRemaining} left</Text>
              </PressableScale>
            </View>
          </View>
        ) : currentCard ? (
          <TruthOrDarePromptCard
            card={currentCard}
            cardNumber={played.length + 1}
            totalCards={totalCards}
          />
        ) : null}

        <View style={styles.actions}>
          {pendingCardId ? (
            <>
              <PressableScale
                style={styles.skipBtn}
                onPress={skipCard}
                activeOpacity={0.74}
                pressedScale={0.97}
              >
                <Ionicons name="play-skip-forward" size={16} color={Colors.textMuted} />
                <Text style={styles.skipText}>Skip</Text>
              </PressableScale>
              <PressableScale
                style={styles.doneBtn}
                onPress={completeCard}
                activeOpacity={0.78}
                pressedScale={0.95}
              >
                <Text style={styles.doneText}>Done</Text>
                <Ionicons name="checkmark" size={20} color="#0A0908" />
              </PressableScale>
            </>
          ) : (
            <View style={styles.waitingPill}>
              <Text style={styles.waitingText}>
                {pendingChoice ? pendingChoice.toUpperCase() : `${played.length}/${totalCards} played`}
              </Text>
            </View>
          )}
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
    maxWidth: '64%',
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
  choicePanel: {
    flex: 1,
    justifyContent: 'center',
    gap: Spacing.xl,
  },
  choiceHeader: {
    gap: Spacing.sm,
  },
  kicker: {
    ...Typography.label,
    color: Colors.accent,
  },
  choiceTitle: {
    ...Typography.h1,
    color: Colors.text,
  },
  choiceSubtitle: {
    ...Typography.body,
    color: Colors.textMuted,
  },
  choiceButtons: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  choiceCard: {
    flex: 1,
    minHeight: 176,
    borderRadius: Radius.xxl,
    borderWidth: 1.5,
    borderColor: Colors.accentBorder,
    backgroundColor: Colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    padding: Spacing.md,
  },
  choiceCardDisabled: {
    opacity: 0.35,
  },
  choiceName: {
    fontSize: 24,
    fontWeight: '900',
    color: Colors.accent,
    letterSpacing: -0.4,
  },
  choiceMeta: {
    fontSize: 12,
    fontWeight: '800',
    color: Colors.textDim,
    letterSpacing: 0.6,
    textTransform: 'uppercase',
  },
  promptCard: {
    flex: 1,
    backgroundColor: Colors.surface,
    borderRadius: Radius.xxl,
    borderWidth: 1.5,
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.xl,
    paddingBottom: Spacing.lg,
    marginBottom: Spacing.sm,
  },
  cardTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  typeTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 5,
    paddingHorizontal: 12,
    borderRadius: Radius.full,
    borderWidth: 1.5,
  },
  typeLabel: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1.3,
  },
  typeDots: {
    flexDirection: 'row',
    gap: 6,
  },
  typeDot: {
    width: 8,
    height: 8,
    borderRadius: Radius.full,
  },
  textWrap: {
    flex: 1,
    justifyContent: 'center',
  },
  cardText: {
    fontWeight: '600',
    color: Colors.text,
    letterSpacing: -0.3,
  },
  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  modeChip: {
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: Radius.full,
    borderWidth: 1.5,
  },
  modeName: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  counter: {
    fontSize: 13,
    fontWeight: '500',
    color: Colors.textDim,
    letterSpacing: 0.3,
  },
  actions: {
    minHeight: 60,
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
  waitingPill: {
    flex: 1,
    height: 60,
    borderRadius: Radius.xl,
    borderWidth: 1,
    borderColor: Colors.borderSubtle,
    backgroundColor: Colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  waitingText: {
    fontSize: 13,
    fontWeight: '800',
    color: Colors.textDim,
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.lg,
  },
  emptyEmoji: {
    fontSize: 64,
    color: Colors.accent,
  },
  emptyTitle: {
    fontSize: 34,
    fontWeight: '700',
    color: Colors.text,
    letterSpacing: -1,
    textAlign: 'center',
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
