import type { Iso3 } from '../../src/lib/data/types.js';

/**
 * Article défini de chaque pays en français : « **le** Pérou », « **la**
 * France », « **l'**Iran », « **les** Pays-Bas », et rien du tout pour Cuba,
 * Malte ou Singapour. Le genre d'un nom de pays ne se déduit pas de sa forme,
 * donc cette table est écrite à la main — le build échoue si un pays manque.
 */
export type FrenchArticle = 'le' | 'la' | "l'" | 'les' | '';

export const ARTICLE_FR: Readonly<Record<Iso3, FrenchArticle>> = {
  AFG: "l'", AGO: "l'", ALB: "l'", AND: "l'", ARE: 'les', ARG: "l'", ARM: "l'",
  ATG: '', AUS: "l'", AUT: "l'", AZE: "l'", BDI: 'le', BEL: 'la', BEN: 'le',
  BFA: 'le', BGD: 'le', BGR: 'la', BHR: '', BHS: 'les', BIH: 'la', BLR: 'la',
  BLZ: 'le', BOL: 'la', BRA: 'le', BRB: 'la', BRN: 'le', BTN: 'le', BWA: 'le',
  CAF: 'la', CAN: 'le', CHE: 'la', CHL: 'le', CHN: 'la', CIV: 'la', CMR: 'le',
  COD: 'la', COG: 'la', COL: 'la', COM: 'les', CPV: 'le', CRI: 'le', CUB: '',
  CYP: '', CZE: 'la', DEU: "l'", DJI: '', DMA: 'la', DNK: 'le', DOM: 'la',
  DZA: "l'", ECU: "l'", EGY: "l'", ERI: "l'", ESP: "l'", EST: "l'", ETH: "l'",
  FIN: 'la', FJI: 'les', FRA: 'la', FSM: 'la', GAB: 'le', GBR: 'le', GEO: 'la',
  GHA: 'le', GIN: 'la', GMB: 'la', GNB: 'la', GNQ: 'la', GRC: 'la', GRD: 'la',
  GTM: 'le', GUY: 'le', HND: 'le', HRV: 'la', HTI: '', HUN: 'la', IDN: "l'",
  IND: "l'", IRL: "l'", IRN: "l'", IRQ: "l'", ISL: "l'", ISR: '', ITA: "l'",
  JAM: 'la', JOR: 'la', JPN: 'le', KAZ: 'le', KEN: 'le', KGZ: 'le', KHM: 'le',
  KIR: '', KNA: '', KOR: 'la', KWT: 'le', LAO: 'le', LBN: 'le', LBR: 'le',
  LBY: 'la', LCA: '', LIE: 'le', LKA: 'le', LSO: 'le', LTU: 'la', LUX: 'le',
  LVA: 'la', MAR: 'le', MCO: '', MDA: 'la', MDG: '', MDV: 'les', MEX: 'le',
  MHL: 'les', MKD: 'la', MLI: 'le', MLT: '', MMR: 'la', MNE: 'le', MNG: 'la',
  MOZ: 'le', MRT: 'la', MUS: '', MWI: 'le', MYS: 'la', NAM: 'la', NER: 'le',
  NGA: 'le', NIC: 'le', NLD: 'les', NOR: 'la', NPL: 'le', NRU: '', NZL: 'la',
  OMN: '', PAK: 'le', PAN: 'le', PER: 'le', PHL: 'les', PLW: 'les', PNG: 'la',
  POL: 'la', PRK: 'la', PRT: 'le', PRY: 'le', QAT: 'le', ROU: 'la', RUS: 'la',
  RWA: 'le', SAU: "l'", SDN: 'le', SEN: 'le', SGP: '', SLB: 'les', SLE: 'la',
  SLV: 'le', SMR: '', SOM: 'la', SRB: 'la', SSD: 'le', STP: '', SUR: 'le',
  SVK: 'la', SVN: 'la', SWE: 'la', SWZ: "l'", SYC: 'les', SYR: 'la', TCD: 'le',
  TGO: 'le', THA: 'la', TJK: 'le', TKM: 'le', TLS: 'le', TON: 'les', TTO: '',
  TUN: 'la', TUR: 'la', TUV: '', TZA: 'la', UGA: "l'", UKR: "l'", URY: "l'",
  USA: 'les', UZB: "l'", VAT: 'la', VCT: '', VEN: 'le', VNM: 'le', VUT: 'le',
  WSM: 'les', YEM: 'le', ZAF: "l'", ZMB: 'la', ZWE: 'le',

  // Territoires : jamais demandés, mais nommés quand on clique dessus par erreur.
  ATF: 'les', ESH: 'le', FLK: 'les', GRL: 'le', NCL: 'la', PRI: '', PSE: 'la',
  TWN: '', XKX: 'le', XNC: '', XSL: 'le',
};

/** Les rares pays qui prennent « the » en anglais. */
export const ENGLISH_THE: ReadonlySet<Iso3> = new Set([
  'ARE', 'BHS', 'CAF', 'COG', 'COM', 'DOM', 'GBR', 'GMB', 'MDV', 'MHL', 'NLD',
  'PHL', 'SLB', 'SYC', 'USA',
  // Territoires
  'ATF', 'FLK',
]);
