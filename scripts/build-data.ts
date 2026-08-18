/**
 * Génère le dataset du jeu à partir de deux sources figées, puis l'écrit dans
 * `src/data/`. À relancer à la main (`npm run build:data`) — le résultat est
 * commité, l'application ne fait aucune requête réseau au runtime.
 *
 * Sources :
 *  - Natural Earth `admin_0_countries` 1:110m (domaine public) → géométries + noms FR/EN
 *  - mledoze/countries (ODbL) → capitales, monnaies, régions, superficie, population
 *    (c'est la source amont de REST Countries, dont l'API publique est dépréciée)
 *  - flag-icons (MIT, devDependency) → drapeaux SVG copiés localement
 */
import { mkdir, readFile, writeFile, copyFile, rm, readdir } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import type { Country, CountryFeature, Currency, Iso3, RegionId, Tier } from '../src/lib/data/types.js';
import {
  EXTRA_ENTITIES,
  ISO_ALIASES,
  NE_ISO_FIXES,
  REGION_BY_SOURCE,
} from './overrides/geography.js';
import { NAME_EN_OVERRIDES, NAME_FR_OVERRIDES } from './overrides/names.js';
import { CAPITAL_FR_OVERRIDES } from './overrides/capitals.js';
import { CURRENCY_EN_OVERRIDES, CURRENCY_FR } from './overrides/currencies.js';
import { TIER_BY_ISO, TIER_DUPLICATES } from './overrides/tiers.js';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const CACHE = resolve(ROOT, '.cache');
const OUT_DATA = resolve(ROOT, 'src/data');
const OUT_FLAGS = resolve(ROOT, 'src/assets/flags');
const FLAG_SRC = resolve(ROOT, 'node_modules/flag-icons/flags/4x3');

const SOURCES = {
  naturalEarth:
    'https://raw.githubusercontent.com/nvkelso/natural-earth-vector/master/geojson/ne_110m_admin_0_countries.geojson',
  countries: 'https://raw.githubusercontent.com/mledoze/countries/master/countries.json',
} as const;

/** Précision des coordonnées conservées : 3 décimales ≈ 110 m, largement au-delà du 1:110m. */
const COORD_PRECISION = 3;

// --- sources brutes (typage minimal, on ne lit que ce qu'on utilise) ---

interface NeProperties {
  ISO_A3: string;
  ISO_A3_EH: string;
  NAME: string;
  NAME_EN: string;
  NAME_FR: string;
  /** Estimation de population portée par Natural Earth (millésime `POP_YEAR`). */
  POP_EST: number;
}

interface RawCountry {
  cca2: string;
  cca3: string;
  name: { common: string };
  translations?: Record<string, { common: string }>;
  capital?: string[];
  currencies?: Record<string, { name: string; symbol?: string }>;
  region: string;
  latlng?: [number, number];
  area?: number;
  population?: number;
  independent?: boolean;
  unMember?: boolean;
}

const problems: string[] = [];
const notices: string[] = [];

async function fetchCached(name: string, url: string): Promise<string> {
  const file = resolve(CACHE, name);
  if (existsSync(file)) {
    console.log(`· ${name} (cache)`);
    return readFile(file, 'utf8');
  }
  console.log(`· ${name} ← ${url}`);
  const res = await fetch(url);
  if (!res.ok) throw new Error(`${url} → HTTP ${res.status}`);
  const text = await res.text();
  await mkdir(CACHE, { recursive: true });
  await writeFile(file, text);
  return text;
}

const round = (n: number): number => Number(n.toFixed(COORD_PRECISION));

function roundCoords(input: unknown): unknown {
  if (typeof input === 'number') return round(input);
  if (Array.isArray(input)) return input.map(roundCoords);
  throw new Error('coordonnées inattendues');
}

/** Résout l'ISO d'un polygone Natural Earth, `-99` compris. */
function isoOfFeature(props: NeProperties): Iso3 {
  if (props.ISO_A3 && props.ISO_A3 !== '-99') return props.ISO_A3;
  if (props.ISO_A3_EH && props.ISO_A3_EH !== '-99') return props.ISO_A3_EH;
  const fixed = NE_ISO_FIXES[props.NAME];
  if (fixed) return fixed;
  problems.push(`Polygone sans ISO exploitable : « ${props.NAME} »`);
  return `X_${props.NAME.replace(/\W+/g, '_').toUpperCase()}`;
}

