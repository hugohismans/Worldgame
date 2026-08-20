import { describe, expect, it } from 'vitest';
import type { Box } from './projection.js';
import {
  MIN_WIDTH,
  WORLD,
  boxAround,
  boxForBounds,
  clampBox,
  pathOf,
  project,
} from './projection.js';

describe('projection', () => {
  it('place le méridien de Greenwich au centre', () => {
    expect(project(0, 0)[0]).toBeCloseTo(WORLD.width / 2);
  });

  it('cale le canevas sur la bande habitée', () => {
    // Le nord du Groenland en haut, la pointe du Chili bien avant le bas.
    expect(project(-180, 84)).toEqual([0, expect.closeTo(0, 6)]);
    expect(project(180, -58)[0]).toBeCloseTo(WORLD.width);
    expect(project(180, -58)[1]).toBeCloseTo(WORLD.height);
    expect(project(0, -56)[1]).toBeLessThan(WORLD.height);
  });

  it('reste plus large que haut', () => {
    // Poussé à ses limites, Mercator ferait un carré dont un tiers d'océan vide.
    expect(WORLD.width / WORLD.height).toBeGreaterThan(1.3);
  });

  it('borne les latitudes extrêmes au lieu de partir à l’infini', () => {
    // Au-delà du bord du canevas, mais fini : rien d'habité ne va si haut.
    expect(Number.isFinite(project(0, 89.9)[1])).toBe(true);
    expect(Number.isFinite(project(0, 90)[1])).toBe(true);
    expect(Number.isFinite(project(0, -90)[1])).toBe(true);
  });

  it('espace les parallèles de plus en plus vers les pôles', () => {
    // La signature de Mercator : c'est ce qui redresse les formes.
    const equateurA30 = project(0, 0)[1] - project(0, 30)[1];
    const de30A60 = project(0, 30)[1] - project(0, 60)[1];
    expect(de30A60).toBeGreaterThan(equateurA30);
  });

  it('garde les formes localement justes', () => {
    // À 60° de latitude, un degré de longitude vaut la moitié d'un degré de
    // latitude au sol : la projection doit refléter ce rapport.
    const dx = project(1, 60)[0] - project(0, 60)[0];
    const dy = project(0, 60)[1] - project(0, 61)[1];
    expect(dy / dx).toBeCloseTo(2, 1);
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
    const [x, y] = project(0, 0);
    expect(box.x + box.width / 2).toBeCloseTo(x);
    expect(box.y + box.height / 2).toBeCloseTo(y);
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

  /** Le pays tient-il en entier dans le cadre ? */
  const contient = (box: Box, bounds: readonly [number, number, number, number]): boolean => {
    const [left, top] = project(bounds[0], bounds[3]);
    const [right, bottom] = project(bounds[2], bounds[1]);
    return (
      left >= box.x &&
      right <= box.x + box.width &&
      top >= box.y &&
      bottom <= box.y + box.height
    );
  };

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
    expect(contient(boxForBounds(chili), chili)).toBe(true);
  });

  it('reste dans le monde même au bord', () => {
    const box = boxForBounds([-180, -55, -178, -53]);
    expect(box.x).toBeGreaterThanOrEqual(0);
    expect(box.x + box.width).toBeLessThanOrEqual(WORLD.width);
  });
});
