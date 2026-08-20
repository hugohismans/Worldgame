import { describe, expect, it } from 'vitest';
import {
  MIN_WIDTH,
  WORLD,
  boxAround,
  boxForBounds,
  clampBox,
  initialBox,
  pathOf,
  project,
} from './projection.js';

describe('projection', () => {
  it('place le méridien de Greenwich et l’équateur au centre', () => {
    expect(project(0, 0)).toEqual([WORLD.width / 2, WORLD.height / 2]);
  });

  it('place les coins du monde aux coins du canevas', () => {
    expect(project(-180, 90)).toEqual([0, 0]);
    expect(project(180, -90)).toEqual([WORLD.width, WORLD.height]);
  });

  it('trace un polygone fermé', () => {
    const d = pathOf({ type: 'Polygon', coordinates: [[[0, 0], [10, 0], [10, 10]]] });
    expect(d.startsWith('M')).toBe(true);
    expect(d.endsWith('Z')).toBe(true);
  });

  it('trace chaque anneau d’un multipolygone', () => {
    const d = pathOf({
      type: 'MultiPolygon',
      coordinates: [[[[0, 0], [1, 0], [1, 1]]], [[[5, 5], [6, 5], [6, 6]]]],
    });
    expect(d.match(/M/g)).toHaveLength(2);
  });
});

describe('cadrage initial', () => {
  it('laisse le monde entier sur un écran large', () => {
    expect(initialBox(1280, 800).width).toBe(WORLD.width);
  });

  it('se rapproche sur un téléphone en portrait', () => {
    // Sinon la carte tiendrait dans une bande où un petit pays ferait deux pixels.
    const box = initialBox(393, 660);
    expect(box.width).toBeLessThan(WORLD.width);
    expect(box.width).toBeGreaterThan(WORLD.width / 4);
  });

  it('reste dans le monde', () => {
    const box = initialBox(393, 660);
    expect(box.x).toBeGreaterThanOrEqual(0);
    expect(box.x + box.width).toBeLessThanOrEqual(WORLD.width);
  });

  it('ne casse pas sur une taille nulle', () => {
    expect(initialBox(0, 0).width).toBe(WORLD.width);
  });
});

describe('cadrage', () => {
  it('empêche de sortir de la carte', () => {
    const box = clampBox({ x: -500, y: -500, width: 1800, height: 900 }, 2);
    expect(box.x).toBe(0);
    expect(box.y).toBe(0);
  });

  it('empêche de dépasser le bord opposé', () => {
    const box = clampBox({ x: 9999, y: 9999, width: 1800, height: 900 }, 2);
    expect(box.x).toBe(WORLD.width - 1800);
    expect(box.y).toBe(WORLD.height - 900);
  });

  it('ne dézoome pas au-delà du monde entier', () => {
    expect(clampBox({ x: 0, y: 0, width: 99999, height: 99999 }, 2).width).toBe(WORLD.width);
  });

  it('ne zoome pas indéfiniment', () => {
    // Le plancher descend très bas — il faut voir le Vatican — mais il existe.
    expect(clampBox({ x: 100, y: 100, width: 0.00001, height: 0.00001 }, 2).width).toBe(MIN_WIDTH);
  });

  it('centre sur un point donné', () => {
    const box = boxAround(0, 0, 1800, 2);
    expect(box.x + box.width / 2).toBeCloseTo(WORLD.width / 2);
    expect(box.y + box.height / 2).toBeCloseTo(WORLD.height / 2);
  });

  it('recentre sans sortir du monde près d’un bord', () => {
    const box = boxAround(179, 89, 1800, 2);
    expect(box.x + box.width).toBeLessThanOrEqual(WORLD.width);
    expect(box.y).toBeGreaterThanOrEqual(0);
  });
});

describe('cadrage d’un pays', () => {
  // Saint-Marin : 0,107° de large. La Russie : plus de 190°.
  const SAINT_MARIN = [12.38563, 43.89206, 12.49239, 43.98257] as const;
  const VATICAN = [12.45271, 41.90275, 12.45403, 41.90391] as const;
  const RUSSIE = [-180, 41.19, 180, 81.85] as const;

  it('serre le cadre sur un micro-État', () => {
    const box = boxForBounds(SAINT_MARIN);
    // Assez près pour que les frontières se voient : moins de 3° de large.
    expect(box.width / 10).toBeLessThan(3);
  });

  it('descend jusqu’à voir le Vatican', () => {
    const box = boxForBounds(VATICAN);
    expect(box.width / 10).toBeLessThan(0.2);
    expect(box.width).toBeGreaterThanOrEqual(MIN_WIDTH);
  });

  it('élargit le cadre sur un très grand pays', () => {
    expect(boxForBounds(RUSSIE).width).toBe(WORLD.width);
  });

  it('tient compte de la hauteur, pas seulement de la largeur', () => {
    // Un pays étroit mais très étiré du nord au sud doit tenir en entier.
    const chili = [-75, -56, -66, -17] as const;
    const box = boxForBounds(chili);
    expect(box.height / 10).toBeGreaterThan(39);
  });

  it('reste dans le monde même au bord', () => {
    const box = boxForBounds([-180, -55, -178, -53]);
    expect(box.x).toBeGreaterThanOrEqual(0);
    expect(box.x + box.width).toBeLessThanOrEqual(WORLD.width);
  });
});
