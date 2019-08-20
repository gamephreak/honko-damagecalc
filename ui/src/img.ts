const BW: { [id: string]: DexData } = require('./data/bw').BattlePokemonSpritesBW;
const XY: { [id: string]: DexData } = require('./data/xy').BattlePokemonSprites;

interface DexData {
  num: number;
  isTotem: boolean;
  front?: { w: number; h: number };
  frontf?: { w: number; h: number };
  back?: { w: number; h: number };
  backf?: { w: number; h: number };
}

type ID = '' | string & { __isID: true };

function toID(text: any): ID {
  return ('' + text).toLowerCase().replace(/[^a-z0-9]+/g, '') as ID;
}

export interface SpriteData {
  url: string;
  w: number;
  h: number;

  y?: number;
  pixelated?: boolean;
  back?: boolean;
  shiny?: boolean;
}

type Gender = 'M' | 'F' | 'N' | '';
type Facing = 'back' | 'front' | 'backf' | 'frontf';

export const Sprites = new (class {
  forBattle(
    pokemon: string,
    options: {
      gen?: number;
      back?: boolean;
      shiny?: boolean;
      gender?: Gender;
      noScale?: boolean;
      noAnim?: boolean;
    } = { gen: 6 }
  ) {
    if (!options.gen) options.gen = 6;

    const data = getData(pokemon);
    const genNum = Math.max(options.gen, Math.min(data.gen, 5));
    const gen = ['', 'rby', 'gsc', 'rse', 'dpp', 'bw', 'xy', 'xy'][genNum];

    const spriteData = {
      w: 96,
      h: 96,
      y: 0,
      url: URL + 'sprites/',
      pixelated: !options.noAnim && genNum >= 6,
      back: options.back,
      shiny: options.shiny,
    };

    let dir = options.back ? '-back' : '';
    if (options.shiny && options.gen > 1) dir += '-shiny';
    let facing: Facing = options.back ? 'back' : 'front';
    if (data[`${facing}f` as Facing] && options.gender === 'F') facing += 'f';

    let name = data.spriteid;
    if (!options.noAnim && data[facing as Facing] && genNum >= 5) {
      if (facing.slice(-1) === 'f') name += '-f';
      dir = `${gen}ani${dir}`;

      spriteData.w = data[facing as Facing]!.w;
      spriteData.h = data[facing as Facing]!.h;
      spriteData.url += ` ${dir}/${name}.gif`;
    } else {
      // Handle these in case-by-case basis; either using BW sprites or matching the played gen.
      dir = (gen === 'xy' ? 'bw' : gen) + dir;
      // Gender differences don't exist prior to Gen 4, so there are no sprites for it.
      if (genNum >= 4 && data.frontf && options.gender === 'F') name += '-f';

      spriteData.url += `${dir}/${name}.png`;
    }

    if (!options.noScale) {
      if (options.gen > 5) {
        // no scaling
      } else if (!spriteData.back || options.gen === 5) {
        spriteData.w *= 2;
        spriteData.h *= 2;
        spriteData.y += -16;
      } else {
        // backsprites are multiplied 1.5x by the 3D engine
        spriteData.w *= 2 / 1.5;
        spriteData.h *= 2 / 1.5;
        spriteData.y += -11;
      }
      if (options.gen === 5) spriteData.y = -35;
      if (options.gen === 5 && spriteData.back) spriteData.y += 40;
      if (genNum <= 2) spriteData.y += 2;
    }
    if (data.isTotem && !options.noScale) {
      spriteData.w *= 1.5;
      spriteData.h *= 1.5;
      spriteData.y += -11;
    }

    return spriteData;
  }

  forTeambuilder(
    pokemon: string,
    options: {
      gen?: number;
      shiny?: boolean;
      gender?: Gender;
    } = { gen: 6 }
  ) {
    if (!pokemon) return '';
    const data = getData(pokemon);
    const id = data.id;
    const shiny = options.shiny ? '-shiny' : '';

    if (!options.gen || options.gen >= 6) {
      let offset = '-2px -3px';
      if (data.gen >= 7) offset = '-6px -7px';
      if (id.substr(0, 6) === 'arceus') offset = '-2px 7px';
      if (id === 'garchomp') offset = '-2px 2px';
      if (id === 'garchompmega') offset = '-2px 0px';
      return `background-image:url(${URL}sprites/xydex${shiny}/${data.spriteid}.png);background-position:${offset};background-repeat:no-repeat`;
    }

    let gen = 'bw';
    if (options.gen <= 1 && data.gen <= 1) gen = 'rby';
    else if (options.gen <= 2 && data.gen <= 2) gen = 'gsc';
    else if (options.gen <= 3 && data.gen <= 3) gen = 'rse';
    else if (options.gen <= 4 && data.gen <= 4) gen = 'dpp';
    return `background-image:url(${URL}sprites/${gen}${shiny}/${data.spriteid}.png);background-position:10px 5px;background-repeat:no-repeat`;
  }
})();

