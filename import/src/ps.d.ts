declare module 'pokemon-showdown' {
    type ID = '' | string & {__isID: true}
    type Stat = 'hp' | 'atk' | 'def' | 'spa' | 'spd' | 'spe'
    type Gender = 'M' | 'F' | 'N' | ''
    type StatsTable<T> = {[stat in Stat]: T }
    interface Effect {
        id: ID
        gen: number
        name: string
        exists: boolean
    }
    interface Ability extends Effect {
        rating: number
    }
    interface Item extends Effect {}
    interface Move extends Effect {
        category: 'Physical' | 'Special' | 'Status'
    }
    type Nonstandard = 'Glitch' | 'Past' | 'Future' | 'CAP' | 'LGPE' | 'Pokestar' | 'Custom'
    interface Template extends Effect, TemplateFormatsData {
        abilities: {0: string, 1?: string, H?: string, S?: string}
        baseStats: StatsTable<number>
        species: string
        baseSpecies?: string
        isNonstandard?: Nonstandard | null
        tier?: string
        evos?: string[]
        nfe?: boolean
        types: string[]
        learnset?: {[k: string]: string[]}
    }
    interface DexTable<T> {
        [key: string]: T
    }
    interface Data {
        Abilities: DexTable<Ability>
        Items: DexTable<Item>
        Movedex: DexTable<Move>
        Pokedex: DexTable<Template>
        FormatsData: DexTable<TemplateFormatsData>
    }
    interface Dex {
        data: Data;
        includeModData(): void;
        getId(text: any): ID
        forFormat(formatid: string): Dex;

        getAbility(name: string): Ability
        getItem(name: string): Item
        getMove(name: string): Move
        getTemplate(name: string): Template
    }
    interface TemplateFormatsData {
        tier?: string
        
        comboMoves?: readonly string[]
        essentialMove?: string
        exclusiveMoves?: readonly string[]
        randomBattleMoves?: readonly string[]

        requiredAbility?: string
        requiredItem?: string
        requiredItems?: string[]
        requiredMove?: string

        randomSet1?: TemplateRandomSet
        randomSet2?: TemplateRandomSet
        randomSet3?: TemplateRandomSet
        randomSet4?: TemplateRandomSet
        randomSet5?: TemplateRandomSet
    }
    interface TemplateRandomSet {
		chance: number;
		item: string[];
		baseMove1?: string;
		baseMove2?: string;
		baseMove3?: string;
		baseMove4?: string;
		fillerMoves1?: string[];
		fillerMoves2?: string[];
		fillerMoves3?: string[];
		fillerMoves4?: string[];
	}
}
