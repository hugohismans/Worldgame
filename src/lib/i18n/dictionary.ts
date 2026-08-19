/**
 * Le français est la **référence** : le dictionnaire anglais est typé
 * `Dictionary`, c'est-à-dire `typeof fr`. Une clé oubliée ou en trop côté
 * anglais casse le build, et une phrase à trous doit avoir la même signature
 * dans les deux langues.
 *
 * Volontairement sans `as const` : sinon chaque chaîne deviendrait son propre
 * type littéral et l'anglais devrait répéter le texte français mot pour mot.
 */
export const fr = {
  tagline: 'Trouve le pays sur le globe.',

  // Accueil
  clueSection: 'Indice',
  lengthSection: 'Questions',
  poolSection: 'Pays',
  regionSection: 'Zone',
  regionSelectLabel: 'Continent',
  play: 'Jouer',

  modeName: 'Nom',
  modeFlag: 'Drapeau',
  modeCapital: 'Capitale',
  modeCurrency: 'Monnaie',
  modeNameHint: 'Trouve le Pérou',
  modeFlagHint: 'Le drapeau seul',
  modeCapitalHint: 'Sa capitale est Lima',
  modeCurrencyHint: 'Sa monnaie est le sol',

  tierAll: 'Le monde entier',
  tierCommon: 'Grand public',
  tierUncommon: 'Hors-piste',
  tierRare: 'Terra incognita',

  regionAll: 'Tous les continents',
  regionAfrica: 'Afrique',
  regionAmericas: 'Amériques',
  regionAsia: 'Asie',
  regionEurope: 'Europe',
  regionOceania: 'Océanie',
  regionAntarctic: 'Antarctique',

  poolEmpty: 'Aucune question possible dans cette sélection.',
  poolShort: (available: number, length: number) =>
    `${available} questions disponibles : la manche en comptera ${length}.`,
  poolCount: (available: number) => `${available} questions possibles.`,
  bestScore: (score: number, total: number) => `Record : ${score} / ${total}`,
  noRecordYet: 'Pas encore de record ici.',

  // Manche
  quitRound: 'Quitter la manche',
  roundProgress: 'Progression de la manche',
  flagToIdentify: 'Drapeau à identifier',
  cluePrefix: 'Trouve',
  clueCapital: 'Trouve le pays dont la capitale est',
  clueCurrencyAny: 'Trouve un pays dont la monnaie est',
  clueCurrencyOne: 'Trouve le pays dont la monnaie est',
  correct: 'Bravo',
  youPicked: (country: string) => `Tu as cliqué sur ${country}.`,
  itWas: (country: string) => `C’était ${country}.`,
  anyGoldCountry: 'N’importe quel pays en or convenait.',
  next: 'Continuer',
  skip: 'Je donne ma langue au chat',

  // Fin de manche
  roundOver: 'Manche terminée',
  accuracy: 'Précision',
  bestStreak: 'Meilleure série',
  toReview: 'À revoir',
  answered: (country: string) => `tu as répondu ${country}`,
  flawless: 'Sans faute.',
  newRecord: 'Nouveau record',
  playAgain: 'Rejouer',
  changeSettings: 'Changer de réglages',
};

export type Dictionary = typeof fr;

export const en: Dictionary = {
  tagline: 'Find the country on the globe.',

  clueSection: 'Clue',
  lengthSection: 'Questions',
  poolSection: 'Countries',
  regionSection: 'Region',
  regionSelectLabel: 'Continent',
  play: 'Play',

  modeName: 'Name',
  modeFlag: 'Flag',
  modeCapital: 'Capital',
  modeCurrency: 'Currency',
  modeNameHint: 'Find Peru',
  modeFlagHint: 'The flag alone',
  modeCapitalHint: 'Its capital is Lima',
  modeCurrencyHint: 'Its currency is the sol',

  tierAll: 'The whole world',
  tierCommon: 'Household names',
  tierUncommon: 'Off the beaten track',
  tierRare: 'Terra incognita',

  regionAll: 'Every continent',
  regionAfrica: 'Africa',
  regionAmericas: 'Americas',
  regionAsia: 'Asia',
  regionEurope: 'Europe',
  regionOceania: 'Oceania',
  regionAntarctic: 'Antarctica',

  poolEmpty: 'No question available in this selection.',
  poolShort: (available: number, length: number) =>
    `${available} questions available: this round will have ${length}.`,
  poolCount: (available: number) => `${available} questions available.`,
  bestScore: (score: number, total: number) => `Best: ${score} / ${total}`,
  noRecordYet: 'No record here yet.',

  quitRound: 'Quit round',
  roundProgress: 'Round progress',
  flagToIdentify: 'Flag to identify',
  cluePrefix: 'Find',
  clueCapital: 'Find the country whose capital is',
  clueCurrencyAny: 'Find a country whose currency is',
  clueCurrencyOne: 'Find the country whose currency is',
  correct: 'Nice',
  youPicked: (country: string) => `You picked ${country}.`,
  itWas: (country: string) => `It was ${country}.`,
  anyGoldCountry: 'Any country in gold would have counted.',
  next: 'Continue',
  skip: 'I give up',

  roundOver: 'Round over',
  accuracy: 'Accuracy',
  bestStreak: 'Best streak',
  toReview: 'To review',
  answered: (country: string) => `you picked ${country}`,
  flawless: 'Flawless.',
  newRecord: 'New record',
  playAgain: 'Play again',
  changeSettings: 'Change settings',
};
