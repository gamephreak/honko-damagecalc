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

//$('#display').select2();
$('#display').html(calc.calculate(
  1,
  new calc.Pokemon(1, 'Gengar'),
  new calc.Pokemon(1, 'Chansey'),
  new calc.Move(1, 'Thunderbolt')
).desc());  
