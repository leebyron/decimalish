/**
 * Done:
 *  - moving between normalized forms and predicate
 *  - sign is done
 *  - constructor/conversion is done
 *  - abs/neg magnitude is done
 *  - all comparisons are done
 *  - add/sub is done
 *  - mul is done
 *  - round is done and tested
 *  - pow - matching ECMA proposal has this with a positive integer - needs tests
 *  - mod and rem done - need tests
 *  - div needs more tests
 *  - divmod done but needs more tests
 *  - EUCLIDIAN mode for divmod/round. floor/truncated mode.
 *  - toFixed / toExponential. with all rounding modes.
 *  - scale - needs tests
 *
 * Todo:
 *  - rounding modes should take Numeric instead of number
 *  - unit tests
 *  - min/max/sum
 *  - cmp ideally can accept +-Infinity
 *  - sqrt - is this actually useful? Big.js has this, but ECMA does not
 *  - cbrt?
 *  - trig / PI?
 *  - exp/ln/log?
 *  - toLocaleString would be useful, but I'm not sure how to get this working
 *  - Error quality
 *  - "unnecessary" rounding mode?
 *
 *  - rest of decimal.js lib?
 *
 *  - prettier
 *  - eslint
 *  - build outputs (optimized for build size?)
 *  - test tree shaking
 *  - doc generator
 *  - build size testing
 *  - performance testing
 *  - compare to other libraries?
 *
 * Pitch:
 *
 *  - decimal is a primitive! therefore immutable and can be used as keys
 *  - canonical. Equivalent canonical decimals are also `===` so can be used in Set() and as object property keys!
 *  - 10 rounding modes
 *  - no global configuration or state
 *  - use it or lose it! per-method tree shaking supported
 *  - or at worst, only 5KB minified!
 */


// Decimal type

/**
 * **The decimal type:**
 *
 * A decimal is represented as a numeric string, allowing arbitrary precision.
 * It is a subtype of numeric string, that is all decimal types are numeric
 * strings, but not all numeric strings are decimals.
 */
export type decimal = `${number}` & { [$decimal]: typeof $decimal }
declare const $decimal: unique symbol


/**
 * Converts any numeric value to a decimal.
 *
 * Throws a TypeError if the provided value cannot be translated to decimal.
 *
 * Note: unlike number, decimal cannot represent Infinity, NaN, or -0.
 *
 */
export function decimal(value: unknown): decimal {
  const [sign, significand, exponent] = toRepresentation(value)
  return fromRepresentation(sign, significand, exponent)
}

/**
 * Returns true if the provided value is a decimal value.
 *
 * A value is decimal if it is a numeric string in a canonical decimal form.
 */
export function isDecimal(value: unknown): value is decimal {
  return decimalRegex.test(''+value) && decimal(value) === value
}

/**
 * The Numeric type represents all numeric values: numbers, bigint, and
 * numeric strings (including `decimal`).
 */
export type Numeric = `${number}` | number | bigint


// Arithmetic

/**
 * Adds two numeric values as a decimal result.
 *
 * @equivalent a + b
 */
