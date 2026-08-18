import type { GameMode } from '../types.js';

/** Le drapeau seul, sans aucun texte. */
export const flagMode: GameMode = {
  id: 'flag',
  eligible: () => true,
  question: (country) => ({
    answer: country.iso3,
    accepted: [country.iso3],
    clue: { kind: 'flag', iso2: country.iso2 },
  }),
};
