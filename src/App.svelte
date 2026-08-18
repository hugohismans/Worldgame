<script lang="ts">
  import { countries } from './lib/data/countries.js';
  import type { Country, Iso3 } from './lib/data/types.js';
  import GlobeView from './lib/globe/GlobeView.svelte';
  import type { Highlight } from './lib/globe/theme.js';
  import { nameMode } from './lib/game/modes/name.js';
  import { buildPool } from './lib/game/pool.js';
  import { createRound, currentQuestion, isOver, recordAnswer, summary } from './lib/game/round.js';
  import type { PoolFilter, Question, Round, RoundLength } from './lib/game/types.js';
  import GameHud from './lib/ui/GameHud.svelte';
  import HomeScreen from './lib/ui/HomeScreen.svelte';
  import ResultScreen from './lib/ui/ResultScreen.svelte';

  /** Temps d'affichage d'une bonne réponse avant la question suivante. */
  const CORRECT_PAUSE_MS = 900;

  type Screen = 'home' | 'playing' | 'result';

  let screen = $state<Screen>('home');
  let round = $state<Round | null>(null);
  let config = $state<{ length: RoundLength; filter: PoolFilter } | null>(null);
  let reveal = $state<{
    question: Question;
    picked: Iso3;
    correct: boolean;
  } | null>(null);
  let pending: ReturnType<typeof setTimeout> | undefined;

  /**
   * Pendant la révélation, la manche a déjà avancé : on continue d'afficher la
   * question à laquelle le joueur vient de répondre, sans quoi l'interface
   * disparaîtrait après la dernière réponse.
   */
  const question = $derived(reveal?.question ?? (round ? currentQuestion(round) : undefined));

  const highlights = $derived.by(() => {
    const map = new Map<Iso3, Highlight>();
    if (!reveal) return map;
    if (reveal.correct) {
      map.set(reveal.picked, 'correct');
    } else {
      // Le pays attendu s'allume aussi : c'est là qu'on apprend quelque chose.
      map.set(reveal.picked, 'wrong');
      map.set(reveal.question.answer, 'target');
    }
    return map;
  });

  function start(next: { length: RoundLength; filter: PoolFilter }): void {
    const pool = buildPool(countries, nameMode, next.filter);
    config = next;
    round = createRound(pool, nameMode, next.length, Math.random);
    reveal = null;
    screen = 'playing';
  }

  function select(country: Country): void {
    if (screen !== 'playing' || reveal || !round) return;
    const asked = currentQuestion(round);
    if (!asked) return;
    const correct = asked.accepted.includes(country.iso3);
    round = recordAnswer(round, country.iso3);
    reveal = { question: asked, picked: country.iso3, correct };
    // Une bonne réponse s'enchaîne toute seule ; une erreur attend le joueur,
    // le temps qu'il regarde où était le pays.
    if (correct) pending = setTimeout(advance, CORRECT_PAUSE_MS);
  }

  function advance(): void {
    clearTimeout(pending);
    reveal = null;
    if (round && isOver(round)) screen = 'result';
  }

  function quit(): void {
    clearTimeout(pending);
    reveal = null;
    round = null;
    screen = 'home';
  }

  function replay(): void {
    if (config) start(config);
  }

  $effect(() => () => clearTimeout(pending));
</script>

<main>
  <GlobeView
    onselect={select}
    {highlights}
    focus={reveal && !reveal.correct ? reveal.question.answer : null}
    selectable={screen === 'playing' && reveal === null}
  />

  <div class="overlay" class:overlay--pass-through={screen === 'playing'}>
    {#if screen === 'home'}
      <HomeScreen onstart={start} />
    {:else if screen === 'playing' && round && question}
      <GameHud
        {question}
        position={round.answers.length + (reveal ? 0 : 1)}
        total={round.questions.length}
        score={summary(round).score}
        reveal={reveal ? { picked: reveal.picked, correct: reveal.correct } : null}
        onnext={advance}
        onquit={quit}
      />
    {:else if screen === 'result' && round}
      <ResultScreen summary={summary(round)} onreplay={replay} onhome={quit} />
    {/if}
  </div>
</main>

<style>
  main {
    position: relative;
    block-size: 100dvh;
    inline-size: 100%;
    overflow: hidden;
  }

  .overlay {
    position: absolute;
    inset: 0;
  }

  /* En jeu, le globe doit rester saisissable à travers l'interface. */
  .overlay--pass-through {
    pointer-events: none;
  }
</style>
