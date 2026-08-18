import { defineConfig } from 'vite'
import { svelte } from '@sveltejs/vite-plugin-svelte'

// Le site est publié sur https://hugohismans.github.io/Worldgame/ : les assets
// doivent être préfixés au build (et à la prévisualisation de ce build), mais
// pas sur le serveur de développement.
export default defineConfig(({ command, isPreview }) => ({
  base: command === 'build' || isPreview ? '/Worldgame/' : '/',
  plugins: [svelte()],
  build: {
    // Les drapeaux restent des fichiers à part : inlinés en data-URI, les 180
    // SVG alourdiraient le bundle initial alors qu'une partie n'en affiche
    // qu'une poignée.
    assetsInlineLimit: (file: string) => !file.endsWith('.svg'),
  },
}))
