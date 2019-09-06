import * as path from 'path';
import * as fs from 'fs';

import { Dex } from "pokemon-showdown";
const Dex = require('pokemon-showdown/.sim-dist').Dex as Dex
Dex.includeModData();

interface RandomSets {
	[species: string]: RandomSet;
}

interface RandomSet {
	level: number;
	abilities?: string[];
	items?: string[];
	moves: string[];
}

const GENS = ['RBY', 'GSC', 'ADV', 'DPP', 'BW', 'XY', 'SM'];

export function importRandom(dir: string) {
    const generators = [gen1, gen2, gen3]; // TODO
    for (const [i, fn] of generators.entries()) {
        const comment = '/* AUTOMATICALLY GENERATED FROM pokemon-showdown, DO NOT EDIT! */';
        const data = JSON.stringify(fn(), null, 2); // FIXME
        const js = `${comment}\nvar RANDOM_${GENS[i]} = ${data};`;
        fs.writeFileSync(path.resolve(dir, `random/gen${i + 1}.js`), js);
    }
}

function gen1(): RandomSets {
	const dex = Dex.forFormat('gen1randombattle');

	const levelScale = {
		LC: 88,
		NFE: 80,
		UU: 74,
		OU: 68,
		Uber: 65,
	};

	const customScale = {
		Mewtwo: 62,
		Caterpie: 99, Metapod: 99, Weedle: 99, Kakuna: 99, Magikarp: 99,
		Ditto: 88,
	};

	const pools = {};
	for (const id in dex.data.FormatsData) {
		const template = dex.getTemplate(id);
		if (!template.exists || template.isNonstandard || !template.randomBattleMoves) continue;

		const moves = new Set<string>();
		if (template.essentialMove) moves.add(template.essentialMove);
		if (template.exclusiveMoves) {
			for (const move of template.exclusiveMoves) {
				moves.add(move);
			}
		}
		if (template.comboMoves) {
			for (const move of template.comboMoves) {
				moves.add(move);
			}
		}
		for (const move of template.randomBattleMoves) {
			moves.add(move);
		}

		pools[template.name] = {
            level: customScale[template.name] || levelScale[template.tier] || 80, 
            moves: Array.from(moves).map(m => dex.getMove(m).name)
        }
	}

	return pools;
}

function gen2(): RandomSets {
	const dex = Dex.forFormat('gen2randombattle');

	const levelScale = {
		LC: 90, // unused
		NFE: 84, // unused
		NU: 78,
		UU: 74,
		UUBL: 70,
		OU: 68,
		Uber: 64,
	};
	const customScale = {
		Caterpie: 99, Kakuna: 99, Magikarp: 99, Metapod: 99, Weedle: 99, // unused
		Unown: 98, Wobbuffet: 82, Ditto: 82,
		Snorlax: 66, Nidoqueen: 70,
	};

	const pools = {};
	for (const id in dex.data.FormatsData) {
		const template = dex.getTemplate(id);
		if (!template.exists || template.isNonstandard || !('randomSet1' in template)) continue;

		const moves = new Set<string>();
		const items = new Set<string>();
		const fillerMoves = new Set<string>();

		for (let i = 1; i <= 5; i++) {
			if (!(`randomSet${i}` in template)) break;
			const set = template[`randomSet${i}`];

			if (set.item) {
				for (const item of set.item) {
					items.add(item);
				}
			}

			for (let j = 1; j <= 4; j++) {
				if (`baseMove${j}` in set) moves.add(set[`baseMove${j}`]);
			}
			for (let j = 1; j <= 4; j++) {
				if (`fillerMoves${j}` in set) {
					for (const move of set[`fillerMoves${j}`]) {
						fillerMoves.add(move);
					}
				}
			}
		}

		for (const move of fillerMoves) {
			moves.add(move);
		}

		pools[template.name] = {
			level: customScale[template.name] || levelScale[template.tier] || 90,
			items: Array.from(items).map(i => dex.getItem(i).name),
			moves: Array.from(moves).map(m => dex.getMove(m).name),
		}
	}

	return pools;
}

