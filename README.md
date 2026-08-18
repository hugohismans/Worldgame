# Worldgame

Jeu de géographie sur globe 3D : un indice s'affiche, tu tournes le globe et tu
cliques sur le bon pays. Tout tourne côté client, sans backend ni requête réseau
au runtime.

## Lancer

```sh
npm install
npm run dev        # serveur de développement
npm run build      # build statique dans dist/
npm run preview    # sert le build
npm run check      # svelte-check + tsc (TypeScript strict)
```

## Données

Le dataset est **figé et commité** dans `src/data/` : l'application ne fait
aucun appel réseau. Pour le régénérer :

```sh
npm run build:data
```

Le script `scripts/build-data.ts` télécharge deux sources (mises en cache dans
`.cache/`, non commité), les croise, copie les drapeaux et écrit :

| Fichier | Contenu |
|---|---|
| `src/data/countries.json` | 205 entités : noms FR/EN, capitale, monnaies, région, superficie, population |
| `src/data/geometry.json` | 176 polygones Natural Earth 110m, réduits à `{ iso3 }` + géométrie |
| `src/assets/flags/*.svg` | drapeaux copiés depuis `flag-icons` (aucun CDN) |

Sources :

- **Natural Earth `admin_0_countries` 1:110m** (domaine public) — géométries et noms FR/EN.
- **[mledoze/countries](https://github.com/mledoze/countries)** (ODbL) — capitales,
  monnaies, régions, superficie. C'est la source amont de REST Countries, dont
  l'API publique renvoie désormais une erreur de dépréciation sur toutes ses versions.
- **[flag-icons](https://github.com/lipis/flag-icons)** (MIT, `devDependency`) — drapeaux SVG.

Le script échoue (code de sortie 1) si une donnée obligatoire manque : nom
français, capitale d'un pays jouable, nom de monnaie en français, drapeau. Les
données seulement douteuses sont signalées en `⚠︎` sans bloquer.

### Corrections manuelles

Les sources ne couvrent pas tout : `scripts/overrides/` contient les tables
relues à la main, à éditer si une donnée est fausse.

| Fichier | Rôle |
|---|---|
| `geography.ts` | polygones Natural Earth sans ISO (`-99`), entités hors base pays, libellés de régions |
| `names.ts` | noms de pays FR/EN mal orthographiés ou datés à la source |
| `capitals.ts` | capitales en français (la source ne fournit que l'anglais) |
| `currencies.ts` | noms de monnaies en français, par code ISO 4217 |

### Choix de modélisation

- **Jouable ou décor.** Un pays est `playable` s'il est indépendant et membre de
  l'ONU (194). Les territoires dépendants — Groenland, Porto Rico, Nouvelle-Calédonie,
  Sahara occidental, Palestine, Taïwan, Malouines, TAAF, Kosovo, Chypre du Nord,
  Somaliland — sont affichés et cliquables, mais ne sont jamais la réponse
  attendue : un clic dessus est traité comme une erreur, sans planter.
- **Polygone ou marqueur.** 29 membres de l'ONU n'existent pas à la résolution
  110m (Monaco, Malte, Singapour, Maldives, Bahreïn, les micro-États des Caraïbes
  et du Pacifique…). Ils sont rendus comme marqueurs ponctuels cliquables
  (`shape: 'point'`) plutôt qu'exclus du jeu.
- **L'Antarctique est retiré** de la géométrie : ni jouable, ni cliquable.
- **Population** : reprise de Natural Earth (`POP_EST`), donc inconnue pour les
  29 pays sans polygone. Aucun mode de jeu ne s'en sert aujourd'hui.

## Déploiement

Le site est publié sur **https://hugohismans.github.io/Worldgame/** par
`.github/workflows/deploy.yml` : chaque push sur `main` relance `npm run check`,
`npm run build`, puis déploie `dist/`.

Côté dépôt, *Settings → Pages → Source* doit être réglé sur **GitHub Actions**
(et non « Deploy from a branch » : Pages servirait alors le `index.html` source,
qui référence `/src/main.ts` et ne fonctionne pas sans build).

Le chemin de base `/Worldgame/` est appliqué au build et à `npm run preview`,
mais pas à `npm run dev`. Il est à changer dans `vite.config.ts` si le dépôt est
renommé ou si un domaine personnalisé est configuré.

## Architecture

```
scripts/build-data.ts     génération du dataset (hors runtime)
scripts/overrides/        corrections manuelles des sources
src/data/                 dataset figé, commité
src/lib/data/             types partagés et accès au dataset
src/lib/globe/            rendu du globe (globe.gl) et couleurs
src/App.svelte            écran principal
```

## Dépendances

- `globe.gl` (runtime) — rendu du globe, couche de polygones, raycasting du
  survol et du clic, animation de caméra. Seule dépendance de production.
- `flag-icons` (dev) — source des drapeaux SVG, copiés dans `src/assets/` au
  build des données puis jamais rechargés.
- `tsx` (dev) — exécute le script de génération en TypeScript.

## État d'avancement

- [x] **Phase 1 — Socle** : projet, dataset, globe avec pays et marqueurs cliquables.
- [ ] Phase 2 — MVP jouable (mode « nom », manches de 10/20/30, score, écran de fin)
- [ ] Phase 3 — Modes drapeau / capitale / monnaie
- [ ] Phase 4 — Bascule FR/EN
- [ ] Phase 5 — Direction artistique, animations, meilleurs scores, mobile, déploiement
