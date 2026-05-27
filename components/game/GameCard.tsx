import { StyleSheet, Text, View } from 'react-native';
import { Colors, Radius, Spacing } from '@/constants/theme';
import type { Card, Mode } from '@/data/types';

type GameCardProps = {
  card: Card;
  mode: Mode;
  cardNumber: number;
  totalCards: number;
};

const typeLabels: Record<Card['type'], string> = {
  question: 'QUESTION',
  task: 'TASK',
  challenge: 'CHALLENGE',
};

const typeDots: Record<Card['type'], number> = {
  question: 1,
  task: 2,
  challenge: 3,
};

function cardFontSize(len: number): number {
  if (len > 160) return 19;
  if (len > 90) return 22;
  return 25;
}

export function GameCard({ card, mode, cardNumber, totalCards }: GameCardProps) {
  const cfg = Colors.modes[mode];
  const fontSize = cardFontSize(card.text.length);
  const dots = typeDots[card.type];

  return (
    <View style={[styles.card, { borderColor: cfg.primary }]}>
      {/* Top row: type tag + dots */}
      <View style={styles.topRow}>
        <View style={[styles.typeTag, { borderColor: cfg.primary }]}>
          <Text style={[styles.typeLabel, { color: cfg.primary }]}>
            {typeLabels[card.type]}
          </Text>
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

      {/* Main card text */}
      <View style={styles.textWrap}>
        <Text style={[styles.cardText, { fontSize, lineHeight: fontSize * 1.45 }]}>
          {card.text}
        </Text>
      </View>

      {/* Footer */}
      <View style={styles.footer}>
        <View style={[styles.modeChip, { borderColor: cfg.primary }]}>
          <Text style={[styles.modeName, { color: cfg.primary }]}>{cfg.emoji}  {cfg.name}</Text>
        </View>
        <Text style={styles.counter}>{cardNumber}/{totalCards}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    backgroundColor: Colors.surface,
    borderRadius: Radius.xxl,
    borderWidth: 1.5,
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.xl,
    paddingBottom: Spacing.lg,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  typeTag: {
    paddingVertical: 5,
    paddingHorizontal: 12,
    borderRadius: Radius.full,
    borderWidth: 1.5,
  },
  typeLabel: {
    fontSize: 10,
    fontWeight: '700',
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
  footer: {
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
});