function gen3(): RandomSets {
	const dex = Dex.forFormat('gen3randombattle');

	const levelScale = {
		LC: 87,
		NFE: 85,
		NU: 83,
		NUBL: 81,
		UU: 79,
		UUBL: 77,
		OU: 75,
		Uber: 71,
	};
	const customScale = {
		Ditto: 99, Unown: 99,
	};

	const allowedNFE = ['Scyther', 'Vigoroth'];

	const pools = {};
	for (const id in dex.data.FormatsData) {
		const template = dex.getTemplate(id);
		if (!template.exists || template.isNonstandard ||!template.randomBattleMoves) continue;
		if (template.evos && !allowedNFE.includes(template.species)) {
			let invalid = false;
			for (const evo of template.evos) {
				if (dex.getTemplate(evo).gen <= 3) {
					invalid = true;
					break;
				}
			}
			if (invalid) continue;
		}

		const pool = template.randomBattleMoves ? 	
			template.randomBattleMoves : template.learnset ? 
			Object.keys(template.learnset) :
			[];

		const moves = new Set<string>();
		const counter = {Physical: 0, Special: 0, Status: 0};
		for (const m of pool) {
			const move = dex.getMove(m);
			moves.add(move.name);
			counter[move.category]++;
		}

		const sorted = Object.values(template.abilities)
			.map(a => dex.getAbility(a))
			.filter(a => a.gen === 3)
			.sort((a, b) => b.rating - a.rating);
		const abilities = new Set([sorted[0].name]);
		if (sorted[1] && sorted[0].rating - 0.6 <= sorted[1].rating) {
			abilities.add(sorted[1].name);
		}

		// BUG: Most the the ability rejections will never happen possible when
		// considering the whole movepool (as opposed to a subset) so we don't bother.
		// Furthermore, the removal check is more complex than just checking size...
		if (template.id === 'blissey') abilities.delete('Serene Grace');
		if (abilities.has('Sturdy') && abilities.size > 1) abilities.delete('Sturdy');
		if (abilities.has('Lightning Rod')  && abilities.size > 1 && template.types.includes('Ground')) abilities.delete('Lightning Rod');
		if (abilities.has('Limber')  && abilities.size > 1 && template.types.includes('Electric')) abilities.delete('Limber');

		const items = new Set();
		if (template.requiredItems) {
			for (const item of template.requiredItems) {
				items.add(dex.getItem(item).name);
			}
		} else if (template.species === 'Farfetch\'d') {
			items.add('Stick');
		} else if (template.species === 'Marowak') {
			items.add('Thick Club');
		} else if (template.species === 'Shedinja') {
			items.add('Lum Berry');
		} else if (template.species === 'Slaking') {
			items.add('Choice Band');
		} else if (template.species === 'Unown') {
			items.add('Twisted Spoon');
		} else {
			items.add('Leftovers');
			if (moves.has('Trick') || (counter.Physical >= 4 || counter.Physical >= 3 && counter.Special >= 1)) {
				items.add('Choice Band');
			}
			if (moves.has('Belly Drum')) items.add('Salac Berry');
			if (moves.has('Rest') && Array.from(abilities).some(a => a !== 'Natural Cure' && a !== 'Shed Skin')) items.add('Chesto Berry');
			const pinch = moves.has('Endeavor') || moves.has('Flail') || moves.has('Reversal') || moves.has('Endure');
			if (pinch || moves.has('Substitute') && (counter.Physical + counter.Special > 1) && template.baseStats.hp + template.baseStats.def + template.baseStats.spd < 250) {
				items.add('Liechi Berry');
				items.add('Petaya Berry');
				if (template.baseStats.spe <= 90) items.add('Salac Berry');
			}
		}

		// evs default to 85, ivs to 31
		pools[template.name] = {
			level: customScale[template.name] || levelScale[template.tier] || 75,
			abilities,
			items: Array.from(items),
			moves: Array.from(moves),
		}
	}

	return pools;
}

