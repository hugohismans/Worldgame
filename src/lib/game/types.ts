import type { Country, Iso3, Localized, RegionId, Tier } from '../data/types.js';

/** Un mode de jeu = une façon de poser la question. */
export type ModeId = 'name';

/**
 * L'indice affiché au joueur. Il porte des valeurs déjà traduites plutôt que
 * du texte figé : c'est la vue qui choisit la langue, pas le moteur.
 */
export type Clue = { readonly kind: 'name'; readonly name: Localized };

export interface Question {
  /** Le pays visé. */
  readonly answer: Iso3;
  /**
   * Tous les pays comptés comme bonne réponse. Identique à `answer` ici ;
   * le mode « monnaie » en aura plusieurs (l'euro, le franc CFA…).
   */
  readonly accepted: readonly Iso3[];
  readonly clue: Clue;
}

/**
 * Ajouter un mode = ajouter un fichier dans `modes/` qui implémente ceci.
 * Le moteur de manche ne connaît rien d'autre.
 */
export interface GameMode {
  readonly id: ModeId;
  /** Un pays sans capitale ou sans monnaie ne peut pas être demandé partout. */
  eligible(country: Country): boolean;
  question(country: Country, pool: readonly Country[]): Question;
}

/** Filtre de composition du pool. `'all'` = pas de restriction. */
export interface PoolFilter {
  readonly tier: Tier | 'all';
  readonly region: RegionId | 'all';
}

export const ROUND_LENGTHS = [10, 20, 30] as const;
export type RoundLength = (typeof ROUND_LENGTHS)[number];

export interface Answer {
  readonly question: Question;
  /** Le pays cliqué. `null` si la question a été passée. */
  readonly picked: Iso3 | null;
  readonly correct: boolean;
}

export interface Round {
  readonly questions: readonly Question[];
  readonly answers: readonly Answer[];
}

export interface RoundSummary {
  readonly score: number;
  readonly total: number;
  /** Entre 0 et 1. */
  readonly accuracy: number;
  readonly bestStreak: number;
  readonly missed: readonly Answer[];
}
