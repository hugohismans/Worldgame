export const LANGS = ['fr', 'en'] as const;
export type Lang = (typeof LANGS)[number];

export const LANG_LABELS: Readonly<Record<Lang, string>> = {
  fr: 'Français',
  en: 'English',
};

const isLang = (value: unknown): value is Lang => LANGS.includes(value as Lang);

/**
 * Langue à utiliser au lancement : le choix mémorisé s'il existe, sinon celle
 * du navigateur, sinon l'anglais. Pure, pour être testable.
 */
export function pickLanguage(saved: string | null, preferred: readonly string[]): Lang {
  if (isLang(saved)) return saved;
  for (const tag of preferred) {
    const base = tag.toLowerCase().split('-')[0];
    if (isLang(base)) return base;
  }
  return 'en';
}
