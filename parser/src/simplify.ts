import {Pokemon, Move, Field, Result, State} from '@smogon/calc';

export function simplify(
  attacker: Pokemon,
  defender: Pokemon,
  move: Move,
  field: Field,
  result: Result) {

  // TODO simplify!

  const gen = result.gen;
  const a: State.Pokemon = {...attacker, curHP: attacker.curHP(true)};
  const d: State.Pokemon = {...defender, curHP: defender.curHP(true)};
  const m: State.Move = move;
  const f: State.Field = field;

  return {gen, attacker: a, defender: d, move: m, field: f};
}