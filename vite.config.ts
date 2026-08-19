import { defineConfig } from 'vite'
import { svelte } from '@sveltejs/vite-plugin-svelte'

// Le site est publié sur https://hugohismans.github.io/Worldgame/ : les assets
// doivent être préfixés au build (et à la prévisualisation de ce build), mais
// pas sur le serveur de développement.
export default defineConfig(({ command, isPreview }) => ({
  base: command === 'build' || isPreview ? '/Worldgame/' : '/',
  plugins: [svelte()],
  build: {
    // Rien n'est inliné en data-URI : les 180 drapeaux alourdiraient le bundle
    // initial alors qu'une manche en affiche dix, et les fontes gonfleraient la
    // feuille de style qui bloque le premier rendu.
    assetsInlineLimit: 0,
  },
}))
