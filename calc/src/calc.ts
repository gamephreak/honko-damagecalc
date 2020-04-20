import {Field} from './field';
import {Generation} from './data/interface';
import {Move} from './move';
import {Pokemon} from './pokemon';
import {Result} from './result';

import {calculateRBY} from './mechanics/gen1';
import {calculateGSC} from './mechanics/gen2';
import {calculateADV} from './mechanics/gen3';
import {calculateDPP} from './mechanics/gen4';
import {calculateBWXY} from './mechanics/gen56';
import {calculateSMSS} from './mechanics/gen78';

const MECHANICS = [
  () => {},
  calculateRBY,
  calculateGSC,
  calculateADV,
  calculateDPP,
  calculateBWXY,
  calculateBWXY,
  calculateSMSS,
  calculateSMSS,
];

export function calculate(
  gen: Generation,
  attacker: Pokemon,
  defender: Pokemon,
  move: Move,
  field?: Field,
  clone = true
) {
  return MECHANICS[gen.num](
    gen,
    clone ? attacker.clone() : attacker,
    clone ? defender.clone() : defender,
    clone ? move.clone() : move,
    field ? (clone ? field.clone() : field) : new Field()
  ) as Result;
}
