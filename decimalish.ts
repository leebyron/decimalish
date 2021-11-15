/**
 * Done:
 *  - moving between normalized forms
 *  - sign is done
 *  - constructor/conversion is done
 *  - abs/neg magnitude is done
 *  - all comparisons are done
 *  - add/sub is done
 *  - mul is done
 *
 *
 * Todo:
 *  - unit tests
 *  - cmp ideally can accept +-Infinity
 *  - round - WIP.
 *  - div - should it require a rounding mode?
 *  - idiv or divmod or something that returns an [int, int] of [result, remain]?
 *  - mod - surely there's an arbitrary integer algorithm for this somewhere
 *  - pow - ECMA proposal has this with a positive integer
 *  - sqrt - is this actually useful? Big.js has this, but ECMA does not
 *  - toFixed / toExponential / toPrecision - are these useful?
 *  - toLocaleString would be useful, but I'm not sure how to get this working
 */

/**
 * The decimal type.
 *
 * A decimal is represented as a numeric string, allowing arbitrary precision.
 * It is a subtype of numeric string, that is all decimal types are numeric
 * strings, but not all numeric strings are decimals.
 *
 * Note: unlike number, decimal cannot represent Infinity, NaN, or negative zero.
 */
export type decimal = `${number}` & { [$decimal]: typeof $decimal }
declare const $decimal: unique symbol

/**
 * The Numeric type represents all numeric values: numbers, bigint, and
 * numeric strings (including decimal).
 */
export type Numeric = `${number}` | number | bigint

// Type conversion

/**
 * Converts any numeric value to a decimal.
 *
 * Throws a TypeError if the provided value cannot be translated to decimal.
 */
export function decimal(value: string | Numeric): decimal {
  const [sign, significand, exponent] = toParts(value)
  return fromParts(sign, significand, exponent)
}

// Magnitude

/**
 * Absolute value, always positive.
 *
 * @equivalent Math.abs(value)
 */
export function abs(value: Numeric): decimal {
  const [, significand, exponent] = toParts(value)
  return fromParts(1, significand, exponent)
}

/**
 * Negated value, same magnitude but opposite sign.
 *
 * @equivalent -value
 */
