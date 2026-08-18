import type { GameMode } from '../types.js';

/** « Trouve le Pérou ». Le plus simple : l'indice est le nom du pays. */
export const nameMode: GameMode = {
  id: 'name',
  eligible: () => true,
  question: (country) => ({
    answer: country.iso3,
    accepted: [country.iso3],
    // Forme avec article : l'indice s'insère dans une phrase (« Trouve le Pérou »).
    clue: { kind: 'name', name: country.nameWithArticle },
  }),
};
