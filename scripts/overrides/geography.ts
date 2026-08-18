import type { Iso3, RegionId } from '../../src/lib/data/types.js';

/**
 * Polygones Natural Earth dont `ISO_A3` vaut `-99`.
 * Norvège et France sont réparables via `ISO_A3_EH`; les trois autres n'ont
 * pas de code ISO officiel, on leur attribue un code `X**` de convention.
 */
export const NE_ISO_FIXES: Readonly<Record<string, Iso3>> = {
  Kosovo: 'XKX',
  'N. Cyprus': 'XNC',
  Somaliland: 'XSL',
};

/** Entités présentes sur la carte mais absentes de la base pays (pas d'ISO officiel). */
export const EXTRA_ENTITIES: readonly {
  iso3: Iso3;
  iso2: string;
  name: { fr: string; en: string };
  capital: { fr: string; en: string } | null;
  region: RegionId;
  center: [number, number];
}[] = [
  {
    iso3: 'XNC',
    iso2: 'cy', // pas de drapeau ISO propre — on réutilise celui de Chypre
    name: { fr: 'Chypre du Nord', en: 'Northern Cyprus' },
    capital: { fr: 'Nicosie', en: 'Nicosia' },
    region: 'asia',
    center: [33.4, 35.2],
  },
  {
    iso3: 'XSL',
    iso2: 'so', // idem, drapeau de la Somalie faute de code ISO
    name: { fr: 'Somaliland', en: 'Somaliland' },
    capital: { fr: 'Hargeisa', en: 'Hargeisa' },
    region: 'africa',
    center: [46.2, 9.6],
  },
];

/** Kosovo : `UNK` chez mledoze, `XKX` dans l'usage courant. */
export const ISO_ALIASES: Readonly<Record<string, Iso3>> = { UNK: 'XKX' };

/** mledoze `region` → identifiant de région interne. */
export const REGION_BY_SOURCE: Readonly<Record<string, RegionId>> = {
  Africa: 'africa',
  Americas: 'americas',
  Asia: 'asia',
  Europe: 'europe',
  Oceania: 'oceania',
  Antarctic: 'antarctic',
};

export const REGION_LABELS: Readonly<Record<RegionId, { fr: string; en: string }>> = {
  africa: { fr: 'Afrique', en: 'Africa' },
  americas: { fr: 'Amériques', en: 'Americas' },
  asia: { fr: 'Asie', en: 'Asia' },
  europe: { fr: 'Europe', en: 'Europe' },
  oceania: { fr: 'Océanie', en: 'Oceania' },
  antarctic: { fr: 'Antarctique', en: 'Antarctica' },
};