export const Icons = new (class {
  getPokemon(pokemon: string, options: { gender?: Gender; left?: boolean } = {}) {
    const data = getData(pokemon);
    const id = data.id;
    let num = data.num;
    if (num < 0) num = 0;
    if (num > 809) num = 0;

    if (options.left && POKEMON_ICONS_LEFT[id]) {
      num = POKEMON_ICONS_LEFT[id];
    } else if (
      options.gender === 'F' &&
      ['unfezant', 'frillish', 'jellicent', 'meowstic', 'pyroar'].includes(id)
    ) {
      num = POKEMON_ICONS[`${id}f`];
    } else if (POKEMON_ICONS[id]) {
      num = POKEMON_ICONS[id];
    }

    const top = Math.floor(num / 12) * 30;
    const left = (num % 12) * 40;
    return `background:transparent url(${URL}sprites/smicons-sheet.png?a6) no-repeat scroll -${left}px -${top}px`;
  }

  getItem(item: string) {
    const num = ITEMS[toID(item)] || 0;
    const top = Math.floor(num / 16) * 24;
    const left = (num % 16) * 24;
    return `background:transparent url(${URL}sprites/itemicons-sheet.png) no-repeat scroll -${left}px -${top}px`;
  }

  getType(type: string) {
    return !type
      ? ''
      : `<img src="${URL}sprites/types/${type}.png" alt="${type}" height="14" width="32" />`;
  }
})();

const URL = (() => {
  let prefix = '';
  if (!window.document || !document.location || document.location.protocol !== 'http:') {
    prefix = 'https:';
  }
  return prefix + '//play.pokemonshowdown.com/';
})();

interface PokemonData extends DexData {
  id: ID;
  species: string;
  baseSpecies: string;
  spriteid: string;
  forme: string;
  formeid: string;
  gen: number;
  isTotem: boolean;
}

function getData(pokemon: string, bw?: boolean): PokemonData {
  const id = toID(pokemon);
  const data = {
    id,
    species: pokemon,
    baseSpecies: pokemon,
    spriteid: id as string,
    forme: '',
    formeid: '',
    num: 0,
    gen: 0,
    isTotem: false,
  };

  if (['hooh', 'hakamoo', 'jangmoo', 'kommoo', 'porygonz'].includes(id)) {
    const dashIndex = pokemon.indexOf('-');
    if (id === 'kommoototem') {
      data.baseSpecies = 'Kommo-o';
      data.forme = 'Totem';
    } else if (dashIndex > 0) {
      data.baseSpecies = pokemon.slice(0, dashIndex);
      data.forme = pokemon.slice(dashIndex + 1);
    }
  }

  for (const baseid of BASE_SPECIES) {
    if (id.length > baseid.length && id.slice(0, baseid.length) === baseid) {
      data.baseSpecies = baseid;
      data.forme = id.slice(baseid.length);
    }
  }

  if (id !== 'yanmega' && id.slice(-4) === 'mega') {
    data.baseSpecies = id.slice(0, -4);
    data.forme = id.slice(-4);
  } else if (id.slice(-6) === 'primal') {
    data.baseSpecies = id.slice(0, -6);
    data.forme = id.slice(-6);
  } else if (id.slice(-5) === 'alola') {
    data.baseSpecies = id.slice(0, -5);
    data.forme = id.slice(-5);
  }

  const baseid = toID(data.baseSpecies);
  if (baseid !== id) data.formeid = `-${toID(data.forme)}`;
  data.spriteid = `${baseid}${data.formeid}`;
  data.gen = getGen(data.formeid, data.num);
  data.isTotem = data.formeid === '-totem' || data.formeid === '-alolatotem';

  return Object.assign(data, (bw ? BW : XY)[toID(data.isTotem ? data.spriteid : data.species)]);
}

