import { mount } from 'svelte'
import './app.css'
import App from './App.svelte'
import { i18n } from './lib/i18n/i18n.svelte.js'

// L'attribut lang du document suit la langue choisie : les lecteurs d'écran
// et la césure du navigateur s'y fient.
document.documentElement.lang = i18n.lang

const app = mount(App, {
  target: document.getElementById('app')!,
})

export default app
