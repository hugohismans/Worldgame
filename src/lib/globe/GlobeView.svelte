<script lang="ts">
  import Globe, { type GlobeInstance } from 'globe.gl';
  import { countryOf, countryPoints, countryPolygons } from '../data/countries.js';
  import type { Country, CountryFeature, Iso3 } from '../data/types.js';
  import { fittingAltitude } from './camera.js';
  import { GLOBE_COLORS, HIGHLIGHT_COLORS, type Highlight } from './theme.js';

  interface Props {
    /** Clic sur un pays, polygone ou marqueur. */
    onselect?: (country: Country) => void;
    /** Survol : `null` quand le pointeur quitte tout pays. */
    onhover?: (country: Country | null) => void;
    /** Couleurs temporaires posées pendant la révélation d'une réponse. */
    highlights?: ReadonlyMap<Iso3, Highlight>;
    /** Pays vers lequel la caméra se recentre en s'animant. */
    focus?: Iso3 | null;
    /** À `false`, le globe se tourne mais ne se clique plus. */
    selectable?: boolean;
  }

  const { onselect, onhover, highlights, focus = null, selectable = true }: Props = $props();

  let container: HTMLDivElement;
  let globe: GlobeInstance | undefined;
  let hovered: Iso3 | null = null;

  /**
   * Le survol n'a de sens qu'à la souris. Au doigt, il n'existe pas
   * d'événement de sortie : faire tourner le globe colorerait chaque pays qui
   * passe sous le doigt, et le dernier resterait allumé une fois le geste
   * terminé. On part de ce que dit l'appareil, puis on suit le type de
   * pointeur réellement utilisé — un portable tactile fait les deux.
   */
  let hoverFromMouse = !window.matchMedia('(hover: none), (pointer: coarse)').matches;

  const isoOf = (feature: object): Iso3 => (feature as CountryFeature).properties.iso3;

  function colorOf(iso3: Iso3, base: string, hoverColor: string): string {
    const highlight = highlights?.get(iso3);
    if (highlight) return HIGHLIGHT_COLORS[highlight];
    // Pendant la révélation, le globe ne réagit plus au survol : un pays
    // simplement pointé ne doit pas se confondre avec une réponse.
    if (selectable && hoverFromMouse && iso3 === hovered) return hoverColor;
    return base;
  }

  function capColor(feature: object): string {
    const iso3 = isoOf(feature);
    const base =
      countryOf(iso3)?.playable === false ? GLOBE_COLORS.landDependent : GLOBE_COLORS.land;
    return colorOf(iso3, base, GLOBE_COLORS.hover);
  }

  const pointColor = (point: object): string =>
    colorOf((point as Country).iso3, GLOBE_COLORS.marker, GLOBE_COLORS.markerHover);

  function repaint(): void {
    globe?.polygonCapColor(capColor).pointColor(pointColor);
  }

  /** globe.gl met les accesseurs en cache : les réappliquer force le repeint. */
  function setHover(iso3: Iso3 | null): void {
    if (hovered === iso3) return;
    hovered = iso3;
    repaint();
    onhover?.(iso3 === null ? null : (countryOf(iso3) ?? null));
  }

  function trackPointerType(event: PointerEvent): void {
    const isMouse = event.pointerType === 'mouse';
    if (isMouse === hoverFromMouse) return;
    hoverFromMouse = isMouse;
    if (!isMouse) hovered = null;
    repaint();
  }

  function select(iso3: Iso3): void {
    if (!selectable) return;
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
      .polygonAltitude(0.01)
      .polygonCapColor(capColor)
      // Deux pays voisins partagent exactement les mêmes points de frontière :
      // leurs parois latérales seraient rigoureusement confondues et le GPU
      // n'arriverait pas à les départager (scintillement). On les rend
      // invisibles, la frontière est dessinée par le trait.
      .polygonSideColor(() => 'rgba(0, 0, 0, 0)')
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

    // Le plan de coupe proche par défaut (0.1) est absurde ici : rien n'est
    // jamais à moins de 29 unités de la caméra, et cet écart démesuré entre
    // near et far ruine la précision du tampon de profondeur — d'où le
    // scintillement des frontières et de la grille (que three-globe pose
    // exactement sur la sphère).
    const camera = instance.camera() as unknown as {
      near: number;
      far: number;
      updateProjectionMatrix(): void;
    };
    camera.near = 10;
    camera.far = 1200;
    camera.updateProjectionMatrix();
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

    container.addEventListener('pointerdown', trackPointerType, { passive: true });
    container.addEventListener('pointermove', trackPointerType, { passive: true });

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
      container.removeEventListener('pointerdown', trackPointerType);
      container.removeEventListener('pointermove', trackPointerType);
      orientation.removeEventListener('change', frameGlobe);
      resize.disconnect();
      instance._destructor();
      globe = undefined;
    };
  });

  // Repeindre quand le feedback change : globe.gl met les accesseurs en cache.
  $effect(() => {
    void highlights;
    void selectable;
    repaint();
  });

  // Amener la bonne réponse au centre, pour qu'on la voie là où elle est.
  $effect(() => {
    const iso3 = focus;
    if (!iso3 || !globe) return;
    const country = countryOf(iso3);
    if (!country) return;
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    globe.pointOfView(
      { lat: country.center[1], lng: country.center[0], altitude: globe.pointOfView().altitude },
      reduced ? 0 : 900,
    );
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