/** Centroïde de l'anneau extérieur le plus vaste — sert à vérifier `latlng`. */
function polygonCentroid(geometry: CountryFeature['geometry']): [number, number] {
  const polygons =
    geometry.type === 'Polygon'
      ? [geometry.coordinates as number[][][]]
      : (geometry.coordinates as number[][][][]);
  let best: number[][] = [];
  let bestArea = -1;
  for (const poly of polygons) {
    const ring = poly[0]!;
    let area = 0;
    for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
      area += ring[j]![0]! * ring[i]![1]! - ring[i]![0]! * ring[j]![1]!;
    }
    area = Math.abs(area / 2);
    if (area > bestArea) [bestArea, best] = [area, ring];
  }
  let x = 0;
  let y = 0;
  let a = 0;
  for (let i = 0, j = best.length - 1; i < best.length; j = i++) {
    const [x0, y0] = best[j] as [number, number];
    const [x1, y1] = best[i] as [number, number];
    const f = x0 * y1 - x1 * y0;
    a += f;
    x += (x0 + x1) * f;
    y += (y0 + y1) * f;
  }
  if (a === 0) return [best[0]![0]!, best[0]![1]!];
  return [x / (3 * a), y / (3 * a)];
}

function buildCurrencies(raw: RawCountry): Currency[] {
  return Object.entries(raw.currencies ?? []).map(([code, value]) => {
    const fr = CURRENCY_FR[code];
    if (!fr) problems.push(`Monnaie sans nom français : ${code} (${raw.cca3})`);
    return {
      code,
      name: { fr: fr ?? code, en: CURRENCY_EN_OVERRIDES[code] ?? value.name },
      symbol: value.symbol ?? null,
    };
  });
}

