<script lang="ts">
  import { audio } from './lib/audio/audio.svelte.js';
  import { countries } from './lib/data/countries.js';
  import type { Country, Iso3 } from './lib/data/types.js';
  import GlobeView from './lib/globe/GlobeView.svelte';
  import type { Highlight } from './lib/globe/theme.js';
  import { MODES } from './lib/game/modes/index.js';
  import { buildPool } from './lib/game/pool.js';
  import {
    createRound,
    currentQuestion,
    currentStreak,
    isOver,
    recordAnswer,
    summary,
  } from './lib/game/round.js';
  import type { ModeId, PoolFilter, Question, Round, RoundLength } from './lib/game/types.js';
  import { records } from './lib/storage/records.svelte.js';
  import GameHud from './lib/ui/GameHud.svelte';
  import HomeScreen from './lib/ui/HomeScreen.svelte';
  import ResultScreen from './lib/ui/ResultScreen.svelte';

  /** Temps d'affichage d'une bonne réponse avant la question suivante. */
  const CORRECT_PAUSE_MS = 900;

  type Screen = 'home' | 'playing' | 'result';

  let screen = $state<Screen>('home');
  let round = $state<Round | null>(null);
  let config = $state<{ mode: ModeId; length: RoundLength; filter: PoolFilter } | null>(null);
  let reveal = $state<{
    question: Question;
    /** `null` quand le joueur a passé la question. */
    picked: Iso3 | null;
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
    // Toutes les bonnes réponses s'allument : en mode monnaie, on découvre
    // ainsi la zone euro ou la zone franc CFA d'un coup d'œil.
    for (const iso3 of reveal.question.accepted) map.set(iso3, 'target');
    if (reveal.picked) map.set(reveal.picked, reveal.correct ? 'correct' : 'wrong');
    return map;
  });

  function start(next: { mode: ModeId; length: RoundLength; filter: PoolFilter }): void {
    const mode = MODES[next.mode];
    const pool = buildPool(countries, mode, next.filter);
    // `world` = tous les pays jouables : en mode monnaie, cliquer un pays de la
    // zone euro reste juste même s'il n'était pas dans le pool tiré.
    const world = buildPool(countries, mode, { tier: 'all', region: 'all' });
    config = next;
    round = createRound(pool, mode, next.length, Math.random, world);
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
    // La série fait monter la note : on entend qu'on enchaîne.
    audio.play(correct ? 'correct' : 'wrong', currentStreak(round));
    // Une bonne réponse s'enchaîne toute seule ; une erreur attend le joueur,
    // le temps qu'il regarde où était le pays.
    if (correct) pending = setTimeout(advance, CORRECT_PAUSE_MS);
  }

  /** Le joueur renonce : on lui montre la réponse, elle compte comme ratée. */
  function skip(): void {
    if (screen !== 'playing' || reveal || !round) return;
    const asked = currentQuestion(round);
    if (!asked) return;
    round = recordAnswer(round, null);
    reveal = { question: asked, picked: null, correct: false };
    audio.play('wrong');
  }

  let isRecord = $state(false);

  function advance(): void {
    clearTimeout(pending);
    reveal = null;
    if (!round || !isOver(round)) return;
    const result = summary(round);
    isRecord = config
      ? records.submit(config.mode, config.length, { score: result.score, total: result.total })
      : false;
    audio.play(isRecord ? 'record' : 'roundOver');
    screen = 'result';
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
        onskip={skip}
        onquit={quit}
      />
    {:else if screen === 'result' && round}
      <ResultScreen summary={summary(round)} {isRecord} onreplay={replay} onhome={quit} />
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
