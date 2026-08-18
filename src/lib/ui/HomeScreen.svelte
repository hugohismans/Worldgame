<script lang="ts">
  import { countries } from '../data/countries.js';
  import { REGIONS, TIERS, type RegionId, type Tier } from '../data/types.js';
  import { buildPool } from '../game/pool.js';
  import { MODES } from '../game/modes/index.js';
  import { distinctClues } from '../game/round.js';
  import { MODE_IDS, ROUND_LENGTHS, type ModeId, type PoolFilter, type RoundLength } from '../game/types.js';

  interface Props {
    onstart: (config: { mode: ModeId; length: RoundLength; filter: PoolFilter }) => void;
  }

  const { onstart }: Props = $props();

  const MODE_LABELS: Record<ModeId, { name: string; hint: string }> = {
    name: { name: 'Nom', hint: 'Trouve le Pérou' },
    flag: { name: 'Drapeau', hint: 'Le drapeau seul' },
    capital: { name: 'Capitale', hint: 'Sa capitale est Lima' },
    currency: { name: 'Monnaie', hint: 'Sa monnaie est le sol' },
  };

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

  let mode = $state<ModeId>('name');
  let length = $state<RoundLength>(10);
  let tier = $state<Tier | 'all'>('all');
  let region = $state<RegionId | 'all'>('all');

  const filter = $derived<PoolFilter>({ tier, region });
  // Le mode « monnaie » regroupe les pays d'une même zone : le nombre de
  // questions possibles n'est pas le nombre de pays.
  const available = $derived(distinctClues(buildPool(countries, MODES[mode], filter), MODES[mode]));
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
      <legend>Indice</legend>
      <div class="chips chips--wrap">
        {#each MODE_IDS as value (value)}
          <button
            type="button"
            class="chip"
            aria-pressed={mode === value}
            onclick={() => (mode = value)}
            title={MODE_LABELS[value].hint}>{MODE_LABELS[value].name}</button
          >
        {/each}
      </div>
      <p class="hint">{MODE_LABELS[mode].hint}</p>
    </fieldset>

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
        Aucune question possible dans cette sélection.
      {:else if actualLength < length}
        {available} questions disponibles : la manche en comptera {actualLength}.
      {:else}
        {available} questions possibles.
      {/if}
    </p>
    <button
      type="button"
      class="play"
      disabled={available === 0}
      onclick={() => onstart({ mode, length, filter })}>Jouer</button
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

  .count,
  .hint {
    color: var(--text-dim);
    font-size: 0.9rem;
  }

  .hint {
    padding-block-start: 0.5rem;
    font-style: italic;
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
