import type { Iso3 } from '../../src/lib/data/types.js';

/**
 * Devises nationales : le texte original, et sa traduction dans les deux
 * langues du jeu.
 *
 * Table **curée à la main**. Wikidata expose bien les devises (P1451), mais
 * mêlées à des slogans touristiques — « Endless discovery » pour le Japon,
 * « Magical Kenya » — et parsemée d'erreurs : la devise de l'Azerbaïdjan y
 * était attribuée à l'Équateur et à la Tanzanie. Seuls les textes originaux
 * viennent de là, pour ne pas recopier à la main de l'arabe ou du géorgien ;
 * le tri et les traductions sont manuels.
 *
 * Un pays absent de cette table ne sort pas en mode « devise » : mieux vaut
 * 108 devises sûres que 194 dont un tiers de slogans d'agence de voyage.
 */
export interface MottoEntry {
  /** La devise dans sa langue d'origine. */
  readonly original: string;
  readonly fr: string;
  readonly en: string;
}

export const MOTTOS: Readonly<Partial<Record<Iso3, MottoEntry>>> = {
  AGO: {
    original: 'Virtus Unita Fortior',
    fr: 'La vertu unie est plus forte',
    en: 'Virtue united is stronger',
  },
  AND: {
    original: 'Virtus Unita Fortior',
    fr: 'La vertu unie est plus forte',
    en: 'Virtue united is stronger',
  },
  ARG: {
    original: 'En unión y libertad',
    fr: 'En union et liberté',
    en: 'In unity and freedom',
  },
  BDI: {
    original: 'Unité, Travail, Progrès',
    fr: 'Unité, Travail, Progrès',
    en: 'Unity, Work, Progress',
  },
  BEL: {
    original: 'L’union fait la force',
    fr: 'L’union fait la force',
    en: 'Strength through unity',
  },
  BEN: {
    original: 'Fraternité, Justice, Travail',
    fr: 'Fraternité, Justice, Travail',
    en: 'Fellowship, Justice, Labour',
  },
  BFA: {
    original: 'Unité–Progrès–Justice',
    fr: 'Unité, Progrès, Justice',
    en: 'Unity, Progress, Justice',
  },
  BLZ: {
    original: 'Sub umbra floreo',
    fr: 'À l’ombre je fleuris',
    en: 'Under the shade I flourish',
  },
  BOL: {
    original: 'La Unión es la Fuerza',
    fr: 'L’union fait la force',
    en: 'Unity is strength',
  },
  BRA: {
    original: 'Ordem e Progresso',
    fr: 'Ordre et Progrès',
    en: 'Order and Progress',
  },
  BRB: {
    original: 'Pride and Industry',
    fr: 'Fierté et labeur',
    en: 'Pride and Industry',
  },
  CAF: {
    original: 'Unité, Dignité, Travail',
    fr: 'Unité, Dignité, Travail',
    en: 'Unity, Dignity, Work',
  },
  CAN: {
    original: 'A mari usque ad mare',
    fr: 'D’un océan à l’autre',
    en: 'From sea to sea',
  },
  CHE: {
    original: 'Unus pro omnibus, omnes pro uno',
    fr: 'Un pour tous, tous pour un',
    en: 'One for all, all for one',
  },
  CHL: {
    original: 'Por la razón o la fuerza',
    fr: 'Par la raison ou par la force',
    en: 'By reason or by force',
  },
  CIV: {
    original: 'Union – Discipline – Travail',
    fr: 'Union, Discipline, Travail',
    en: 'Unity, Discipline, Work',
  },
  CMR: {
    original: 'Paix, Travail, Patrie',
    fr: 'Paix, Travail, Patrie',
    en: 'Peace, Work, Fatherland',
  },
  COD: {
    original: 'Justice – Paix – Travail',
    fr: 'Justice, Paix, Travail',
    en: 'Justice, Peace, Work',
  },
  COG: {
    original: 'Unité, Travail, Progrès',
    fr: 'Unité, Travail, Progrès',
    en: 'Unity, Work, Progress',
  },
  COL: {
    original: 'Libertad y Orden',
    fr: 'Liberté et Ordre',
    en: 'Freedom and Order',
  },
  COM: {
    original: 'Unité – Solidarité – Développement',
    fr: 'Unité, Solidarité, Développement',
    en: 'Unity, Solidarity, Development',
  },
  CRI: {
    original: 'Vivan siempre el trabajo y la paz',
    fr: 'Vivent à jamais le travail et la paix',
    en: 'Long live work and peace',
  },
  CUB: {
    original: '¡Patria o Muerte, Venceremos!',
    fr: 'La patrie ou la mort, nous vaincrons',
    en: 'Homeland or death, we shall overcome',
  },
  CZE: {
    original: 'Pravda vítězí.',
    fr: 'La vérité prévaut',
    en: 'Truth prevails',
  },
  DEU: {
    original: 'Einigkeit und Recht und Freiheit',
    fr: 'Unité, justice et liberté',
    en: 'Unity and justice and freedom',
  },
  DOM: {
    original: 'Dios, Patria, Libertad',
    fr: 'Dieu, Patrie, Liberté',
    en: 'God, Homeland, Freedom',
  },
  DZA: {
    original: 'بالشّعب وللشّعب',
    fr: 'Par le peuple et pour le peuple',
    en: 'By the people and for the people',
  },
  ECU: {
    original: 'Dios, patria y libertad',
    fr: 'Dieu, patrie et liberté',
    en: 'God, homeland and freedom',
  },
  ESP: {
    original: 'Plus Ultra',
    fr: 'Toujours plus loin',
    en: 'Further beyond',
  },
  FJI: {
    original: 'Rerevaka na Kalou ka Doka na Tui',
    fr: 'Crains Dieu et honore la Reine',
    en: 'Fear God and honour the Queen',
  },
  FRA: {
    original: 'Liberté, égalité, fraternité',
    fr: 'Liberté, égalité, fraternité',
    en: 'Liberty, equality, fraternity',
  },
  FSM: {
    original: 'Peace, Unity, Liberty',
    fr: 'Paix, Unité, Liberté',
    en: 'Peace, Unity, Liberty',
  },
  GAB: {
    original: 'Union, Travail, Justice',
    fr: 'Union, Travail, Justice',
    en: 'Union, Work, Justice',
  },
  GBR: {
    original: 'Dieu et mon droit',
    fr: 'Dieu et mon droit',
    en: 'God and my right',
  },
  GEO: {
    original: 'ძალა ერთობაშია',
    fr: 'La force est dans l’unité',
    en: 'Strength is in unity',
  },
  GHA: {
    original: 'Freedom and Justice',
    fr: 'Liberté et Justice',
    en: 'Freedom and Justice',
  },
  GIN: {
    original: 'Travail, Justice, Solidarité',
    fr: 'Travail, Justice, Solidarité',
    en: 'Work, Justice, Solidarity',
  },
  GMB: {
    original: 'Progress, Peace, Prosperity',
    fr: 'Progrès, Paix, Prospérité',
    en: 'Progress, Peace, Prosperity',
  },
  GNB: {
    original: 'Unidade, Luta, Progresso',
    fr: 'Unité, Lutte, Progrès',
    en: 'Unity, Struggle, Progress',
  },
  GNQ: {
    original: 'Unidad, Paz, Justicia',
    fr: 'Unité, Paix, Justice',
    en: 'Unity, Peace, Justice',
  },
  GRC: {
    original: 'Ελευθερία ή Θάνατος',
    fr: 'La liberté ou la mort',
    en: 'Freedom or Death',
  },
  GTM: {
    original: 'Libre Crezca Fecundo',
    fr: 'Croîs libre et féconde',
    en: 'Grow free and fertile',
  },
  HND: {
    original: 'Libre, Soberana e Independiente',
    fr: 'Libre, souveraine et indépendante',
    en: 'Free, Sovereign and Independent',
  },
  HTI: {
    original: 'L’union fait la force',
    fr: 'L’union fait la force',
    en: 'Unity makes strength',
  },
  IDN: {
    original: 'Bhinneka Tunggal Ika',
    fr: 'Unité dans la diversité',
    en: 'Unity in Diversity',
  },
  IND: {
    original: 'सत्यमेव जयते',
    fr: 'Seule la vérité triomphe',
    en: 'Truth alone triumphs',
  },
  IRN: {
    original: 'استقلال، آزادی، جمهوری اسلامی',
    fr: 'Indépendance, liberté, République islamique',
    en: 'Independence, freedom, Islamic Republic',
  },
  JAM: {
    original: 'Out of Many, One People',
    fr: 'De plusieurs, un seul peuple',
    en: 'Out of Many, One People',
  },
  JOR: {
    original: 'الله، الوطن، الملك',
    fr: 'Dieu, la Patrie, le Roi',
    en: 'God, Homeland, King',
  },
  KEN: {
    original: 'Harambee',
    fr: 'Tous ensemble',
    en: 'All pull together',
  },
  KHM: {
    original: 'ជាតិ សាសនា ព្រះមហាក្សត្រ',
    fr: 'Nation, Religion, Roi',
    en: 'Nation, Religion, King',
  },
  KOR: {
    original: '홍익인간(弘益人間): 널리 인간을 이롭게 하라',
    fr: 'Œuvrer largement au bien de l’humanité',
    en: 'Benefit broadly the human world',
  },
  LAO: {
    original: 'ສັນຕິພາບ ເອກະລາດ ປະຊາທິປະໄຕ ເອກະພາບ ວັດທະນາຖາວອນ',
    fr: 'Paix, indépendance, démocratie, unité, prospérité',
    en: 'Peace, independence, democracy, unity, prosperity',
  },
  LBR: {
    original: 'The Love Of Liberty Brought Us Here',
    fr: 'L’amour de la liberté nous a menés ici',
    en: 'The Love of Liberty Brought Us Here',
  },
  LCA: {
    original: 'The Land, The People, The Light',
    fr: 'La terre, le peuple, la lumière',
    en: 'The Land, The People, The Light',
  },
  LIE: {
    original: 'Für Gott, Fürst und Vaterland',
    fr: 'Pour Dieu, le Prince et la Patrie',
    en: 'For God, Prince and Fatherland',
  },
  LTU: {
    original: 'Vienybė težydi',
    fr: 'Que l’unité fleurisse',
    en: 'Let unity flourish',
  },
  LUX: {
    original: 'Mir wëlle bleiwe wat mir sinn',
    fr: 'Nous voulons rester ce que nous sommes',
    en: 'We want to remain what we are',
  },
  LVA: {
    original: 'Tēvzemei un Brīvībai',
    fr: 'Pour la Patrie et la Liberté',
    en: 'For Fatherland and Freedom',
  },
  MAR: {
    original: 'الله، الوطن، الملك',
    fr: 'Dieu, la Patrie, le Roi',
    en: 'God, Homeland, King',
  },
  MCO: {
    original: 'Deo Juvante',
    fr: 'Avec l’aide de Dieu',
    en: 'With God’s help',
  },
  MLI: {
    original: 'Un peuple, un but, une foi',
    fr: 'Un peuple, un but, une foi',
    en: 'One people, one goal, one faith',
  },
  MRT: {
    original: 'شرف إخاء عدل',
    fr: 'Honneur, Fraternité, Justice',
    en: 'Honour, Fraternity, Justice',
  },
  MWI: {
    original: 'Unity and Freedom',
    fr: 'Unité et Liberté',
    en: 'Unity and Freedom',
  },
  MYS: {
    original: 'Bersekutu Bertambah Mutu',
    fr: 'L’unité fait la force',
    en: 'Unity is strength',
  },
  NAM: {
    original: 'Unity, Liberty, Justice',
    fr: 'Unité, Liberté, Justice',
    en: 'Unity, Liberty, Justice',
  },
  NER: {
    original: 'Fraternité, Travail, Progrès',
    fr: 'Fraternité, Travail, Progrès',
    en: 'Fraternity, Work, Progress',
  },
  NGA: {
    original: 'Unity and Faith, Peace and Progress',
    fr: 'Unité et Foi, Paix et Progrès',
    en: 'Unity and Faith, Peace and Progress',
  },
  NIC: {
    original: 'En Dios confiamos',
    fr: 'En Dieu nous croyons',
    en: 'In God we trust',
  },
  NLD: {
    original: 'Je maintiendrai',
    fr: 'Je maintiendrai',
    en: 'I will maintain',
  },
  NPL: {
    original: 'जननी जन्मभूमिश्च स्वर्गादपि गरीयसी',
    fr: 'La mère et la patrie sont plus grandes que le ciel',
    en: 'Mother and Motherland are greater than Heaven',
  },
  PAK: {
    original: 'ایمان، اتحاد، نظم',
    fr: 'Foi, Unité, Discipline',
    en: 'Faith, Unity, Discipline',
  },
  PAN: {
    original: 'Pro Mundi Beneficio',
    fr: 'Pour le bien du monde',
    en: 'For the benefit of the world',
  },
  PER: {
    original: 'Firme y feliz por la unión',
    fr: 'Ferme et heureux par l’union',
    en: 'Firm and happy for the union',
  },
  PHL: {
    original: 'Maka-Diyos, Maka-Tao, Makakalikasan at Makabansa',
    fr: 'Pour Dieu, le peuple, la nature et la patrie',
    en: 'For God, People, Nature and Country',
  },
  POL: {
    original: 'Bóg, Honor, Ojczyzna',
    fr: 'Dieu, Honneur, Patrie',
    en: 'God, Honour, Fatherland',
  },
  PRY: {
    original: 'Paz y justicia',
    fr: 'Paix et Justice',
    en: 'Peace and Justice',
  },
  RWA: {
    original: 'Ubumwe, Umurimo, Gukunda Igihugu',
    fr: 'Unité, Travail, Patriotisme',
    en: 'Unity, Work, Patriotism',
  },
  SDN: {
    original: 'النصر لنا',
    fr: 'La victoire est nôtre',
    en: 'Victory is ours',
  },
  SEN: {
    original: 'Un Peuple, Un But, Une Foi',
    fr: 'Un peuple, un but, une foi',
    en: 'One people, one goal, one faith',
  },
  SGP: {
    original: 'Majulah Singapura',
    fr: 'En avant, Singapour',
    en: 'Onward, Singapore',
  },
  SLB: {
    original: 'To Lead is to Serve',
    fr: 'Diriger, c’est servir',
    en: 'To Lead is to Serve',
  },
  SLE: {
    original: 'Unity, Freedom, Justice',
    fr: 'Unité, Liberté, Justice',
    en: 'Unity, Freedom, Justice',
  },
  SLV: {
    original: 'Dios, Unión, Libertad',
    fr: 'Dieu, Union, Liberté',
    en: 'God, Union, Liberty',
  },
  SMR: {
    original: 'Libertas',
    fr: 'Liberté',
    en: 'Liberty',
  },
  SSD: {
    original: 'Justice, Liberty, Prosperity',
    fr: 'Justice, Liberté, Prospérité',
    en: 'Justice, Liberty, Prosperity',
  },
  STP: {
    original: 'Unidade, Disciplina, Trabalho',
    fr: 'Unité, Discipline, Travail',
    en: 'Unity, Discipline, Work',
  },
  SUR: {
    original: 'Justitia, Pietas, Fides',
    fr: 'Justice, Piété, Fidélité',
    en: 'Justice, Piety, Fidelity',
  },
  SYC: {
    original: 'Finis coronat opus',
    fr: 'La fin couronne l’œuvre',
    en: 'The end crowns the work',
  },
  TCD: {
    original: 'Unité, Travail, Progrès',
    fr: 'Unité, Travail, Progrès',
    en: 'Unity, Work, Progress',
  },
  TGO: {
    original: 'Travail, Liberté, Patrie',
    fr: 'Travail, Liberté, Patrie',
    en: 'Work, Liberty, Homeland',
  },
  THA: {
    original: 'ชาติ ศาสนา พระมหากษัตริย์',
    fr: 'Nation, Religion, Roi',
    en: 'Nation, Religion, King',
  },
  TLS: {
    original: 'Unidade, Acção, Progresso',
    fr: 'Unité, Action, Progrès',
    en: 'Unity, Action, Progress',
  },
  TON: {
    original: 'Ko e ʻOtua mo Tonga ko hoku tofiʻa',
    fr: 'Dieu et Tonga sont mon héritage',
    en: 'God and Tonga are my inheritance',
  },
  TTO: {
    original: 'Together We Aspire, Together We Achieve',
    fr: 'Ensemble nous aspirons, ensemble nous accomplissons',
    en: 'Together We Aspire, Together We Achieve',
  },
  TUN: {
    original: 'حرية، نظام، عدالة',
    fr: 'Liberté, Ordre, Justice',
    en: 'Liberty, Order, Justice',
  },
  TUR: {
    original: 'Yurtta sulh, cihanda sulh',
    fr: 'Paix dans le pays, paix dans le monde',
    en: 'Peace at home, peace in the world',
  },
  TUV: {
    original: 'Tuvalu mo te Atua',
    fr: 'Tuvalu pour le Tout-Puissant',
    en: 'Tuvalu for the Almighty',
  },
  TZA: {
    original: 'Uhuru na Umoja',
    fr: 'Liberté et Unité',
    en: 'Freedom and Unity',
  },
  UGA: {
    original: 'For God and My Country',
    fr: 'Pour Dieu et mon pays',
    en: 'For God and My Country',
  },
  URY: {
    original: 'Libertad o Muerte',
    fr: 'Liberté ou Mort',
    en: 'Liberty or Death',
  },
  USA: {
    original: 'In God We Trust',
    fr: 'En Dieu nous croyons',
    en: 'In God We Trust',
  },
  VEN: {
    original: 'Dios y Federación',
    fr: 'Dieu et Fédération',
    en: 'God and Federation',
  },
  VNM: {
    original: 'Độc lập – Tự do – Hạnh phúc',
    fr: 'Indépendance, Liberté, Bonheur',
    en: 'Independence, Freedom, Happiness',
  },
  VUT: {
    original: 'Long God yumi stanap',
    fr: 'En Dieu nous nous tenons',
    en: 'In God we stand',
  },
  ZAF: {
    original: 'ǃke e꞉ ǀxarra ǁke',
    fr: 'Des peuples divers s’unissent',
    en: 'Diverse people unite',
  },
  ZMB: {
    original: 'One Zambia, One Nation',
    fr: 'Une Zambie, une nation',
    en: 'One Zambia, One Nation',
  },
  ZWE: {
    original: 'Unity, Freedom, Work',
    fr: 'Unité, Liberté, Travail',
    en: 'Unity, Freedom, Work',
  },
};
