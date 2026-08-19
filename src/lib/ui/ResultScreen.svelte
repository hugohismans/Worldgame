<script lang="ts">
  import { countryOf } from '../data/countries.js';
  import { i18n } from '../i18n/i18n.svelte.js';
  import type { RoundSummary } from '../game/types.js';

  interface Props {
    summary: RoundSummary;
    /** `true` quand la manche vient de battre le record du mode. */
    isRecord: boolean;
    onreplay: () => void;
    onhome: () => void;
  }

  const { summary, isRecord, onreplay, onhome }: Props = $props();

  const percent = $derived(Math.round(summary.accuracy * 100));
</script>

<section class="result">
  <header>
    <p class="label">{i18n.t.roundOver}</p>
    <p class="score readout"><strong>{summary.score}</strong> / {summary.total}</p>
    {#if isRecord}
      <p class="record readout">★ {i18n.t.newRecord}</p>
    {/if}
    <dl class="stats">
      <div><dt class="label">{i18n.t.accuracy}</dt><dd class="readout">{percent}%</dd></div>
      <div>
        <dt class="label">{i18n.t.bestStreak}</dt>
        <dd class="readout">{summary.bestStreak}</dd>
      </div>
    </dl>
  </header>

  {#if summary.missed.length > 0}
    <div class="missed">
      <h2 class="label">{i18n.t.toReview}</h2>
      <ul>
        {#each summary.missed as answer (answer.question.answer)}
          {@const expected = countryOf(answer.question.answer)}
          {@const picked = answer.picked ? countryOf(answer.picked) : undefined}
          <li>
            <span class="expected">{expected ? i18n.of(expected.name) : ''}</span>
            {#if picked && picked.iso3 !== expected?.iso3}
              <span class="picked">{i18n.t.answered(i18n.of(picked.name))}</span>
            {/if}
          </li>
        {/each}
      </ul>
    </div>
  {:else}
    <p class="perfect">{i18n.t.flawless}</p>
  {/if}

  <footer>
    <button type="button" class="primary" onclick={onreplay}>{i18n.t.playAgain}</button>
    <button type="button" onclick={onhome}>{i18n.t.changeSettings}</button>
  </footer>
</section>

<style>
  .result {
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
    block-size: 100%;
    padding: max(1.5rem, env(safe-area-inset-top)) 1.25rem max(1.5rem, env(safe-area-inset-bottom));
    /* C'est la liste qui défile, pas l'écran : les boutons restent atteignables
       au pouce même avec trente pays ratés. */
    overflow: hidden;
    background: color-mix(in oklab, var(--abysse) 94%, transparent);
  }

  .score {
    font-size: clamp(2.5rem, 16vw, 4rem);
    font-variant-numeric: tabular-nums;
    line-height: 1;

    & strong {
      color: var(--laiton);
    }
  }

  .record {
    margin-block-start: 0.35rem;
    color: var(--laiton);
    font-size: 0.9rem;
    letter-spacing: 0.06em;
    animation: record-in 500ms ease-out;
  }

  @keyframes record-in {
    from {
      opacity: 0;
      scale: 0.9;
    }
  }

  .stats {
    display: flex;
    gap: 2rem;
    margin-block-start: 1rem;

    & dd {
      margin: 0;
      font-size: 1.25rem;
      font-variant-numeric: tabular-nums;
    }
  }

  .missed {
    display: flex;
    flex: 1;
    flex-direction: column;
    min-block-size: 0;

    & h2 {
      margin-block-end: 0.5rem;
    }

    & ul {
      display: flex;
      flex: 1;
      flex-direction: column;
      gap: 0.25rem;
      min-block-size: 0;
      margin: 0;
      padding: 0;
      overflow-y: auto;
      list-style: none;
      overscroll-behavior: contain;
    }

    & li {
      display: flex;
      flex-wrap: wrap;
      gap: 0.5rem;
      align-items: baseline;
      padding-block: 0.5rem;
      border-block-end: 1px solid var(--trait);
    }
  }

  .expected {
    font-weight: 600;
  }

  .picked {
    color: var(--corail);
    font-size: 0.85rem;
  }

  .perfect {
    flex: 1;
    color: var(--verdigris);
    font-size: 1.25rem;
  }

  footer {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  button {
    min-block-size: 48px;
    border: 1px solid var(--trait);
    border-radius: 999px;
    background: var(--surface);
    color: var(--os);
    font: inherit;
    cursor: pointer;

    &.primary {
      border-color: transparent;
      background: var(--laiton);
      color: var(--abysse);
      font-weight: 600;
    }
  }
</style>