function getGen(formeid: string, num: number) {
  if (['-mega', '-megax', '-megay'].includes(formeid)) return 6;
  if (formeid === '-primal') return 6;
  if (formeid === '-totem' || formeid === '-alolatotem') return 7;
  if (formeid === '-alola') return 7;
  if (num >= 722) return 7;
  if (num >= 650) return 6;
  if (num >= 494) return 5;
  if (num >= 387) return 4;
  if (num >= 252) return 3;
  if (num >= 152) return 2;
  if (num >= 1) return 1;
  return 0;
}

const BASE_SPECIES = [
  'pikachu',
  'pichu',
  'unown',
  'castform',
  'deoxys',
  'burmy',
  'wormadam',
  'cherrim',
  'shellos',
  'gastrodon',
  'rotom',
  'giratina',
  'shaymin',
  'arceus',
  'basculin',
  'darmanitan',
  'deerling',
  'sawsbuck',
  'tornadus',
  'thundurus',
  'landorus',
  'kyurem',
  'keldeo',
  'meloetta',
  'genesect',
  'vivillon',
  'flabebe',
  'floette',
  'florges',
  'furfrou',
  'aegislash',
  'pumpkaboo',
  'gourgeist',
  'meowstic',
  'hoopa',
  'zygarde',
  'lycanroc',
  'wishiwashi',
  'minior',
  'mimikyu',
  'greninja',
  'oricorio',
  'silvally',
  'necrozma',

  // alola totems
  'raticate',
  'marowak',
  'kommoo',

  // mega evolutions
  'charizard',
  'mewtwo',
  // others are hardcoded by ending with 'mega'
] as ID[];

