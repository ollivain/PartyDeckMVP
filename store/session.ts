import { create } from 'zustand';
import { allCards } from '@/data/cards';
import type { Mode } from '@/data/types';

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
  mode: Mode | null;
  startedAt: number | null;
  endedAt: number | null;
  currentPlayerIndex: number;
  deck: string[];
  deckIndex: number;
  played: PlayedCard[];
  mediaUris: string[];
  mediaMoments: MediaMoment[];

  addPlayer: (name: string) => void;
  removePlayer: (id: string) => void;
  setMode: (mode: Mode) => void;
  startGame: () => void;
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

const defaultState = {
  players: [] as Player[],
  mode: null as Mode | null,
  startedAt: null as number | null,
  endedAt: null as number | null,
  currentPlayerIndex: 0,
  deck: [] as string[],
  deckIndex: 0,
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

  setMode: (mode: Mode) => set({ mode }),

  startGame: () => {
    const { mode } = get();
    if (!mode) return;
    const modeCards = allCards.filter(c => c.mode === mode);
    const deck = shuffleArray(modeCards).map(c => c.id);
    set({
      deck,
      deckIndex: 0,
      currentPlayerIndex: 0,
      played: [],
      startedAt: Date.now(),
      endedAt: null,
    });
  },

  completeCard: () => {
    const { deck, deckIndex, currentPlayerIndex, players, played } = get();
    if (deckIndex >= deck.length || !players.length) return;
    set({
      played: [
        ...played,
        {
          cardId: deck[deckIndex],
          playerId: players[currentPlayerIndex].id,
          skipped: false,
          at: Date.now(),
        },
      ],
      deckIndex: deckIndex + 1,
      currentPlayerIndex: (currentPlayerIndex + 1) % players.length,
    });
  },

  skipCard: () => {
    const { deck, deckIndex, currentPlayerIndex, players, played } = get();
    if (deckIndex >= deck.length || !players.length) return;
    set({
      played: [
        ...played,
        {
          cardId: deck[deckIndex],
          playerId: players[currentPlayerIndex].id,
          skipped: true,
          at: Date.now(),
        },
      ],
      deckIndex: deckIndex + 1,
      currentPlayerIndex: (currentPlayerIndex + 1) % players.length,
    });
  },

  endGame: () => set({ endedAt: Date.now() }),

  addMedia: (uri: string, mediaType: MediaType = 'photo') =>
    set(s => ({
      mediaUris: [...s.mediaUris, uri],
      mediaMoments: [...s.mediaMoments, { uri, mediaType, createdAt: Date.now() }],
    })),

  reset: () => set({ ...defaultState }),
}));
