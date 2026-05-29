import type { PackId, PremiumPackMetadata } from './types';

export const PREMIUM_PACK_IDS = [
  'temptations',
  'roast',
  'truth-bombs',
  'couples-chemistry',
  'after-dark',
] as const satisfies readonly PackId[];

export const premiumPackMetadata: Record<PackId, PremiumPackMetadata> = {
  temptations: {
    id: 'temptations',
    kind: 'premium-pack',
    title: 'Temptations',
    description: 'Flirty questions, bold choices and late-night tension.',
    locked: true,
    premium: true,
    comingSoon: true,
  },
  roast: {
    id: 'roast',
    kind: 'premium-pack',
    title: 'Roast',
    description: 'Savage jokes, brutal votes and friendly fire.',
    locked: true,
    premium: true,
    comingSoon: true,
  },
  'truth-bombs': {
    id: 'truth-bombs',
    kind: 'premium-pack',
    title: 'Truth Bombs',
    description: 'Honest answers, group votes and uncomfortable truths.',
    locked: true,
    premium: true,
    comingSoon: true,
  },
  'couples-chemistry': {
    id: 'couples-chemistry',
    kind: 'premium-pack',
    title: 'Couples & Chemistry',
    description: 'Date-night questions, playful tension and deeper connection.',
    locked: true,
    premium: true,
    comingSoon: true,
  },
  'after-dark': {
    id: 'after-dark',
    kind: 'premium-pack',
    title: 'After Dark',
    description: 'Late-night cards for bolder groups.',
    locked: true,
    premium: true,
    comingSoon: true,
  },
};

export const premiumPacks = PREMIUM_PACK_IDS.map(id => premiumPackMetadata[id]);
