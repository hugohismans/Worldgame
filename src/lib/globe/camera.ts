/**
 * Position de caméra initiale. Le champ de vision de three.js est **vertical** :
 * sur un écran en portrait, c'est la largeur qui contraint le cadrage, et il
 * faut reculer sinon le globe déborde des deux côtés.
 */

/** Marge autour du globe, en proportion de la distance de cadrage exact. */
const MARGIN = 1.15;

/** Bornes de l'altitude, exprimée en rayons de globe (unité de globe.gl). */
const MIN_ALTITUDE = 2;
const MAX_ALTITUDE = 3.2;

export function fittingAltitude(width: number, height: number, fovDegrees: number): number {
  if (width <= 0 || height <= 0) return MIN_ALTITUDE;
  const halfVertical = ((fovDegrees / 2) * Math.PI) / 180;
  const halfHorizontal = Math.atan(Math.tan(halfVertical) * (width / height));
  // L'axe le plus étroit est celui qui coupe le globe en premier.
  const halfAngle = Math.min(halfVertical, halfHorizontal);
  // Distance caméra-centre pour que le globe tienne juste, en rayons de globe.
  const distance = (1 / Math.sin(halfAngle)) * MARGIN;
  return Math.min(MAX_ALTITUDE, Math.max(MIN_ALTITUDE, distance - 1));
}
