import type { Localized } from '../data/types.js';
import { en, fr, type Dictionary } from './dictionary.js';
import { pickLanguage, type Lang } from './language.js';

const DICTIONARIES: Readonly<Record<Lang, Dictionary>> = { fr, en };
const STORAGE_KEY = 'worldgame.lang';

/**
 * La langue courante. C'est le seul état vraiment global de l'application :
 * elle traverse tous les écrans et survit au rechargement.
 */
class I18n {
  #lang = $state<Lang>(
    pickLanguage(safeRead(), typeof navigator === 'undefined' ? [] : navigator.languages),
  );

  get lang(): Lang {
    return this.#lang;
  }

  /** Le dictionnaire courant : `i18n.t.play` suit la langue. */
  get t(): Dictionary {
    return DICTIONARIES[this.#lang];
  }

  set(lang: Lang): void {
    this.#lang = lang;
    safeWrite(lang);
    document.documentElement.lang = lang;
  }

  /** Choisit la bonne face d'une donnée traduite (nom de pays, capitale…). */
  of(value: Localized): string {
    return value[this.#lang];
  }
}

function safeRead(): string | null {
  // Safari en navigation privée refuse localStorage : la langue n'est alors
  // pas mémorisée, mais le jeu ne doit pas s'arrêter là.
  try {
    return localStorage.getItem(STORAGE_KEY);
  } catch {
    return null;
  }
}

function safeWrite(lang: Lang): void {
  try {
    localStorage.setItem(STORAGE_KEY, lang);
  } catch {
    // tant pis, la préférence ne survivra pas au rechargement
  }
}

export const i18n = new I18n();
