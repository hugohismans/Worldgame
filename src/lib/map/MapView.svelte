<script lang="ts">
  import { untrack } from 'svelte';
  import { countryOf, countryPoints, countryPolygons } from '../data/countries.js';
  import type { Country, Iso3 } from '../data/types.js';
  import { GLOBE_COLORS, HIGHLIGHT_COLORS, type Highlight } from '../globe/theme.js';
  import {
    WORLD,
    WORLD_ASPECT,
    boxAround,
    clampBox,
    initialBox,
    pathOf,
    project,
    type Box,
  } from './projection.js';

  interface Props {
    onselect?: (country: Country) => void;
    onhover?: (country: Country | null) => void;
    highlights?: ReadonlyMap<Iso3, Highlight>;
    focus?: Iso3 | null;
    selectable?: boolean;
  }

  const { onselect, onhover, highlights, focus = null, selectable = true }: Props = $props();

  /** Les tracés sont calculés une fois : la géométrie ne change jamais. */
  const shapes = countryPolygons.map((feature) => ({
    iso3: feature.properties.iso3,
    d: pathOf(feature.geometry),
    playable: countryOf(feature.properties.iso3)?.playable !== false,
  }));

  const markers = countryPoints.map((country) => ({
    iso3: country.iso3,
    position: project(country.center[0], country.center[1]),
  }));

  const GRATICULE = { meridians: [-150, -120, -90, -60, -30, 0, 30, 60, 90, 120, 150], parallels: [-60, -30, 0, 30, 60] };

  let svg: SVGSVGElement;
  // Le cadre garde les proportions du monde ; l'écran le laisse entier et
  // comble le reste (`meet`), sans quoi un téléphone en portrait n'en verrait
  // qu'une bande verticale.
  let box = $state<Box>({ x: 0, y: 0, width: WORLD.width, height: WORLD.height });
  let hovered = $state<Iso3 | null>(null);
  let hoverFromMouse = $state(!window.matchMedia('(hover: none), (pointer: coarse)').matches);

  /** Rayon des marqueurs, constant à l'écran quel que soit le zoom. */
  const markerRadius = $derived((box.width / WORLD.width) * 14);
  const strokeWidth = $derived((box.width / WORLD.width) * 1.6);

  function colorOf(iso3: Iso3, playable: boolean): string {
    const highlight = highlights?.get(iso3);
    if (highlight) return HIGHLIGHT_COLORS[highlight];
    if (selectable && hoverFromMouse && iso3 === hovered) return GLOBE_COLORS.hover;
    return playable ? GLOBE_COLORS.land : GLOBE_COLORS.landDependent;
  }

  function setHover(iso3: Iso3 | null): void {
    if (hovered === iso3) return;
    hovered = iso3;
    onhover?.(iso3 === null ? null : (countryOf(iso3) ?? null));
  }

  function select(iso3: Iso3): void {
    // Un déplacement de la carte ne doit pas valider une réponse.
    if (!selectable || dragged) return;
    const country = countryOf(iso3);
    if (country) onselect?.(country);
  }

  // --- déplacement et zoom ---

  const pointers = new Map<number, { x: number; y: number }>();
  let dragged = false;
  let pinchDistance = 0;

  /**
   * Combien d'unités de carte vaut un pixel d'écran. Avec `meet`, la carte est
   * mise à l'échelle sur son axe le plus contraint.
   */
  function perPixel(): number {
    const rect = svg?.getBoundingClientRect();
    if (!rect || rect.width === 0) return 1;
    return 1 / Math.min(rect.width / box.width, rect.height / box.height);
  }

  function onpointerdown(event: PointerEvent): void {
    if (event.pointerType === 'mouse' !== hoverFromMouse) {
      hoverFromMouse = event.pointerType === 'mouse';
      if (!hoverFromMouse) hovered = null;
    }
    pointers.set(event.pointerId, { x: event.clientX, y: event.clientY });
    if (pointers.size === 1) dragged = false;
    if (pointers.size === 2) pinchDistance = distanceBetweenPointers();
    // Pas de capture ici : elle détournerait l'événement `click` vers le SVG,
    // et le pays cliqué ne le recevrait jamais. On capture au premier vrai
    // déplacement, quand il n'y a plus de clic à préserver.
  }

  function distanceBetweenPointers(): number {
    const [a, b] = [...pointers.values()];
    if (!a || !b) return 0;
    return Math.hypot(a.x - b.x, a.y - b.y);
  }

  function onpointermove(event: PointerEvent): void {
    const previous = pointers.get(event.pointerId);
    if (!previous) return;
    const delta = { x: event.clientX - previous.x, y: event.clientY - previous.y };
    pointers.set(event.pointerId, { x: event.clientX, y: event.clientY });
    if (!dragged && Math.hypot(delta.x, delta.y) > 1) {
      dragged = true;
      // Le geste continue même si le doigt sort de la carte.
      svg.setPointerCapture(event.pointerId);
    }

    if (pointers.size >= 2) {
      const distance = distanceBetweenPointers();
      if (pinchDistance > 0 && distance > 0) {
        zoomBy(pinchDistance / distance, midpoint());
      }
      pinchDistance = distance;
      return;
    }
    const scale = perPixel();
    box = clampBox({ ...box, x: box.x - delta.x * scale, y: box.y - delta.y * scale });
  }

  function midpoint(): { x: number; y: number } {
    const [a, b] = [...pointers.values()];
    if (!a || !b) return { x: 0, y: 0 };
    return { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 };
  }

  function onpointerup(event: PointerEvent): void {
    pointers.delete(event.pointerId);
    if (svg.hasPointerCapture(event.pointerId)) svg.releasePointerCapture(event.pointerId);
    if (pointers.size < 2) pinchDistance = 0;
    // Laisse le clic se produire avant de réarmer la sélection.
    if (pointers.size === 0) setTimeout(() => (dragged = false), 0);
  }

  /** Zoome autour d'un point de l'écran, qui reste sous le doigt. */
  function zoomBy(factor: number, screen: { x: number; y: number }): void {
    const rect = svg.getBoundingClientRect();
    const scale = perPixel();
    // Le point sous le doigt reste sous le doigt.
    const anchorX = box.x + (screen.x - rect.left - (rect.width - box.width / scale) / 2) * scale;
    const anchorY = box.y + (screen.y - rect.top - (rect.height - box.height / scale) / 2) * scale;
    const width = box.width * factor;
    const height = width / WORLD_ASPECT;
    const ratioX = box.width === 0 ? 0.5 : (anchorX - box.x) / box.width;
    const ratioY = box.height === 0 ? 0.5 : (anchorY - box.y) / box.height;
    box = clampBox({ x: anchorX - ratioX * width, y: anchorY - ratioY * height, width, height });
  }

  function onwheel(event: WheelEvent): void {
    event.preventDefault();
    zoomBy(event.deltaY > 0 ? 1.15 : 1 / 1.15, { x: event.clientX, y: event.clientY });
  }

  // Cadrage de départ, une seule fois, quand on connaît la taille de l'écran.
  let framed = false;
  $effect(() => {
    if (framed || !svg) return;
    const rect = svg.getBoundingClientRect();
    if (rect.width === 0) return;
    framed = true;
    box = initialBox(rect.width, rect.height);
  });

  // Amène le pays attendu au centre, comme la rotation du globe.
  $effect(() => {
    const iso3 = focus;
    if (!iso3 || !svg) return;
    const country = countryOf(iso3);
    if (!country) return;
    const target = boxAround(country.center[0], country.center[1], WORLD.width / 4);
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduced) {
      box = target;
      return;
    }
    // `untrack` est indispensable : lire `box` ici relancerait l'effet à chaque
    // image de l'animation, qui repartirait sans cesse de zéro.
    const from = untrack(() => box);
    const started = performance.now();
    const step = (now: number): void => {
      const t = Math.min(1, (now - started) / 600);
      // Départ et arrivée adoucis.
      const eased = t < 0.5 ? 2 * t * t : 1 - (-2 * t + 2) ** 2 / 2;
      box = {
        x: from.x + (target.x - from.x) * eased,
        y: from.y + (target.y - from.y) * eased,
        width: from.width + (target.width - from.width) * eased,
        height: from.height + (target.height - from.height) * eased,
      };
      if (t < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  });


</script>

<svg
  bind:this={svg}
  class="map"
  viewBox="{box.x} {box.y} {box.width} {box.height}"
  preserveAspectRatio="xMidYMid meet"
  role="img"
  aria-label="Planisphère"
  {onpointerdown}
  {onpointermove}
  {onpointerup}
  onpointercancel={onpointerup}
  {onwheel}
>
  <rect x="0" y="0" width={WORLD.width} height={WORLD.height} fill={GLOBE_COLORS.ocean} />

  <!-- La grille est un décor : elle ne doit jamais intercepter un clic. -->
  <g
    stroke={GLOBE_COLORS.hover}
    stroke-opacity="0.09"
    stroke-width={strokeWidth}
    fill="none"
    pointer-events="none"
  >
    {#each GRATICULE.meridians as lng (lng)}
      <line x1={project(lng, 90)[0]} y1="0" x2={project(lng, -90)[0]} y2={WORLD.height} />
    {/each}
    {#each GRATICULE.parallels as lat (lat)}
      <line x1="0" y1={project(0, lat)[1]} x2={WORLD.width} y2={project(0, lat)[1]} />
    {/each}
  </g>

  {#each shapes as shape (shape.iso3)}
    <path
      d={shape.d}
      fill={colorOf(shape.iso3, shape.playable)}
      stroke={GLOBE_COLORS.stroke}
      stroke-width={strokeWidth}
      stroke-linejoin="round"
      onclick={() => select(shape.iso3)}
      onpointerenter={() => setHover(shape.iso3)}
      onpointerleave={() => setHover(null)}
      role="presentation"
    />
  {/each}

  {#each markers as marker (marker.iso3)}
    <circle
      cx={marker.position[0]}
      cy={marker.position[1]}
      r={markerRadius}
      fill={colorOf(marker.iso3, true) === GLOBE_COLORS.land
        ? GLOBE_COLORS.marker
        : colorOf(marker.iso3, true)}
      stroke={GLOBE_COLORS.stroke}
      stroke-width={strokeWidth}
      onclick={() => select(marker.iso3)}
      onpointerenter={() => setHover(marker.iso3)}
      onpointerleave={() => setHover(null)}
      role="presentation"
    />
  {/each}
</svg>

<style>
  .map {
    display: block;
    inline-size: 100%;
    block-size: 100%;
    background: var(--abysse);
    /* La carte capte le geste : pas de scroll ni de zoom natif par-dessus. */
    touch-action: none;
  }

  path,
  circle {
    cursor: pointer;
  }
</style>
