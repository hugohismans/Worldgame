import type { Country } from '../../data/types.js';
import type { GameMode } from '../types.js';

/**
 * « Trouve le pays dont la devise est *Ordem e Progresso* ».
 *
 * L'indice montre la devise **dans sa langue d'origine**, avec sa traduction
 * dessous : la langue est un indice en soi, et la traduction rend le mode
 * jouable même quand la devise est en arabe ou en géorgien.
 *
 * Quatre devises sont partagées — le Burundi, le Congo et le Tchad ont la même.
 * Comme pour les monnaies, tous les pays concernés comptent comme justes.
 */
export const mottoMode: GameMode = {
  id: 'motto',
  eligible: (country) => country.motto !== null,

  question: (country, world) => {
    const motto = country.motto;
    if (!motto) {
      return { answer: country.iso3, accepted: [country.iso3], clue: { kind: 'name', name: country.name } };
    }
    const accepted = world
      .filter((other) => other.motto?.original === motto.original)
      .map((other) => other.iso3);
    return {
      answer: country.iso3,
      accepted: accepted.length > 0 ? accepted : [country.iso3],
      clue: { kind: 'motto', original: motto.original, translation: motto.translation },
    };
  },

  // Sans cette clé, une manche pourrait poser deux fois « Unité, Travail, Progrès ».
  clueKey: (country: Country) => country.motto?.original ?? country.iso3,
};
