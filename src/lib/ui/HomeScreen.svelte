<script lang="ts">
  import { countries } from '../data/countries.js';
  import { REGIONS, TIERS, type RegionId, type Tier } from '../data/types.js';
  import { buildPool } from '../game/pool.js';
  import { nameMode } from '../game/modes/name.js';
  import { ROUND_LENGTHS, type PoolFilter, type RoundLength } from '../game/types.js';

  interface Props {
    onstart: (config: { length: RoundLength; filter: PoolFilter }) => void;
  }

  const { onstart }: Props = $props();

  const TIER_LABELS: Record<Tier | 'all', string> = {
    all: 'Le monde entier',
    common: 'Grand public',
    uncommon: 'Hors-piste',
    rare: 'Terra incognita',
  };

  const REGION_LABELS: Record<RegionId | 'all', string> = {
    all: 'Tous les continents',
    africa: 'Afrique',
    americas: 'Amériques',
    asia: 'Asie',
    europe: 'Europe',
    oceania: 'Océanie',
    antarctic: 'Antarctique',
  };

  let length = $state<RoundLength>(10);
  let tier = $state<Tier | 'all'>('all');
  let region = $state<RegionId | 'all'>('all');

  const filter = $derived<PoolFilter>({ tier, region });
  const available = $derived(buildPool(countries, nameMode, filter).length);
  // Une manche ne peut pas dépasser le nombre de pays disponibles.
  const actualLength = $derived(Math.min(length, available));

  // L'Antarctique n'a aucun pays : le proposer n'aurait pas de sens.
  const regionOptions = ['all', ...REGIONS.filter((r) => r !== 'antarctic')] as const;
</script>

<section class="home">
  <header>
    <h1>Worldgame</h1>
    <p class="tagline">Trouve le pays sur le globe.</p>
  </header>

  <div class="choices">
    <fieldset>
      <legend>Questions</legend>
      <div class="chips">
        {#each ROUND_LENGTHS as value (value)}
          <button
            type="button"
            class="chip"
            aria-pressed={length === value}
            onclick={() => (length = value)}>{value}</button
          >
        {/each}
      </div>
    </fieldset>

    <fieldset>
      <legend>Pays</legend>
      <div class="chips chips--wrap">
        {#each ['all', ...TIERS] as const as value (value)}
          <button
            type="button"
            class="chip"
            aria-pressed={tier === value}
            onclick={() => (tier = value)}>{TIER_LABELS[value]}</button
          >
        {/each}
      </div>
    </fieldset>

    <fieldset>
      <legend>Zone</legend>
      <select bind:value={region} aria-label="Continent">
        {#each regionOptions as value (value)}
          <option {value}>{REGION_LABELS[value]}</option>
        {/each}
      </select>
    </fieldset>
  </div>

  <footer>
    <p class="count" aria-live="polite">
      {#if available === 0}
        Aucun pays dans cette sélection.
      {:else if actualLength < length}
        {available} pays disponibles : la manche en comptera {actualLength}.
      {:else}
        {available} pays possibles.
      {/if}
    </p>
    <button
      type="button"
      class="play"
      disabled={available === 0}
      onclick={() => onstart({ length, filter })}>Jouer</button
    >
  </footer>
</section>

<style>
  .home {
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
    justify-content: space-between;
    block-size: 100%;
    padding: max(1.5rem, env(safe-area-inset-top)) 1.25rem max(1.5rem, env(safe-area-inset-bottom));
    overflow-y: auto;
    background: linear-gradient(
      to bottom,
      color-mix(in oklab, var(--space) 92%, transparent),
      color-mix(in oklab, var(--space) 70%, transparent)
    );
  }

  h1 {
    font-size: clamp(2rem, 12vw, 3rem);
    font-weight: 700;
    letter-spacing: -0.02em;
  }

  .tagline {
    color: var(--text-dim);
  }

  .choices {
    display: flex;
    flex-direction: column;
    gap: 1.25rem;
  }

  fieldset {
    border: 0;
    margin: 0;
    padding: 0;
  }

  legend {
    padding-block-end: 0.5rem;
    color: var(--text-dim);
    font-size: 0.8rem;
    letter-spacing: 0.08em;
    text-transform: uppercase;
  }

  .chips {
    display: flex;
    gap: 0.5rem;

    &.chips--wrap {
      flex-wrap: wrap;
    }
  }

  .chip,
  .play,
  select {
    /* 44 px : la cible tactile minimale confortable. */
    min-block-size: 44px;
    border: 1px solid var(--line);
    border-radius: 999px;
    background: var(--surface);
    color: var(--text);
    font: inherit;
    cursor: pointer;
  }

  .chip {
    padding-inline: 1rem;

    &[aria-pressed='true'] {
      border-color: var(--accent);
      background: color-mix(in oklab, var(--accent) 20%, var(--surface));
      color: var(--accent-text);
    }
  }

  select {
    inline-size: 100%;
    padding-inline: 1rem;
    border-radius: 0.75rem;
  }

  footer {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
  }

  .count {
    color: var(--text-dim);
    font-size: 0.9rem;
  }

  .play {
    padding-block: 0.9rem;
    border-color: transparent;
    background: var(--accent);
    color: var(--space);
    font-size: 1.1rem;
    font-weight: 600;

    &:disabled {
      opacity: 0.4;
      cursor: not-allowed;
    }
  }
</style>