export function add(a: Numeric, b: Numeric): decimal {
  const [signA, significandA, exponentA, precisionA] = toRepresentation(a)
  const [signB, significandB, exponentB, precisionB] = toRepresentation(b)

  // Additive identity. Return early so the rest of the method can safely assume
  // both operands are signed non-zero numbers.
  if (!signA) return fromRepresentation(signB, significandB, exponentB)
  if (!signB) return fromRepresentation(signA, significandA, exponentA)

  // Result normalized form
  let sign = signA
  let significand
  let exponent = exponentA > exponentB ? exponentA : exponentB

  // Operate right to left starting from the most precise digit
  let pos = precisionA - exponentA > precisionB - exponentB ? precisionA - exponentA : precisionB - exponentB
  let digits = new Array(pos + exponent)
  let result = 0

  // If the operands have the same sign, add the significands.
  if (signA === signB) {
    while (pos-- > -exponent) {
      result += +(significandA[pos + exponentA] || 0) + +(significandB[pos + exponentB] || 0)
      digits[pos + exponent] = result % 10
      result = result > 9 ? 1 : 0
    }
    significand = digits.join('')

    // Prepend the final sum's carried-over result.
    if (result) {
      significand = result + significand
      exponent++
    }

  // Otherwise, the signs differ; subtract the significands.
  } else {
    // Compare the absolute values of A and B to ensure the smaller is
    // subtracted from the larger.
    const direction = cmpAbs(significandA, exponentA, precisionA, significandB, exponentB, precisionB)

    // There will only be a result if the operands are not equivalent (A != B),
    // otherwise: A - B == 0
    if (direction) {

      // Correct the resulting sign for the subtraction direction.
      sign = (sign * direction) as 1 | -1
      while (pos-- > -exponent) {
        result += 10 + direction * (+(significandA[pos + exponentA] || 0) - +(significandB[pos + exponentB] || 0))
        digits[pos + exponent] = result % 10
        result = result > 9 ? 0 : -1
      }
    }

    significand = digits.join('')
  }

  return fromRepresentation(sign, significand, exponent)
}

/**
 * Subtracts the numeric b from the numeric a, returning a decimal result.
 *
 * @equivalent a - b
 */
export function sub(a: Numeric, b: Numeric): decimal {
  // a - b is equivalent to a + -b
  return add(a, neg(b))
}

/**
 * Multiplies two numeric values as a decimal result.
 *
 * @equivalent a * b
 */
export function mul(a: Numeric, b: Numeric): decimal {
  const [signA, significandA, exponentA, precisionA] = toRepresentation(a)
  const [signB, significandB, exponentB, precisionB] = toRepresentation(b)

  let digits = new Array(precisionA + precisionB)
  let result = 0

  for (let i = precisionA; i--;) {
    result = 0;
    for (let j = precisionB; j--;) {
      result += (digits[i + j + 1] || 0) + +(significandA[i] || 0) * +(significandB[j] || 0);
      digits[i + j + 1] = result % 10;
      result = result / 10 | 0;
    }
    digits[i] = result;
  }

  return fromRepresentation((signA * signB) as Sign, digits.join(''), exponentA + exponentB + 1)
}

/*
 * Raises `base` to the power `exponent`, where `exponent` must be a positive
 * whole number.
 *
 * @equivalent Math.pow(base, exponent)
 */
export function pow(base: Numeric, exponent: Numeric): decimal {
  let baseToPowerOf2 = decimal(base)
  let result = '1' as decimal

  exponent = toNumber(exponent)
  if (~~exponent !== exponent || exponent < 0) {
    throw RangeError('exponent must be a positive whole number.');
  }

  // Iterate through the bits of exponent
  while (exponent) {
    // If a bit is set, multiply the result by that power of two.
    if (exponent & 1) {
      result = mul(result, baseToPowerOf2)
    }
    // Shift the exponent to align the next bit and if any bits are still set,
    // square to get the next power of two.
    if (exponent >>= 1) {
      baseToPowerOf2 = mul(baseToPowerOf2, baseToPowerOf2)
    }
  }

  return result
}

/**
 * Returns the result of dividing `dividend` by `divisor`.
 *
 * Defaults to 20 decimal places of precision and the `"half even"` rounding
 * mode, configurable by providing rounding rules.
 *
 * @equivalent a / b
 */
export function div(dividend: Numeric, divisor: Numeric, rules?: RoundingRules): decimal {
  const [quotient] = divmod(dividend, divisor, normalizeRules(rules, 20, ROUND_HALF_EVEN))
  return quotient
}

/**
 * Returns the remainder of dividing a by b using truncated (round 'down') division.
 * The result always has the same sign as the first argument (or 0).
 *
 * @equivalent a % b
 */
export function rem(a: Numeric, b: Numeric): decimal {
  const [, remainder] = divmod(a, b, { [MODE]: ROUND_DOWN })
  return remainder
}

