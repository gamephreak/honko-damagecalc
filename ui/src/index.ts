const URLSearchParams = require('url-search-params');

import $ from 'jquery';
// @ts-ignore
import select2 from 'select2/dist/js/select2.full.js';
// @ts-ignore
select2($);
import 'select2/dist/css/select2.css';

import { Sprites, Icons } from './img';
import * as calc from 'calc';

console.log(Sprites.forBattle('Charizard-Mega-Y'));
console.log(Sprites.forTeambuilder('Charizard-Mega-X'));
console.log(Icons.getPokemon('Vaporeon'));
console.log(Icons.getItem('Life Orb'));
console.log(Icons.getType('Ghost'));

type Format = keyof typeof FORMATS;

// Formats organized roughly by usage with the caveat at similar metagames are
// grouped together:
//
//   - Random is the most popular metagame by far, so belongs at the top
//   - AG and Ubers logically sort together and sort on top of OU with regards
//     to the amount of Pokemon available, as well as being highly played
//   - Monotype is highly popular and is sorted under Random due to both its name
//     length and to provide for a logical AG -> Uber -> OU etc progression
//   - OU to ZU are sorted logically, which also happens to roughly follow usage.
//     OU is selected by default as the flagship (and second most popular format)
//   - Doubles sorts above VGC despite VGC's higher popularity due to it being 
//     logically similar to the other Smogon official tiers and so that all of
//     the Nintendo-official formats can be grouped together
//   - The remaining formats are sorted purely by popularity

const FORMATS = {
  Random: 1,
  Monotype: 2,
  AG: 3,
  Uber: 4,
  OU: 5,
  UU: 6,
  RU: 7,
  NU: 8,
  PU: 9,
  ZU: 10,
  LC: 11,
  Doubles: 12,
  'VGC 19': 13,
  'VGC 18': 14,
  'VGC 17': 15,
  'VGC 16': 16,
  'VGC 15': 17,
  'VGC 14': 18,
  'VGC 12': 19,
  'VGC 11': 20,
  BSS: 21,
  BSD: 22,
  BH: 23,
  '1v1': 24,
  'LGPE OU': 25,
  CAP: 26,
};

const SUPPORTED: Format[][] = [
  [],
  ['Uber', 'OU', 'UU', 'LC'],
  ['Uber', 'OU', 'UU', 'NU', 'LC'],
  ['Uber', 'OU', 'UU', 'NU', 'LC'],
  ['Uber', 'OU', 'UU', 'NU', 'LC'],
  ['Uber', 'OU', 'UU', 'RU', 'NU', 'LC', 'Doubles' /*, 'VGC 12', 'VGC 11' */],
  [
    'Monotype',
    'AG',
    'Uber',
    'OU',
    'UU',
    'RU',
    'NU',
    'PU',
    'LC',
    'Doubles',
    // 'VGC 16'
    // 'VGC 15'
    // 'VGC 14'
    'BSS',
    'BSD',
    'BH',
    'CAP',
  ],
  [
    // 'Random'
    'Monotype',
    'AG',
    'Uber',
    'OU',
    'UU',
    'RU',
    'NU',
    'PU',
    // 'ZU'
    'LC',
    'Doubles',
    // 'VGC 19'
    // 'VGC 18'
    // 'VGC 17'
    'BSS',
    'BSD',
    'BH',
    '1v1',
    // 'LGPE OU'
    'CAP',
  ],
];

$('#format').select2({
  data: SUPPORTED[7].map((text, id) => ({ id, text, selected: text === 'OU' })),
  width: '10em',
});
// $('#display').after('<span>' + calc.calculate(
//   1,
//   new calc.Pokemon(1, 'Gengar'),
//   new calc.Pokemon(1, 'Chansey'),
//   new calc.Move(1, 'Thunderbolt')
// ).desc() + '</span>');

const data = [];
let num = 0;
for (const type in calc.TYPE_CHART[7]) {
  data.push({
    id: num++,
    html: type === 'None' ? '<div style="height: 14px; width: 32px;"></div>' : Icons.getType(type),
    text: type,
  })
}

$('.type').select2({
  data,
  width: '40px',
  escapeMarkup: m => m,
  templateResult: d => d.html,
  templateSelection: d => d.html,
  containerCssClass: 'type',
  dropdownCssClass: 'type',
});