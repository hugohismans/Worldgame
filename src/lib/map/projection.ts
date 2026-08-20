import type { CountryFeature } from '../data/types.js';

/**
 * Projection équirectangulaire : la longitude devient l'abscisse, la latitude
 * l'ordonnée. C'est la projection du planisphère scolaire — elle étire les
 * hautes latitudes, mais elle garde les positions relatives lisibles et se
 * calcule en une ligne, sans bibliothèque de cartographie.
 */

/** Unités de dessin par degré. 10 donne un canevas de 3600 × 1800. */
const SCALE = 10;

export const WORLD = { width: 360 * SCALE, height: 180 * SCALE } as const;

/** Le cadre garde toujours les proportions du monde : deux fois plus large que haut. */
export const WORLD_ASPECT = WORLD.width / WORLD.height;

export const project = (lng: number, lat: number): [number, number] => [
  (lng + 180) * SCALE,
  (90 - lat) * SCALE,
];

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
 * Cadrage initial : on cherche à ce que la carte occupe environ 60 % de la
 * hauteur disponible. Sur un écran large, cela laisse le monde entier ; sur un
 * téléphone en portrait, le monde entier tiendrait dans une bande où un petit
 * pays ferait deux pixels, donc on part plus près.
 */
export function initialBox(width: number, height: number): Box {
  if (width <= 0 || height <= 0) return { x: 0, y: 0, width: WORLD.width, height: WORLD.height };
  const scale = (0.6 * height) / WORLD.height;
  const boxWidth = Math.min(WORLD.width, width / scale);
  // Centré sur l'Europe et l'Afrique : le point de départ le plus neutre.
  return boxAround(10, 15, boxWidth);
}

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
  const spanX = (east - west) * SCALE;
  const spanY = (north - south) * SCALE;
  // Trois fois la taille du pays : on le voit en entier, avec son voisinage.
  const width = Math.max(spanX * 3, spanY * 3 * aspect, MIN_WIDTH * 6);
  return boxAround((west + east) / 2, (south + north) / 2, width, aspect);
}

/** Le cadre centré sur un point, à une largeur donnée. */
export function boxAround(
  lng: number,
  lat: number,
  width: number,
  aspect: number = WORLD_ASPECT,
): Box {
  const [x, y] = project(lng, lat);
  const height = width / aspect;
  return clampBox({ x: x - width / 2, y: y - height / 2, width, height }, aspect);
}
