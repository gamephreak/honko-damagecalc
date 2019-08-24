const URLSearchParams = require('url-search-params');

import $ from 'jquery';
// @ts-ignore
import select2 from 'select2';
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