/**
 * Returns the modulo of dividing a by b using floored (round 'floor') division.
 * The result always has the same sign as the second argument (or 0).
 *
 * Note: this does not have the same as the % (remainder) operator. rem()
 *
 * @equivalent ((a % b) + b) % b
 * @see rem
 */
export function mod(a: Numeric, b: Numeric): decimal {
  const [, remainder] = divmod(a, b)
  return remainder
}

/**
 * Divides two numeric values to a given places or precision returning both the
 * quotient and the remainder while satisfying the two conditions:
 *
 *   - `dividend = divisor * quotient + remainder`
 *   - `abs(remainder) < abs(divisor)`.
 *
 * However there is not only one quotient and remainder which satisfies these
 * conditions. A choice of the sign of the remainder (via rounding mode) and
 * precision of the quotient can be provided via `rules`.
 *
 * Result of dividing 10 by 3 with different signs and rounding modes:
 *
 * | Example            | Note
 * | ------------------ | ---------------
 * | `divmod(10, 3, { mode: "floor" }) === [ '3', '1' ]` | "floor" is the default rounding mode
 * | `divmod(10, -3, { mode: "floor" }) === [ '-4', '-2' ]` | The remainder has the same sign as the divisor
 * | `divmod(-10, 3, { mode: "floor" }) === [ '-4', '2' ]` |
 * | `divmod(-10, -3, { mode: "floor" }) === [ '3', '-1' ]` |
 * | `divmod(10, 3, { mode: "down" }) === [ '3', '1' ]` | The remainder has the same sign as the dividend
 * | `divmod(10, -3, { mode: "down" }) === [ '-3', '1' ]` |
 * | `divmod(-10, 3, { mode: "down" }) === [ '-3', '-1' ]` |
 * | `divmod(-10, -3, { mode: "down" }) === [ '3', '-1' ]` |
 * | `divmod(10, 3, { mode: "euclidean" }) === [ '3', '1' ]` | The remainder is always positive
 * | `divmod(10, -3, { mode: "euclidean" }) === [ '-3', '1' ]` |
 * | `divmod(-10, 3, { mode: "euclidean" }) === [ '-4', '2' ]` |
 * | `divmod(-10, -3, { mode: "euclidean" }) === [ '4', '2' ]` |
 *
 * All rounding modes may be used.
 */
