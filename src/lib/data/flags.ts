/**
 * Les drapeaux sont bundlés depuis `src/assets/flags/` : Vite leur donne une
 * URL versionnée et le navigateur ne charge que celui qui s'affiche. Aucun CDN.
 */
const files = import.meta.glob('../../assets/flags/*.svg', {
  eager: true,
  query: '?url',
  import: 'default',
}) as Record<string, string>;

const byIso2 = new Map<string, string>(
  Object.entries(files).map(([path, url]) => [path.split('/').pop()?.replace('.svg', '') ?? '', url]),
);

export function flagUrl(iso2: string): string | undefined {
  return byIso2.get(iso2);
}
