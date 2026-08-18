<script lang="ts">
  import GlobeView from './lib/globe/GlobeView.svelte';
  import type { Country } from './lib/data/types.js';

  let hovered = $state<Country | null>(null);

  function onselect(country: Country): void {
    console.log(`clic → ${country.iso3}`, country);
  }
</script>

<main>
  <GlobeView {onselect} onhover={(country) => (hovered = country)} />
  <p class="readout" aria-live="polite">
    {#if hovered}
      {hovered.name.fr} · {hovered.iso3}{hovered.playable ? '' : ' · territoire'}
    {:else}
      Survole un pays
    {/if}
  </p>
</main>

<style>
  main {
    position: relative;
    block-size: 100dvh;
    inline-size: 100vw;
  }

  .readout {
    position: absolute;
    inset-block-end: 1.5rem;
    inset-inline-start: 50%;
    translate: -50% 0;
    margin: 0;
    padding: 0.5rem 1rem;
    border-radius: 999px;
    background: color-mix(in oklab, var(--surface) 80%, transparent);
    color: var(--text);
    font-variant-numeric: tabular-nums;
    pointer-events: none;
  }
</style>
