import type { Iso3 } from '../../src/lib/data/types.js';

/**
 * Noms de pays : corrections manuelles là où la source (mledoze/countries)
 * donne une forme inhabituelle ou fautive en français.
 */
export const NAME_FR_OVERRIDES: Readonly<Record<Iso3, string>> = {
  COD: 'République démocratique du Congo', // source : « Congo (Rép. dém.) »
  COG: 'République du Congo', // source : « Congo »
  CPV: 'Cap-Vert', // source : « Îles du Cap-Vert »
  SUR: 'Suriname', // source : « Surinam »
  SAU: 'Arabie saoudite', // source : majuscule fautive
  ESH: 'Sahara occidental', // source : majuscule fautive
  NGA: 'Nigéria',
  PLW: 'Palaos', // source : « Palaos (Palau) »
  MUS: 'Maurice', // source : « Île Maurice »
  TLS: 'Timor oriental',
  SWZ: 'Eswatini',
  MKD: 'Macédoine du Nord',
  CZE: 'Tchéquie',
  TUR: 'Turquie',
  MMR: 'Birmanie',
  ATF: 'Terres australes et antarctiques françaises',
  FLK: 'Îles Malouines',
};

/** Idem côté anglais (la source utilise quelques formes datées). */
export const NAME_EN_OVERRIDES: Readonly<Record<Iso3, string>> = {
  CIV: "Côte d'Ivoire", // source : « Ivory Coast »
  CPV: 'Cabo Verde', // source : « Cape Verde »
  COD: 'DR Congo',
  COG: 'Republic of the Congo',
  CZE: 'Czechia',
  MMR: 'Myanmar',
  TUR: 'Türkiye',
};
