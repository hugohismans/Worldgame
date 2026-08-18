import type { GameMode } from '../types.js';

/** « Trouve le pays dont la capitale est Lima ». */
export const capitalMode: GameMode = {
  id: 'capital',
  eligible: (country) => country.capital !== null,
  question: (country) => ({
    answer: country.iso3,
    accepted: [country.iso3],
    // `eligible` garantit la capitale ; le repli ne sert qu'au typage.
    clue: { kind: 'capital', capital: country.capital ?? country.name },
  }),
};
