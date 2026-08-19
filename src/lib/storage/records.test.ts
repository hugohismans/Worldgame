import { describe, expect, it } from 'vitest';
import { beats, recordKey, withRecord } from './records.js';

describe('records', () => {
  it('sépare les records par mode et par longueur', () => {
    expect(recordKey('name', 10)).not.toBe(recordKey('name', 20));
    expect(recordKey('name', 10)).not.toBe(recordKey('flag', 10));
  });

  it('retient un premier résultat non nul', () => {
    expect(beats({ score: 3, total: 10 }, undefined)).toBe(true);
  });

  it('ignore un zéro pointé comme premier record', () => {
    expect(beats({ score: 0, total: 10 }, undefined)).toBe(false);
  });

  it('départage par score', () => {
    expect(beats({ score: 8, total: 10 }, { score: 7, total: 10 })).toBe(true);
    expect(beats({ score: 6, total: 10 }, { score: 7, total: 10 })).toBe(false);
  });

  it('à score égal, préfère la meilleure précision', () => {
    // 7/10 vaut mieux que 7/20 : une manche écourtée ne vole pas la place.
    expect(beats({ score: 7, total: 10 }, { score: 7, total: 20 })).toBe(true);
    expect(beats({ score: 7, total: 20 }, { score: 7, total: 10 })).toBe(false);
  });

  it('ne remplace pas un record égal', () => {
    expect(beats({ score: 7, total: 10 }, { score: 7, total: 10 })).toBe(false);
  });

  it('rend la même référence quand rien ne change', () => {
    const before = { 'name:10': { score: 9, total: 10 } };
    expect(withRecord(before, 'name', 10, { score: 4, total: 10 })).toBe(before);
  });

  it('ajoute sans toucher aux autres clés', () => {
    const before = { 'name:10': { score: 9, total: 10 } };
    const after = withRecord(before, 'flag', 20, { score: 5, total: 20 });
    expect(after['name:10']).toEqual({ score: 9, total: 10 });
    expect(after['flag:20']).toEqual({ score: 5, total: 20 });
  });
});
