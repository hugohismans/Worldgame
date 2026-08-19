<script lang="ts">
  import { countryOf } from '../data/countries.js';
  import { flagUrl } from '../data/flags.js';
  import { ACCEPT_ANY_COUNTRY_OF_THE_ZONE } from '../game/modes/currency.js';
  import { i18n } from '../i18n/i18n.svelte.js';
  import SoundToggle from './SoundToggle.svelte';
  import type { Question } from '../game/types.js';

  interface Props {
    question: Question;
    /** Numéro de la question en cours, à partir de 1. */
    position: number;
    total: number;
    score: number;
    /** Réponse en cours de révélation, `null` tant que le joueur cherche. */
    reveal: { picked: string | null; correct: boolean } | null;
    onnext: () => void;
    onskip: () => void;
    onquit: () => void;
  }

  const { question, position, total, score, reveal, onnext, onskip, onquit }: Props = $props();

  const expected = $derived(countryOf(question.answer));
  const picked = $derived(reveal?.picked ? countryOf(reveal.picked) : undefined);
</script>

<div class="hud">
  <!-- Le cadre de carte : une neatline en laiton, avec ses équerres d'angle. -->
  <div class="neatline" aria-hidden="true"></div>

  <header>
    <button type="button" class="quit" onclick={onquit} aria-label={i18n.t.quitRound}>✕</button>
    <div class="sound-slot"><SoundToggle /></div>
    <p class="progress readout" class:progress--pulse={reveal?.correct}>
      <strong>{score}</strong> / {total}
    </p>
  </header>

  <!-- L'avancement passe par la barre : afficher deux compteurs côte à côte
       (score et numéro de question) se lisait mal. -->
  <div
    class="track"
    role="progressbar"
    aria-valuenow={position}
    aria-valuemin={1}
    aria-valuemax={total}
    aria-label={i18n.t.roundProgress}
  >
    <span class="fill" style="--fill: {(position / total) * 100}%"></span>
  </div>

  <div class="clue-slot">
    {#key question.answer}
    {#if question.clue.kind === 'flag'}
      <!-- Le drapeau seul, sans texte : le nommer donnerait la réponse. -->
      <figure class="flag" aria-live="polite">
        <img src={flagUrl(question.clue.iso2)} alt="" width="120" height="90" />
        <figcaption class="visually-hidden">{i18n.t.flagToIdentify}</figcaption>
      </figure>
    {:else}
      <p class="clue" aria-live="polite">
        {#if question.clue.kind === 'name'}
          {i18n.t.cluePrefix} <strong>{i18n.of(question.clue.name)}</strong>
        {:else if question.clue.kind === 'capital'}
          {i18n.t.clueCapital} <strong>{i18n.of(question.clue.capital)}</strong>
        {:else}
          {ACCEPT_ANY_COUNTRY_OF_THE_ZONE ? i18n.t.clueCurrencyAny : i18n.t.clueCurrencyOne}
          <strong>{i18n.of(question.clue.currency)}</strong>
        {/if}
      </p>
    {/if}
    {/key}
  </div>

  <div class="feedback-slot">
    {#if !reveal}
      <button type="button" class="skip" onclick={onskip}>{i18n.t.skip}</button>
    {:else if reveal}
      {#if reveal.correct}
        <p class="feedback feedback--correct" aria-live="assertive">{i18n.t.correct}</p>
      {:else}
        <div class="feedback feedback--wrong" aria-live="assertive">
          <p>
            {#if picked}{i18n.t.youPicked(i18n.of(picked.nameWithArticle))}{/if}
            {#if question.accepted.length > 1}
              <!-- Nommer un seul pays laisserait croire qu'il était le seul bon. -->
              {i18n.t.anyGoldCountry}
            {:else if expected}
              {i18n.t.itWas(i18n.of(expected.nameWithArticle))}
            {/if}
          </p>
          <button type="button" class="next" onclick={onnext}>{i18n.t.next}</button>
        </div>
      {/if}
    {/if}
  </div>
</div>

<style>
  .neatline {
    position: absolute;
    inset: max(0.55rem, env(safe-area-inset-top)) 0.55rem max(0.55rem, env(safe-area-inset-bottom));
    border: 1px solid color-mix(in oklab, var(--laiton) 22%, transparent);
    border-radius: 0.35rem;
    /* Équerres d'angle, comme la graduation d'une carte marine. */
    mask:
      linear-gradient(to right, #000 0 2.2rem, transparent 2.2rem calc(100% - 2.2rem), #000 calc(100% - 2.2rem) 100%),
      linear-gradient(to bottom, #000 0 2.2rem, transparent 2.2rem calc(100% - 2.2rem), #000 calc(100% - 2.2rem) 100%);
    mask-composite: intersect;
  }

  .hud {
    position: relative;
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
    border: 1px solid var(--trait);
    border-radius: 999px;
    background: var(--surface);
    color: var(--os-fane);
    font-size: 1rem;
    cursor: pointer;
    pointer-events: auto;
  }

  /* Le bouton doit rester cliquable à travers l'interface transparente. */
  .sound-slot {
    pointer-events: auto;
  }

  .progress {
    margin-inline-start: auto;
    font-size: 0.95rem;
    color: var(--os-fane);

    & strong {
      color: var(--laiton);
      font-size: 1.35rem;
    }
  }

  /* Le score encaisse la bonne réponse : une pulsation courte, une seule fois. */
  .progress--pulse strong {
    display: inline-block;
    animation: pulse 420ms ease-out;
  }

  @keyframes pulse {
    0% {
      scale: 1;
      color: var(--laiton);
    }
    35% {
      scale: 1.35;
      color: var(--verdigris);
    }
    100% {
      scale: 1;
      color: var(--laiton);
    }
  }

  .track {
    block-size: 3px;
    margin-block-start: 0.6rem;
    border-radius: 999px;
    background: var(--trait);
    overflow: hidden;
  }

  .fill {
    display: block;
    block-size: 100%;
    inline-size: var(--fill);
    border-radius: inherit;
    background: var(--laiton);
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

  .flag {
    margin: 0;
    padding: 0.4rem;
    border-radius: 0.5rem;
    background: var(--surface-dense);

    & img {
      display: block;
      inline-size: min(32vw, 7.5rem);
      block-size: auto;
      border-radius: 0.25rem;
      /* Les drapeaux blancs (Japon) doivent rester détachés du fond. */
      box-shadow: 0 0 0 1px var(--trait);
    }
  }

  .visually-hidden {
    position: absolute;
    inline-size: 1px;
    block-size: 1px;
    overflow: hidden;
    clip-path: inset(50%);
  }

  .clue,
  .flag {
    animation: clue-in 320ms ease-out;
  }

  @keyframes clue-in {
    from {
      opacity: 0;
      translate: 0 -0.5rem;
    }
  }

  .clue {
    padding: 0.6rem 1.1rem;
    border-radius: 999px;
    background: color-mix(in oklab, var(--surface) 90%, transparent);
    font-size: clamp(1rem, 5vw, 1.4rem);
    text-align: center;
    text-wrap: balance;

    & strong {
      color: var(--laiton-clair);
    }
  }

  .feedback-slot {
    display: grid;
    align-content: end;
    justify-items: center;
    gap: 0.5rem;
  }

  /* Passer la question : la seule action possible pour qui ne peut pas viser
     un pays au doigt ou à la souris. */
  .skip {
    min-block-size: 44px;
    padding-inline: 1rem;
    border: 0;
    border-radius: 999px;
    background: none;
    color: var(--os-fane);
    font-size: 0.85rem;
    text-decoration: underline;
    text-underline-offset: 3px;
    cursor: pointer;
    pointer-events: auto;

    &:hover {
      color: var(--os);
    }
  }

  .feedback {
    display: grid;
    gap: 0.75rem;
    justify-items: center;
    inline-size: min(100%, 30rem);
    padding: 0.9rem 1.1rem;
    border-radius: 1rem;
    background: var(--surface-dense);
    text-align: center;
    text-wrap: balance;
  }

  .feedback--correct {
    color: var(--verdigris);
    font-weight: 600;
  }

  .feedback {
    animation: clue-in 260ms ease-out;
  }

  .next {
    min-block-size: 44px;
    padding-inline: 1.5rem;
    border: 0;
    border-radius: 999px;
    background: var(--laiton);
    color: var(--abysse);
    font: inherit;
    font-weight: 600;
    cursor: pointer;
    pointer-events: auto;
  }
</style>
