import type { Iso3, Tier } from '../../src/lib/data/types.js';

/**
 * Niveau de notoriété des 194 pays jouables, pour composer des pools de
 * difficulté. Classement **éditorial**, du point de vue d'un joueur
 * francophone, et volontairement discutable : chaque pays est dans une liste
 * et une seule, `build-data.ts` échoue si l'un manque ou apparaît deux fois.
 *
 * Le critère n'est pas « connaître le nom » mais « savoir le placer sur un
 * globe ». C'est pourquoi Monaco, Singapour ou le Vatican — noms archi-connus,
 * points minuscules sur la carte — ne sont pas dans `common`.
 *
 * Une piste automatique a été essayée puis abandonnée : les consultations
 * Wikipédia comptent l'île pour l'Irlande et Chypre, la ligne équatoriale pour
 * l'Équateur, et donnent au Soudan du Sud plus de vues qu'aux États-Unis.
 */

/** Grands pays et pays familiers : la forme ou la position est déjà connue. */
const COMMON: readonly Iso3[] = [
  // Europe
  'FRA', 'DEU', 'ITA', 'ESP', 'PRT', 'GBR', 'IRL', 'BEL', 'NLD', 'CHE',
  'AUT', 'DNK', 'NOR', 'SWE', 'FIN', 'ISL', 'POL', 'CZE', 'GRC', 'HUN',
  'ROU', 'UKR', 'RUS',
  // Afrique
  'MAR', 'DZA', 'TUN', 'EGY', 'LBY', 'ZAF', 'SEN', 'CIV', 'MLI', 'NGA',
  'KEN', 'ETH', 'MDG',
  // Amériques
  'USA', 'CAN', 'MEX', 'BRA', 'ARG', 'CHL', 'PER', 'COL', 'CUB', 'VEN', 'BOL',
  // Asie
  'CHN', 'JPN', 'IND', 'KOR', 'PRK', 'THA', 'VNM', 'IDN', 'ISR', 'IRN',
  'IRQ', 'SAU', 'TUR', 'PAK', 'AFG', 'SYR', 'LBN',
  // Océanie
  'AUS', 'NZL',
];

/** Noms connus, mais il faut avoir regardé une carte de la région. */
const UNCOMMON: readonly Iso3[] = [
  // Europe
  'BLR', 'LTU', 'LVA', 'EST', 'SVK', 'SVN', 'HRV', 'SRB', 'BIH', 'MNE',
  'MKD', 'ALB', 'BGR', 'MDA', 'CYP', 'LUX',
  // Afrique
  'GHA', 'CMR', 'AGO', 'MOZ', 'ZWE', 'ZMB', 'TZA', 'UGA', 'SDN', 'SSD',
  'SOM', 'TCD', 'NER', 'MRT', 'BFA', 'GIN', 'GAB', 'COG', 'COD', 'CAF',
  'NAM', 'BWA',
  // Amériques
  'URY', 'PRY', 'ECU', 'PAN', 'CRI', 'GTM', 'HND', 'NIC', 'SLV', 'JAM',
  'HTI', 'DOM',
  // Asie
  'PHL', 'MYS', 'SGP', 'MMR', 'KHM', 'LAO', 'NPL', 'BGD', 'LKA', 'MNG',
  'KAZ', 'UZB', 'ARE', 'QAT', 'KWT', 'JOR', 'YEM', 'OMN', 'AZE', 'ARM', 'GEO',
  // Océanie
  'PNG', 'FJI',
];

/** Micro-États, archipels et confins : il faut chercher. */
const RARE: readonly Iso3[] = [
  // Europe
  'AND', 'MCO', 'SMR', 'VAT', 'LIE', 'MLT',
  // Afrique
  'BEN', 'TGO', 'SLE', 'LBR', 'GMB', 'GNB', 'CPV', 'STP', 'GNQ', 'BDI',
  'RWA', 'MWI', 'LSO', 'SWZ', 'ERI', 'DJI', 'COM', 'MUS', 'SYC',
  // Amériques
  'BLZ', 'SUR', 'GUY', 'TTO', 'BHS', 'BRB', 'LCA', 'VCT', 'GRD', 'DMA',
  'ATG', 'KNA',
  // Asie
  'BTN', 'BRN', 'TLS', 'TJK', 'TKM', 'KGZ', 'MDV', 'BHR',
  // Océanie
  'SLB', 'VUT', 'WSM', 'TON', 'KIR', 'TUV', 'NRU', 'MHL', 'FSM', 'PLW',
];

export const TIER_BY_ISO: ReadonlyMap<Iso3, Tier> = new Map([
  ...COMMON.map((iso) => [iso, 'common'] as const),
  ...UNCOMMON.map((iso) => [iso, 'uncommon'] as const),
  ...RARE.map((iso) => [iso, 'rare'] as const),
]);

/** Doublons éventuels entre les trois listes, signalés par le build. */
export const TIER_DUPLICATES: readonly Iso3[] = (() => {
  const seen = new Set<Iso3>();
  const duplicates = new Set<Iso3>();
  for (const iso of [...COMMON, ...UNCOMMON, ...RARE]) {
    if (seen.has(iso)) duplicates.add(iso);
    seen.add(iso);
  }
  return [...duplicates];
})();
