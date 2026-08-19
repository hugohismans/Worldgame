import { describe, expect, it } from 'vitest';
import { PEAK_GAIN, note, streakSemitones, voicesOf } from './sounds.js';

const ALL = ['correct', 'wrong', 'roundOver', 'record'] as const;

const totalDuration = (name: (typeof ALL)[number]) =>
  Math.max(...voicesOf(name).map((v) => v.start + v.duration));

describe('hauteurs', () => {
  it('place le La 440 à zéro demi-ton', () => {
    expect(note(0)).toBeCloseTo(440);
    expect(note(12)).toBeCloseTo(880);
    expect(note(-12)).toBeCloseTo(220);
  });

  it('fait monter la bonne réponse avec la série', () => {
    expect(streakSemitones(1)).toBe(0);
    expect(streakSemitones(2)).toBe(1);
    expect(streakSemitones(5)).toBe(4);
  });

  it('plafonne la montée à une quinte', () => {
    // Sans plafond, une série de trente réponses finirait en sifflet.
    expect(streakSemitones(30)).toBe(7);
    expect(streakSemitones(200)).toBe(7);
  });

  it('reste sur la note de base quand la série est nulle', () => {
    expect(streakSemitones(0)).toBe(0);
  });
});

describe('sons', () => {
  it('ne dépassent jamais le gain maximal', () => {
    for (const name of ALL) {
      for (const voice of voicesOf(name)) {
        expect(voice.gain, name).toBeLessThanOrEqual(PEAK_GAIN);
        expect(voice.gain, name).toBeGreaterThan(0);
      }
    }
  });

  it('restent courts', () => {
    // Un retour de jeu qui dure fatigue : on entend le même trente fois.
    expect(totalDuration('correct')).toBeLessThan(0.35);
    expect(totalDuration('wrong')).toBeLessThan(0.35);
    // Les fins de manche s'autorisent une phrase, sans traîner non plus.
    expect(totalDuration('roundOver')).toBeLessThan(1);
    expect(totalDuration('record')).toBeLessThan(1.5);
  });

  it('font monter la bonne réponse', () => {
    const [first, second] = voicesOf('correct');
    expect(second!.pitch).toBeGreaterThan(first!.pitch);
    expect(second!.start).toBeGreaterThan(first!.start);
  });

  it('gardent l’erreur grave et étouffée', () => {
    const [thud] = voicesOf('wrong');
    expect(thud!.pitch).toBeLessThan(-12);
    expect(thud!.lowpass).toBeLessThan(500);
    expect(thud!.gain).toBeLessThan(PEAK_GAIN);
  });

  it('transposent toutes les voix ensemble', () => {
    const base = voicesOf('correct');
    const up = voicesOf('correct', 5);
    expect(up.map((v) => v.pitch)).toEqual(base.map((v) => v.pitch + 5));
  });

  it('font du record un prolongement de la fin de manche', () => {
    expect(voicesOf('record').length).toBe(voicesOf('roundOver').length + 1);
    const last = voicesOf('record').at(-1);
    expect(last!.pitch).toBeGreaterThan(12);
  });
});
