import { describe, expect, it } from 'vitest';
import { countries } from '../data/countries.js';
import type { Country } from '../data/types.js';
import { buildPool } from './pool.js';
import {
  createRound,
  currentQuestion,
  distinctClues,
  isOver,
  recordAnswer,
  shuffle,
  summary,
} from './round.js';
import { MODES } from './modes/index.js';
import { nameMode } from './modes/name.js';
import type { Round } from './types.js';

/** Aléa déterministe (générateur congruentiel), pour des tests reproductibles. */
function seeded(seed: number) {
  let state = seed;
  return () => {
    state = (state * 1664525 + 1013904223) % 2 ** 32;
    return state / 2 ** 32;
  };
}

const pool = buildPool(countries, nameMode, { tier: 'all', region: 'all' });

/** Joue une manche entière ; `correct` décide de la justesse de chaque réponse. */
function play(round: Round, correct: (index: number) => boolean): Round {
  let current = round;
  for (let i = 0; !isOver(current); i++) {
    const question = currentQuestion(current);
    if (!question) break;
    current = recordAnswer(current, correct(i) ? question.answer : 'ZZZ');
  }
  return current;
}

describe('pool', () => {
  it('ne retient que les pays jouables', () => {
    expect(pool).toHaveLength(194);
    expect(pool.every((c: Country) => c.playable)).toBe(true);
  });

  it('exclut les territoires dépendants', () => {
    const isos = new Set(pool.map((c) => c.iso3));
    for (const territory of ['GRL', 'PRI', 'TWN', 'XKX', 'ESH']) {
      expect(isos.has(territory)).toBe(false);
    }
  });

  it('filtre par niveau de notoriété', () => {
    const common = buildPool(countries, nameMode, { tier: 'common', region: 'all' });
    expect(common).toHaveLength(66);
    expect(common.every((c) => c.tier === 'common')).toBe(true);
  });

  it('filtre par région, et croise les deux filtres', () => {
    const europe = buildPool(countries, nameMode, { tier: 'all', region: 'europe' });
    expect(europe.every((c) => c.region === 'europe')).toBe(true);
    const rareEurope = buildPool(countries, nameMode, { tier: 'rare', region: 'europe' });
    expect(rareEurope.length).toBeLessThan(europe.length);
    expect(rareEurope.every((c) => c.region === 'europe' && c.tier === 'rare')).toBe(true);
  });
});

describe('createRound', () => {
  it('tire le nombre de questions demandé', () => {
    expect(createRound(pool, nameMode, 20, seeded(1)).questions).toHaveLength(20);
  });

  it('ne repose jamais le même pays', () => {
    const round = createRound(pool, nameMode, 30, seeded(7));
    const asked = round.questions.map((q) => q.answer);
    expect(new Set(asked).size).toBe(asked.length);
  });

  it('raccourcit la manche quand le pool est trop petit', () => {
    const tiny = pool.slice(0, 4);
    expect(createRound(tiny, nameMode, 30, seeded(3)).questions).toHaveLength(4);
  });

  it('ne tire que dans le pool fourni', () => {
    const oceania = buildPool(countries, nameMode, { tier: 'all', region: 'oceania' });
    const round = createRound(oceania, nameMode, 10, seeded(5));
    const allowed = new Set(oceania.map((c) => c.iso3));
    expect(round.questions.every((q) => allowed.has(q.answer))).toBe(true);
  });

  it('change de tirage selon la graine', () => {
    const a = createRound(pool, nameMode, 10, seeded(1)).questions.map((q) => q.answer);
    const b = createRound(pool, nameMode, 10, seeded(2)).questions.map((q) => q.answer);
    expect(a).not.toEqual(b);
  });

  it('conserve tous les pays du pool sans en perdre au mélange', () => {
    const shuffled = shuffle(pool, seeded(11));
    expect(new Set(shuffled.map((c) => c.iso3))).toEqual(new Set(pool.map((c) => c.iso3)));
  });
});

