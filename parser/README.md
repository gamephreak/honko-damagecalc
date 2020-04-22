# `@smogon/calc-parser`

This package houses logic for controlling the damage calculator via a textual interface. It does
**not** actually perfom any calculations (see [`@smogon/calc`][5]), it merely serves as a way to
convert the damage calculator state to and from text.

## Usage

### Programmatic

`simplify.ts` can be used to determine the minimum information that needs to be specified in order
to reproduce a damage calculation [`Result`][6]. This depends on the [`RawDesc`][7] containing all
relevant information for the result:

```ts
import {calculate} from `@smogon/calc`;
import {simplify} from `@smogon/calc-parser`;

const simplified = simplify(attacker, defender, move, field, calculate(...));
```

`parse.ts` contains the logic for parsing the [format](#Format) detailed below:

```ts
import {parse} from `@smogon/calc-parser`;

const {gen, attacker, defender, move, field} =
   parse(`252 SpA Gengar @ Choice Specs [Focus Blast] vs. 0 HP / 172+ SpD Blissey --gen=4`);
```

`encode.ts` can be used to encode a [`Result`][6] into a format parseable by `parse`. It relies on
`simplify` to ensure the encoded version is as terse as possible (though because `parse` does
not currently support 'overrides', it is not guaranteed to be able to encode every `Result`).

```ts
import {calculate} from `@smogon/calc`;
import {encode} from `@smogon/calc-parser`;

const encoded = encode(attacker, defender, move, field, calculate(...));
const urlSafe = encode(attacker, defender, move, field, calculate(...), /* url safe? */ true);
```

`encode` also supports a second parameter to produce a [URL-safe](#URL-encoding) encoded result.

### CLI

This package is used by the [`dmg` binary][4] to allow for performaning damage calculations via the
command line.

```sh
dmg +1 252 SpA Gengar @ Choice Specs [Focus Blast] vs. 0 HP / 172+ SpD Blissey --gen=4
+1 252 SpA Choice Specs Gengar Focus Blast vs. 0 HP / 172+ SpD Blissey: 362-428 (55.6 - 65.7%) -- guaranteed 2HKO after Leftovers recovery

$ dmg gengar [focus blast] vs. blissey gen:6
252 SpA Life Orb Gengar Focus Blast vs. 252 HP / 4 SpD Blissey: 263-309 (36.8 - 43.2%) -- 98.7% chance to 3HKO after Leftovers recovery

$ dmg gen=3 mence @ CB [EQ] vs. cune @ lefties
252+ Atk Choice Band Salamence Earthquake vs. 252 HP / 252+ Def Suicune: 121-143 (29.9 - 35.3%) -- guaranteed 4HKO after Leftovers recovery
```

Like the https://calc.pokemonshowdown.com, the CLI relies on predefined sets and heuristics to
minimize the amount of information that needs to be specified in order to perform a calculation. See
the [CLI's documentation][4] for more details.

## Format

### Flags

Every configuration option possible to set programmatically can be specified as a **flag**. Flags
are verfy flexible in how they can be specified: any thing in the form `key:value` or `'key=value`
(where the key can optionally be prefixed with `-` or `--`, i.e. `-key=value` or `--key:value`, etc)
gets interpreted as a flag. Some flag values (`Choice Band`) may contain spaces - you may either
completely remove spaces (`attackerItem:ChoiceBand` or `attackerItem=choiceband`), replace spaces
with underscores (`attackerItem=Choice_Band`) or quote the space using if the parser in an
environment where spaces are allowed in the input (eg. `--attackerItem='Choice Band'` on the
command like, though this wouldn't be allowed in a browser URL).

Flags used to set properties of the attacker Pokémon or side must prefix all of their keys with
`attacker` (like `attackerItem` above), those for the defender must begin with `defender`. However,
because the parsing only handles a single move being used by an attacker vs. a defender, these
prefixes can be elided in the cases where they only make sense for one side or the other. Finally
the `is` on boolean properties is optional (i.e. `--isSR=true` and `sr:true` both set Stealth Rock
on the defender's side). For boolean options, `true`, `1`, `yes`, and `y` are all recognized as
affirmative, where `false`, `0`, `no`, and `n` can be used for negatives (though all booleans
default to negative to begin with). Similarly, `has` may be used interchangeably with `is`.

#### Flag Reference

Flag names are **not** case sensitive, though are written as such below for improved readability.
**Overrides for Pokémon and move attributes are not currently supported.**

##### Pokémon

| **key** | **description** |
| ------- | ----------------|
| `attacker` / `defender`<br />(`attackerSpecies` / `defenderSpecies`) | the name of the attacker / defender species |
| `attackerLevel` / `defenderLevel`| the level of the attacker / defender |
| `attackerAbility` / `defenderAbility`| the ability of the attacker / defender |
| `attackerAbilityOn` / `defenderAbilityOn`| whether the ability of the attacker / defender in activated |
| `attackerDynamaxed` / `defenderDynamaxed`<br />(`attackerIsDynamaxed` / `defenderIsDynamaxed`)| whether the attacker / defender is dynamaxed |
| `attackerItem` / `defenderItem` | the item held by the attacker / defender |
| `attackerGender` / `defenderGender` | the gender of the attacker / defender |
| `attackerNature` / `defenderNature` | the nature of the attacker / defender |
| `attacker*IV` / `defender*IV` | the IV of the attacker / defender stat (eg. `attackerSpAIV`) |
| `attacker*EV` / `defender*EV` | the EV of the attacker / defender stat (eg. `defenderHPEV`) |
| `attacker*Boosts` / `defender*Boosts` | the number boosts of the attacker / defender has in the specific stat |
| `attackerHP` / `defenderHP` | the current HP of the attacker / defender |
| `attackerStatus` / `defenderStatus` | the current status of the attacker / defender |
| `attackerToxicCounter` / `defenderToxicCounter` | the current toxic counter of the attacker / defender |

##### Move

| **key** | **description** |
| ------- | ----------------|
| `move` | the name of the move being used by the attacker |
| `useZ` | whether to use the Z-Move version of the move |
| `useMax` | whether to use the Max version of the move |
| `crit` (`isCrit`) | whether the move was a critical hit |
| `hits` | the number of times a multi hit move hit |
| `timesUsed` | the number of times the move was used previously |

##### Field

| **key** | **description** |
| ------- | ----------------|
| `gen` | sets the generation of the calculation |
| `gameType` | sets the type of game |
| `weather` | sets the weather present on the field |
| `terrain` | sets the terrain present on the field |
| `gravity` | sets whether Gravity is currently in effect |
| `spikes` (`defenderSpikes`) | the number of layers of spikes on the defender's side of the field |
| `steelsurge` (`defenderSteelsurge`) | the number of layers of hazards from G-Max Steelsurge on the defender's side |
| `SR` (`hasSR`, `defenderHasSR`) | whether the defender's side has Stealth Rocks on it |
| `reflect` (`defenderhasReflect`) | whether the defender's side has Reflect up |
| `lightscreen` ( `defenderHasLightScreen`) | whether the defender's side has Light Screen up |
| `auroraveil` (`defenderHasAuroraVeil`) | whether the defender's side has Aurora Veil up |
| `tailwind`<br />(`attackerHasTailwind`,&nbsp;`defenderHasTailwind`) | whether a side has Tailwind (defaults to attacker)|
| `seeded` (`defenderIsSeeded`) | whether the defender's side has been seeded by Leech Seed |
| `foresight` (`attackerHasForesight`) | whether the attacker is benefiting from Foresight |
| `helpinghand` (`attackerHasHelpingHand`) | whether the attacker is benefiting from Helping Hand |
| `friendguard` (`defenderHasFriendGuard`) | whether the defender is benefiting from Friend Guard |
| `battery` (`attackerHasBattery`) | whether the attacker is benefiting from Battery |
| `isSwitching` (`defenderIsSwitching`) | whether the defender is switching out |

### Phrases

In addition to flags, the parser supports **phrases**. The specification for the phrases it
understands is similar to the output description, with items and moves requiring a slight
modification in their place in order to make parsing easier:

```txt
<ATTACKER_BOOST>? <ATTACKER_EVS>? <ATTACKER_POKEMON> (@ <ATTACKER_ITEM>)? ([<ATTACKER_MOVE>])?
vs. <DEFENDER_BOOST>? <DEFENDER_EVS>? <DEFENDER_POKEMON> (@ <DEFENDER_ITEM>)?
```

where:

- `ATTACKER_BOOST`: optional, can range from -6 to +6 and boosts the stat used for attacking.
- `ATTACKER_EVS`: optional, can range from 0-252 and can only be 'Atk' or 'SpA' EVs (not
   case-sensitive). A '+' or '-' may be included after the number of EVs to indicate nature.
- `ATTACKER_POKEMON`: required, the name of the attacking Pokémon species/forme.
- `ATTACKER_ITEM`: optional, must come after a '@', the held item of the attacker.
- `ATTACKER_MOVE`: optional, must be enclosed in square brackets, the attacking move.
- `DEFENDER_BOOST`: optional, can range from -6 to +6 and boosts the stat used to defend against
   the attack.
- `DEFENDER_EVS`: optional, can range from 0-252 and can of the form `<N> HP / <N> Def` or
   `<N> HP / <N> SpD` (not case-sensitive). A '+' or '-' may be included after the number of Def or
   SpD EVs to indicate nature.
- `DEFENDER_POKEMON`: required, the name of the defending Pokémon species/forme.

The `.` in the `vs.` is optional. Flags may appear anywhere within the phrase (as well as before
and / or after).

### URL encoding

[RFC1738][2] and [RFC3986][3] outlining the URL syntax restrict the set of characters which are
allowed to exist in URLs. As such, certain characters may be substituted for their equivalent,
URL-safe counterparts:

| **character** | **substitution** |
| ------------- | -----------------|
|      `/`      |        `$`       |
|     `[ ]`     |       `( )`      |
|      `@`      |        `*`       |
|      `:`      |        `=`       |
|     `' '`     |        `_`       |

For example:

```txt
+1_252_SpA_Gengar_*_Choice_Specs_(Focus_Blast)_vs_0_HP_$_172+_SpD_Blissey_gen=4
```

This alternative encoding can be accomplished fairly trivially in JavaScript as follows:

```js
const REPLACE = {'/': '$', '[': '(', ']': ')', '@': '*', ':': '=', ' ': '_'};
const REGEX = new RegExp(Object.keys(REPLACE).join('|'), 'g');
const encode = str => str.replace(REGEX, match => REPLACE[match]);
```

## License

This package is also distributed under the terms of the [MIT License][1].

   [1]: https://github.com/smogon/damage-calc/blob/master/parser/LICENSE
   [2]: https://www.ietf.org/rfc/rfc1738.txt
   [3]: https://www.ietf.org/rfc/rfc3986.txt
   [4]: https://github.com/smogon/damage-calc/blob/master/cli/
   [5]: https://github.com/smogon/damage-calc/blob/master/calc/
   [6]: https://github.com/smogon/damage-calc/blob/master/calc/src/result.ts
   [7]: https://github.com/smogon/damage-calc/blob/master/calc/src/desc.ts