const POKEMON_ICONS: { [id: string]: number } = {
  egg: 816 + 1,
  pikachubelle: 816 + 2,
  pikachulibre: 816 + 3,
  pikachuphd: 816 + 4,
  pikachupopstar: 816 + 5,
  pikachurockstar: 816 + 6,
  pikachucosplay: 816 + 7,
  // unown gap
  castformrainy: 816 + 35,
  castformsnowy: 816 + 36,
  castformsunny: 816 + 37,
  deoxysattack: 816 + 38,
  deoxysdefense: 816 + 39,
  deoxysspeed: 816 + 40,
  burmysandy: 816 + 41,
  burmytrash: 816 + 42,
  wormadamsandy: 816 + 43,
  wormadamtrash: 816 + 44,
  cherrimsunshine: 816 + 45,
  shelloseast: 816 + 46,
  gastrodoneast: 816 + 47,
  rotomfan: 816 + 48,
  rotomfrost: 816 + 49,
  rotomheat: 816 + 50,
  rotommow: 816 + 51,
  rotomwash: 816 + 52,
  giratinaorigin: 816 + 53,
  shayminsky: 816 + 54,
  unfezantf: 816 + 55,
  basculinbluestriped: 816 + 56,
  darmanitanzen: 816 + 57,
  deerlingautumn: 816 + 58,
  deerlingsummer: 816 + 59,
  deerlingwinter: 816 + 60,
  sawsbuckautumn: 816 + 61,
  sawsbucksummer: 816 + 62,
  sawsbuckwinter: 816 + 63,
  frillishf: 816 + 64,
  jellicentf: 816 + 65,
  tornadustherian: 816 + 66,
  thundurustherian: 816 + 67,
  landorustherian: 816 + 68,
  kyuremblack: 816 + 69,
  kyuremwhite: 816 + 70,
  keldeoresolute: 816 + 71,
  meloettapirouette: 816 + 72,
  vivillonarchipelago: 816 + 73,
  vivilloncontinental: 816 + 74,
  vivillonelegant: 816 + 75,
  vivillonfancy: 816 + 76,
  vivillongarden: 816 + 77,
  vivillonhighplains: 816 + 78,
  vivillonicysnow: 816 + 79,
  vivillonjungle: 816 + 80,
  vivillonmarine: 816 + 81,
  vivillonmodern: 816 + 82,
  vivillonmonsoon: 816 + 83,
  vivillonocean: 816 + 84,
  vivillonpokeball: 816 + 85,
  vivillonpolar: 816 + 86,
  vivillonriver: 816 + 87,
  vivillonsandstorm: 816 + 88,
  vivillonsavanna: 816 + 89,
  vivillonsun: 816 + 90,
  vivillontundra: 816 + 91,
  pyroarf: 816 + 92,
  flabebeblue: 816 + 93,
  flabebeorange: 816 + 94,
  flabebewhite: 816 + 95,
  flabebeyellow: 816 + 96,
  floetteblue: 816 + 97,
  floetteeternal: 816 + 98,
  floetteorange: 816 + 99,
  floettewhite: 816 + 100,
  floetteyellow: 816 + 101,
  florgesblue: 816 + 102,
  florgesorange: 816 + 103,
  florgeswhite: 816 + 104,
  florgesyellow: 816 + 105,
  furfroudandy: 816 + 106,
  furfroudebutante: 816 + 107,
  furfroudiamond: 816 + 108,
  furfrouheart: 816 + 109,
  furfroukabuki: 816 + 110,
  furfroulareine: 816 + 111,
  furfroumatron: 816 + 112,
  furfroupharaoh: 816 + 113,
  furfroustar: 816 + 114,
  meowsticf: 816 + 115,
  aegislashblade: 816 + 116,
  hoopaunbound: 816 + 118,
  rattataalola: 816 + 119,
  raticatealola: 816 + 120,
  raichualola: 816 + 121,
  sandshrewalola: 816 + 122,
  sandslashalola: 816 + 123,
  vulpixalola: 816 + 124,
  ninetalesalola: 816 + 125,
  diglettalola: 816 + 126,
  dugtrioalola: 816 + 127,
  meowthalola: 816 + 128,
  persianalola: 816 + 129,
  geodudealola: 816 + 130,
  graveleralola: 816 + 131,
  golemalola: 816 + 132,
  grimeralola: 816 + 133,
  mukalola: 816 + 134,
  exeggutoralola: 816 + 135,
  marowakalola: 816 + 136,
  greninjaash: 816 + 137,
  zygarde10: 816 + 138,
  zygardecomplete: 816 + 139,
  oricoriopompom: 816 + 140,
  oricoriopau: 816 + 141,
  oricoriosensu: 816 + 142,
  lycanrocmidnight: 816 + 143,
  wishiwashischool: 816 + 144,
  miniormeteor: 816 + 145,
  miniororange: 816 + 146,
  minioryellow: 816 + 147,
  miniorgreen: 816 + 148,
  miniorblue: 816 + 149,
  miniorviolet: 816 + 150,
  miniorindigo: 816 + 151,
  magearnaoriginal: 816 + 152,
  pikachuoriginal: 816 + 153,
  pikachuhoenn: 816 + 154,
  pikachusinnoh: 816 + 155,
  pikachuunova: 816 + 156,
  pikachukalos: 816 + 157,
  pikachualola: 816 + 158,
  pikachupartner: 816 + 159,
  lycanrocdusk: 816 + 160,
  necrozmaduskmane: 816 + 161,
  necrozmadawnwings: 816 + 162,
  necrozmaultra: 816 + 163,
  pikachustarter: 816 + 164,
  eeveestarter: 816 + 165,

  gumshoostotem: 735,
  raticatealolatotem: 816 + 120,
  marowakalolatotem: 816 + 136,
  araquanidtotem: 752,
  lurantistotem: 754,
  salazzletotem: 758,
  vikavolttotem: 738,
  togedemarutotem: 777,
  mimikyutotem: 778,
  mimikyubustedtotem: 778,
  ribombeetotem: 743,
  kommoototem: 784,

  venusaurmega: 984 + 0,
  charizardmegax: 984 + 1,
  charizardmegay: 984 + 2,
  blastoisemega: 984 + 3,
  beedrillmega: 984 + 4,
  pidgeotmega: 984 + 5,
  alakazammega: 984 + 6,
  slowbromega: 984 + 7,
  gengarmega: 984 + 8,
  kangaskhanmega: 984 + 9,
  pinsirmega: 984 + 10,
  gyaradosmega: 984 + 11,
  aerodactylmega: 984 + 12,
  mewtwomegax: 984 + 13,
  mewtwomegay: 984 + 14,
  ampharosmega: 984 + 15,
  steelixmega: 984 + 16,
  scizormega: 984 + 17,
  heracrossmega: 984 + 18,
  houndoommega: 984 + 19,
  tyranitarmega: 984 + 20,
  sceptilemega: 984 + 21,
  blazikenmega: 984 + 22,
  swampertmega: 984 + 23,
  gardevoirmega: 984 + 24,
  sableyemega: 984 + 25,
  mawilemega: 984 + 26,
  aggronmega: 984 + 27,
  medichammega: 984 + 28,
  manectricmega: 984 + 29,
  sharpedomega: 984 + 30,
  cameruptmega: 984 + 31,
  altariamega: 984 + 32,
  banettemega: 984 + 33,
  absolmega: 984 + 34,
  glaliemega: 984 + 35,
  salamencemega: 984 + 36,
  metagrossmega: 984 + 37,
  latiasmega: 984 + 38,
  latiosmega: 984 + 39,
  kyogreprimal: 984 + 40,
  groudonprimal: 984 + 41,
  rayquazamega: 984 + 42,
  lopunnymega: 984 + 43,
  garchompmega: 984 + 44,
  lucariomega: 984 + 45,
  abomasnowmega: 984 + 46,
  gallademega: 984 + 47,
  audinomega: 984 + 48,
  dianciemega: 984 + 49,

  syclant: 1152 + 0,
  revenankh: 1152 + 1,
  pyroak: 1152 + 2,
  fidgit: 1152 + 3,
  stratagem: 1152 + 4,
  arghonaut: 1152 + 5,
  kitsunoh: 1152 + 6,
  cyclohm: 1152 + 7,
  colossoil: 1152 + 8,
  krilowatt: 1152 + 9,
  voodoom: 1152 + 10,
  tomohawk: 1152 + 11,
  necturna: 1152 + 12,
  mollux: 1152 + 13,
  aurumoth: 1152 + 14,
  malaconda: 1152 + 15,
  cawmodore: 1152 + 16,
  volkraken: 1152 + 17,
  plasmanta: 1152 + 18,
  naviathan: 1152 + 19,
  crucibelle: 1152 + 20,
  crucibellemega: 1152 + 21,
  kerfluffle: 1152 + 22,
  pajantom: 1152 + 23,
  jumbao: 1152 + 24,
  caribolt: 1152 + 25,
  smokomodo: 1152 + 26,
  snaelstrom: 1152 + 27,
  equilibra: 1152 + 28,

  syclar: 1188 + 0,
  embirch: 1188 + 1,
  flarelm: 1188 + 2,
  breezi: 1188 + 3,
  scratchet: 1188 + 4,
  necturine: 1188 + 5,
  cupra: 1188 + 6,
  argalis: 1188 + 7,
  brattler: 1188 + 8,
  cawdet: 1188 + 9,
  volkritter: 1188 + 10,
  snugglow: 1188 + 11,
  floatoy: 1188 + 12,
  caimanoe: 1188 + 13,
  pluffle: 1188 + 14,
  rebble: 1188 + 15,
  tactite: 1188 + 16,
  privatyke: 1188 + 17,
  nohface: 1188 + 18,
  monohm: 1188 + 19,
  duohm: 1188 + 20,
  // protowatt: 1188 + 21,
  voodoll: 1188 + 22,
  mumbao: 1188 + 23,
  fawnifer: 1188 + 24,
  electrelk: 1188 + 25,
  smogecko: 1188 + 26,
  smoguana: 1188 + 27,
  swirlpool: 1188 + 28,
  coribalis: 1188 + 29,
};

