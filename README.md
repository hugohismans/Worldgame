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
npm run test       # Vitest sur la logique pure
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
| `tiers.ts` | répartition des 194 pays jouables en trois niveaux de notoriété |
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
- **Monnaies partagées.** Vingt-six pays ont l'euro, huit le franc CFA (BCEAO).
  Plutôt que d'écarter du jeu les monnaies les plus intéressantes, le mode
  « monnaie » accepte **n'importe quel pays de la zone** et éclaire la zone
  entière à la révélation. Le drapeau `ACCEPT_ANY_COUNTRY_OF_THE_ZONE`
  (`src/lib/game/modes/currency.ts`) restreint le jeu aux monnaies uniques.
  Seule la monnaie **nationale** compte : le dollar américain a cours légal au
  Panama, mais faire entrer le Panama dans la « zone dollar » n'apprendrait rien.
- **Trois niveaux de notoriété** (`scripts/overrides/tiers.ts`) servent à
  composer des pools de difficulté : `common` (66), `uncommon` (73), `rare` (55).
  Le critère n'est pas « connaître le nom » mais « savoir le placer sur un
  globe » — d'où Monaco, Singapour et le Vatican en `rare`. Classement
  éditorial et discutable : chaque pays est dans une liste et une seule, le
  build échoue si l'un manque ou est en double.
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

## Ajouter un mode de jeu

Le moteur ne connaît qu'une notion abstraite de question : un indice et la
liste des réponses acceptées. Un mode tient donc dans un fichier.

1. Créer `src/lib/game/modes/<mode>.ts` qui exporte un `GameMode` :
   - `eligible(country)` écarte les pays auxquels la question ne s'applique
     pas (un pays sans capitale ne peut pas sortir en mode « capitale ») ;
   - `question(country, pool)` rend `{ answer, accepted, clue }`. `accepted`
     contient plusieurs pays quand plusieurs réponses sont justes — le mode
     « monnaie » acceptera n'importe quel pays de la zone euro.
2. Ajouter la variante d'indice au type `Clue` dans `src/lib/game/types.ts`.
   Un indice porte des valeurs déjà traduites (`Localized`), jamais du texte
   figé : c'est la vue qui choisit la langue.
3. Afficher cette variante dans `src/lib/ui/GameHud.svelte`.

Rien d'autre à toucher : le tirage, le score, les séries et l'écran de fin
sont communs à tous les modes.

## Langues

Français et anglais, interface **et** données : noms de pays, formes avec
article, capitales et monnaies existent dans les deux langues depuis la phase 1.

- `src/lib/i18n/dictionary.ts` — les deux dictionnaires. **Le français est la
  référence** : l'anglais est typé `typeof fr`, donc une clé oubliée, en trop,
  ou une phrase à trous dont la signature diffère **casse le build**.
- `src/lib/i18n/language.ts` — `pickLanguage(mémorisé, langues du navigateur)`,
  pure et testée.
- `src/lib/i18n/i18n.svelte.ts` — la langue courante. `i18n.t.play` donne une
  chaîne d'interface, `i18n.of(country.name)` la bonne face d'une donnée.

Au premier lancement la langue du navigateur décide ; ensuite c'est le choix du
joueur, mémorisé en `localStorage` et reflété par l'attribut `lang` du document.

Ajouter une chaîne : l'écrire dans `fr`, puis dans `en` — le compilateur
refusera de passer tant que la seconde manque. Ajouter une langue : un
dictionnaire de plus, un code dans `LANGS`.

## Direction artistique

**Carte marine de nuit.** Les terres sont en parchemin sur un océan d'encre —
l'inverse du bleu-sur-bleu habituel. C'est un parti pris, et c'est aussi ce qui
sépare le mieux deux pays voisins.

| Jeton | Valeur | Rôle |
|---|---|---|
| `--abysse` | `#060f18` | le fond, derrière le globe |
| `--encre` | `#0e2130` | l'océan et les surfaces d'interface |
| `--parchemin` | `#d9cfba` | les terres |
| `--laiton` | `#d9a441` | l'accent : actions, pays attendu |
| `--verdigris` | `#37977d` | bonne réponse |
| `--corail` | `#cf5a45` | erreur |

**Typographie** : Bricolage Grotesque (titres et texte) associé à IBM Plex Mono
pour les relevés — score, étiquettes, records. Les deux fontes sont **hébergées
dans le dépôt** (144 Ko, sous-ensembles latin et latin-ext chargés séparément) :
aucun appel à un service tiers, et le jeu reste identique hors ligne.

**Élément signature** : la *neatline*, ce cadre en laiton avec ses équerres
d'angle qui encadre le globe pendant la partie, comme la graduation d'une carte
marine.

**Animations** : elles servent le jeu et rien d'autre — l'indice qui monte à
chaque question, la pulsation du score sur une bonne réponse, le globe qui
pivote pour amener le pays attendu au centre. Toutes sont neutralisées sous
`prefers-reduced-motion`.

## Contraintes de conception

- **Accessibilité.** Tout est atteignable au clavier avec un focus visible, les
  changements d'état passent par `aria-live`, et `prefers-reduced-motion` coupe
  les animations. **Limite connue** : on ne peut pas désigner un pays au clavier
  — le globe est une scène 3D. Le bouton « je donne ma langue au chat » permet
  au moins d'avancer et de voir la réponse sans pointeur.
- **Mobile d'abord.** Les écrans sont pensés en portrait puis élargis, jamais
  l'inverse. Conséquences déjà appliquées : cadrage du globe calculé depuis le
  ratio de l'écran, `touch-action: none` sur le canvas, aucune information
  disponible seulement au survol (il n'y a pas de survol sur un téléphone).
- Le globe est le héros de l'écran : en portrait il occupe la bande centrale,
  l'interface se loge dans les marges haute et basse.

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
- [x] **Phase 2 — MVP jouable** : mode « nom », manches de 10/20/30, filtres de
      pool (notoriété et continent), score, feedback, écran de fin.
- [x] **Phase 3 — Modes** : drapeau, capitale, monnaie, choix du mode sur l'accueil.
- [x] **Phase 4 — Bascule FR/EN** : interface, noms, capitales et monnaies dans
      les deux langues ; détection au premier lancement, choix mémorisé.
- [x] **Phase 5 — Finition** : direction artistique, animations, meilleurs
      scores par mode et par longueur, mise en page mobile, accessibilité.
- [ ] Phase 6 — Sound design : retours de jeu uniquement (tap, bonne réponse,
      erreur, révélation, fin de manche). Sons d'interface **synthétisés** via
      l'API Web Audio — zéro octet, aucune licence à tracer — et un ou deux
      fichiers courts sous licence CC0 pour les moments forts. Coupure du son
      persistée, et pas un bruit avant le premier geste du joueur (iOS refuse
      d'ouvrir le contexte audio sans interaction).
