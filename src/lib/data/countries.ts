/**
 * Accès au dataset figé (`src/data/`, généré par `npm run build:data`).
 * Tout est chargé au bundle : aucune requête réseau au runtime.
 */
import countriesJson from '../../data/countries.json';
import geometryJson from '../../data/geometry.json';
import type { Country, CountryFeature, Iso3 } from './types.js';

// Le JSON perd le typage des tuples (`center`) : la forme est garantie par le
// script de génération, un cast suffit ici.
export const countries = countriesJson as unknown as readonly Country[];

/** Polygones Natural Earth 110m, une feature par pays présent à cette résolution. */
export const countryPolygons = (geometryJson as unknown as { features: CountryFeature[] }).features;

/** Pays trop petits pour exister en 110m : rendus comme marqueurs cliquables. */
export const countryPoints = countries.filter((c) => c.shape === 'point');

const index = new Map<Iso3, Country>(countries.map((c) => [c.iso3, c]));

export function countryOf(iso3: Iso3): Country | undefined {
  return index.get(iso3);
}