async function main(): Promise<void> {
  const [neText, rawText] = await Promise.all([
    fetchCached('ne_110m_admin_0_countries.geojson', SOURCES.naturalEarth),
    fetchCached('countries.json', SOURCES.countries),
  ]);

  const ne = JSON.parse(neText) as {
    features: { properties: NeProperties; geometry: CountryFeature['geometry'] }[];
  };
  const raws = (JSON.parse(rawText) as RawCountry[]).map((c) => ({
    ...c,
    cca3: ISO_ALIASES[c.cca3] ?? c.cca3,
  }));
  const rawByIso = new Map(raws.map((c) => [c.cca3, c]));

  // --- géométries ---
  const features: CountryFeature[] = [];
  const centroidByIso = new Map<Iso3, [number, number]>();
  const populationByIso = new Map<Iso3, number>();
  for (const f of ne.features) {
    const iso3 = isoOfFeature(f.properties);
    // L'Antarctique est un décor : ni jouable, ni cliquable, il fausse le globe.
    if (iso3 === 'ATA') continue;
    const geometry = {
      type: f.geometry.type,
      coordinates: roundCoords(f.geometry.coordinates),
    } as CountryFeature['geometry'];
    features.push({ type: 'Feature', properties: { iso3 }, geometry });
    centroidByIso.set(iso3, polygonCentroid(geometry));
    if (typeof f.properties.POP_EST === 'number') populationByIso.set(iso3, f.properties.POP_EST);
  }

  // --- pays ---
  const extraByIso = new Map(EXTRA_ENTITIES.map((e) => [e.iso3, e]));
  const wanted = new Set<Iso3>([
    ...raws.filter((c) => c.independent === true && c.unMember === true).map((c) => c.cca3),
    ...centroidByIso.keys(),
  ]);

  const countries: Country[] = [];
  for (const iso3 of [...wanted].sort()) {
    const shape = centroidByIso.has(iso3) ? 'polygon' : 'point';
    const extra = extraByIso.get(iso3);
    const raw = rawByIso.get(iso3);

    if (!raw) {
      if (!extra) {
        problems.push(`Polygone sans métadonnées : ${iso3}`);
        continue;
      }
      countries.push({
        iso3,
        iso2: extra.iso2,
        name: extra.name,
        capital: extra.capital,
        currencies: [],
        region: extra.region,
        playable: false,
        tier: null,
        shape,
        center: extra.center,
        area: null,
        population: null,
      });
      continue;
    }

    const region = REGION_BY_SOURCE[raw.region] as RegionId | undefined;
    if (!region) {
      problems.push(`Région inconnue pour ${iso3} : « ${raw.region} »`);
      continue;
    }

    const nameFr = NAME_FR_OVERRIDES[iso3] ?? raw.translations?.fra?.common;
    if (!nameFr) problems.push(`Nom français manquant : ${iso3}`);

    const capitalEn = raw.capital?.[0] ?? null;
    const capital = capitalEn
      ? { fr: CAPITAL_FR_OVERRIDES[iso3] ?? capitalEn, en: capitalEn }
      : null;

    const playable = raw.independent === true && raw.unMember === true;
    if (playable && !capital) problems.push(`Capitale manquante : ${iso3}`);

    let tier: Tier | null = null;
    if (playable) {
      tier = TIER_BY_ISO.get(iso3) ?? null;
      if (!tier) problems.push(`Pays absent des listes de notoriété : ${iso3}`);
    }

    const latlng = raw.latlng;
    if (!latlng) problems.push(`Coordonnées manquantes : ${iso3}`);
    const center: [number, number] = latlng
      ? [round(latlng[1]), round(latlng[0])]
      : (centroidByIso.get(iso3) ?? [0, 0]);

    // Contrôle croisé : un `latlng` très loin du centroïde du polygone est suspect.
    const centroid = centroidByIso.get(iso3);
    if (centroid) {
      const drift = Math.max(Math.abs(centroid[0] - center[0]), Math.abs(centroid[1] - center[1]));
      if (drift > 15) {
        notices.push(
          `${iso3} : centre déclaré [${center}] à ${drift.toFixed(0)}° du centroïde [${centroid.map((v) => v.toFixed(1))}]`,
        );
      }
    }

    countries.push({
      iso3,
      iso2: raw.cca2.toLowerCase(),
      name: { fr: nameFr ?? raw.name.common, en: NAME_EN_OVERRIDES[iso3] ?? raw.name.common },
      capital,
      currencies: buildCurrencies(raw),
      region,
      playable,
      tier,
      shape,
      center,
      area: raw.area ?? null,
      population: populationByIso.get(iso3) ?? null,
    });
  }

  // --- cohérence des listes de notoriété ---
  for (const iso3 of TIER_DUPLICATES) {
    problems.push(`Pays dans plusieurs listes de notoriété : ${iso3}`);
  }
  const playableIsos = new Set(countries.filter((c) => c.playable).map((c) => c.iso3));
  for (const iso3 of TIER_BY_ISO.keys()) {
    if (!playableIsos.has(iso3)) problems.push(`Liste de notoriété : ${iso3} n'est pas un pays jouable`);
  }

  // --- drapeaux ---
  await rm(OUT_FLAGS, { recursive: true, force: true });
  await mkdir(OUT_FLAGS, { recursive: true });
  const available = new Set(await readdir(FLAG_SRC));
  for (const iso2 of new Set(countries.map((c) => c.iso2))) {
    const file = `${iso2}.svg`;
    if (!available.has(file)) {
      problems.push(`Drapeau manquant : ${iso2}`);
      continue;
    }
    await copyFile(resolve(FLAG_SRC, file), resolve(OUT_FLAGS, file));
  }

  // --- écriture ---
  await mkdir(OUT_DATA, { recursive: true });
  await writeFile(
    resolve(OUT_DATA, 'countries.json'),
    `${JSON.stringify(countries, null, 0)}\n`,
  );
  await writeFile(
    resolve(OUT_DATA, 'geometry.json'),
    `${JSON.stringify({ type: 'FeatureCollection', features }, null, 0)}\n`,
  );

  // --- rapport ---
  const noPopulation = countries.filter((c) => c.playable && c.population === null);
  if (noPopulation.length) {
    notices.push(
      `population inconnue pour ${noPopulation.length} pays sans polygone : ${noPopulation.map((c) => c.iso3).join(', ')}`,
    );
  }

  const playable = countries.filter((c) => c.playable);
  console.log(`\n${countries.length} entités écrites — ${features.length} polygones`);
  console.log(
    `  jouables : ${playable.length} (${playable.filter((c) => c.shape === 'polygon').length} polygones, ${playable.filter((c) => c.shape === 'point').length} marqueurs)`,
  );
  console.log(`  décor (non jouables) : ${countries.length - playable.length}`);
  for (const tier of ['common', 'uncommon', 'rare'] as const) {
    console.log(`  notoriété « ${tier} » : ${playable.filter((c) => c.tier === tier).length}`);
  }

  if (notices.length) {
    console.log(`\n⚠︎ Données à vérifier (${notices.length}) :`);
    for (const n of notices) console.log(`  - ${n}`);
  }
  if (problems.length) {
    console.error(`\n✗ ${problems.length} problème(s) bloquant(s) :`);
    for (const p of problems) console.error(`  - ${p}`);
    process.exitCode = 1;
  } else {
    console.log('\n✓ dataset complet');
  }
}

await main();