export function divmod(dividend: Numeric, divisor: Numeric, rules?: RoundingRules): [quotient: decimal, remainder: decimal] {
  const roundingRules = normalizeRules(rules, 0, ROUND_FLOOR)
  const [signA, significandA, exponentA, precisionA] = toRepresentation(dividend)
  const [signB, significandB, exponentB, precisionB] = toRepresentation(divisor)

  // The resulting exponent of a division is the difference between the
  // exponents of the dividend and divisor.
  const sign = (signA * signB) as Sign
  const exponent = exponentA - exponentB

  // Determine the desired rounding mode and precision.
  let roundingMode = roundingRules[MODE]
  let roundingPrecision = getRoundingPrecision(roundingRules, exponent)

  if (!significandB) throw new TypeError('Divide by 0')

  // Collect the digits of the quotient.
  let quotientSignificand = ''

  // Remainder is a mutable list of digits, starting as a copy of the dividend
  // (a) which is at least as long as the divisor (b).
  const remainderDigits: number[] = []
  for (let i = 0; i < precisionA || i < precisionB; i++) {
    remainderDigits[i] = +significandA[i] || 0
  }

  // The most significant digit of the remainder.
  let msd = 0

  // Compute digits of the quotient by repeatedly subtracting the divisor from
  // each place of the dividend while:
  let place = 0
  let digit = 0
  for (;
    // The total number of digits are not yet at the desired precision,
    place < roundingPrecision &&
    // and not all places of dividend have been divided or there is a remainder.
    (place <= precisionA - precisionB || msd < place + precisionB - 1);
    place++
  ) {
    // Append a zero to the remainder if necessary.
    remainderDigits[place + precisionB - 1] ||= 0

    // Count how many times divisor (b) can be subtracted from remainder at the
    // current place (between 0 and 9 times).
    digit = -1
    countSubtractions: while (digit++ < 9) {

      // If the divisor cannot be subtracted from the remainder at the
      // current place (because the remainder is less than the divisor),
      // then stop counting subtractions.
      if (msd >= place) {
        for (let i = -1, difference = 0; !difference && ++i < precisionB;) {
          difference = remainderDigits[place + i] - +significandB[i]
          if (difference < 0) {
            break countSubtractions
          }
        }
      }

      // Subtract at this location
      for (let i = place + precisionB; i-- > place;) {
        remainderDigits[i] -= +(significandB[i - place] || 0)
        if (remainderDigits[i] < 0) {
          remainderDigits[i] += 10
          remainderDigits[i - 1] -= 1
        }
      }

      // Then update the location of the most significant digit of the remainder.
      while (remainderDigits[msd] === 0) {
        msd++
      }
    }

    // If precision was directly specified and the first digit is 0, then
    // 1 additional digit is necessary to reach the desired precision.
    if (place === 0 && digit === 0 && roundingRules[PRECISION] != null) {
      roundingPrecision++
    }

    // Append this digit to the result.
    quotientSignificand += digit
  }

  // Determine the quotient and remainder from the resulting digits.
  let remainderSignificand = remainderDigits.join('')
  let quotient = fromRepresentation(sign, quotientSignificand, exponent)
  let remainder = fromRepresentation(signA, remainderSignificand, exponentA)

  // If there is a remainder, consider the provided rounding rule.
  if (remainder !== '0') {

    // Normalize the rounding mode based on sign and other context; reducing the
    // set of possible rounding modes to four (up, down, half up, and half down)
    // which apply to the absolute value of quotient.
    // TODO: can this be shared with round()?
    roundingMode =
      roundingMode === ROUND_CEILING ? sign < 0 ? ROUND_DOWN : ROUND_UP :
      roundingMode === ROUND_FLOOR ? sign < 0 ? ROUND_UP : ROUND_DOWN :
      roundingMode === ROUND_EUCLIDEAN ? sign === signB ? ROUND_DOWN : ROUND_UP :
      roundingMode === ROUND_HALF_CEILING ? sign < 0 ? ROUND_HALF_DOWN : ROUND_HALF_UP :
      roundingMode === ROUND_HALF_FLOOR ? sign < 0 ? ROUND_HALF_UP : ROUND_HALF_DOWN :
      roundingMode === ROUND_HALF_EVEN ? digit % 2 ? ROUND_HALF_DOWN : ROUND_HALF_UP :
      roundingMode

    // Determine whether to round up the quotient. This is trivial for whole
    // rounding modes, however half rounding modes need to compare the remainder
    // to the midpoint of the divisor, treating exactly the midpoint specially.
    let shouldRoundUp
    if (roundingMode === ROUND_UP || roundingMode === ROUND_DOWN) {
      shouldRoundUp = roundingMode === ROUND_UP
    } else {
      const midpointCmp = cmp(mul(2, remainderSignificand as decimal), significandB as decimal)
      shouldRoundUp = roundingMode === ROUND_HALF_UP ? midpointCmp >= 0 : midpointCmp > 0
    }

    if (shouldRoundUp) {
      // In order to "round up" the absolute value of the quotient, add 1 to the
      // least significant digit. Then subtract one additional dividend from the
      // remainder at the same exponent.
      quotient = add(quotient, fromRepresentation(sign, '1', exponent - place + 1))
      remainder = sub(remainder, fromRepresentation(signA, significandB, exponentA - place + 1))
    }
  }

  return [quotient, remainder]
}


// Comparisons

/**
 * Compares two numeric values and returns true if they are equivalent.
 *
 * @equivalent a == b
 */
 export function eq(a: Numeric, b: Numeric): boolean {
  return cmp(a, b) === 0
}

/**
 * Compares two numeric values and returns true if a is greater than b.
 *
 * @equivalent a > b
 */
export function gt(a: Numeric, b: Numeric): boolean {
  return cmp(a, b) === 1
}

/**
 * Compares two numeric values and returns true if a is greater than or equal to b.
 *
 * @equivalent a >= b
 */