describe('déroulement', () => {
  it('avance question par question', () => {
    let round = createRound(pool, nameMode, 3, seeded(1));
    expect(currentQuestion(round)?.answer).toBe(round.questions[0]?.answer);
    round = recordAnswer(round, 'FRA');
    expect(currentQuestion(round)?.answer).toBe(round.questions[1]?.answer);
    expect(isOver(round)).toBe(false);
  });

  it('ne mute pas la manche existante', () => {
    const round = createRound(pool, nameMode, 3, seeded(1));
    recordAnswer(round, 'FRA');
    expect(round.answers).toHaveLength(0);
  });

  it('ignore une réponse après la fin', () => {
    const round = play(createRound(pool, nameMode, 2, seeded(1)), () => true);
    expect(isOver(round)).toBe(true);
    expect(recordAnswer(round, 'FRA').answers).toHaveLength(2);
  });

  it('compte un clic sur un territoire comme une erreur, sans casser', () => {
    let round = createRound(pool, nameMode, 2, seeded(1));
    round = recordAnswer(round, 'GRL');
    expect(round.answers[0]?.correct).toBe(false);
  });

  it('accepte une réponse alternative déclarée', () => {
    const question = { answer: 'FRA', accepted: ['FRA', 'DEU'], clue: { kind: 'name' as const, name: { fr: 'x', en: 'x' } } };
    const round = recordAnswer({ questions: [question], answers: [] }, 'DEU');
    expect(round.answers[0]?.correct).toBe(true);
  });
});

describe('summary', () => {
  it('compte le score et la précision', () => {
    const round = play(createRound(pool, nameMode, 10, seeded(1)), (i) => i % 2 === 0);
    const result = summary(round);
    expect(result.score).toBe(5);
    expect(result.total).toBe(10);
    expect(result.accuracy).toBeCloseTo(0.5);
  });

  it('retient la plus longue série, pas la dernière', () => {
    const round = play(createRound(pool, nameMode, 8, seeded(1)), (i) => [0, 1, 2, 4, 6].includes(i));
    expect(summary(round).bestStreak).toBe(3);
  });

  it('liste les pays ratés', () => {
    const round = play(createRound(pool, nameMode, 5, seeded(1)), (i) => i !== 2);
    const result = summary(round);
    expect(result.missed).toHaveLength(1);
    expect(result.missed[0]?.question.answer).toBe(round.questions[2]?.answer);
  });

  it('donne une précision nulle sur une manche vierge', () => {
    expect(summary(createRound(pool, nameMode, 10, seeded(1))).accuracy).toBe(0);
  });
});

describe('modes', () => {
  const world = buildPool(countries, nameMode, { tier: 'all', region: 'all' });

  it('propose un drapeau pour chaque pays jouable', () => {
    const eligible = world.filter((c) => MODES.flag.eligible(c));
    expect(eligible).toHaveLength(194);
  });

  it('demande une capitale connue', () => {
    expect(world.every((c) => MODES.capital.eligible(c))).toBe(true);
    const question = MODES.capital.question(world.find((c) => c.iso3 === 'PER') as Country, world);
    expect(question.clue).toEqual({ kind: 'capital', capital: { fr: 'Lima', en: 'Lima' } });
  });

  it('accepte tout pays de la zone euro', () => {
    const france = world.find((c) => c.iso3 === 'FRA') as Country;
    const question = MODES.currency.question(france, world);
    expect(question.answer).toBe('FRA');
    expect(question.accepted).toContain('DEU');
    expect(question.accepted).toContain('IRL');
    expect(question.accepted).not.toContain('CHE');
    expect(question.accepted.length).toBeGreaterThan(20);
  });

  it('accepte tout pays de la zone franc CFA', () => {
    const senegal = world.find((c) => c.iso3 === 'SEN') as Country;
    const question = MODES.currency.question(senegal, world);
    expect(question.accepted).toContain('CIV');
    expect(question.accepted).toContain('MLI');
    // Les deux francs CFA sont des monnaies distinctes : la BEAC n'est pas la BCEAO.
    expect(question.accepted).not.toContain('CMR');
  });

  it('garde une seule bonne réponse pour une monnaie unique', () => {
    const japan = world.find((c) => c.iso3 === 'JPN') as Country;
    // Aucun autre membre de l'ONU n'a le yen pour monnaie nationale.
    expect(MODES.currency.question(japan, world).accepted).toEqual(['JPN']);
  });

  it('ne demande pas deux fois la même monnaie dans une manche', () => {
    const round = createRound(world, MODES.currency, 30, seeded(4), world);
    const currencies = round.questions.map((q) =>
      q.clue.kind === 'currency' ? q.clue.currency.fr : '',
    );
    expect(new Set(currencies).size).toBe(currencies.length);
  });

  it('compte les indices distincts, pas les pays', () => {
    expect(distinctClues(world, MODES.name)).toBe(194);
    // 194 pays mais moins de monnaies : l'euro et le franc CFA regroupent.
    expect(distinctClues(world, MODES.currency)).toBeLessThan(194);
    expect(distinctClues(world, MODES.currency)).toBeGreaterThan(100);
  });

  it('raccourcit la manche quand les indices distincts manquent', () => {
    const euroZone = world.filter((c) => c.currencies[0]?.code === 'EUR');
    const round = createRound(euroZone, MODES.currency, 10, seeded(2), world);
    expect(round.questions).toHaveLength(1);
  });
});
