<script lang="ts">
  import { countryOf } from '../data/countries.js';
  import type { RoundSummary } from '../game/types.js';

  interface Props {
    summary: RoundSummary;
    onreplay: () => void;
    onhome: () => void;
  }

  const { summary, onreplay, onhome }: Props = $props();

  const percent = $derived(Math.round(summary.accuracy * 100));
</script>

<section class="result">
  <header>
    <p class="label">Manche terminée</p>
    <p class="score"><strong>{summary.score}</strong> / {summary.total}</p>
    <dl class="stats">
      <div><dt>Précision</dt><dd>{percent}%</dd></div>
      <div><dt>Meilleure série</dt><dd>{summary.bestStreak}</dd></div>
    </dl>
  </header>

  {#if summary.missed.length > 0}
    <div class="missed">
      <h2>À revoir</h2>
      <ul>
        {#each summary.missed as answer (answer.question.answer)}
          {@const expected = countryOf(answer.question.answer)}
          {@const picked = answer.picked ? countryOf(answer.picked) : undefined}
          <li>
            <span class="expected">{expected?.name.fr}</span>
            {#if picked && picked.iso3 !== expected?.iso3}
              <span class="picked">tu as répondu {picked.name.fr}</span>
            {/if}
          </li>
        {/each}
      </ul>
    </div>
  {:else}
    <p class="perfect">Sans faute.</p>
  {/if}

  <footer>
    <button type="button" class="primary" onclick={onreplay}>Rejouer</button>
    <button type="button" onclick={onhome}>Changer de réglages</button>
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
    background: color-mix(in oklab, var(--space) 94%, transparent);
  }

  .label {
    color: var(--text-dim);
    font-size: 0.8rem;
    letter-spacing: 0.08em;
    text-transform: uppercase;
  }

  .score {
    font-size: clamp(2.5rem, 16vw, 4rem);
    font-variant-numeric: tabular-nums;
    line-height: 1;

    & strong {
      color: var(--accent);
    }
  }

  .stats {
    display: flex;
    gap: 2rem;
    margin-block-start: 1rem;

    & dt {
      color: var(--text-dim);
      font-size: 0.85rem;
    }

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
      font-size: 0.8rem;
      letter-spacing: 0.08em;
      text-transform: uppercase;
      color: var(--text-dim);
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
      border-block-end: 1px solid var(--line);
    }
  }

  .expected {
    font-weight: 600;
  }

  .picked {
    color: var(--wrong);
    font-size: 0.85rem;
  }

  .perfect {
    flex: 1;
    color: var(--correct);
    font-size: 1.25rem;
  }

  footer {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  button {
    min-block-size: 48px;
    border: 1px solid var(--line);
    border-radius: 999px;
    background: var(--surface);
    color: var(--text);
    font: inherit;
    cursor: pointer;

    &.primary {
      border-color: transparent;
      background: var(--accent);
      color: var(--space);
      font-weight: 600;
    }
  }
</style>
