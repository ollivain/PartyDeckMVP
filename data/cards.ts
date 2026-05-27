import { chillCards } from './cards.chill';
import { spicyCards } from './cards.spicy';
import { wildCards } from './cards.wild';
import type { Card } from './types';

export const allCards: Card[] = [...chillCards, ...spicyCards, ...wildCards];

export const cardsById: Record<string, Card> = Object.fromEntries(
  allCards.map(c => [c.id, c])
);
