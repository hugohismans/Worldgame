import { describe, expect, it } from 'vitest';
import { pickLanguage } from './language.js';
import { en, fr } from './dictionary.js';

describe('pickLanguage', () => {
  it('respecte le choix mémorisé avant la langue du navigateur', () => {
    expect(pickLanguage('en', ['fr-FR'])).toBe('en');
    expect(pickLanguage('fr', ['en-US'])).toBe('fr');
  });

  it('suit le navigateur en l’absence de choix', () => {
    expect(pickLanguage(null, ['fr-BE', 'fr'])).toBe('fr');
    expect(pickLanguage(null, ['en-GB'])).toBe('en');
  });

  it('prend la première langue reconnue de la liste', () => {
    expect(pickLanguage(null, ['de-DE', 'nl', 'fr-CH'])).toBe('fr');
  });

  it('retombe sur l’anglais pour une langue non gérée', () => {
    expect(pickLanguage(null, ['de-DE'])).toBe('en');
    expect(pickLanguage(null, [])).toBe('en');
  });

  it('ignore une valeur mémorisée invalide', () => {
    expect(pickLanguage('klingon', ['fr'])).toBe('fr');
  });
});

describe('dictionnaires', () => {
  it('couvrent exactement les mêmes clés', () => {
    // Le typage l'impose déjà au build ; ce test le prouve à l'exécution.
    expect(Object.keys(en).sort()).toEqual(Object.keys(fr).sort());
  });

  it('n’ont aucune traduction vide', () => {
    for (const [key, value] of Object.entries(en)) {
      if (typeof value === 'string') expect(value.trim(), key).not.toBe('');
    }
  });
});
