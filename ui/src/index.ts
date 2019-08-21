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

// TODO: discover programmactically based on which formats have strategies
// TODO sort by usage stats battle numbers
// TODO Random / Random Doubles
const FORMATS = [
    ['Uber', 'OU', 'UU', 'LC'],
    ['Uber', 'OU', 'UU', 'NU', 'LC'],
    ['Uber', 'OU', 'UU', 'NU', 'LC'],
    ['Uber', 'OU', 'UU', 'NU', 'LC'],
     // DW OU, VGC 11/12
    ['Uber', 'OU', 'UU', 'RU', 'NU', 'LC', 'Doubles'],
    // AAA, MC, STABmons, VGC 14/15/16, Mix and Mega
    ['Uber', 'OU', 'UU', 'RU', 'NU', 'PU', 'LC', 'Monotype', 'Doubles', 'AG', 'BSS', 'BSD', 'BH', 'CAP' ],
      // LGPE OU, AAA, MC, STABmons, VGC 17/18/19, Mix and Mega
    ['Uber', 'OU', 'UU', 'RU', 'NU', 'PU', 'LC', 'Monotype', 'Doubles', 'AG', 'BSS', 'BSD', 'BH', 'CAP', '1v1', 'ZU' ],
];

$('#format').select2({
    data: FORMATS[6].map((text, id) => ({id, text, selected: text === 'OU'})),
    width: '10em',
});
// $('#display').after('<span>' + calc.calculate(
//   1,
//   new calc.Pokemon(1, 'Gengar'),
//   new calc.Pokemon(1, 'Chansey'),
//   new calc.Move(1, 'Thunderbolt')
// ).desc() + '</span>');
