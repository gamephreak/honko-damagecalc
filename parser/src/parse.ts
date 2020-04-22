import {State, toID} from '@smogon/calc';
import {decodeURL} from './encode';

export function parse(s: string) {
  s = decodeURL(s);

  let gen = 8;
  const attacker: Partial<State.Pokemon> = {};
  const defender: Partial<State.Pokemon> = {};
  const move: Partial<State.Move> = {};
  const field: Partial<State.Field> = {};

  return {gen, attacker, defender, move, field};
}