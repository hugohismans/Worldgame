import { playVoices, streakSemitones, voicesOf, type SoundName } from './sounds.js';

const STORAGE_KEY = 'worldgame.muted';

/**
 * Le son du jeu. Le contexte audio n'est créé qu'au premier geste du joueur :
 * iOS refuse de l'ouvrir autrement, et surtout on ne veut pas qu'une page
 * ouverte dans le métro se mette à sonner toute seule.
 */
class Audio {
  muted = $state<boolean>(readMuted());

  #ctx: AudioContext | null = null;
  #master: GainNode | null = null;

  /** Ouvre le contexte audio. À appeler depuis un geste utilisateur. */
  arm(): void {
    if (this.#ctx) {
      // Safari suspend le contexte dès qu'il perd le focus.
      if (this.#ctx.state === 'suspended') void this.#ctx.resume();
      return;
    }
    const Ctor = window.AudioContext ?? (window as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!Ctor) return;
    const ctx = new Ctor();
    const master = ctx.createGain();
    master.gain.value = this.muted ? 0 : 1;
    master.connect(ctx.destination);
    this.#ctx = ctx;
    this.#master = master;
  }

  /**
   * `streak` fait monter la bonne réponse d'un demi-ton par réussite
   * consécutive : la série s'entend.
   */
  play(name: SoundName, streak = 0): void {
    if (this.muted) return;
    this.arm();
    if (!this.#ctx || !this.#master) return;
    const transpose = name === 'correct' ? streakSemitones(streak) : 0;
    playVoices(this.#ctx, this.#master, voicesOf(name, transpose));
  }

  toggle(): void {
    this.muted = !this.muted;
    if (this.#master && this.#ctx) {
      // Une rampe très courte plutôt qu'une coupure nette, qui clique.
      this.#master.gain.setTargetAtTime(this.muted ? 0 : 1, this.#ctx.currentTime, 0.01);
    }
    write(this.muted);
  }
}

function readMuted(): boolean {
  try {
    return localStorage.getItem(STORAGE_KEY) === 'true';
  } catch {
    return false;
  }
}

function write(muted: boolean): void {
  try {
    localStorage.setItem(STORAGE_KEY, String(muted));
  } catch {
    // navigation privée : la préférence ne survivra pas au rechargement
  }
}

export const audio = new Audio();

// Le tout premier geste ouvre le contexte, sans rien jouer : au moment où le
// joueur répondra, le son sera prêt.
if (typeof window !== 'undefined') {
  const unlock = (): void => audio.arm();
  window.addEventListener('pointerdown', unlock, { once: true, passive: true });
  window.addEventListener('keydown', unlock, { once: true, passive: true });
}
