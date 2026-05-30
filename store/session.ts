import { create } from 'zustand';
import { allCards } from '@/data/cards';
import { truthOrDareCards } from '@/data/truthOrDare';
import type { GameType, Mode, TruthOrDareChoice } from '@/data/types';

export type Player = {
  id: string;
  name: string;
};

export type PlayedCard = {
  cardId: string;
  playerId: string;
  skipped: boolean;
  at: number;
};

export type MediaType = 'photo' | 'video';

export type MediaMoment = {
  uri: string;
  mediaType: MediaType;
  createdAt: number;
};

type SessionStore = {
  players: Player[];
  gameType: GameType | null;
  mode: Mode | null;
  startedAt: number | null;
  endedAt: number | null;
  currentPlayerIndex: number;
  deck: string[];
  deckIndex: number;
  truthOrDareTruthDeck: string[];
  truthOrDareDareDeck: string[];
  truthOrDareTruthIndex: number;
  truthOrDareDareIndex: number;
  pendingTruthOrDareChoice: TruthOrDareChoice | null;
  pendingTruthOrDareCardId: string | null;
  played: PlayedCard[];
  mediaUris: string[];
  mediaMoments: MediaMoment[];

  addPlayer: (name: string) => void;
  removePlayer: (id: string) => void;
  setGameType: (gameType: GameType) => void;
  setMode: (mode: Mode) => void;
  startGame: () => boolean;
  chooseTruthOrDareCard: (choice: TruthOrDareChoice) => boolean;
  completeTruthOrDareCard: () => void;
  skipTruthOrDareCard: () => void;
  completeCard: () => void;
  skipCard: () => void;
  endGame: () => void;
  addMedia: (uri: string, mediaType?: MediaType) => void;
  reset: () => void;
};

function shuffleArray<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function advanceCard(
  state: Pick<SessionStore, 'deck' | 'deckIndex' | 'currentPlayerIndex' | 'players' | 'played'>,
  skipped: boolean
) {
  const { deck, deckIndex, currentPlayerIndex, players, played } = state;
  const cardId = deck[deckIndex];
  const player = players.length > 0 ? players[currentPlayerIndex % players.length] : undefined;

  if (!cardId || !player) return state;

  return {
    played: [
      ...played,
      {
        cardId,
        playerId: player.id,
        skipped,
        at: Date.now(),
      },
    ],
    deckIndex: deckIndex + 1,
    currentPlayerIndex: (currentPlayerIndex + 1) % players.length,
  };
}

function advanceTruthOrDareCard(
  state: Pick<
    SessionStore,
    | 'currentPlayerIndex'
    | 'pendingTruthOrDareCardId'
    | 'pendingTruthOrDareChoice'
    | 'played'
    | 'players'
    | 'truthOrDareDareIndex'
    | 'truthOrDareTruthIndex'
  >,
  skipped: boolean
) {
  const {
    currentPlayerIndex,
    pendingTruthOrDareCardId,
    pendingTruthOrDareChoice,
    played,
    players,
    truthOrDareDareIndex,
    truthOrDareTruthIndex,
  } = state;
  const player = players.length > 0 ? players[currentPlayerIndex % players.length] : undefined;

  if (!pendingTruthOrDareCardId || !pendingTruthOrDareChoice || !player) return state;

  return {
    played: [
      ...played,
      {
        cardId: pendingTruthOrDareCardId,
        playerId: player.id,
        skipped,
        at: Date.now(),
      },
    ],
    currentPlayerIndex: (currentPlayerIndex + 1) % players.length,
    truthOrDareTruthIndex:
      pendingTruthOrDareChoice === 'truth' ? truthOrDareTruthIndex + 1 : truthOrDareTruthIndex,
    truthOrDareDareIndex:
      pendingTruthOrDareChoice === 'dare' ? truthOrDareDareIndex + 1 : truthOrDareDareIndex,
    pendingTruthOrDareChoice: null,
    pendingTruthOrDareCardId: null,
  };
}

