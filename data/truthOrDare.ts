import { chillTruthOrDareCards } from './truthOrDare.chill';
import { spicyTruthOrDareCards } from './truthOrDare.spicy';
import { wildTruthOrDareCards } from './truthOrDare.wild';
import type { TruthOrDareCard } from './types';

export const truthOrDareCards: TruthOrDareCard[] = [
  ...chillTruthOrDareCards,
  ...spicyTruthOrDareCards,
  ...wildTruthOrDareCards,
];

export const truthOrDareCardsById: Record<string, TruthOrDareCard> = Object.fromEntries(
  truthOrDareCards.map(c => [c.id, c])
);
