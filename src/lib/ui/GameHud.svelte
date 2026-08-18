<script lang="ts">
  import { countryOf } from '../data/countries.js';
  import type { Clue, Question } from '../game/types.js';

  interface Props {
    question: Question;
    /** Numéro de la question en cours, à partir de 1. */
    position: number;
    total: number;
    score: number;
    /** Réponse en cours de révélation, `null` tant que le joueur cherche. */
    reveal: { picked: string; correct: boolean } | null;
    onnext: () => void;
    onquit: () => void;
  }

  const { question, position, total, score, reveal, onnext, onquit }: Props = $props();

  const clueText = (clue: Clue): string => clue.name.fr;
  const expected = $derived(countryOf(question.answer));
  const picked = $derived(reveal ? countryOf(reveal.picked) : undefined);
</script>

<div class="hud">
  <header>
    <button type="button" class="quit" onclick={onquit} aria-label="Quitter la manche">✕</button>
    <p class="progress"><strong>{score}</strong> / {total}</p>
  </header>

  <!-- L'avancement passe par la barre : afficher deux compteurs côte à côte
       (score et numéro de question) se lisait mal. -->
  <div
    class="track"
    role="progressbar"
    aria-valuenow={position}
    aria-valuemin={1}
    aria-valuemax={total}
    aria-label="Progression de la manche"
  >
    <span class="fill" style="--fill: {(position / total) * 100}%"></span>
  </div>

  <div class="clue-slot">
    <p class="clue" aria-live="polite">Trouve <strong>{clueText(question.clue)}</strong></p>
  </div>

  <div class="feedback-slot">
    {#if reveal}
      {#if reveal.correct}
        <p class="feedback feedback--correct" aria-live="assertive">Bravo</p>
      {:else}
        <div class="feedback feedback--wrong" aria-live="assertive">
          <p>
            {#if picked}Tu as cliqué sur {picked.nameWithArticle.fr}.{/if}
            C’était {expected?.nameWithArticle.fr}.
          </p>
          <button type="button" class="next" onclick={onnext}>Continuer</button>
        </div>
      {/if}
    {/if}
  </div>
</div>

<style>
  .hud {
    display: grid;
    grid-template-rows: auto auto auto 1fr;
    block-size: 100%;
    padding: max(0.75rem, env(safe-area-inset-top)) 1rem max(1rem, env(safe-area-inset-bottom));
    /* Le globe reste manipulable : seuls les éléments explicites captent le geste. */
    pointer-events: none;
  }

  header {
    display: flex;
    gap: 0.75rem;
    align-items: center;
  }

  .quit {
    display: grid;
    place-items: center;
    inline-size: 44px;
    block-size: 44px;
    border: 1px solid var(--line);
    border-radius: 999px;
    background: var(--surface);
    color: var(--text-dim);
    font-size: 1rem;
    cursor: pointer;
    pointer-events: auto;
  }

  .progress {
    margin-inline-start: auto;
    font-variant-numeric: tabular-nums;

    & strong {
      color: var(--accent);
      font-size: 1.25rem;
    }
  }

  .track {
    block-size: 3px;
    margin-block-start: 0.6rem;
    border-radius: 999px;
    background: var(--line);
    overflow: hidden;
  }

  .fill {
    display: block;
    block-size: 100%;
    inline-size: var(--fill);
    border-radius: inherit;
    background: var(--accent);
    transition: inline-size 200ms ease-out;
  }

  @media (prefers-reduced-motion: reduce) {
    .fill {
      transition: none;
    }
  }

  .clue-slot {
    display: grid;
    place-items: center;
    padding-block: 1rem;
  }

  .clue {
    padding: 0.6rem 1.1rem;
    border-radius: 999px;
    background: color-mix(in oklab, var(--surface) 90%, transparent);
    font-size: clamp(1rem, 5vw, 1.4rem);
    text-align: center;
    text-wrap: balance;

    & strong {
      color: var(--accent-text);
    }
  }

  .feedback-slot {
    display: grid;
    align-content: end;
    justify-items: center;
  }

  .feedback {
    display: grid;
    gap: 0.75rem;
    justify-items: center;
    inline-size: min(100%, 30rem);
    padding: 0.9rem 1.1rem;
    border-radius: 1rem;
    background: var(--surface-strong);
    text-align: center;
    text-wrap: balance;
  }

  .feedback--correct {
    color: var(--correct);
    font-weight: 600;
  }

  .next {
    min-block-size: 44px;
    padding-inline: 1.5rem;
    border: 0;
    border-radius: 999px;
    background: var(--accent);
    color: var(--space);
    font: inherit;
    font-weight: 600;
    cursor: pointer;
    pointer-events: auto;
  }
</style>
