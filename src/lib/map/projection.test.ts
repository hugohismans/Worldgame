import { describe, expect, it } from 'vitest';
import { WORLD, boxAround, clampBox, initialBox, pathOf, project } from './projection.js';

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
    expect(clampBox({ x: 100, y: 100, width: 1, height: 1 }, 2).width).toBeGreaterThan(1);
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
