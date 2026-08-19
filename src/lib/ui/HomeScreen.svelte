<script lang="ts">
  import { countries } from '../data/countries.js';
  import { REGIONS, TIERS, type RegionId, type Tier } from '../data/types.js';
  import { i18n } from '../i18n/i18n.svelte.js';
  import { records } from '../storage/records.svelte.js';
  import { LANGS, LANG_LABELS } from '../i18n/language.js';
  import SoundToggle from './SoundToggle.svelte';
  import { VIEWS, view } from '../storage/view.svelte.js';
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
    motto: { name: i18n.t.modeMotto, hint: i18n.t.modeMottoHint },
  });

  const tierLabels = $derived<Record<Tier | 'all', string>>({
    all: i18n.t.tierAll,
    common: i18n.t.tierCommon,
    uncommon: i18n.t.tierUncommon,
    rare: i18n.t.tierRare,
  });

  const viewLabels = $derived<Record<(typeof VIEWS)[number], string>>({
    globe: i18n.t.viewGlobe,
    map: i18n.t.viewMap,
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
  const best = $derived(records.best(mode, length));

  // L'Antarctique n'a aucun pays : le proposer n'aurait pas de sens.
  const regionOptions = ['all', ...REGIONS.filter((r) => r !== 'antarctic')] as const;
</script>

<section class="home">
  <header>
    <div class="langs">
      <SoundToggle />
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
      <legend class="label">{i18n.t.clueSection}</legend>
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
      <legend class="label">{i18n.t.lengthSection}</legend>
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
      <legend class="label">{i18n.t.poolSection}</legend>
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
      <legend class="label">{i18n.t.viewSection}</legend>
      <div class="chips">
        {#each VIEWS as value (value)}
          <button
            type="button"
            class="chip"
            aria-pressed={view.current === value}
            onclick={() => view.set(value)}>{viewLabels[value]}</button
          >
        {/each}
      </div>
    </fieldset>

    <fieldset>
      <legend class="label">{i18n.t.regionSection}</legend>
      <select bind:value={region} aria-label={i18n.t.regionSelectLabel}>
        {#each regionOptions as value (value)}
          <option {value}>{regionLabels[value]}</option>
        {/each}
      </select>
    </fieldset>
  </div>

  <footer>
    <p class="best readout">
      {#if best}{i18n.t.bestScore(best.score, best.total)}{:else}{i18n.t.noRecordYet}{/if}
    </p>
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
    /* Mobile d'abord, mais un bouton de 1 280 px de large n'aide personne :
       la colonne se borne et se centre sur grand écran. */
    inline-size: min(100%, 34rem);
    margin-inline: auto;
    display: grid;
    grid-template-rows: auto 1fr auto;
    gap: 1.25rem;
    block-size: 100%;
    padding: max(1.5rem, env(safe-area-inset-top)) 1.25rem max(1.5rem, env(safe-area-inset-bottom));
    /* Seuls les réglages défilent : « Jouer » reste sous le pouce, même sur un
       petit écran où la liste des pools passe sous la ligne de flottaison. */
    overflow: hidden;
    background: linear-gradient(
      to bottom,
      color-mix(in oklab, var(--abysse) 92%, transparent),
      color-mix(in oklab, var(--abysse) 70%, transparent)
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
    border: 1px solid var(--trait);
    border-radius: 999px;
    background: var(--surface);
    color: var(--os-fane);
    font: inherit;
    font-size: 0.85rem;
    cursor: pointer;

    &[aria-pressed='true'] {
      border-color: var(--laiton);
      color: var(--laiton-clair);
    }
  }

  h1 {
    font-size: clamp(1.9rem, 10vw, 2.75rem);
    font-weight: 700;
    letter-spacing: -0.02em;
  }

  .tagline {
    color: var(--os-fane);
  }

  .choices {
    display: flex;
    flex-direction: column;
    gap: 1.25rem;
    min-block-size: 0;
    padding-block-end: 0.5rem;
    overflow-y: auto;
    overscroll-behavior: contain;
    /* Le dernier réglage s'estompe : on comprend qu'il y a encore à faire
       défiler, sans ajouter d'ombre ni de flèche. */
    mask-image: linear-gradient(to bottom, #000 calc(100% - 2rem), transparent);
  }

  fieldset {
    border: 0;
    margin: 0;
    padding: 0;
  }

  legend {
    padding-block-end: 0.5rem;
    color: var(--os-fane);
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
    border: 1px solid var(--trait);
    border-radius: 999px;
    background: var(--surface);
    color: var(--os);
    font: inherit;
    cursor: pointer;
  }

  .chip {
    padding-inline: 1rem;

    &[aria-pressed='true'] {
      border-color: var(--laiton);
      background: color-mix(in oklab, var(--laiton) 20%, var(--surface));
      color: var(--laiton-clair);
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
    gap: 0.4rem;
    /* Détache visuellement la zone d'action des réglages qui défilent. */
    padding-block-start: 0.75rem;
    border-block-start: 1px solid var(--trait);
  }

  .count,
  .hint {
    color: var(--os-fane);
    font-size: 0.9rem;
  }

  .best {
    color: var(--laiton-clair);
    font-size: 0.8rem;
  }

  .hint {
    padding-block-start: 0.5rem;
    font-style: italic;
  }

  .play {
    margin-block-start: 0.35rem;
    padding-block: 0.9rem;
    border-color: transparent;
    background: var(--laiton);
    color: var(--abysse);
    font-size: 1.1rem;
    font-weight: 600;

    &:disabled {
      opacity: 0.4;
      cursor: not-allowed;
    }
  }
</style>