const defaultState = {
  players: [] as Player[],
  gameType: null as GameType | null,
  mode: null as Mode | null,
  startedAt: null as number | null,
  endedAt: null as number | null,
  currentPlayerIndex: 0,
  deck: [] as string[],
  deckIndex: 0,
  truthOrDareTruthDeck: [] as string[],
  truthOrDareDareDeck: [] as string[],
  truthOrDareTruthIndex: 0,
  truthOrDareDareIndex: 0,
  pendingTruthOrDareChoice: null as TruthOrDareChoice | null,
  pendingTruthOrDareCardId: null as string | null,
  played: [] as PlayedCard[],
  mediaUris: [] as string[],
  mediaMoments: [] as MediaMoment[],
};

export const useSessionStore = create<SessionStore>((set, get) => ({
  ...defaultState,

  addPlayer: (name: string) => {
    const trimmed = name.trim();
    if (!trimmed) return;
    set(s => ({
      players: [
        ...s.players,
        { id: `${Date.now()}-${Math.random().toString(36).slice(2)}`, name: trimmed },
      ],
    }));
  },

  removePlayer: (id: string) =>
    set(s => ({ players: s.players.filter(p => p.id !== id) })),

  setGameType: (gameType: GameType) => set({ gameType }),

  setMode: (mode: Mode) => set({ mode }),

  startGame: () => {
    const { gameType, mode, players } = get();
    if (!mode || players.length < 2) return false;

    if (gameType === 'truth-or-dare') {
      const truthDeck = shuffleArray(
        truthOrDareCards.filter(c => c.mode === mode && c.choice === 'truth')
      ).map(c => c.id);
      const dareDeck = shuffleArray(
        truthOrDareCards.filter(c => c.mode === mode && c.choice === 'dare')
      ).map(c => c.id);

      if (truthDeck.length === 0 || dareDeck.length === 0) return false;

      set({
        deck: [],
        deckIndex: 0,
        truthOrDareTruthDeck: truthDeck,
        truthOrDareDareDeck: dareDeck,
        truthOrDareTruthIndex: 0,
        truthOrDareDareIndex: 0,
        pendingTruthOrDareChoice: null,
        pendingTruthOrDareCardId: null,
        currentPlayerIndex: 0,
        played: [],
        startedAt: Date.now(),
        endedAt: null,
      });
      return true;
    }

    if (gameType !== 'classic') return false;

    const modeCards = allCards.filter(c => c.mode === mode);
    if (modeCards.length === 0) return false;
    const deck = shuffleArray(modeCards).map(c => c.id);
    set({
      deck,
      deckIndex: 0,
      truthOrDareTruthDeck: [],
      truthOrDareDareDeck: [],
      truthOrDareTruthIndex: 0,
      truthOrDareDareIndex: 0,
      pendingTruthOrDareChoice: null,
      pendingTruthOrDareCardId: null,
      currentPlayerIndex: 0,
      played: [],
      startedAt: Date.now(),
      endedAt: null,
    });
    return true;
  },

  chooseTruthOrDareCard: (choice: TruthOrDareChoice) => {
    const state = get();
    if (state.gameType !== 'truth-or-dare' || !state.startedAt || state.pendingTruthOrDareCardId) {
      return false;
    }

    const deck = choice === 'truth' ? state.truthOrDareTruthDeck : state.truthOrDareDareDeck;
    const index = choice === 'truth' ? state.truthOrDareTruthIndex : state.truthOrDareDareIndex;
    const cardId = deck[index];

    if (!cardId) return false;

    set({
      pendingTruthOrDareChoice: choice,
      pendingTruthOrDareCardId: cardId,
    });
    return true;
  },

  completeTruthOrDareCard: () => set(s => advanceTruthOrDareCard(s, false)),

  skipTruthOrDareCard: () => set(s => advanceTruthOrDareCard(s, true)),

  completeCard: () => set(s => advanceCard(s, false)),

  skipCard: () => set(s => advanceCard(s, true)),

  endGame: () => set({ endedAt: Date.now() }),

  addMedia: (uri: string, mediaType: MediaType = 'photo') =>
    set(s => ({
      mediaUris: [...s.mediaUris, uri],
      mediaMoments: [...s.mediaMoments, { uri, mediaType, createdAt: Date.now() }],
    })),

  reset: () => set({ ...defaultState }),
}));
