import type { CountryFeature } from '../data/types.js';

/**
 * Projection de Mercator, celle des applications de cartes.
 *
 * Elle est **conforme** : les formes locales sont justes, un pays n'y paraît ni
 * étiré ni aplati. C'est ce qui la rend familière, là où une équirectangulaire
 * — longitude en abscisse, latitude en ordonnée — double les distances
 * est-ouest dès 60° de latitude et écrase visuellement l'Europe et la Russie.
 *
 * Rançon connue : les aires enflent vers les pôles, le Groenland y paraît
 * énorme. C'est le compromis qu'accepte tout le monde depuis Google Maps.
 */

/** Unités de dessin par degré de longitude. 10 donne un canevas de 3600 de large. */
const SCALE = 10;

/**
 * Latitude de coupure. Au-delà, Mercator part à l'infini ; à 85,051°, le monde
 * forme exactement un carré — c'est la convention du web.
 */
export const MAX_LATITUDE = 85.05112878;

/**
 * Le canevas s'arrête à la bande habitée. Poussé jusqu'à ses limites
 * mathématiques, Mercator réserverait un tiers de la hauteur à un océan austral
 * vide : le nord du Groenland est à 83,6°, la pointe du Chili à 56° sud.
 */
const NORTH_EDGE = 84;
const SOUTH_EDGE = -58;

const RADIANS = Math.PI / 180;

/** L'ordonnée de Mercator, en radians, avant mise à l'échelle. */
function mercatorY(lat: number): number {
  const clamped = Math.max(-MAX_LATITUDE, Math.min(MAX_LATITUDE, lat));
  return Math.log(Math.tan(Math.PI / 4 + (clamped * RADIANS) / 2));
}

const TOP = mercatorY(NORTH_EDGE);
const BOTTOM = mercatorY(SOUTH_EDGE);

export const WORLD = {
  width: 360 * SCALE,
  height: ((TOP - BOTTOM) / (2 * Math.PI)) * 360 * SCALE,
} as const;

/** Le cadre garde toujours les proportions du monde : ici, un carré. */
export const WORLD_ASPECT = WORLD.width / WORLD.height;

export function project(lng: number, lat: number): [number, number] {
  return [
    (lng + 180) * SCALE,
    ((TOP - mercatorY(lat)) / (2 * Math.PI)) * 360 * SCALE,
  ];
}

/** Le tracé SVG d'un pays, tous ses anneaux mis bout à bout. */
export function pathOf(geometry: CountryFeature['geometry']): string {
  const polygons =
    geometry.type === 'Polygon'
      ? [geometry.coordinates as number[][][]]
      : (geometry.coordinates as number[][][][]);
  const parts: string[] = [];
  for (const polygon of polygons) {
    for (const ring of polygon) {
      const points = ring.map(([lng, lat]) => {
        const [x, y] = project(lng as number, lat as number);
        return `${x.toFixed(1)} ${y.toFixed(1)}`;
      });
      if (points.length > 0) parts.push(`M${points.join('L')}Z`);
    }
  }
  return parts.join('');
}

export interface Box {
  readonly x: number;
  readonly y: number;
  readonly width: number;
  readonly height: number;
}

/**
 * Largeur minimale du cadre : 0,1 unité, soit 0,01° ou environ 1,1 km de large.
 * Il faut aller jusque-là pour voir la forme du Vatican, qui mesure 400 m.
 */
export const MIN_WIDTH = 0.1;

/**
 * Ramène le cadre dans le monde : on peut zoomer et se déplacer, jamais sortir
 * de la carte ni la voir se répéter.
 */
export function clampBox(box: Box, aspect: number = WORLD_ASPECT): Box {
  const width = Math.min(WORLD.width, Math.max(MIN_WIDTH, box.width));
  const height = Math.min(WORLD.height, width / aspect);
  return {
    width,
    height,
    x: Math.min(WORLD.width - width, Math.max(0, box.x)),
    y: Math.min(WORLD.height - height, Math.max(0, box.y)),
  };
}

/**
 * Le cadre qui montre un pays entier, avec de la marge autour. Un pays large
 * est cadré large, un micro-État est cadré serré — c'est ce qui permet de voir
 * la forme de Saint-Marin comme celle de la Russie.
 */
export function boxForBounds(
  bounds: readonly [number, number, number, number],
  aspect: number = WORLD_ASPECT,
): Box {
  const [west, south, east, north] = bounds;
  // En Mercator, l'abscisse ne dépend que de la longitude et l'ordonnée que de
  // la latitude : les coins projetés suffisent à encadrer le pays.
  const [left, top] = project(west, north);
  const [right, bottom] = project(east, south);
  const spanX = right - left;
  const spanY = bottom - top;
  // Trois fois la taille du pays : on le voit en entier, avec son voisinage.
  const width = Math.max(spanX * 3, spanY * 3 * aspect, MIN_WIDTH * 6);
  return boxAroundPoint((left + right) / 2, (top + bottom) / 2, width, aspect);
}

/** Le cadre centré sur un point déjà projeté. */
export function boxAroundPoint(
  x: number,
  y: number,
  width: number,
  aspect: number = WORLD_ASPECT,
): Box {
  const height = width / aspect;
  return clampBox({ x: x - width / 2, y: y - height / 2, width, height }, aspect);
}

/** Le cadre centré sur un point géographique, à une largeur donnée. */
export function boxAround(
  lng: number,
  lat: number,
  width: number,
  aspect: number = WORLD_ASPECT,
): Box {
  const [x, y] = project(lng, lat);
  return boxAroundPoint(x, y, width, aspect);
}
