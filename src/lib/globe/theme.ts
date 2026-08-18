/** Couleurs du globe. La direction artistique complète arrive en phase 5. */
export const GLOBE_COLORS = {
  background: '#070d18',
  ocean: '#0d2136',
  atmosphere: '#4d7ea8',
  /** Pays proposables comme réponse. */
  land: '#2f4f6b',
  /** Territoires dépendants : présents sur la carte, jamais demandés. */
  landDependent: '#22394d',
  stroke: '#0a1826',
  hover: '#e9b44c',
  marker: '#9fb8cc',
  markerHover: '#e9b44c',
  /** Feedback de réponse. */
  correct: '#3fa06a',
  wrong: '#c8483c',
  /** Le pays attendu, révélé après une erreur. */
  target: '#e9b44c',
} as const;

/** Rôle de couleur temporaire posé sur un pays pendant la révélation. */
export type Highlight = 'correct' | 'wrong' | 'target';

export const HIGHLIGHT_COLORS: Readonly<Record<Highlight, string>> = {
  correct: GLOBE_COLORS.correct,
  wrong: GLOBE_COLORS.wrong,
  target: GLOBE_COLORS.target,
};