export function neg(value: Numeric): decimal {
  const [sign, significand, exponent] = toParts(value)
  return fromParts(-sign as Sign, significand, exponent)
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
 * Compares two numeric values and returns 1 if a is greater than b, -1 if b is
 * greater than a, and 0 if a and b are equivalent.
 *
 * Note: This is equivalent to the sign of the difference of a and b.
 *
 * @equivalant a == b ? 0 : a > b ? 1 : -1
 */
 export function cmp(a: Numeric, b: Numeric): Sign {
  const [signA, significandA, exponentA, precisionA] = toParts(a)
  const [signB, significandB, exponentB, precisionB] = toParts(b)

  // Comparison to zero or differing signs
  if (!significandA) return (-signB | 0) as Sign
  if (!significandB || signA !== signB) return signA

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

// Mathematic operations

/**
 * Adds two numeric values as a decimal result.
 *
 * @equivalent a + b
 */
export function add(a: Numeric, b: Numeric): decimal {
  const [signA, significandA, exponentA, precisionA] = toParts(a)
  const [signB, significandB, exponentB, precisionB] = toParts(b)

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

    // If the two numbers are equivalent (A == B), then: A - B == 0
    if (direction === 0) {
      return '0' as decimal
    }

    // Correct the resulting sign for the subtraction direction.
    sign = (sign * direction) as Sign
    while (pos-- > -exponent) {
      result += 10 + direction * (+(significandA[pos + exponentA] || 0) - +(significandB[pos + exponentB] || 0))
      digits[pos + exponent] = result % 10
      result = result > 9 ? 0 : -1
    }
    significand = digits.join('')
  }

  return fromParts(sign, significand, exponent)
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
  const [signA, significandA, exponentA, precisionA] = toParts(a)
  const [signB, significandB, exponentB, precisionB] = toParts(b)

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

  return fromParts((signA * signB) as Sign, digits.join(''), exponentA + exponentB + 1)
}

export function div(a: Numeric, b: Numeric, roundingRules?: RoundingRules): decimal {
  const [signA, significandA, exponentA, precisionA] = toParts(a)
  const [signB, significandB, exponentB, precisionB] = toParts(b)

  if (!significandB) throw new TypeError('Divide by 0')
  if (!significandA) return '0' as decimal

  let exponent = exponentA - exponentB

  // TODO factor out validating and determining precision as a function of rules and exponent
  const maxPrecision = (roundingRules?.precision ?? ((roundingRules?.places || 0) + exponent)) + 1

  // Remainder is a mutable list of digits, starting as a copy of the dividend (a).
  const remainder: number[] = []
  for (let i=0;i<precisionA;i++) {
    remainder[i] = +significandA[i]
  }

  const digits: number[] = []
  let place = 0;
  // most significant digit of the remainder. Incremented as leading zeros are produced
  let msd = 0;

  // TODO:
  // repeat either until 1 more digit than the desired precision is reached,
  //            or until all digits of a are used and the remainder is 0
  while (true) {

    // Count how many times divisor (b) can be subtracted from remainder at the
    // current place.
    let digit = 0;
    for (digit = 0; digit < 10; digit++) {

      // Is remainder less than divisor?


    }

  }





  // start by defining a "remainder" of the same number of sigs as b (divisor).
  // then count the subtractions of the divisor until remainder is smaller than divisor
  // append count to digits
  // append the next digit of a (dividend) to remainder (or 0) (and shift off 0? or just change its exponent?)
  // repeat either until 1 more digit than the desired precision is reached,
  //            or until all digits of a are used and the remainder is 0

  // Notes: "remainder" needs to be an array of digits due to mutation
  // Notes: one extra precision isn't quite enough to round, also need to know
  //        if there was additional remainder. That's the difference between 0.5 (midpoint) and 0.5 + something (above midpoint)


  return fromParts((signA * signB) as Sign, digits.join(''), exponent)
}

// Rounding

type RoundingRules =
  | { places?: number, mode?: RoundingMode, precision?: never }
  | { precision?: number, mode?: RoundingMode, places?: never }

type RoundingMode =
  | 'up'
  | 'down'
  | 'ceiling'
  | 'floor'
  | 'half up'
  | 'half down'
  | 'half even'
  | 'unnecessary'

const roundingMode = {
  'up': 1,
  'down': 2,
  'ceiling': 3,
  'floor': 4,
  'half up': 5,
  'half down': 6,
  'half even': 7,
  'unnecessary': 8
}

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
 *       If not provided, the default mode "half down" is used.
 *  - "up": Rounds up away from zero.
 *  - "down": Rounds down towards zero.
 *  - "ceiling": Rounds up towards positive infinity.
 *  - "floor": Rounds down towards negative infinity.
 *  - "half up": Rounds towards the nearest neighbor, otherwise up.
 *  - "half down": Rounds towards the nearest neighbor, otherwise down.
 *  - "half even": Rounds towards the nearest neighbor, otherwise towards the
 *    even neighbor. Useful to avoid aggregated bias.
 *  - "unnecessary": Asserts that the no rounding is necessary by throwing an
 *    Error if rounding occurs.
 */
export function round(value: Numeric, rules?: RoundingRules): decimal {
  let [sign, significand, exponent] = toParts(value)

  // // TODO: validate and throw TypeError if necessary
  // const mode = roundingMode[rules?.mode] || 3

  // // TODO: this could result in "negative precision" eg round(5, -2) === 100
  // // Expressed as "precision" this only makes sense for positive values.
  // // Maybe this can be explained as removing precision from a value?
  // // eg {precision:0} will take any value and round it to the next higher power:
  // // round(789, { precision: 0 }) === 1000
  // const precision = rules?.precision ?? ((rules?.places || 0) + exponent)

  return fromParts(sign, significand, exponent)
}

// Normalized parts

type DecimalParts = readonly [sign: Sign, significand: string, exponent: number, precision: number]
type Sign = 0 | 1 | -1

const decimalRegex = /^([-+])?(?:(\d+)|(?=\.\d))(?:\.(\d+)?)?(?:e([-+]?\d+))?$/i

/**
 * Returns a positive or negative 1 indicating the sign of the provided number.
 * If the provided number is 0, it will return 0. Note that decimal does not
 * represent negative zero.
 *
 * @equivalent Math.sign(value)
 */
export function sign(value: Numeric): Sign {
  const [sign] = toParts(value)
  return sign
}

/**
 * Given a numeric value, return a normalized form of a decimal:
 * a [significand, exponent, sign] tuple.
 *
 * Functions within this library internally operate on the normalized form
 * before converting back to a decimal primitive via fromNormalized. These
 * functions are exported to enable user-defined mathematical functions on the
 * decimal type.
 *
 * sign: either 1 for a positive number, -1 for a negative number, or 0 for 0.
 * significand: a string of significant digits expressed in scientific
 * notation, where the first digit is the ones place, or an empty string for 0.
 * exponent: the power of ten the significand is multiplied by, or 0 for 0.
 * precision: the number of digits found in significand (e.g. number of significant digits).
 *
 * @example toParts('-1.23e4') returns [-1, '123', 4, 3]
 */
export function toParts(value: string | Numeric): DecimalParts {
  const match = decimalRegex.exec(''+value)
  if (!match) throw new TypeError(`Expected a numeric string: ${value}`)
  const [, signStr, integer = '', fractional = '', exponentStr = '0'] = match
  return normalizeParts(signStr === '-' ? -1 : 1, integer + fractional, +exponentStr + integer.length - 1)
}

/**
 * Given a decimal's three parts, produce a canonical decimal value.
 */
export function fromParts(sign: Sign, significand: string, exponent: number): decimal {
  // Some mathematical algorithms may leave insignificant zeros in the
  // significand. Normalize the parts before printing a canonical decimal value.
  let precision;
  [sign, significand, exponent, precision] = normalizeParts(sign, significand, exponent)
  let result = sign < 0 ? '-' : ''
  if (!significand) {
    result = '0'
  } else if (exponent < 0) {
    result += '0.'
    while (++exponent) result += '0'
    result += significand
  } else {
    if (++exponent < precision) {
      result += significand.slice(0, exponent) + '.' + significand.slice(exponent)
    } else {
      result += significand
      while (exponent-- > precision) result += '0'
    }
  }
  return result as decimal
}

/**
 * Removes unnecessary leading or trailing zeros from the significand, adjusting
 * the exponent and sign if necessary.
 *
 * @internal
 */
function normalizeParts(sign: Sign, significand: string, exponent: number): DecimalParts {
  let precision = significand.length
  let leadingZeros = 0;
  let trailingZeros = 0;
  while (significand[leadingZeros] === '0') {
    leadingZeros++
    exponent--
  }
  while (significand[precision - 1 - trailingZeros] === '0') {
    trailingZeros++
  }
  if (leadingZeros || trailingZeros) {
    significand = significand.slice(leadingZeros, precision - trailingZeros)
  }
  if (!significand) {
    sign = 0
    exponent = 0
  }
  return [sign, significand, exponent, precision - leadingZeros - trailingZeros]
}
