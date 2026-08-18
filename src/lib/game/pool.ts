import type { Country } from '../data/types.js';
import type { GameMode, PoolFilter } from './types.js';

/**
 * Les pays qui peuvent être demandés : jouables, compatibles avec le mode, et
 * retenus par le filtre. Les territoires dépendants n'y entrent jamais — on
 * peut cliquer dessus, jamais les demander.
 */
export function buildPool(
  countries: readonly Country[],
  mode: GameMode,
  filter: PoolFilter,
): readonly Country[] {
  return countries.filter(
    (country) =>
      country.playable &&
      mode.eligible(country) &&
      (filter.tier === 'all' || country.tier === filter.tier) &&
      (filter.region === 'all' || country.region === filter.region),
  );
}
