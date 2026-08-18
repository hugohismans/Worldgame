<script lang="ts">
  import Globe, { type GlobeInstance } from 'globe.gl';
  import { countryOf, countryPoints, countryPolygons } from '../data/countries.js';
  import type { Country, CountryFeature, Iso3 } from '../data/types.js';
  import { fittingAltitude } from './camera.js';
  import { GLOBE_COLORS } from './theme.js';

  interface Props {
    /** Clic sur un pays, polygone ou marqueur. */
    onselect?: (country: Country) => void;
    /** Survol : `null` quand le pointeur quitte tout pays. */
    onhover?: (country: Country | null) => void;
  }

  const { onselect, onhover }: Props = $props();

  let container: HTMLDivElement;
  let globe: GlobeInstance | undefined;
  let hovered: Iso3 | null = null;

  const isoOf = (feature: object): Iso3 => (feature as CountryFeature).properties.iso3;

  function capColor(feature: object): string {
    const iso3 = isoOf(feature);
    if (iso3 === hovered) return GLOBE_COLORS.hover;
    return countryOf(iso3)?.playable === false ? GLOBE_COLORS.landDependent : GLOBE_COLORS.land;
  }

  const pointColor = (point: object): string =>
    (point as Country).iso3 === hovered ? GLOBE_COLORS.markerHover : GLOBE_COLORS.marker;

  /** globe.gl met les accesseurs en cache : les réappliquer force le repeint. */
  function setHover(iso3: Iso3 | null): void {
    if (hovered === iso3) return;
    hovered = iso3;
    globe?.polygonCapColor(capColor).pointColor(pointColor);
    onhover?.(iso3 === null ? null : (countryOf(iso3) ?? null));
  }

  function select(iso3: Iso3): void {
    const country = countryOf(iso3);
    if (country) onselect?.(country);
  }

  $effect(() => {
    // Sphère unie : aucune texture à télécharger, et aucun repère géographique
    // qui donnerait la réponse au joueur.
    const instance = new Globe(container, { animateIn: false })
      .backgroundColor(GLOBE_COLORS.background)
      .showAtmosphere(true)
      .atmosphereColor(GLOBE_COLORS.atmosphere)
      .atmosphereAltitude(0.18)
      .showGraticules(true)
      .polygonsData(countryPolygons as unknown as object[])
      .polygonAltitude(0.008)
      .polygonCapColor(capColor)
      .polygonSideColor(() => GLOBE_COLORS.stroke)
      .polygonStrokeColor(() => GLOBE_COLORS.stroke)
      .polygonsTransitionDuration(0)
      .onPolygonHover((polygon) => setHover(polygon === null ? null : isoOf(polygon)))
      .onPolygonClick((polygon) => select(isoOf(polygon)))
      // Les pays absents de la géométrie 110m (Monaco, Malte, Singapour…)
      // sont rendus en marqueurs, cliquables comme n'importe quel polygone.
      .pointsData(countryPoints as unknown as object[])
      .pointLat((point) => (point as Country).center[1])
      .pointLng((point) => (point as Country).center[0])
      .pointAltitude(0.02)
      .pointRadius(0.55)
      .pointColor(pointColor)
      .pointsMerge(false)
      .onPointHover((point) => setHover(point === null ? null : (point as Country).iso3))
      .onPointClick((point) => select((point as Country).iso3));

    (instance.globeMaterial() as unknown as { color: { set(value: string): void } }).color.set(
      GLOBE_COLORS.ocean,
    );
    instance.controls().enablePan = false;
    instance.controls().minDistance = 130;
    instance.controls().maxDistance = 600;

    const frameGlobe = (): void => {
      const { clientWidth: width, clientHeight: height } = container;
      const fov = (instance.camera() as { fov?: number }).fov ?? 50;
      instance.pointOfView({ altitude: fittingAltitude(width, height, fov) }, 300);
    };

    instance.pointOfView({ lat: 20, lng: 5, altitude: fittingAltitude(container.clientWidth, container.clientHeight, 50) });
    globe = instance;

    const resize = new ResizeObserver(([entry]) => {
      if (entry) instance.width(entry.contentRect.width).height(entry.contentRect.height);
    });
    resize.observe(container);

    // Recadrer à la rotation de l'écran seulement : un ResizeObserver se
    // déclencherait aussi quand la barre d'adresse mobile se replie, ce qui
    // annulerait le zoom du joueur en plein jeu.
    const orientation = window.matchMedia('(orientation: portrait)');
    orientation.addEventListener('change', frameGlobe);

    return () => {
      orientation.removeEventListener('change', frameGlobe);
      resize.disconnect();
      instance._destructor();
      globe = undefined;
    };
  });
</script>

<div class="globe" bind:this={container}></div>

<style>
  .globe {
    inline-size: 100%;
    block-size: 100%;
    /* Le globe capte le geste : pas de scroll/zoom natif par-dessus. */
    touch-action: none;
  }
</style>