export function gte(a: Numeric, b: Numeric): boolean {
  return cmp(a, b) !== -1
}

/**
 * Compares two numeric values and returns true if a is less than b.
 *
 * @equivalent a < b
 */
export function lt(a: Numeric, b: Numeric): boolean {
  return cmp(a, b) === -1
}

/**
 * Compares two numeric values and returns true if a is less than or equal to b.
 *
 * @equivalent a <= b
 */
export function lte(a: Numeric, b: Numeric): boolean {
  return cmp(a, b) !== 1
}

/**
 * Compares two numeric values and returns `1` if a is greater than b, `-1` if b
 * is greater than a, and `0` if a and b are equivalent.
 *
 * Note: This is equivalent to, but much faster than, `sign(sub(a, b))`.
 *
 * @equivalant a == b ? 0 : a > b ? 1 : -1
 */
 export function cmp(a: Numeric, b: Numeric): Sign {
  const [signA, significandA, exponentA, precisionA] = toRepresentation(a)
  const [signB, significandB, exponentB, precisionB] = toRepresentation(b)

  // Comparison to zero or differing signs
  if (!signA) return (-signB | 0) as Sign
  if (!signB || signA !== signB) return signA

  // Compare absolute value and flip if negative.
  return (cmpAbs(significandA, exponentA, precisionA, significandB, exponentB, precisionB) * signA | 0) as Sign
}

/**
 * Compares two normalized absolute values
 *
 * @internal
 */
function cmpAbs(significandA: string, exponentA: number, precisionA: number, significandB: string, exponentB: number, precisionB: number): Sign {
  if (exponentA !== exponentB) return exponentA > exponentB ? 1 : -1
  for (let i = -1, j = precisionA < precisionB ? precisionA : precisionB; ++i < j;) {
    if (significandA[i] !== significandB[i]) return significandA[i] > significandB[i] ? 1 : -1
  }
  return precisionA === precisionB ? 0 : precisionA > precisionB ? 1 : -1
}


// Magnitude

/**
 * Absolute value, always positive.
 *
 * @equivalent Math.abs(value)
 */
export function abs(value: Numeric): decimal {
  const [, significand, exponent] = toRepresentation(value)
  return fromRepresentation(1, significand, exponent)
}

/**
 * Negated value, same magnitude but opposite sign.
 *
 * @equivalent -value
 */
export function neg(value: Numeric): decimal {
  const [sign, significand, exponent] = toRepresentation(value)
  return fromRepresentation(-sign as Sign, significand, exponent)
}

/**
 * Returns a positive `1` or negative `-1` indicating the sign of the provided
 * number. If the provided number is zero, it will return `0`.
 *
 * Note: decimal does not represent negative zero.
 *
 * @equivalent Math.sign(value)
 */
export function sign(value: Numeric): Sign {
  const [sign] = toRepresentation(value)
  return sign
}

/**
 * Returns the `value` scaled up or down by `power`. In other words, this moves
 * the decimal point right `power` places.
 *
 * Note: This is equivalent to, but much faster than, `mul(value, pow(10, power))`.
 *
 * Note: decimal does not represent negative zero.
 *
 * @equivalent value * Math.pow(10, power)
 */
export function scale(value: Numeric, power: Numeric): decimal {
  const [sign, significand, exponent] = toRepresentation(value)
  power = toNumber(power)
  if (~~power !== power) {
    throw RangeError('power must be a whole number.');
  }
  return fromRepresentation(sign, significand, exponent + power)
}


// Rounding

