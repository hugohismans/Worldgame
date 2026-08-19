import type { ModeId } from '../game/types.js';
import { recordKey, withRecord, type Record_, type Records } from './records.js';

const STORAGE_KEY = 'worldgame.records';

/** Les meilleurs scores, conservés d'une session à l'autre. */
class RecordBook {
  #records = $state<Records>(read());

  best(mode: ModeId, length: number): Record_ | undefined {
    return this.#records[recordKey(mode, length)];
  }

  /** Enregistre un résultat ; rend `true` si c'est un nouveau record. */
  submit(mode: ModeId, length: number, candidate: Record_): boolean {
    const next = withRecord(this.#records, mode, length, candidate);
    if (next === this.#records) return false;
    this.#records = next;
    write(next);
    return true;
  }
}

function read(): Records {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as Records) : {};
  } catch {
    // localStorage refusé (navigation privée) ou JSON abîmé : on repart de zéro
    // plutôt que d'empêcher de jouer.
    return {};
  }
}

function write(records: Records): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
  } catch {
    // tant pis, le record ne survivra pas au rechargement
  }
}

export const records = new RecordBook();
