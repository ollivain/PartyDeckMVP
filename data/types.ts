export type Mode = 'chill' | 'spicy' | 'wild';
export type CardType = 'question' | 'task' | 'challenge';

export type Card = {
  id: string;
  mode: Mode;
  type: CardType;
  text: string;
};