/**
 * Rounds a numeric value according to the provided rules.
 *
 * places: The number of decimal places to round to. Negative places rounds
 *         integer places. Ignored if precision is provided. If neither places
 *         or precision is provided, a default value of 0 is used, rounding to
 *         an whole number.
 *
 * precision: The number of significant digits to round to. Overrides places.
 *
 * mode: Determines how a rounded value should be determined.
 *       If not provided, the default mode "half ceiling" is used.
 *  - `"up"`: Rounds up away from zero.
 *  - `"down"`: Rounds down towards zero.
 *  - `"ceiling"`: Rounds up towards positive infinity.
 *  - `"floor"`: Rounds down towards negative infinity.
 *  - `"euclidean"`: Same as floor, but with specific behavior for division.
 *  - `"half up"`: Rounds towards the nearest neighbor, otherwise up.
 *  - `"half down"`: Rounds towards the nearest neighbor, otherwise down.
 *  - `"half ceiling"`: Rounds towards the nearest neighbor, otherwise ceiling.
 *  - `"half floor"`: Rounds towards the nearest neighbor, otherwise floor.
 *  - `"half even"`: Rounds towards the nearest neighbor, otherwise towards the
 *    even neighbor. Useful to avoid aggregated bias.
 *
 * Note: the default "half ceiling" rounding mode is different from the behavior
 * of round() in many other libraries and programming languages, but matches the
 * behavior of JavaScript's Math.round(). Other languages default to "half up".
 */
export function round(value: Numeric, rules?: RoundingRules): decimal {
  const roundingRules = normalizeRules(rules, 0, ROUND_HALF_CEILING)
  let [sign, significand, exponent, precision] = toRepresentation(value)

  // Determine the desired rounding mode and precision.
  let roundingMode = roundingRules[MODE]
  let roundingPrecision = getRoundingPrecision(roundingRules, exponent)

  // Start the rounded value as a truncated value to the desired precision.
  let rounded = fromRepresentation(sign, roundingPrecision > 0 ? significand.slice(0, roundingPrecision) : '', exponent)

  // Only round if the rounded precision is less than the original precision.
  if (precision > roundingPrecision) {

    // Normalize the rounding mode to either: up, down, half up, or half down.
    roundingMode =
      roundingMode === ROUND_CEILING ? sign < 0 ? ROUND_DOWN : ROUND_UP :
      roundingMode === ROUND_FLOOR || roundingMode === ROUND_EUCLIDEAN ? sign < 0 ? ROUND_UP : ROUND_DOWN :
      roundingMode === ROUND_HALF_CEILING ? sign < 0 ? ROUND_HALF_DOWN : ROUND_HALF_UP :
      roundingMode === ROUND_HALF_FLOOR ? sign < 0 ? ROUND_HALF_UP : ROUND_HALF_DOWN :
      roundingMode === ROUND_HALF_EVEN ? +(significand[roundingPrecision - 1] || 0) % 2 ? ROUND_HALF_UP : ROUND_HALF_DOWN :
      roundingMode

    const roundingDigit = +(significand[roundingPrecision] || 0)
    if (
      // A half up mode found the subsequent digit to be 5 or greater
      roundingMode === ROUND_HALF_UP ? roundingDigit > 4 :
      // A half down mode found the subsequent digit to be greater than 5, or 5 with additional digits
      roundingMode === ROUND_HALF_DOWN ? roundingDigit > 5 || roundingDigit === 5 && precision > roundingPrecision + 1 :
      // The rounding mode is up and the value is non-zero
      roundingMode === ROUND_UP && sign
    ) {
      // Round up by adding one to the the least significant digit of the absolute value
      rounded = add(rounded, fromRepresentation(sign, '1', exponent - roundingPrecision + 1))
    }
  }

  return rounded
}

type RoundingRules =
  | { places?: number, mode?: RoundingMode, precision?: never }
  | { precision?: number, mode?: RoundingMode, places?: never }

type NormalizedRoundingRules =
  | { places: number, mode: RoundingMode, precision: never }
  | { precision: number, mode: RoundingMode, places: never }

type RoundingMode =
  | 'up'
  | 'down'
  | 'ceiling'
  | 'floor'
  | 'euclidean'
  | 'half up'
  | 'half down'
  | 'half ceiling'
  | 'half floor'
  | 'half even'

const PLACES = 'places'
const PRECISION = 'precision'
const MODE = 'mode'

