/**
 * Les sons du jeu, synthétisés. Aucun fichier audio : des oscillateurs et des
 * enveloppes, donc zéro octet ajouté, aucune licence à tracer, et chaque
 * paramètre reste lisible et réglable ici.
 *
 * Règle de conception : sur une manche de trente questions, on entend le même
 * son trente fois. Ils sont donc courts, doux, et jamais punitifs — un buzzer
 * désagréable fait couper le son au bout de trois manches.
 */

/** Gain maximal d'un son. Au-delà, ça agresse au casque. */
export const PEAK_GAIN = 0.22;

/** La 4e octave de La 440 comme référence : `note(0)` vaut la 440 Hz. */
export const note = (semitones: number): number => 440 * 2 ** (semitones / 12);

/**
 * La bonne réponse monte d'un demi-ton par bonne réponse consécutive, jusqu'à
 * une quinte. La série s'entend, sans qu'aucun écran ne l'annonce.
 */
export const streakSemitones = (streak: number): number =>
  Math.min(Math.max(streak - 1, 0), 7);

export type SoundName = 'correct' | 'wrong' | 'roundOver' | 'record';

interface Voice {
  /** Demi-tons par rapport au La 440. */
  readonly pitch: number;
  readonly start: number;
  readonly duration: number;
  readonly type: OscillatorType;
  readonly gain: number;
  /** Coupure d'un filtre passe-bas, pour étouffer un son. */
  readonly lowpass?: number;
}

/** La partition de chaque son, en voix élémentaires. */
export function voicesOf(name: SoundName, transpose = 0): readonly Voice[] {
  switch (name) {
    case 'correct':
      // Deux notes qui montent, une quarte : bref, net, satisfaisant.
      return [
        { pitch: 3 + transpose, start: 0, duration: 0.1, type: 'triangle', gain: PEAK_GAIN },
        { pitch: 10 + transpose, start: 0.07, duration: 0.16, type: 'triangle', gain: PEAK_GAIN },
      ];
    case 'wrong':
      // Une note grave et étouffée. On signale l'erreur, on ne la sanctionne pas.
      return [
        { pitch: -22, start: 0, duration: 0.26, type: 'sine', gain: PEAK_GAIN * 0.8, lowpass: 380 },
      ];
    case 'roundOver':
      // Un arpège de quatre notes : le seul moment où l'on s'autorise une phrase.
      return [0, 4, 7, 12].map((step, index) => ({
        pitch: step + transpose,
        start: index * 0.12,
        duration: index === 3 ? 0.5 : 0.22,
        type: 'triangle' as OscillatorType,
        gain: PEAK_GAIN * 0.85,
      }));
    case 'record':
      // Le même arpège, prolongé d'une octave qui traîne : c'est la fête.
      return [
        ...voicesOf('roundOver', transpose),
        { pitch: 19 + transpose, start: 0.48, duration: 0.8, type: 'triangle', gain: PEAK_GAIN },
      ];
  }
}

/**
 * Joue un son. `destination` reçoit le signal — un gain maître dans le jeu, la
 * destination d'un contexte hors ligne dans les tests.
 */
export function playVoices(
  ctx: BaseAudioContext,
  destination: AudioNode,
  voices: readonly Voice[],
  at = ctx.currentTime,
): void {
  for (const voice of voices) {
    const oscillator = ctx.createOscillator();
    const envelope = ctx.createGain();
    oscillator.type = voice.type;
    oscillator.frequency.value = note(voice.pitch);

    const start = at + voice.start;
    const end = start + voice.duration;
    // Attaque courte mais pas instantanée : un saut sec produit un clic.
    envelope.gain.setValueAtTime(0.0001, start);
    envelope.gain.exponentialRampToValueAtTime(voice.gain, start + 0.012);
    envelope.gain.exponentialRampToValueAtTime(0.0001, end);

    let node: AudioNode = envelope;
    if (voice.lowpass !== undefined) {
      const filter = ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.value = voice.lowpass;
      envelope.connect(filter);
      node = filter;
    }

    oscillator.connect(envelope);
    node.connect(destination);
    oscillator.start(start);
    oscillator.stop(end + 0.02);
  }
}
