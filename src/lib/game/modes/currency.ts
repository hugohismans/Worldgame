import type { Country } from '../../data/types.js';
import type { GameMode } from '../types.js';

/**
 * Vingt-sept pays utilisent l'euro, huit le franc CFA (BCEAO), dix le dollar
 * américain. Plutôt que d'exclure du jeu les monnaies les plus intéressantes,
 * on accepte **n'importe quel pays de la zone** : la question devient « trouve
 * un pays dont la monnaie est… », et la révélation éclaire toute la zone.
 *
 * Passer ce drapeau à `false` restreint le pool aux monnaies uniques, avec une
 * seule bonne réponse par question.
 */
export const ACCEPT_ANY_COUNTRY_OF_THE_ZONE = true;

/**
 * La monnaie retenue pour un pays qui en a plusieurs : la première déclarée,
 * c'est-à-dire sa monnaie nationale. Dix pays en ont une seconde qui a cours
 * légal (le rand en Namibie, le dollar américain au Panama) — la compter
 * ferait entrer le Panama dans la « zone dollar », ce qui n'apprend rien.
 */
const mainCurrency = (country: Country) => country.currencies[0];

const usesCurrency = (country: Country, code: string): boolean =>
  mainCurrency(country)?.code === code;

export const currencyMode: GameMode = {
  id: 'currency',
  eligible: (country) => country.currencies.length > 0,

  question: (country, world) => {
    const currency = mainCurrency(country);
    if (!currency) {
      return { answer: country.iso3, accepted: [country.iso3], clue: { kind: 'currency', currency: country.name } };
    }
    const accepted = ACCEPT_ANY_COUNTRY_OF_THE_ZONE
      ? world.filter((other) => usesCurrency(other, currency.code)).map((other) => other.iso3)
      : [country.iso3];
    return {
      answer: country.iso3,
      accepted: accepted.length > 0 ? accepted : [country.iso3],
      clue: { kind: 'currency', currency: currency.nameWithArticle },
    };
  },

  // Sans cette clé, une manche pourrait demander l'euro cinq fois de suite.
  clueKey: (country) =>
    ACCEPT_ANY_COUNTRY_OF_THE_ZONE ? (mainCurrency(country)?.code ?? country.iso3) : country.iso3,
};