const ROUND_UP = 'up'
const ROUND_DOWN = 'down'
const ROUND_CEILING = 'ceiling'
const ROUND_FLOOR = 'floor'
const ROUND_EUCLIDEAN = 'euclidean'
const ROUND_HALF_UP = 'half up'
const ROUND_HALF_DOWN = 'half down'
const ROUND_HALF_CEILING = 'half ceiling'
const ROUND_HALF_FLOOR = 'half floor'
const ROUND_HALF_EVEN = 'half even'

const roundingModes = {
  [ROUND_UP]: ROUND_UP,
  [ROUND_DOWN]: ROUND_DOWN,
  [ROUND_CEILING]: ROUND_CEILING,
  [ROUND_FLOOR]: ROUND_FLOOR,
  [ROUND_EUCLIDEAN]: ROUND_EUCLIDEAN,
  [ROUND_HALF_UP]: ROUND_HALF_UP,
  [ROUND_HALF_DOWN]: ROUND_HALF_DOWN,
  [ROUND_HALF_CEILING]: ROUND_HALF_CEILING,
  [ROUND_HALF_FLOOR]: ROUND_HALF_FLOOR,
  [ROUND_HALF_EVEN]: ROUND_HALF_EVEN,
}

/**
 * Given rounding rules, a number's exponent, and a default, produce a rounding
 * precision and mode. If there are problems with rounding rules, throw an Error.
 *
 * @internal
 */
function normalizeRules(rules: RoundingRules | undefined, defaultPlaces: number, defaultMode: RoundingMode): NormalizedRoundingRules {
  let precision = rules && rules[PRECISION]
  let places = rules && rules[PLACES]
  let mode = rules && rules[MODE]
  if (precision != null) {
    if (places != null) throw new TypeError('Cannot provide both precision and places')
    if (~~precision !== precision) throw new RangeError('precision must be a whole number')
  } else if (places != null) {
    if (~~places !== places) throw new RangeError('places must be a whole number')
  } else {
    places = defaultPlaces
  }
  if (mode && !(mode in roundingModes)) throw new TypeError(`Unknown rounding mode: ${mode}`)
  return {
    [PRECISION]: precision,
    [PLACES]: places,
    [MODE]: mode || defaultMode
  } as NormalizedRoundingRules
}

function getRoundingPrecision(rules: RoundingRules, exponent: number): number {
  return rules[PRECISION] != null ?
    rules[PRECISION] as number :
    (rules[PLACES] || 0) + exponent + 1
}


// Conversions

/**
 * Converts a `Numeric` value (including `decimal`) to a JavaScript number.
 *
 * Throws an Error if the converting the value would lead to a loss of precision
 * unless `{ strict: false }` is provided to the `options` argument.
 */
export function toNumber(value: Numeric, options?: { strict: boolean }): number {
  const canonical = decimal(value)
  const number = +canonical
  // Unless `strict` has been explicitly set to false, check to ensure the
  // number conversion has not lost information by converting it back to a
  // canonical decimal and comparing it to the original.
  if ((!options || options.strict !== false) && decimal(number) !== canonical) {
    throw new RangeError(`Lost precision converting ${canonical} to ${number}`)
  }
  return number
}

/**
 * A string representation of the provided Numeric `value` using canonical
 * decimal format.
 *
 * This is equivalent to the `decimal()` function.
 *
 * @see decimal
 */
export const toString: (value: Numeric) => string = decimal

/**
 * A string representation of the provided Numeric `value` using fixed notation.
 * Uses rules to specify `precision` or `places` and the rounding `mode` should
 * that result in fewer digits.
 */
export function toFixed(value: Numeric, rules?: RoundingRules): string {
  return toFormat(false, value, rules)
}

/**
 * A string representation of the provided Numeric `value` using exponential
 * scientific notation. Uses rules to specify `precision` or `places` and the
 * rounding `mode` should that result in fewer digits.
 */
export function toExponential(value: Numeric, rules?: RoundingRules): string {
  // Interpret "places" relative to the final exponential notation rather than
  // the original number. In exponential scientific notation, the precision of
  // a number is always exactly one more than the number of decimal places.
  return toFormat(true, value, rules && rules[PLACES] != null ? { [PRECISION]: rules[PLACES]! + 1, [MODE]: rules[MODE] } : rules)
}