const POKEMON_ICONS_LEFT: { [id: string]: number } = {
  pikachubelle: 1044 + 0,
  pikachupopstar: 1044 + 1,
  clefairy: 1044 + 2,
  clefable: 1044 + 3,
  jigglypuff: 1044 + 4,
  wigglytuff: 1044 + 5,
  dugtrioalola: 1044 + 6,
  poliwhirl: 1044 + 7,
  poliwrath: 1044 + 8,
  mukalola: 1044 + 9,
  kingler: 1044 + 10,
  croconaw: 1044 + 11,
  cleffa: 1044 + 12,
  igglybuff: 1044 + 13,
  politoed: 1044 + 14,
  // unown gap
  sneasel: 1044 + 35,
  teddiursa: 1044 + 36,
  roselia: 1044 + 37,
  zangoose: 1044 + 38,
  seviper: 1044 + 39,
  castformsnowy: 1044 + 40,
  absolmega: 1044 + 41,
  absol: 1044 + 42,
  regirock: 1044 + 43,
  torterra: 1044 + 44,
  budew: 1044 + 45,
  roserade: 1044 + 46,
  magmortar: 1044 + 47,
  togekiss: 1044 + 48,
  rotomwash: 1044 + 49,
  shayminsky: 1044 + 50,
  emboar: 1044 + 51,
  pansear: 1044 + 52,
  simisear: 1044 + 53,
  drilbur: 1044 + 54,
  excadrill: 1044 + 55,
  sawk: 1044 + 56,
  lilligant: 1044 + 57,
  garbodor: 1044 + 58,
  solosis: 1044 + 59,
  vanilluxe: 1044 + 60,
  amoonguss: 1044 + 61,
  klink: 1044 + 62,
  klang: 1044 + 63,
  klinklang: 1044 + 64,
  litwick: 1044 + 65,
  golett: 1044 + 66,
  golurk: 1044 + 67,
  kyuremblack: 1044 + 68,
  kyuremwhite: 1044 + 69,
  kyurem: 1044 + 70,
  keldeoresolute: 1044 + 71,
  meloetta: 1044 + 72,
  greninja: 1044 + 73,
  greninjaash: 1044 + 74,
  furfroudebutante: 1044 + 75,
  barbaracle: 1044 + 76,
  clauncher: 1044 + 77,
  clawitzer: 1044 + 78,
  sylveon: 1044 + 79,
  klefki: 1044 + 80,
  zygarde: 1044 + 81,
  zygarde10: 1044 + 82,
  zygardecomplete: 1044 + 83,
  dartrix: 1044 + 84,
  steenee: 1044 + 85,
  tsareena: 1044 + 86,
  comfey: 1044 + 87,
  miniormeteor: 1044 + 88,
  minior: 1044 + 89,
  miniororange: 1044 + 90,
  minioryellow: 1044 + 91,
  miniorgreen: 1044 + 92,
  miniorblue: 1044 + 93,
  miniorviolet: 1044 + 94,
  miniorindigo: 1044 + 95,
  dhelmise: 1044 + 96,
  necrozma: 1044 + 97,
  marshadow: 1044 + 98,
  pikachuoriginal: 1044 + 99,
  pikachupartner: 1044 + 100,
  necrozmaduskmane: 1044 + 101,
  necrozmadawnwings: 1044 + 102,
  necrozmaultra: 1044 + 103,
  stakataka: 1044 + 104,
  blacephalon: 1044 + 105,
};

