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
 * Tire les questions d'une manche. Un pays ne sort qu'une fois ; si le pool est
 * plus petit que la longueur demandée, la manche est raccourcie d'autant.
 */
export function createRound(
  pool: readonly Country[],
  mode: GameMode,
  length: number,
  random: Random,
): Round {
  const picked = shuffle(pool, random).slice(0, Math.max(0, length));
  return {
    questions: picked.map((country) => mode.question(country, pool)),
    answers: [],
  };
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
