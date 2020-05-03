export interface As<T> {__brand: T}
export type ID = string & As<'ID'>;
export type GenerationNum = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8;
export type GenderName = 'M' | 'F' | 'N';
export type StatName = 'hp' | 'atk' | 'def' | 'spa' | 'spd' | 'spe';
export type Stat = StatName | 'spc';
export type StatsTable<T = number> = {[stat in StatName]: T};

export type AbilityName = string & As<'AbilityName'>;
export type ItemName = string & As<'ItemName'>;
export type MoveName = string & As<'MoveName'>;
export type SpeciesName = string & As<'SpeciesName'>;

export type StatusName = 'slp' | 'psn' | 'brn' | 'frz' | 'par' | 'tox';

export type GameType = 'Singles' | 'Doubles';
export type Terrain = 'Electric' | 'Grassy' | 'Psychic' | 'Misty';
export type Weather =
  | 'Sand' | 'Sun' | 'Rain' | 'Hail' | 'Harsh Sunshine' | 'Heavy Rain' | 'Strong Winds';

export type NatureName =
  'Adamant' | 'Bashful' | 'Bold' | 'Brave' | 'Calm' |
  'Careful' | 'Docile' | 'Gentle' | 'Hardy' | 'Hasty' |
  'Impish' | 'Jolly' | 'Lax' | 'Lonely' | 'Mild' |
  'Modest' | 'Naive' | 'Naughty' | 'Quiet' | 'Quirky' |
  'Rash' | 'Relaxed' | 'Sassy' | 'Serious' | 'Timid';

export type TypeName =
  'Normal' | 'Fighting' | 'Flying' | 'Poison' | 'Ground' | 'Rock' | 'Bug' | 'Ghost' | 'Steel' |
  'Fire' | 'Water' | 'Grass' | 'Electric' | 'Psychic' | 'Ice' | 'Dragon' | 'Dark' | 'Fairy' | '???';

export type MoveCategory = 'Physical' | 'Special' | 'Status';
export type MoveRecoil = boolean | number | 'crash' | 'Struggle';

export type MoveTarget =
  'adjacentAlly' | 'adjacentAllyOrSelf' | 'adjacentFoe' | 'all' |
  'allAdjacent' | 'allAdjacentFoes' | 'allies' | 'allySide' | 'allyTeam' |
  'any' | 'foeSide' | 'normal' | 'randomNormal' | 'scripted' | 'self';

export interface Generations {
  get(gen: GenerationNum): Generation;
}

export interface Generation {
  readonly num: GenerationNum;
  readonly abilities: Abilities;
  readonly items: Items;
  readonly moves: Moves;
  readonly species: Species;
  readonly types: Types;
  readonly natures: Natures;
}

export type DataKind = 'Ability' | 'Item' | 'Move' | 'Species' | 'Type' | 'Nature';

export interface Data<NameT> {
  readonly id: ID;
  readonly name: NameT;
  readonly kind: DataKind;
}

export interface Abilities {
  get(id: ID): Ability | undefined;
  [Symbol.iterator](): IterableIterator<Ability>;
}

export interface Ability extends Data<AbilityName> {
  readonly kind: 'Ability';
}

export interface Items {
  get(id: ID): Item | undefined;
  [Symbol.iterator](): IterableIterator<Item>;
}

export interface Item extends Data<ItemName> {
  readonly kind: 'Item';
  readonly megaEvolves?: SpeciesName;
  readonly isBerry?: boolean;
  readonly naturalGift?: Readonly<{basePower: number; type: TypeName}>;
}

export interface Moves {
  get(id: ID): Move | undefined;
  [Symbol.iterator](): IterableIterator<Move>;
}

export interface MoveFlags {
  contact?: 1 | 0;
  bite?: 1 | 0;
  sound?: 1 | 0;
  // TODO: heal?: 1 | 0;
  punch?: 1 | 0;
  bullet?: 1 | 0;
  pulse?: 1 | 0;
}

export interface Move extends Data<MoveName> {
  readonly kind: 'Move';
  readonly bp: number;
  readonly type: TypeName;
  readonly category?: MoveCategory;
  readonly flags: MoveFlags;
  readonly hasSecondaryEffect?: boolean;
  readonly target?: MoveTarget;
  readonly hasRecoil?: MoveRecoil;
  readonly willCrit?: boolean;
  readonly drain?: [number, number];
  readonly priority?: number;
  readonly dropsStats?: number;
  readonly ignoreDefensive?: boolean;
  readonly defensiveCategory?: MoveCategory;
  readonly breaksProtect?: boolean;
  readonly isZ?: boolean;
  readonly isMax?: boolean;
  readonly zp?: number;
  readonly maxPower?: number;
  readonly multihit?: number | number[];
}

export interface Species {
  get(id: ID): Specie | undefined;
  [Symbol.iterator](): IterableIterator<Specie>;
}

// TODO: rename these fields to be readable
export interface Specie extends Data<SpeciesName> {
  readonly kind: 'Species';
  readonly types: [TypeName] | [TypeName, TypeName];
  readonly baseStats: StatsTable;
  readonly weightkg: number; // weight
  readonly nfe?: boolean;
  readonly gender?: GenderName;
  readonly formes?: SpeciesName[];
  readonly isAlternateForme?: boolean;
  readonly abilities?: {0: AbilityName}; // ability
}

export interface Types {
  get(id: ID): Type | undefined;
  [Symbol.iterator](): IterableIterator<Type>;
}

export type TypeEffectiveness = 0 | 0.5 | 1 | 2;

export interface Type extends Data<TypeName> {
  readonly kind: 'Type';
  readonly effectiveness: Readonly<{[type in TypeName]?: TypeEffectiveness}>;
}

export interface Natures {
  get(id: ID): Nature | undefined;
  [Symbol.iterator](): IterableIterator<Nature>;
}

export interface Nature extends Data<NatureName> {
  readonly kind: 'Nature';
  readonly plus?: StatName;
  readonly minus?: StatName;
}