const ITEMS: { [id: string]: number } = {
  abomasite: 575,
  absolite: 576,
  absorbbulb: 2,
  adamantorb: 4,
  adrenalineorb: 660,
  aerodactylite: 577,
  aggronite: 578,
  aguavberry: 5,
  airballoon: 6,
  alakazite: 579,
  aloraichiumz: 655,
  altarianite: 615,
  ampharosite: 580,
  apicotberry: 10,
  armorfossil: 12,
  aspearberry: 13,
  assaultvest: 581,
  audinite: 617,
  babiriberry: 17,
  banettite: 582,
  beastball: 661,
  beedrillite: 628,
  belueberry: 21,
  berryjuice: 22,
  bigroot: 29,
  bindingband: 31,
  blackbelt: 32,
  blacksludge: 34,
  blackglasses: 35,
  blastoisinite: 583,
  blazikenite: 584,
  blueorb: 41,
  blukberry: 44,
  bottlecap: 696,
  brightpowder: 51,
  buggem: 53,
  bugmemory: 673,
  buginiumz: 642,
  burndrive: 54,
  cameruptite: 625,
  cellbattery: 60,
  charcoal: 61,
  charizarditex: 585,
  charizarditey: 586,
  chartiberry: 62,
  cheriberry: 63,
  cherishball: 64,
  chestoberry: 65,
  chilanberry: 66,
  chilldrive: 67,
  choiceband: 68,
  choicescarf: 69,
  choicespecs: 70,
  chopleberry: 71,
  clawfossil: 72,
  cobaberry: 76,
  colburberry: 78,
  cornnberry: 81,
  coverfossil: 85,
  custapberry: 86,
  damprock: 88,
  darkgem: 89,
  darkmemory: 683,
  darkiniumz: 646,
  dawnstone: 92,
  decidiumz: 650,
  deepseascale: 93,
  deepseatooth: 94,
  destinyknot: 95,
  diancite: 624,
  diveball: 101,
  domefossil: 102,
  dousedrive: 103,
  dracoplate: 105,
  dragonfang: 106,
  dragongem: 107,
  dragonmemory: 682,
  dragonscale: 108,
  dragoniumz: 645,
  dreadplate: 110,
  dreamball: 111,
  dubiousdisc: 113,
  durinberry: 114,
  duskball: 115,
  duskstone: 116,
  earthplate: 117,
  eeviumz: 657,
  ejectbutton: 118,
  electirizer: 119,
  electricgem: 120,
  electricmemory: 679,
  electricseed: 664,
  electriumz: 634,
  energypowder: 123,
  enigmaberry: 124,
  eviolite: 130,
  expertbelt: 132,
  fairiumz: 648,
  fairygem: 611,
  fairymemory: 684,
  fastball: 137,
  fightinggem: 139,
  fightingmemory: 668,
  fightiniumz: 637,
  figyberry: 140,
  firegem: 141,
  firememory: 676,
  firestone: 142,
  firiumz: 632,
  fistplate: 143,
  flameorb: 145,
  flameplate: 146,
  floatstone: 147,
  flyinggem: 149,
  flyingmemory: 669,
  flyiniumz: 640,
  focusband: 150,
  focussash: 151,
  friendball: 153,
  fullincense: 155,
  galladite: 616,
  ganlonberry: 158,
  garchompite: 589,
  gardevoirite: 587,
  gengarite: 588,
  ghostgem: 161,
  ghostmemory: 674,
  ghostiumz: 644,
  glalitite: 623,
  goldbottlecap: 697,
  grassgem: 172,
  grassmemory: 678,
  grassiumz: 635,
  grassyseed: 667,
  greatball: 174,
  grepaberry: 178,
  gripclaw: 179,
  griseousorb: 180,
  groundgem: 182,
  groundmemory: 671,
  groundiumz: 639,
  gyaradosite: 589,
  habanberry: 185,
  hardstone: 187,
  healball: 188,
  heatrock: 193,
  heavyball: 194,
  helixfossil: 195,
  heracronite: 590,
  hondewberry: 213,
  houndoominite: 591,
  iapapaberry: 217,
  icegem: 218,
  icememory: 681,
  icestone: 693,
  icicleplate: 220,
  iciumz: 636,
  icyrock: 221,
  inciniumz: 651,
  insectplate: 223,
  ironball: 224,
  ironplate: 225,
  jabocaberry: 230,
  jawfossil: 694,
  kasibberry: 233,
  kebiaberry: 234,
  keeberry: 593,
  kelpsyberry: 235,
  kangaskhanite: 592,
  kingsrock: 236,
  kommoniumz: 690,
  laggingtail: 237,
  lansatberry: 238,
  latiasite: 629,
  latiosite: 630,
  laxincense: 240,
  leafstone: 241,
  leftovers: 242,
  leppaberry: 244,
  levelball: 246,
  liechiberry: 248,
  lifeorb: 249,
  lightball: 251,
  lightclay: 252,
  lopunnite: 626,
  loveball: 258,
  lucarionite: 594,
  luckypunch: 261,
  lumberry: 262,
  luminousmoss: 595,
  lunaliumz: 686,
  lureball: 264,
  lustrousorb: 265,
  luxuryball: 266,
  lycaniumz: 689,
  machobrace: 269,
  magmarizer: 272,
  magnet: 273,
  magoberry: 274,
  magostberry: 275,
  mail: 403,
  manectite: 596,
  marangaberry: 597,
  marshadiumz: 654,
  masterball: 276,
  mawilite: 598,
  meadowplate: 282,
  medichamite: 599,
  mentalherb: 285,
  metagrossite: 618,
  metalcoat: 286,
  metalpowder: 287,
  metronome: 289,
  mewniumz: 658,
  mewtwonitex: 600,
  mewtwonitey: 601,
  micleberry: 290,
  mimikiumz: 688,
  mindplate: 291,
  miracleseed: 292,
  mistyseed: 666,
  moonball: 294,
  moonstone: 295,
  muscleband: 297,
  mysticwater: 300,
  nanabberry: 302,
  nestball: 303,
  netball: 304,
  nevermeltice: 305,
  nomelberry: 306,
  normalgem: 307,
  normaliumz: 631,
  occaberry: 311,
  oddincense: 312,
  oldamber: 314,
  oranberry: 319,
  ovalstone: 321,
  pamtreberry: 323,
  parkball: 325,
  passhoberry: 329,
  payapaberry: 330,
  pechaberry: 333,
  persimberry: 334,
  petayaberry: 335,
  pidgeotite: 622,
  pikaniumz: 649,
  pikashuniumz: 659,
  pinapberry: 337,
  pinsirite: 602,
  pixieplate: 610,
  plumefossil: 339,
  poisonbarb: 343,
  poisongem: 344,
  poisonmemory: 670,
  poisoniumz: 638,
  pokeball: 345,
  pomegberry: 351,
  poweranklet: 354,
  powerband: 355,
  powerbelt: 356,
  powerbracer: 357,
  powerherb: 358,
  powerlens: 359,
  powerweight: 360,
  premierball: 363,
  primariumz: 652,
  prismscale: 365,
  protectivepads: 663,
  protector: 367,
  psychicgem: 369,
  psychicmemory: 680,
  psychicseed: 665,
  psychiumz: 641,
  qualotberry: 371,
  quickball: 372,
  quickclaw: 373,
  quickpowder: 374,
  rabutaberry: 375,
  rarebone: 379,
  rawstberry: 381,
  razorclaw: 382,
  razorfang: 383,
  razzberry: 384,
  reapercloth: 385,
  redcard: 387,
  redorb: 390,
  repeatball: 401,
  rindoberry: 409,
  ringtarget: 410,
  rockgem: 415,
  rockincense: 416,
  rockmemory: 672,
  rockiumz: 643,
  rockyhelmet: 417,
  rootfossil: 418,
  roseincense: 419,
  roseliberry: 603,
  rowapberry: 420,
  sablenite: 614,
  sachet: 691,
  safariball: 425,
  safetygoggles: 604,
  sailfossil: 695,
  salacberry: 426,
  salamencite: 627,
  sceptilite: 613,
  scizorite: 605,
  scopelens: 429,
  seaincense: 430,
  sharpbeak: 436,
  sharpedonite: 619,
  shedshell: 437,
  shellbell: 438,
  shinystone: 439,
  shockdrive: 442,
  shucaberry: 443,
  silkscarf: 444,
  silverpowder: 447,
  sitrusberry: 448,
  skullfossil: 449,
  skyplate: 450,
  slowbronite: 620,
  smoothrock: 453,
  snorliumz: 656,
  snowball: 606,
  softsand: 456,
  solganiumz: 685,
  souldew: 459,
  spelltag: 461,
  spelonberry: 462,
  splashplate: 463,
  spookyplate: 464,
  sportball: 465,
  starfberry: 472,
  steelixite: 621,
  steelgem: 473,
  steelmemory: 675,
  steeliumz: 647,
  stick: 475,
  stickybarb: 476,
  stoneplate: 477,
  sunstone: 480,
  swampertite: 612,
  tamatoberry: 486,
  tangaberry: 487,
  tapuniumz: 653,
  terrainextender: 662,
  thickclub: 491,
  thunderstone: 492,
  timerball: 494,
  toxicorb: 515,
  toxicplate: 516,
  twistedspoon: 520,
  tyranitarite: 607,
  ultraball: 521,
  ultranecroziumz: 687,
  upgrade: 523,
  venusaurite: 608,
  wacanberry: 526,
  watergem: 528,
  watermemory: 677,
  waterstone: 529,
  wateriumz: 633,
  watmelberry: 530,
  waveincense: 531,
  weaknesspolicy: 609,
  wepearberry: 533,
  whippeddream: 692,
  whiteherb: 535,
  widelens: 537,
  wikiberry: 538,
  wiseglasses: 539,
  yacheberry: 567,
  zapplate: 572,
  zoomlens: 574,
  berserkgene: 388,
  berry: 319,
  bitterberry: 334,
  burntberry: 13,
  goldberry: 448,
  iceberry: 381,
  mintberry: 65,
  miracleberry: 262,
  mysteryberry: 244,
  pinkbow: 444,
  polkadotbow: 444,
  przcureberry: 63,
  psncureberry: 333,
  crucibellite: 577,
};
