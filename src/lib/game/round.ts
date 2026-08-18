import type { Country, Iso3 } from '../data/types.js';
import type { Answer, GameMode, Question, Round, RoundSummary } from './types.js';

/** Source d'aléa injectable, pour que les tests soient reproductibles. */
export type Random = () => number;

/** Mélange de Fisher-Yates, sur une copie. */
export function shuffle<T>(items: readonly T[], random: Random): T[] {
  const result = [...items];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [result[i], result[j]] = [result[j] as T, result[i] as T];
  }
  return result;
}

/**
 * Tire les questions d'une manche. Un pays ne sort qu'une fois, et deux pays
 * qui donneraient le même indice non plus — vingt-sept pays ont l'euro. Si le
 * pool ne fournit pas assez d'indices distincts, la manche est raccourcie.
 *
 * `world` sert à décider quelles réponses sont acceptées : elle vaut tous les
 * pays jouables, même quand le pool est restreint à un continent.
 */
export function createRound(
  pool: readonly Country[],
  mode: GameMode,
  length: number,
  random: Random,
  world: readonly Country[] = pool,
): Round {
  const seen = new Set<string>();
  const picked: Country[] = [];
  for (const country of shuffle(pool, random)) {
    if (picked.length >= Math.max(0, length)) break;
    const key = mode.clueKey?.(country) ?? country.iso3;
    if (seen.has(key)) continue;
    seen.add(key);
    picked.push(country);
  }
  return {
    questions: picked.map((country) => mode.question(country, world)),
    answers: [],
  };
}

/** Nombre de questions réellement disponibles dans un pool, indices distincts. */
export function distinctClues(pool: readonly Country[], mode: GameMode): number {
  return new Set(pool.map((country) => mode.clueKey?.(country) ?? country.iso3)).size;
}

export function currentQuestion(round: Round): Question | undefined {
  return round.questions[round.answers.length];
}

export function isOver(round: Round): boolean {
  return round.answers.length >= round.questions.length;
}

/** Enregistre une réponse et rend une nouvelle manche — rien n'est muté. */
export function recordAnswer(round: Round, picked: Iso3 | null): Round {
  const question = currentQuestion(round);
  if (!question) return round;
  const answer: Answer = {
    question,
    picked,
    correct: picked !== null && question.accepted.includes(picked),
  };
  return { ...round, answers: [...round.answers, answer] };
}

export function summary(round: Round): RoundSummary {
  let bestStreak = 0;
  let streak = 0;
  let score = 0;
  for (const answer of round.answers) {
    if (answer.correct) {
      score++;
      streak++;
      bestStreak = Math.max(bestStreak, streak);
    } else {
      streak = 0;
    }
  }
  return {
    score,
    total: round.questions.length,
    accuracy: round.answers.length === 0 ? 0 : score / round.answers.length,
    bestStreak,
    missed: round.answers.filter((answer) => !answer.correct),
  };
}
