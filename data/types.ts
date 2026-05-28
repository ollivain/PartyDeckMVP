export type Mode = 'chill' | 'spicy' | 'wild';
export type CardType = 'question' | 'vote' | 'pick' | 'challenge' | 'camera' | 'chaos';
export type CardIntensity = 1 | 2 | 3;

export type Card = {
  id: string;
  mode: Mode;
  type: CardType;
  label: string;
  text: string;
  intensity?: CardIntensity;
};
