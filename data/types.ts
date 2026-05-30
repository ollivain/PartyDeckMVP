export type GameType = 'classic' | 'truth-or-dare';
export type Mode = 'chill' | 'spicy' | 'wild';
export type TruthOrDareChoice = 'truth' | 'dare';
export type PackId =
  | 'temptations'
  | 'roast'
  | 'truth-bombs'
  | 'couples-chemistry'
  | 'after-dark';
export type CardSourceKind = 'core-mode' | 'premium-pack';
export type CardSourceId = Mode | PackId;
export type CardType = 'question' | 'vote' | 'pick' | 'challenge' | 'camera' | 'chaos';
export type CardIntensity = 1 | 2 | 3;

export type CardSourceMetadata = {
  id: CardSourceId;
  kind: CardSourceKind;
  title: string;
  description: string;
  premium: boolean;
  locked: boolean;
  comingSoon?: boolean;
};

export type PremiumPackMetadata = CardSourceMetadata & {
  id: PackId;
  kind: 'premium-pack';
  premium: true;
  locked: true;
  comingSoon: true;
};

export type Card = {
  id: string;
  mode: Mode;
  type: CardType;
  label: string;
  text: string;
  intensity?: CardIntensity;
};

export type TruthOrDareCard = {
  id: string;
  mode: Mode;
  choice: TruthOrDareChoice;
  label: 'TRUTH' | 'DARE';
  text: string;
  intensity?: CardIntensity;
};
