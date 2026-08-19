import type { ModeId } from '../game/types.js';

/** Un record est retenu par mode **et** par longueur de manche. */
export interface Record_ {
  readonly score: number;
  readonly total: number;
}

export type Records = Readonly<Partial<globalThis.Record<string, Record_>>>;

export const recordKey = (mode: ModeId, length: number): string => `${mode}:${length}`;

/**
 * Un résultat remplace le record s'il a un meilleur score. À score égal, c'est
 * la précision qui départage : une manche écourtée (pool trop petit) ne doit
 * pas voler la place d'une manche complète.
 */
export function beats(candidate: Record_, current: Record_ | undefined): boolean {
  if (!current) return candidate.score > 0;
  if (candidate.score !== current.score) return candidate.score > current.score;
  const ratio = (r: Record_) => (r.total === 0 ? 0 : r.score / r.total);
  return ratio(candidate) > ratio(current);
}

export function withRecord(
  records: Records,
  mode: ModeId,
  length: number,
  candidate: Record_,
): Records {
  const key = recordKey(mode, length);
  if (!beats(candidate, records[key])) return records;
  return { ...records, [key]: candidate };
}
