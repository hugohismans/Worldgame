/** Types partagés entre le script de génération et l'application. */

/** Code ISO 3166-1 alpha-3 (ou un code `X**` pour les entités sans ISO officiel). */
export type Iso3 = string;

/** Une chaîne dans les deux langues supportées. */
export interface Localized {
  readonly fr: string;
  readonly en: string;
}

export const REGIONS = ['africa', 'americas', 'asia', 'europe', 'oceania', 'antarctic'] as const;
export type RegionId = (typeof REGIONS)[number];

export interface Currency {
  /** Code ISO 4217. */
  readonly code: string;
  readonly name: Localized;
  readonly symbol: string | null;
}

/**
 * Comment le pays est représenté sur le globe.
 * - `polygon` : présent dans la géométrie Natural Earth 110m.
 * - `point`   : trop petit pour exister en 110m, rendu comme marqueur cliquable.
 */
export type Shape = 'polygon' | 'point';

export interface Country {
  readonly iso3: Iso3;
  /** Code ISO 3166-1 alpha-2, minuscule — sert aussi de nom de fichier drapeau. */
  readonly iso2: string;
  readonly name: Localized;
  readonly capital: Localized | null;
  readonly currencies: readonly Currency[];
  readonly region: RegionId;
  /**
   * `true` si le pays peut être la réponse attendue d'une question
   * (État indépendant et membre de l'ONU). Les territoires dépendants
   * sont affichés sur le globe mais jamais demandés.
   */
  readonly playable: boolean;
  readonly shape: Shape;
  /** Centre du pays en `[longitude, latitude]` — recentrage caméra et marqueurs. */
  readonly center: readonly [number, number];
  /** Superficie en km², `null` si inconnue. */
  readonly area: number | null;
  readonly population: number | null;
}

/** Géométrie allégée : une feature par pays `polygon`, sans autre propriété que l'ISO. */
export interface CountryFeature {
  readonly type: 'Feature';
  readonly properties: { readonly iso3: Iso3 };
  readonly geometry: {
    readonly type: 'Polygon' | 'MultiPolygon';
    readonly coordinates: number[][][] | number[][][][];
  };
}

export interface CountryFeatureCollection {
  readonly type: 'FeatureCollection';
  readonly features: readonly CountryFeature[];
}
