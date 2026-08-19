import type { GameMode, ModeId } from '../types.js';
import { capitalMode } from './capital.js';
import { currencyMode } from './currency.js';
import { flagMode } from './flag.js';
import { mottoMode } from './motto.js';
import { nameMode } from './name.js';

/** Le registre des modes. Un mode de plus = une entrée de plus. */
export const MODES: Readonly<Record<ModeId, GameMode>> = {
  name: nameMode,
  flag: flagMode,
  capital: capitalMode,
  currency: currencyMode,
  motto: mottoMode,
};
