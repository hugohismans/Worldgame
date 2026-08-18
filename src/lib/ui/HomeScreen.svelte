<script lang="ts">
  import { countries } from '../data/countries.js';
  import { REGIONS, TIERS, type RegionId, type Tier } from '../data/types.js';
  import { i18n } from '../i18n/i18n.svelte.js';
  import { LANGS, LANG_LABELS } from '../i18n/language.js';
  import { buildPool } from '../game/pool.js';
  import { MODES } from '../game/modes/index.js';
  import { distinctClues } from '../game/round.js';
  import { MODE_IDS, ROUND_LENGTHS, type ModeId, type PoolFilter, type RoundLength } from '../game/types.js';

  interface Props {
    onstart: (config: { mode: ModeId; length: RoundLength; filter: PoolFilter }) => void;
  }

  const { onstart }: Props = $props();

  const modeLabels = $derived<Record<ModeId, { name: string; hint: string }>>({
    name: { name: i18n.t.modeName, hint: i18n.t.modeNameHint },
    flag: { name: i18n.t.modeFlag, hint: i18n.t.modeFlagHint },
    capital: { name: i18n.t.modeCapital, hint: i18n.t.modeCapitalHint },
    currency: { name: i18n.t.modeCurrency, hint: i18n.t.modeCurrencyHint },
  });

  const tierLabels = $derived<Record<Tier | 'all', string>>({
    all: i18n.t.tierAll,
    common: i18n.t.tierCommon,
    uncommon: i18n.t.tierUncommon,
    rare: i18n.t.tierRare,
  });

  const regionLabels = $derived<Record<RegionId | 'all', string>>({
    all: i18n.t.regionAll,
    africa: i18n.t.regionAfrica,
    americas: i18n.t.regionAmericas,
    asia: i18n.t.regionAsia,
    europe: i18n.t.regionEurope,
    oceania: i18n.t.regionOceania,
    antarctic: i18n.t.regionAntarctic,
  });

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
    <div class="langs">
      {#each LANGS as value (value)}
        <button
          type="button"
          class="lang"
          aria-pressed={i18n.lang === value}
          onclick={() => i18n.set(value)}
          title={LANG_LABELS[value]}>{value.toUpperCase()}</button
        >
      {/each}
    </div>
    <div class="titles">
      <h1>Worldgame</h1>
      <p class="tagline">{i18n.t.tagline}</p>
    </div>
  </header>

  <div class="choices">
    <fieldset>
      <legend>{i18n.t.clueSection}</legend>
      <div class="chips chips--wrap">
        {#each MODE_IDS as value (value)}
          <button
            type="button"
            class="chip"
            aria-pressed={mode === value}
            onclick={() => (mode = value)}
            title={modeLabels[value].hint}>{modeLabels[value].name}</button
          >
        {/each}
      </div>
      <p class="hint">{modeLabels[mode].hint}</p>
    </fieldset>

    <fieldset>
      <legend>{i18n.t.lengthSection}</legend>
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
      <legend>{i18n.t.poolSection}</legend>
      <div class="chips chips--wrap">
        {#each ['all', ...TIERS] as const as value (value)}
          <button
            type="button"
            class="chip"
            aria-pressed={tier === value}
            onclick={() => (tier = value)}>{tierLabels[value]}</button
          >
        {/each}
      </div>
    </fieldset>

    <fieldset>
      <legend>{i18n.t.regionSection}</legend>
      <select bind:value={region} aria-label={i18n.t.regionSelectLabel}>
        {#each regionOptions as value (value)}
          <option {value}>{regionLabels[value]}</option>
        {/each}
      </select>
    </fieldset>
  </div>

  <footer>
    <p class="count" aria-live="polite">
      {#if available === 0}
        {i18n.t.poolEmpty}
      {:else if actualLength < length}
        {i18n.t.poolShort(available, actualLength)}
      {:else}
        {i18n.t.poolCount(available)}
      {/if}
    </p>
    <button
      type="button"
      class="play"
      disabled={available === 0}
      onclick={() => onstart({ mode, length, filter })}>{i18n.t.play}</button
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

  header {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  /* Le sélecteur passe au-dessus du titre : à côté, « Worldgame » le poussait
     hors de l'écran sur un téléphone. */
  .langs {
    display: flex;
    gap: 0.25rem;
    align-self: end;
  }

  .lang {
    min-inline-size: 44px;
    min-block-size: 44px;
    border: 1px solid var(--line);
    border-radius: 999px;
    background: var(--surface);
    color: var(--text-dim);
    font: inherit;
    font-size: 0.85rem;
    cursor: pointer;

    &[aria-pressed='true'] {
      border-color: var(--accent);
      color: var(--accent-text);
    }
  }

  h1 {
    font-size: clamp(1.9rem, 10vw, 2.75rem);
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
