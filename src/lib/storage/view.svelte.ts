const STORAGE_KEY = 'worldgame.view';

export const VIEWS = ['globe', 'map'] as const;
export type ViewId = (typeof VIEWS)[number];

/** Globe ou planisphère. Le choix suit le joueur d'une session à l'autre. */
class ViewPreference {
  current = $state<ViewId>(read());

  set(view: ViewId): void {
    this.current = view;
    try {
      localStorage.setItem(STORAGE_KEY, view);
    } catch {
      // navigation privée : le choix ne survivra pas au rechargement
    }
  }
}

function read(): ViewId {
  try {
    return localStorage.getItem(STORAGE_KEY) === 'map' ? 'map' : 'globe';
  } catch {
    return 'globe';
  }
}

export const view = new ViewPreference();
