/**
 * Couleurs du globe, alignées sur la direction « carte marine de nuit » :
 * terres en parchemin sur océan d'encre. Les valeurs sont dupliquées depuis
 * `app.css` parce que three.js ne lit pas les variables CSS.
 */
export const GLOBE_COLORS = {
  background: '#060f18',
  ocean: '#0e2130',
  /* Halo discret : à pleine intensité, le laiton mangeait le globe. */
  atmosphere: '#7d6a44',
  /** Pays proposables comme réponse. */
  land: '#d9cfba',
  /** Territoires dépendants : présents sur la carte, jamais demandés. */
  landDependent: '#8d8878',
  stroke: '#0a1a26',
  /** Survol : un parchemin plus vif, jamais une couleur de réponse. */
  hover: '#fbf3df',
  /* Ton moyen : les marqueurs doivent se voir aussi bien sur le parchemin des
     terres que sur l'encre de l'océan. */
  marker: '#5d7180',
  markerHover: '#fbf3df',
  /** Feedback de réponse. */
  correct: '#37977d',
  wrong: '#cf5a45',
  /** Le pays attendu, révélé après une erreur. */
  target: '#d9a441',
} as const;

/** Rôle de couleur temporaire posé sur un pays pendant la révélation. */
export type Highlight = 'correct' | 'wrong' | 'target';

export const HIGHLIGHT_COLORS: Readonly<Record<Highlight, string>> = {
  correct: GLOBE_COLORS.correct,
  wrong: GLOBE_COLORS.wrong,
  target: GLOBE_COLORS.target,
};