/**
 * Prints a formatted string as either fixed or exponential mode according to rules.
 *
 * @internal
 */
function toFormat(asExponential: boolean, value: Numeric, rules?: RoundingRules): string {
  const [sign, significand, exponent, precision] = toRepresentation(rules ? round(value, rules) : value)
  const printPrecision = rules ? getRoundingPrecision(rules, exponent) : precision
  return print(sign, significand, exponent, precision, printPrecision, asExponential)
}

/**
 * Print a numeric string given a decomposed decimal representation.
 *
 * @internal
 */
 function print(
  sign: Sign,
  significand: string,
  exponent: number,
  precision: number,
  printPrecision: number,
  asExponential?: boolean
): string {
  let result = sign < 0 ? '-' : ''
  let decimalPoint = asExponential ? 1 : exponent + 1

  while (precision < printPrecision) {
    significand += '0'
    precision++
  }

  if (decimalPoint < 1) {
    result += '0.'
    while (decimalPoint++) result += '0'
    result += significand
  } else if (decimalPoint < printPrecision) {
    result += significand.slice(0, decimalPoint) + '.' + significand.slice(decimalPoint)
  } else {
    result += significand
    while (decimalPoint-- > precision) result += '0'
  }

  if (asExponential) {
    result += (exponent < 0 ? 'e' : 'e+') + exponent
  }

  return result
}


// Normalized representation

type DecimalRepresentation = readonly [sign: Sign, significand: string, exponent: number, precision: number]
type Sign = 0 | 1 | -1

const decimalRegex = /^([-+])?(?:(\d+)|(?=\.\d))(?:\.(\d+)?)?(?:e([-+]?\d+))?$/i

/**
 * Given a numeric value, return a normalized form of a decimal:
 * a [significand, exponent, sign] tuple.
 *
 * Functions within this library internally operate on the normalized form
 * before converting back to a canonical decimal via fromParts. These
 * functions are exported to enable user-defined mathematical functions on the
 * decimal type.
 *
 * sign: either 1 for a positive number, -1 for a negative number, or 0 for 0.
 * significand: a string of significant digits expressed in scientific
 * notation, where the first digit is the ones place, or an empty string for 0.
 * exponent: the power of ten the significand is multiplied by, or 0 for 0.
 * precision: the number of digits found in significand (e.g. number of significant digits).
 *
 * @example toRepresentation('-1.23e4') returns [-1, '123', 4, 3]
 */
export function toRepresentation(value: unknown): DecimalRepresentation {
  const match = decimalRegex.exec(''+value)
  if (!match) throw new TypeError(`Expected a numeric string: ${value}`)
  const [, signStr, integer = '', fractional = '', exponentStr = '0'] = match
  return normalizeRepresentation(signStr === '-' ? -1 : 1, integer + fractional, +exponentStr + integer.length - 1)
}

/**
 * Given a decimal's decomposed representation, return a canonical decimal value.
 */
export function fromRepresentation(sign: Sign, significand: string, exponent: number): decimal {
  let precision;
  [sign, significand, exponent, precision] = normalizeRepresentation(sign, significand, exponent)
  return print(sign, significand, exponent, precision, precision) as decimal
}

/**
 * Removes unnecessary leading or trailing zeros from the significand, adjusting
 * the exponent and sign if necessary.
 *
 * @internal
 */
function normalizeRepresentation(sign: Sign, significand: string, exponent: number): DecimalRepresentation {
  let precision = significand.length
  let leadingZeros = 0;
  let trailingZeros = 0;
  while (significand[leadingZeros] === '0') {
    leadingZeros++
    exponent--
  }
  if (leadingZeros === precision) {
    return [0, '', 0, 0]
  }
  while (significand[precision - 1 - trailingZeros] === '0') {
    trailingZeros++
  }
  if (leadingZeros || trailingZeros) {
    significand = significand.slice(leadingZeros, precision - trailingZeros)
  }
  return [sign, significand, exponent, precision - leadingZeros - trailingZeros]
}