function gen4(): RandomSets {
	const dex = Dex.forFormat('gen4randombattle');

	const levelScale = {
		LC: 87,
		NFE: 85,
		NU: 83,
		NUBL: 81,
		UU: 79,
		UUBL: 77,
		OU: 75,
		Uber: 71,
	};
	const customScale = {
		Ditto: 99, Unown: 99,
	};

	const allowedNFE = ['Porygon2', 'Scyther'];

	const pools = {};
	for (const id in dex.data.FormatsData) {
		let template = dex.getTemplate(id);
		if (!template.exists || (template.nfe && !allowedNFE.includes(template.species)) || template.isNonstandard ||!template.randomBattleMoves) continue;

		const pool = template.randomBattleMoves ? 	
			template.randomBattleMoves : template.learnset ? 
			Object.keys(template.learnset) :
			[];

		const moves = new Set<string>();
		const counter = {Physical: 0, Special: 0, Status: 0};
		for (const m of pool) {
			const move = dex.getMove(m);
			moves.add(move.name);
			counter[move.category]++;
		}

		const sorted = Object.values(template.abilities)
			.map(a => dex.getAbility(a))
			.sort((a, b) => b.rating - a.rating);
		const abilities = new Set([sorted[0].name]);
		if (sorted[1] && sorted[0].rating - 0.6 <= sorted[1].rating) {
			abilities.add(sorted[1].name);
		}

		// BUG: Most the the ability rejections will never happen possible when
		// considering the whole movepool (as opposed to a subset) so we don't bother
		if (template.id === 'blissey' || template.id === 'chansey') abilities.delete('Serene Grace');

		const items = new Set();
		if (template.requiredItems) {
			for (const item of template.requiredItems) {
				items.add(dex.getItem(item).name);
			}
		} else if (template.species === 'Farfetch\'d') {
			items.add('Stick');
		} else if (template.species === 'Marowak') {
			items.add('Thick Club');
		} else if (template.species === 'Shedinja' || template.species === 'Smeargle') {
			items.add('Lum Berry');
		} else if (template.species === 'Slaking') {
			items.add('Choice Band');
		} else if (template.species === 'Unown') {
			items.add('Choice Specs');
		} else if (template.species === 'Wobbuffet') {
			['Custap Berry', 'Leftovers', 'Sitrus Berry'].forEach(i => items.add(i));
		} else {
			if (moves.has('Switcheroo') || moves.has('Trick')) {
				if (template.baseStats.spe >= 60 && template.baseStats.spe <= 108) items.add('Choice Scarf');
				['Choice Band', 'Choice Specs'].forEach(i => items.add(i));
			}
			if (moves.has('Belly Drum')) items.add('Sitrus Berry');
			// FIXME if ONLY HAS abort...
			if (abilities.has('Magic Guard') || abilities.has('Speed Boost')) items.add('Life Orb');
			// TODO
		}

		if (items.has('Leftovers') && template.types.includes('Poison')) {
			items.delete('Leftovers');
			items.add('Black Sludge');
		}

		// evs default to 85, ivs to 31
		pools[template.name] = {
			level: customScale[template.name] || levelScale[template.tier] || 80,
			abilities,
			items: Array.from(items),
			moves: Array.from(moves),
		}

		




	}

	return pools;
}

function gen5(): RandomSets {
	const dex = Dex.forFormat('gen5randombattle');

	const levelScale = {
		Uber: 78,
		OU: 80,
		UUBL: 81,
		UU: 82,
		RUBL: 83,
		RU: 84,
		NUBL: 85,
		NU: 86,
	};
	const customScale = {
		Blaziken: 79, 'Deoxys-Defense': 79, Landorus: 79, Manaphy: 79, Thundurus: 79, 'Tornadus-Therian': 79, Unown: 100,
	};

	const allowedNFE = ['Porygon2', 'Scyther'];

	const pools = {};
	for (const id in dex.data.FormatsData) {
		let template = dex.getTemplate(id);
		if (!template.exists || (template.nfe && !allowedNFE.includes(template.species)) || template.isNonstandard ||!template.randomBattleMoves) continue;

		const pool = template.randomBattleMoves ? 	
			template.randomBattleMoves : template.learnset ? 
			Object.keys(template.learnset) :
			[];

		const moves = new Set<string>();
		const counter = {Physical: 0, Special: 0, Status: 0};
		for (const m of pool) {
			const move = dex.getMove(m);
			moves.add(move.name);
			counter[move.category]++;
		}

		const sorted = Object.values(template.abilities)
			.map(a => dex.getAbility(a))
			.sort((a, b) => b.rating - a.rating);
		// TODO 3 abilities
		const abilities = new Set([sorted[0].name]);
		if (sorted[1] && sorted[0].rating - 0.6 <= sorted[1].rating) {
			abilities.add(sorted[1].name);
		}

	// BUG: Most the the ability rejections will never happen possible when
	// considering the whole movepool (as opposed to a subset) so we don't bother
	if (template.id === 'blissey' || template.id === 'chansey') abilities.delete('Serene Grace');


	const items = new Set();
	if (template.requiredItems) {
		for (const item of template.requiredItems) {
			items.add(dex.getItem(item).name);
		}
	} else if (template.species === 'Farfetch\'d') {
		items.add('Stick');
	} else if (template.species === 'Marowak') {
		items.add('Thick Club');
	} else if (template.species === 'Deoxys-Attack') {
		['Focus Sash', 'Life Orb'].forEach(i => items.add(i));
	} else if (template.species === 'Shedinja' || template.species === 'Smeargle') {
		items.add('Lum Berry');
	} else if (template.species === 'Slaking') {
		items.add('Choice Band');
	} else if (template.species === 'Pikachu') {
		items.add('Light Ball');
	} else if (template.species === 'Unown') {
		items.add('Choice Specs');
	} else if (abilities.has('Imposter')) {
		items.add('Choice Scarf');
	} else {
		if (template.species === 'Wobbuffet') items.add('Custap Berry');

		// TODO
	}

	if (items.has('Leftovers') && template.types.includes('Poison')) {
		items.delete('Leftovers');
		items.add('Black Sludge');
	}

		// evs default to 85, ivs to 31
		pools[template.name] = {
			level: customScale[template.name] || levelScale[template.tier] || 80,
			abilities,
			items: Array.from(items),
			moves: Array.from(moves),
		}
	}

	return pools;
}