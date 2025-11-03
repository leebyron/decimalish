/**
 * @packageDocumentation
 * Done:
 *  - moving between normalized forms and predicate
 *  - sign is done
 *  - constructor/conversion is done
 *  - abs/neg magnitude is done
 *  - all comparisons are done
 *  - add/sub is done
 *  - mul is done
 *  - round is done and tested
 *  - rounding modes take Numeric
 *  - pow - matching ECMA proposal has this with a positive integer - needs tests
 *  - mod and rem done - need tests
 *  - div needs more tests
 *  - divRem done but needs more tests
 *  - EUCLIDEAN mode for divRem/round. floor/truncated mode.
 *  - divInt
 *  - toFixed / toExponential. with all rounding modes.
 *  - scaleBy - needs tests
 *  - Error quality
 *  - min/max - needs tests
 *  - floor/ceil/trunc - needs tests
 *  - places/precision/scale
 *  - "exact" rounding mode?
 *  - sqrt
 *  - build outputs
 *  - int/intRem/isInteger - needs tests
 *  - github ci/cd
 *  - prettier
 *  - change division defaults from 20 decimals to 34 precision (IEEE 754R Dec128 default)

 * Todo:
 *  - try changing `scale` to factor in precision, such that `num = digits * 10^scale`
 *  - should rounding from a negative result in -0? Reintroduce -0?
 *  - unit tests
 *  - toEngineering ? (or argument to toExponential?)
 *  - cbrt?
 *  - trig / PI?
 *  - exp/ln/log?
 *  - sum
 *  - toLocaleString would be useful, but I'm not sure how to get this working
 *  - cmp ideally can accept +-Infinity - is this actually useful?
 *
 *  - rest of decimal.js lib?
 *
 *  - eslint
 *  - optimized for build size?
 *  - build size testing
 *  - performance testing
 *  - compare to other libraries and standards? http://speleotrove.com/decimal/
 *
 * Pitch:
 *
 *  - Decimal is a primitive, so it is immutable and can be used as keys
 *  - canonical. Equivalent canonical decimals are also `===` so can be used in Set() and as object property keys!
 *  - 11 rounding modes
 *  - no global configuration or state
 *  - use it or lose it! per-method tree shaking supported
 *  - or at worst, only 5.8kb minified (2.7kb gzipped)!
 *  - does not support -0, NaN, or Infinity. -0 isn't useful outside of floating
 *    point, Infinity is not a decimal, and the only case which might produce
 *    Infinity or NaN, dividing by zero, throws.
 *  - supports all environments, all browsers (UMD, ES3-friendly)
 *
 * Why no -0?
 *
 *  It is mainly useful in floating point to represent the sign of an
 *  underflowed number (e.g. not zero but smaller than you can represent,
 *  therefore should have a sign). Underflow is not a concern here!
 *
 * No default rounding
 *
 *  Unlike many other decimal implementations or specifications, these functions
 *  do not perform rounding, and rounding must be done explicitly if desired.
 *  This removes any potential for unexpected underflow or overflow.
 *
 *  This removes the need for some specified functions, like fusedMultiplyAdd().
 *
 */

// Types

/**
 * Decimal type
 *
 * A decimal is represented as a numeric string, allowing arbitrary precision.
 * It is a subtype of numeric string, that is all decimal types are numeric
 * strings, but not all numeric strings are decimals.
 *
 * @category Types
 * @see isDecimal
 */
export type decimal = NumericString & { [$$decimal]: typeof $$decimal }
declare const $$decimal: unique symbol

/**
 * Convert to decimal
 *
 * Converts any numeric value to a `decimal`.
 *
 * Throws a `"NOT_NUM"` Error if the provided value is not numeric and cannot be
 * translated to decimal.
 *
 * Unlike number, decimal cannot represent `Infinity`, `NaN`, or `-0`.
 *
 * @category Types
 */
export function decimal(value: unknown): decimal {
  const [sign, digits, scale] = deconstruct(value)
  return construct(sign, digits, scale)
}

/**
 * Is decimal?
 *
 * Returns true if the provided value is a decimal value.
 *
 * A value is `decimal` if it is a numeric string in a canonical decimal form.
 *
 * @category Types
 */
export function isDecimal(value: unknown): value is decimal {
  return isNumeric(value) && decimal(value) === value
}

/**
 * Is numeric value?
 *
 * Returns true if the provided value is a (finite) `Numeric` value.
 *
 * A value is considered numeric if it can be coerced to a numeric string.
 *
 * @category Types
 */
export function isNumeric(value: unknown): value is Numeric {
  return !!parse(value)
}

/**
 * Is integer?
 *
 * Returns true if the provided value is an integer numeric value.
 *
 * Similar to `Number.isInteger()`, but works with `decimal` or any other
 * `Numeric` value. This is most useful when working with high precision values
 * where `Number.isInteger()` could lose precision, inadvertently remove
 * fractional information, and then come to an incorrect result.
 *
 * @equivalent Number.isInteger(value)
 * @category Types
 */
export function isInteger(value: unknown): boolean {
  let scale, precision
  return (
    isNumeric(value) &&
    (([, , scale, precision] = deconstruct(value)), scale + 1 >= precision)
  )
}

/**
 * Numeric value
 *
 * The Numeric type represents all numeric values which could be coerced to
 * a number: numbers, bigint, boolean, `NumericString` (including `decimal`),
 * and `NumericObject` which have a numeric primitive value.
 *
 * @category Types
 */
export type Numeric = NumericString | NumericObject | number | bigint | boolean

/**
 * Numeric string
 *
 * The NumericString type represents strings that can be parsed as a decimal
 * number.
 *
 * This does not include hex, octal, binary, or any other non-decimal base
 * numeric strings.
 *
 * @category Types
 */
export type NumericString = `${number}`

/**
 * Numeric object
 *
 * The `NumericObject` type represents objects with a `Numeric` primitive
 * value, either by providing a `valueOf()` method which returns `number` or
 * a `toString()` method which returns `NumericString`.
 *
 * @category Types
 */
export type NumericObject =
  | { valueOf(): NumericString | number | bigint }
  | { toString(): NumericString }
  | BigJS

/**
 * Since the DefinitelyTyped Big.js type doesn't satisfy NumericObject, we
 * explicitly include a type which matches that interface.
 *
 * @internal
 */
type BigJS = { valueOf(): string; readonly e: number; readonly s: number }

// Arithmetic

/**
 * Add (+)
 *
 * Adds two numeric values as a `decimal` result. Used as the replacement of the
 * plus (+) operator.
 *
 * @equivalent a + b
 * @category Arithmetic
 */
export function add(a: Numeric, b: Numeric): decimal {
  const [signA, digitsA, scaleA, precisionA] = deconstruct(a)
  const [signB, digitsB, scaleB, precisionB] = deconstruct(b)

  // Additive identity. Return early so the rest of the method can safely assume
  // both operands are signed non-zero numbers.
  if (!signA) return construct(signB, digitsB, scaleB)
  if (!signB) return construct(signA, digitsA, scaleA)

  // Result normalized form
  let sign = signA
  let digits
  let scale = scaleA > scaleB ? scaleA : scaleB

  // Operate right to left starting from the most precise digit
  let pos =
    precisionA - scaleA > precisionB - scaleB
      ? precisionA - scaleA
      : precisionB - scaleB
  let digitsArray = new Array(pos + scale)
  let result = 0

  // If the operands have the same sign, add the two digits.
  if (signA === signB) {
    while (pos-- > -scale) {
      result += +(digitsA[pos + scaleA] || 0) + +(digitsB[pos + scaleB] || 0)
      digitsArray[pos + scale] = result % 10
      result = result > 9 ? 1 : 0
    }
    digits = digitsArray.join("")

    // Prepend the final sum's carried-over result.
    if (result) {
      digits = result + digits
      scale++
    }

    // Otherwise, the signs differ; subtract the two digits.
  } else {
    // Compare the absolute values of A and B to ensure the smaller is
    // subtracted from the larger.
    const direction = cmpAbs(
      digitsA,
      scaleA,
      precisionA,
      digitsB,
      scaleB,
      precisionB,
    )

    // There will only be a result if the operands are not equivalent (A != B),
    // otherwise: A - B == 0
    if (direction) {
      // Correct the resulting sign for the subtraction direction.
      sign = (sign * direction) as 1 | -1
      while (pos-- > -scale) {
        result +=
          10 +
          direction *
            (+(digitsA[pos + scaleA] || 0) - +(digitsB[pos + scaleB] || 0))
        digitsArray[pos + scale] = result % 10
        result = result > 9 ? 0 : -1
      }
    }

    digits = digitsArray.join("")
  }

  return construct(sign, digits, scale)
}

/**
 * Subtract (-)
 *
 * Subtracts the numeric b from the numeric a, returning a `decimal` result.
 * Used as the replacement of the minus (-) operator.
 *
 * @equivalent a - b
 * @category Arithmetic
 */
export function sub(a: Numeric, b: Numeric): decimal {
  // a - b is equivalent to a + -b
  return add(a, neg(b))
}

/**
 * Multiply (*)
 *
 * Multiplies two numeric values as a `decimal` result. Used as the replacement
 * of the times (*) operator.
 *
 * @equivalent a * b
 * @category Arithmetic
 */
export function mul(a: Numeric, b: Numeric): decimal {
  const [signA, digitsA, scaleA, precisionA] = deconstruct(a)
  const [signB, digitsB, scaleB, precisionB] = deconstruct(b)

  // If either a or b is zero, return zero.
  if (!signA || !signB) {
    return ZERO
  }

  const digitsArray = new Array(precisionA + precisionB)
  let result = 0

  for (let i = precisionA; i--; ) {
    result = 0
    for (let j = precisionB; j--; ) {
      result +=
        (digitsArray[i + j + 1] || 0) + +(digitsA[i] || 0) * +(digitsB[j] || 0)
      digitsArray[i + j + 1] = result % 10
      result = (result / 10) | 0
    }
    digitsArray[i] = result
  }

  return construct(
    (signA * signB) as Sign,
    digitsArray.join(""),
    scaleA + scaleB + 1,
  )
}

/**
 * Divide (/)
 *
 * Returns the result of dividing `dividend` by `divisor` as a `decimal`. Used
 * as the replacement of the division (/) operator.
 *
 * Defaults to 34 digits of precision and the `"half even"` rounding
 * mode, configurable by providing rounding `rules`.
 *
 * @equivalent a / b
 * @category Arithmetic
 */
export function div(
  dividend: Numeric,
  divisor: Numeric,
  rules?: RoundingRules,
): decimal {
  const [quotient] = divRem(
    dividend,
    divisor,
    normalizeRoundingRules(rules, HALF_EVEN, 34),
  )
  return quotient
}

/**
 * Divide and remainder
 *
 * Divides two numeric values to a given number of decimal places or to a specified
 * precision, returning both the quotient and the remainder while satisfying the two
 * conditions:
 *
 *   - `dividend = divisor * quotient + remainder`
 *   - `abs(remainder) < abs(divisor)`.
 *
 * However, multiple quotient and remainder pairs satisfy these conditions. A choice
 * of the sign of the remainder (via `RoundingMode`) and precision of the quotient
 * can be provided via `rules`.
 *
 * All rounding modes may be used and these conditions will be satisfied.
 *
 * Result of dividing 10 by 3 with different signs and some rounding modes:
 *
 * | Example            | Note
 * | ------------------ | ---------------
 * | `divRem(10, 3, { mode: "down" }) === [ "3", "1" ]` | The remainder has the same sign as the dividend
 * | `divRem(10, -3, { mode: "down" }) === [ "-3", "1" ]` | "down" is the default rounding mode
 * | `divRem(-10, 3, { mode: "down" }) === [ "-3", "-1" ]` |
 * | `divRem(-10, -3, { mode: "down" }) === [ "3", "-1" ]` |
 * | `divRem(10, 3, { mode: "floor" }) === [ "3", "1" ]` | The remainder has the same sign as the divisor
 * | `divRem(10, -3, { mode: "floor" }) === [ "-4", "-2" ]` |
 * | `divRem(-10, 3, { mode: "floor" }) === [ "-4", "2" ]` |
 * | `divRem(-10, -3, { mode: "floor" }) === [ "3", "-1" ]` |
 * | `divRem(10, 3, { mode: "euclidean" }) === [ "3", "1" ]` | The remainder is always positive
 * | `divRem(10, -3, { mode: "euclidean" }) === [ "-3", "1" ]` |
 * | `divRem(-10, 3, { mode: "euclidean" }) === [ "-4", "2" ]` |
 * | `divRem(-10, -3, { mode: "euclidean" }) === [ "4", "2" ]` |
 *
 * @category Arithmetic
 */
export function divRem(
  dividend: Numeric,
  divisor: Numeric,
  rules?: RoundingRules,
): [quotient: decimal, remainder: decimal] {
  const [signA, digitsA, scaleA, precisionA] = deconstruct(dividend)
  const [signB, digitsB, scaleB, precisionB] = deconstruct(divisor)
  rules = normalizeRoundingRules(rules, DOWN)

  // If the divisor is zero, throw an error.
  if (!signB) {
    error("DIV_ZERO", `${dividend}/${divisor}`)
  }

  // If the dividend is zero, the result is always zero, regardless of any
  // rounding rules. This is important for performance and correctness since
  // the long-division algorithm below assumes dividend is non-zero.
  if (!signA) {
    return [ZERO, ZERO]
  }

  // The resulting scale of a division is the difference between the
  // scales of the dividend and divisor.
  const sign = (signA * signB) as Sign
  const scale = scaleA - scaleB

  // Determine the desired rounding mode and precision.
  let roundingMode = rules[MODE]
  let roundingPrecision = getRoundingPrecision(rules, scale)

  // Collect the digits of the quotient.
  let quotientDigits = ""

  // Remainder is a mutable list of digits, starting as a copy of the dividend
  // (a) which is at least as long as the divisor (b).
  let remainderLength = precisionB > precisionA ? precisionB : precisionA
  const remainderDigitsArray: number[] = []
  for (let i = remainderLength; i--; ) {
    remainderDigitsArray[i] = +(digitsA[i] || 0)
  }

  // The most significant digit of the remainder.
  let msd = 0

  // Compute digits of the quotient by repeatedly subtracting the divisor from
  // each place of the dividend while:
  let place = 0
  let digit = 0
  for (
    ;
    // The total number of digits are not yet at the desired precision,
    place < roundingPrecision &&
    // and not all places of dividend have been divided or there is a remainder.
    (place <= precisionA - precisionB || msd < place + precisionB - 1);
    place++
  ) {
    // Append a zero to the remainder if necessary.
    if (remainderLength < place + precisionB) {
      remainderDigitsArray[remainderLength++] = 0
    }

    // Count how many times divisor (b) can be subtracted from remainder at the
    // current place (between 0 and 9 times).
    digit = -1
    countSubtractions: while (digit++ < 9) {
      // If the divisor cannot be subtracted from the remainder at the
      // current place (because the remainder is less than the divisor),
      // then stop counting subtractions.
      if (msd >= place) {
        for (let i = -1, difference = 0; !difference && ++i < precisionB; ) {
          difference = remainderDigitsArray[place + i] - +digitsB[i]
          if (difference < 0) {
            break countSubtractions
          }
        }
      }

      // Subtract at this location
      for (let i = place + precisionB; i-- > place; ) {
        remainderDigitsArray[i] -= +(digitsB[i - place] || 0)
        if (remainderDigitsArray[i] < 0) {
          remainderDigitsArray[i] += 10
          remainderDigitsArray[i - 1] -= 1
        }
      }

      // Then update the location of the most significant digit of the remainder.
      while (remainderDigitsArray[msd] === 0) {
        msd++
      }
    }

    // If precision was directly specified and the first digit is 0, then
    // 1 additional digit is necessary to reach the desired precision.
    if (place === 0 && digit === 0 && rules[PRECISION] != null) {
      roundingPrecision++
    }

    // Append this digit to the result.
    quotientDigits += digit
  }

  // Determine the quotient and remainder from the resulting digits.
  let remainderDigits = remainderDigitsArray.join("")
  let quotient = construct(sign, quotientDigits, scale)
  let remainder = construct(signA, remainderDigits, scaleA)

  // If there is a remainder, consider the provided rounding rule.
  if (remainder !== ZERO) {
    roundingMode = normalizeRoundingMode(roundingMode, sign, signA, digit)

    if (roundingMode === EXACT) {
      error("INEXACT", `${dividend}/${divisor}`)
    }

    // Determine whether to round up the quotient. This is trivial for whole
    // rounding modes, however half rounding modes need to compare the remainder
    // to the midpoint of the divisor, treating exactly the midpoint specially.
    let shouldRoundUp = roundingMode === UP
    if (roundingMode === HALF_UP || roundingMode === HALF_DOWN) {
      const midpointCmp = cmp(
        mul(2, remainderDigits as decimal),
        digitsB as decimal,
      )
      shouldRoundUp =
        roundingMode === HALF_UP ? midpointCmp >= 0 : midpointCmp > 0
    }

    if (shouldRoundUp) {
      // In order to "round up" the absolute value of the quotient, add 1 to the
      // least significant digit. Then subtract one additional dividend from the
      // remainder at the same scale.
      quotient = add(quotient, construct(sign, "1", scale - place + 1))
      remainder = sub(remainder, construct(signA, digitsB, scaleA - place + 1))
    }
  }

  return [quotient, remainder]
}

/**
 * Divide to integer
 *
 * Returns the integer result of dividing `dividend` by `divisor` using
 * truncated (round `"down"`) division by default.
 *
 * The remainder can be found using `rem()`. If you need both the quotient and
 * the remainder, use `divRem()`.
 *
 * @see rem
 * @see divRem
 * @category Arithmetic
 */
export function divInt(
  dividend: Numeric,
  divisor: Numeric,
  rules?: RoundingRules,
): decimal {
  const [quotient] = divRem(dividend, divisor, rules)
  return quotient
}

/**
 * Remainder (%)
 *
 * Returns the remainder of dividing `dividend` by `divisor` using truncated
 * (round `"down"`) division by default. The result always has the same sign as
 * the first argument (or 0). Used as the replacement of the remainder (%), aka
 * modulo, operator.
 *
 * Note that `rem()` and `div()` use different default division rounding rules
 * and should not be used together. The quotient can be found using `divInt()`
 * instead. If you need both the quotient and the remainder, use `divRem()`.
 *
 * @equivalent dividend % divisor
 * @see divInt
 * @see divRem
 * @category Arithmetic
 */
export function rem(
  dividend: Numeric,
  divisor: Numeric,
  rules?: RoundingRules,
): decimal {
  const [, remainder] = divRem(dividend, divisor, rules)
  return remainder
}

/**
 * Modulo
 *
 * Returns the modulo of dividing a by b using floored (round "floor") division.
 * The result always has the same sign as the second argument (or 0).
 *
 * This is not the same as the % (remainder) operator. Use `rem()` for an equivalent
 * to `%`.
 *
 * @equivalent ((a % b) + b) % b
 * @see rem
 * @category Arithmetic
 */
export function mod(a: Numeric, b: Numeric): decimal {
  return rem(a, b, { mode: FLOOR })
}

/**
 * Power (Exponent)
 *
 * Raises `base` to the power `exponent`, where `exponent` must be a non-negative
 * integer.
 *
 * @equivalent Math.pow(base, exponent)
 * @category Arithmetic
 */
export function pow(base: Numeric, exponent: Numeric): decimal {
  let baseToPowerOf2 = decimal(base)
  let result = "1" as decimal

  let exponentInt = expectInt("exponent", exponent)
  if (exponentInt < 0) {
    error("NOT_POS", `exponent: ${exponent}`)
  }

  // Iterate through the bits of exponent
  while (exponentInt) {
    // If a bit is set, multiply the result by that power of two.
    if (exponentInt & 1) {
      result = mul(result, baseToPowerOf2)
    }
    // Shift the exponent to align the next bit and if any bits are still set,
    // square to get the next power of two.
    if ((exponentInt >>= 1)) {
      baseToPowerOf2 = mul(baseToPowerOf2, baseToPowerOf2)
    }
  }

  return result
}

/**
 * Square root
 *
 * Returns the square root of `value` as a `decimal`.
 *
 * Defaults to 34 digits of precision using the `"half even"` rounding
 * mode, configurable by providing rounding `rules`.
 *
 * @equivalent Math.sqrt(value)
 * @category Arithmetic
 */
export function sqrt(value: Numeric, rules?: RoundingRules): decimal {
  let [sign, digits, scale, precision] = deconstruct(value)

  // Negative number
  if (sign < 0) {
    error("SQRT_NEG", value)
  }

  // Sqrt 0 -> 0
  if (!sign) {
    return ZERO
  }

  rules = normalizeRoundingRules(rules, HALF_EVEN, 34)
  const iterationPrecision = getRoundingPrecision(rules, scale)

  // Start with an estimated result using floating point sqrt based on the idea
  // that the result is independent of original value's scale as long as it
  // is the same parity.
  const estimate = Math.sqrt(+(digits + ((precision + scale) & 1 ? "" : "0")))
  digits = (estimate == 1 / 0 ? "5" : deconstruct(estimate)[1]).slice(
    0,
    iterationPrecision,
  )
  let result = construct(
    1,
    digits,
    (((scale + 1) / 2) | 0) - +(scale < 0 || scale & 1),
  )

  // Use Newton's method to generate and confirm additional precision.
  let prevDigits = digits
  do {
    result = mul(
      0.5,
      add(result, div(value, result, { precision: iterationPrecision + 4 })),
    )
    prevDigits = digits
    digits = deconstruct(result)[1].slice(0, iterationPrecision)
  } while (prevDigits !== digits)

  // Round the final result
  return round(result, rules)
}

// Comparison

/**
 * Equals (==)
 *
 * Compares two numeric values and returns true if they are equivalent.
 *
 * @equivalent a == b
 * @category Comparison
 */
export function eq(a: Numeric, b: Numeric): boolean {
  return cmp(a, b) === 0
}

/**
 * Greater than (>)
 *
 * Compares two numeric values and returns true if a is greater than b.
 *
 * @equivalent a > b
 * @category Comparison
 */
export function gt(a: Numeric, b: Numeric): boolean {
  return cmp(a, b) === 1
}

/**
 * Greater than or equals (≥)
 *
 * Compares two numeric values and returns true if a is greater than or equal to b.
 *
 * @equivalent a >= b
 * @category Comparison
 */
export function gte(a: Numeric, b: Numeric): boolean {
  return cmp(a, b) !== -1
}

/**
 * Less than (<)
 *
 * Compares two numeric values and returns true if a is less than b.
 *
 * @equivalent a < b
 * @category Comparison
 */
export function lt(a: Numeric, b: Numeric): boolean {
  return cmp(a, b) === -1
}

/**
 * Less than or equals (≤)
 *
 * Compares two numeric values and returns true if a is less than or equal to b.
 *
 * @equivalent a <= b
 * @category Comparison
 */
export function lte(a: Numeric, b: Numeric): boolean {
  return cmp(a, b) !== 1
}

/**
 * Compare
 *
 * Compares two numeric values and returns `1` if a is greater than b, `-1` if b
 * is greater than a, and `0` if a and b are equivalent.
 *
 * This is equivalent to, but much faster than, `sign(sub(a, b))`.
 *
 * @equivalent a > b ? 1 : a < b ? -1 : 0
 * @category Comparison
 */
export function cmp(a: Numeric, b: Numeric): 1 | -1 | 0 {
  // Cheap equality check
  if (a === b) return 0

  const [signA, digitsA, scaleA, precisionA] = deconstruct(a)
  const [signB, digitsB, scaleB, precisionB] = deconstruct(b)

  return (
    // If a is zero, return the opposite of b's sign.
    (
      !signA
        ? -signB | 0
        : // If b is zero, or the signs differ, return a's sign.
          !signB || signA !== signB
          ? signA
          : // Otherwise they are the same sign, so compare absolute values and flip if negative.
            (cmpAbs(digitsA, scaleA, precisionA, digitsB, scaleB, precisionB) *
              signA) |
            0
    ) as Sign
  )
}

/**
 * Compares two normalized absolute values
 *
 * @internal
 * @category Comparison
 */
function cmpAbs(
  digitsA: string,
  scaleA: number,
  precisionA: number,
  digitsB: string,
  scaleB: number,
  precisionB: number,
): Sign {
  if (scaleA !== scaleB) return scaleA > scaleB ? 1 : -1
  for (
    let i = -1, j = precisionA < precisionB ? precisionA : precisionB;
    ++i < j;

  ) {
    if (digitsA[i] !== digitsB[i]) return digitsA[i] > digitsB[i] ? 1 : -1
  }
  return precisionA === precisionB ? 0 : precisionA > precisionB ? 1 : -1
}

// Magnitude

/**
 * Absolute value
 *
 * Returns a decimal with the same value but always positive.
 *
 * @equivalent Math.abs(value)
 * @category Magnitude
 */
export function abs(value: Numeric): decimal {
  const [, digits, scale] = deconstruct(value)
  return construct(1, digits, scale)
}

/**
 * Negate
 *
 * Returns a decimal with the same value but an opposite sign.
 *
 * @equivalent -value
 * @category Magnitude
 */
export function neg(value: Numeric): decimal {
  const [sign, digits, scale] = deconstruct(value)
  return construct(-sign as Sign, digits, scale)
}

/**
 * Sign
 *
 * Returns a number indicating the sign of the provided value. A `1` for
 * positive values, `-1` for negative, or `0` for zero (Decimal does not represent negative zero).
 *
 * @equivalent Math.sign(value)
 * @category Magnitude
 */
export function sign(value: Numeric): 1 | -1 | 0 {
  const [sign] = deconstruct(value)
  return sign
}

/**
 * Number of decimal places
 *
 * Returns the number of significant digits after the decimal point.
 *
 * @category Magnitude
 */
export function places(value: Numeric): number {
  const [, , scale, precision] = deconstruct(value)
  const places = precision - scale - 1
  return places > 0 ? places : 0
}

/**
 * Number of digits
 *
 * Returns the number of significant digits of the provided value.
 *
 * @category Magnitude
 */
export function precision(value: Numeric): number {
  const [, , , precision] = deconstruct(value)
  return precision
}

/**
 * Order of magnitude
 *
 * Returns the scale, or order of magnitude, of the provided value.
 * Equivalent to the exponent when the value is printed with `toExponential()`.
 *
 * @category Magnitude
 */
export function scale(value: Numeric): number {
  const [, , scale] = deconstruct(value)
  return scale
}

/**
 * Move decimal point
 *
 * Returns the value with the decimal point moved to the right by the given number
 * of places; negative values move it to the left.
 *
 * This is equivalent to, but much faster than,
 * `mul(value, pow(10, places))`.
 *
 * @equivalent value * Math.pow(10, places)
 * @category Magnitude
 */
export function movePoint(value: Numeric, places: Numeric): decimal {
  const [sign, digits, scale] = deconstruct(value)
  return construct(sign, digits, scale + expectInt("places", places))
}

// Rounding

/**
 * Round
 *
 * Rounds a numeric value according to the provided `RoundingRules`, defaulting
 * to `{ places: 0, mode: "half even" }`.
 *
 * The default `"half even"` rounding mode is different from the behavior
 * of JavaScript's `Math.round()` which uses `"half ceil"`. It is also
 * different from many other languages round() function which most typically
 * use `"half up"`. These or any other rounding mode may be provided to match
 * this behavior. For example, to match `Math.round()`:
 *
 * ```
 * round(value, { mode: "half ceil" })
 * ```
 *
 * @equivalent Math.round(value)
 * @category Rounding
 */
export function round(value: Numeric, rules?: RoundingRules): decimal {
  let [rounded] = roundRem(value, rules)
  return rounded
}

/**
 * Round and remainder
 *
 * Rounds a numeric value according to the provided `RoundingRules`, defaulting
 * to `{ places: 0, mode: "half even" }`.
 *
 * @category Rounding
 */
export function roundRem(
  value: Numeric,
  rules?: RoundingRules,
): [rounded: decimal, remainder: decimal] {
  let [sign, digits, scale, precision] = deconstruct(value)
  let roundingRules = normalizeRoundingRules(rules, HALF_EVEN)

  // Zero always rounds to zero
  if (!sign) {
    return [ZERO, ZERO]
  }

  // Determine the desired rounding mode and precision.
  let roundingMode = roundingRules[MODE]
  let roundingPrecision = getRoundingPrecision(roundingRules, scale)

  // Start the rounded value as a truncated value to the desired precision.
  let slicePoint = roundingPrecision > 0 ? roundingPrecision : 0
  let rounded = construct(sign, digits.slice(0, slicePoint), scale)
  let remainder = construct(sign, digits.slice(slicePoint), scale - slicePoint)

  // Only round if the rounded precision is less than the original precision.
  if (roundingPrecision < precision) {
    roundingMode = normalizeRoundingMode(
      roundingMode,
      sign,
      sign,
      +(digits[roundingPrecision - 1] || 0),
    )

    if (roundingMode === EXACT) {
      error("INEXACT", `round ${value}`)
    }

    const roundingDigit = +(digits[roundingPrecision] || 0)
    if (
      // A half up mode found the subsequent digit to be 5 or greater
      roundingMode === HALF_UP
        ? roundingDigit > 4
        : // A half down mode found the subsequent digit to be greater than 5, or 5 with additional digits
          roundingMode === HALF_DOWN
          ? roundingDigit > 5 ||
            (roundingDigit === 5 && precision > roundingPrecision + 1)
          : // The rounding mode is up and the value is non-zero
            roundingMode === UP && sign
    ) {
      // Round up by adding one to the the least significant digit of the absolute value
      // and subtracting one from the remainder.
      let roundBy = construct(sign, "1", scale - roundingPrecision + 1)
      rounded = add(rounded, roundBy)
      remainder = sub(remainder, roundBy)
    }
  }

  return [rounded, remainder]
}

/**
 * Floor
 *
 * Rounds down to the nearest whole number in the direction of `-Infinity`.
 *
 * Equivalent to `round(value, { mode: "floor" })`
 *
 * @equivalent Math.floor(value)
 * @see round
 * @category Rounding
 */
export function floor(value: Numeric): decimal {
  return round(value, { mode: FLOOR })
}

/**
 * Ceiling
 *
 * Rounds up to the nearest whole number in the direction of `Infinity`.
 *
 * Equivalent to `round(value, { mode: "ceil" })`
 *
 * @equivalent Math.ceil(value)
 * @see round
 * @category Rounding
 */
export function ceil(value: Numeric): decimal {
  return round(value, { mode: CEIL })
}

/**
 * Truncate to integer
 *
 * Returns the integer part of a number by rounding to the nearest whole number
 * in the direction of 0, also known as truncation.
 *
 * Equivalent to `round(value, { mode: "down" })`
 *
 * @equivalent Math.trunc(value)
 * @see round
 * @category Rounding
 */
export function int(value: Numeric): decimal {
  return round(value, { mode: DOWN })
}

/**
 * Integer and fractional parts
 *
 * Returns the integer and fractional parts of a number by rounding to the nearest
 * whole number in the direction of 0 and including the remainder.
 *
 * @see roundRem
 * @category Rounding
 */
export function intFrac(
  value: Numeric,
): [integer: decimal, fractional: decimal] {
  return roundRem(value, { mode: DOWN })
}

/**
 * Maximum
 *
 * Returns the maximum of the provided values as a decimal.
 *
 * @equivalent Math.max(...values)
 * @category Rounding
 */
export function max(...values: Numeric[]): decimal
export function max(): decimal {
  return extremum(arguments, 1)
}

/**
 * Minimum
 *
 * Returns the minimum of the provided values as a decimal.
 *
 * @equivalent Math.min(...values)
 * @category Rounding
 */
export function min(...values: Numeric[]): decimal
export function min(): decimal {
  return extremum(arguments, -1)
}

/**
 * @internal
 */
function extremum(values: IArguments, direction: number): decimal {
  let value = decimal(values[0])
  for (let i = 1; i < values.length; i++) {
    let arg = decimal(values[i])
    if (cmp(arg, value) === direction) {
      value = arg
    }
  }
  return value
}

/**
 * Constrain
 *
 * Constrains `value` between `low` and `high` values.
 *
 * @equivalent value < low ? low : value > high ? high : value
 * @category Rounding
 */
export function clamp(value: Numeric, low: Numeric, high: Numeric): decimal {
  return min(high, max(low, value))
}

/**
 * Configure rounding
 *
 * @category Rounding
 */
export interface RoundingRules {
  /**
   * Decimal places
   *
   * The number of decimal places to round to. A negative value for `places`
   * rounds to higher integer places. Only one of `places` or `precision` can be
   * provided.
   *
   * For most functions, the default is `0`, rounding to an integer whole number.
   */
  places?: Numeric

  /**
   * Significant figures
   *
   * Rounds a result to contain this number of significant digits. Only one of
   * `places` or `precision` can be provided.
   */
  precision?: Numeric

  /**
   * Rounding mode
   *
   * If a result needs to be rounded to meet the expected number of decimal
   * places or significant digits, the rounding mode determines which direction
   * to round towards.
   *
   * The default rounding mode, unless stated otherwise, is `"half even"`.
   */
  mode?: RoundingMode
}

/**
 * Round method
 *
 * An enum of possible ways to perform rounding.
 *
 * @category Rounding
 */
export type RoundingMode =
  /**
   * Round up
   *
   * Rounds a result up, away from zero, to the value with a larger
   * absolute value.
   */
  | "up"

  /**
   * Round down
   *
   * Rounds a result down, towards zero, to the value with a smaller
   * absolute value.
   */
  | "down"

  /**
   * Ceiling
   *
   * Rounds a result up, towards `Infinity`, to the value with the larger
   * signed value.
   */
  | "ceil"

  /**
   * Floor
   *
   * Rounds a result down, towards `-Infinity`, to the value with the smaller
   * signed value.
   */
  | "floor"

  /**
   * Round half up
   *
   * Rounds a result towards the nearest neighboring value, otherwise `"up"` if
   * exactly between the two.
   */
  | "half up"

  /**
   * Round half down
   *
   * Rounds a result towards the nearest neighboring value, otherwise `"down"`
   * if exactly between the two.
   */
  | "half down"

  /**
   * Round half ceiling
   *
   * Rounds a result towards the nearest neighboring value, otherwise `"ceil"`
   * if exactly between the two.
   */
  | "half ceil"

  /**
   * Round half floor
   *
   * Rounds a result towards the nearest neighboring value, otherwise `"floor"`
   * if exactly between the two.
   */
  | "half floor"

  /**
   * Round half towards even
   *
   * Rounds a result towards the nearest neighboring value, otherwise towards
   * the value with an even least significant digit if exactly between the two.
   *
   * This is particularly useful to avoid aggregate bias when adding together
   * multiple rounded values as there is an equal chance of rounding up or down.
   */
  | "half even"

  /**
   * Euclidean division
   *
   * When used with division, produces a result where the remainder is always a
   * positive value, regardless of the signs of the dividend or divisor.
   *
   * This is particularly useful when provided to `rem()` to create a version
   * of modulo which always results in a positive number, which is the
   * [typical mathematical definition](https://en.wikipedia.org/wiki/Modulo_operation#Variants_of_the_definition)
   * even though most programming languages offer different definitions.
   *
   * When used with rounding, this is an alias for `"floor"`.
   */
  | "euclidean"

  /**
   * Assert exact result
   *
   * Asserts that applying the provided rounding rules would not result in a
   * rounded value, otherwise throws a `"INEXACT"` error.
   *
   * This is particularly useful to ensure a set of operations remains within
   * an expected precision or decimal places, or that division does not result
   * in a non-terminating repeating decimal.
   */
  | "exact"

/**
 * Given rounding rules, a number's scale, and a default, produce a rounding
 * precision and mode. If there are problems with rounding rules, throw an Error.
 *
 * @internal
 */
function normalizeRoundingRules(
  rules: RoundingRules | undefined,
  defaultMode: RoundingMode,
  defaultPrecision?: number,
): RoundingRules {
  let precision = rules && rules[PRECISION]
  let places = rules && rules[PLACES]
  let mode = (rules && rules[MODE]) || defaultMode
  let isValidMode
  let validModes = [
    UP,
    DOWN,
    CEIL,
    FLOOR,
    EUCLIDEAN,
    HALF_UP,
    HALF_DOWN,
    HALF_CEIL,
    HALF_FLOOR,
    HALF_EVEN,
    EXACT,
  ]

  if (places != null) {
    if (precision != null) {
      error("NOT_BOTH", `${PLACES}: ${places}, ${PRECISION}: ${precision}`)
    }
    places = expectInt(PLACES, places)
  } else {
    precision =
      precision != null ? expectInt(PRECISION, precision) : defaultPrecision
  }

  // indexOf() or find() would work, however neither are available in ES3.
  for (const i in validModes) {
    // @ts-ignore
    isValidMode |= validModes[i] == mode
  }
  if (!isValidMode) {
    error("NOT_MODE", mode)
  }

  return { precision, places, mode }
}

/**
 * Given rounding rules an a normalized scale, return the desired precision.
 *
 * @internal
 */
function getRoundingPrecision(rules: RoundingRules, scale: number): number {
  return rules[PRECISION] != null
    ? toNumber(rules[PRECISION] as Numeric)
    : toNumber(rules[PLACES] || 0) + scale + 1
}

/**
 * Normalize the rounding mode based on sign and other contextual information
 * to reduce the possible rounding modes to five (up, down, half up, half down,
 * and exact) which apply to the absolute value of rounded value.
 *
 * @internal
 */
function normalizeRoundingMode(
  roundingMode: RoundingMode | undefined,
  sign: number,
  dividendSign: number,
  leastSignificantDigit: number,
): "up" | "down" | "half up" | "half down" | "exact" | undefined {
  // prettier-ignore
  return (
    roundingMode === CEIL ? sign < 0 ? DOWN : UP
    : roundingMode === FLOOR ? sign < 0 ? UP : DOWN
    // Euclidean division results in rounding the quotient up or down depending
    // on the sign of dividend rather than the quotient, ensuring the remainder
    // will always be positive. When used with round(), the sign of the rounded
    // value is used such that "euclidean" is an alias for "floor".
    : roundingMode === EUCLIDEAN ? dividendSign < 0 ? UP : DOWN
    : roundingMode === HALF_CEIL ? sign < 0 ? HALF_DOWN : HALF_UP
    : roundingMode === HALF_FLOOR ? sign < 0 ? HALF_UP : HALF_DOWN
    // Half even rounds towards the next even value. This is determined by
    // looking at the whether the least significant digit is even and rounding
    // "half up" or "half down" accordingly.
    : roundingMode === HALF_EVEN ? leastSignificantDigit % 2 ? HALF_UP : HALF_DOWN
    : roundingMode
  )
}

// Et cetera

/**
 * Numeric → number
 *
 * Converts a `Numeric` value (including `decimal`) to a JavaScript number.
 *
 * Throws an `"INEXACT"` Error if converting the value would lead to a loss
 * of precision. To convert to a number while allowing precision loss, use the
 * native `Number(value)` function.
 *
 * @category Et cetera
 */
export function toNumber(value: Numeric): number {
  const canonical = decimal(value)
  if (decimal(+canonical) !== canonical) {
    error("INEXACT", `toNumber(${value})`)
  }
  return +canonical
}

/**
 * Fixed notation
 *
 * A string representation of the provided Numeric `value` using fixed notation.
 * Uses `rules` to set `precision` or `places`, and a rounding `mode` when that
 * results in fewer digits.
 *
 * @category Et cetera
 */
export function toFixed(value: Numeric, rules?: RoundingRules): NumericString {
  return toFormat(false, value, rules)
}

/**
 * Scientific notation
 *
 * A string representation of the provided Numeric `value` using exponential
 * scientific notation. Uses `rules` to set `precision` or `places`, and a rounding
 * `mode` when that results in fewer digits.
 *
 * @category Et cetera
 */
export function toExponential(
  value: Numeric,
  rules?: RoundingRules,
): NumericString {
  // Interpret "places" relative to the final exponential notation rather than
  // the original number. In exponential scientific notation, the precision of
  // a number is always exactly one more than the number of decimal places.
  return toFormat(
    true,
    value,
    rules && rules[PLACES] != null
      ? { precision: toNumber(rules[PLACES]!) + 1, mode: rules[MODE] }
      : rules,
  )
}

/**
 * Prints a formatted string as either fixed or exponential mode according to rules.
 *
 * @internal
 */
function toFormat(
  asExponential: boolean,
  value: Numeric,
  rules?: RoundingRules,
): NumericString {
  const [sign, digits, scale, precision] = deconstruct(
    rules ? round(value, rules) : value,
  )
  const printPrecision = rules ? getRoundingPrecision(rules, scale) : precision
  const decimalPart = print(
    sign,
    digits,
    precision,
    printPrecision,
    asExponential ? 1 : scale + 1,
  )
  const exponentialPart = asExponential ? (scale < 0 ? "e" : "e+") + scale : ""
  return (decimalPart + exponentialPart) as NumericString
}

/**
 * Print a numeric string given a decomposed decimal representation.
 *
 * @internal
 */
function print(
  sign: Sign,
  digits: string,
  precision: number,
  printPrecision: number,
  decimalPoint: number,
): NumericString {
  let result = sign < 0 ? "-" : ""

  while (precision < printPrecision) {
    digits += "0"
    precision++
  }

  if (decimalPoint < 1) {
    result += "0."
    while (decimalPoint++) result += "0"
    result += digits
  } else if (decimalPoint < printPrecision) {
    result += digits.slice(0, decimalPoint) + "." + digits.slice(decimalPoint)
  } else {
    result += digits
    while (decimalPoint-- > precision) result += "0"
  }

  return result as NumericString
}

/**
 * Given an arbitrary value, attempt to convert it to a numeric string and
 * then match it against decimal numeric regex.
 *
 * Importantly, this function should not throw but instead return null (by
 * failing to match) for non-numeric values.
 *
 * @internal
 */
function parse(value: unknown): DecimalParts | null {
  return decimalRegex.exec(
    // Similar to ToNumeric() and ToPrimitive(), converts value to a primitive,
    // and booleans to a number, before converting it all to a string.
    String(
      value === true || value === false ? +value : Object(value).valueOf(),
    ),
  ) as DecimalParts | null
}

const decimalRegex = /^([-+])?(\d+|(?=\.\d))(?:\.(\d+)?)?(?:e([-+]?\d+))?$/i

type DecimalParts = [
  decimal: string,
  sign: string | undefined,
  integer: string,
  fractional: string | undefined,
  exponent: string | undefined,
]

type Sign = 1 | -1 | 0

/**
 * decimal → Elements
 *
 * Given a numeric value, deconstruct to a normalized representation of a decimal:
 * a `[sign, digits, scale, precision]` tuple.
 *
 * Functions within this library internally operate on the normalized
 * representation before converting back to a canonical decimal via
 * `construct()`. These functions are exported to enable user-defined
 * mathematical functions on the decimal type.
 *
 *  - `sign`: Either 1 for a positive number, -1 for a negative number, or 0 for 0.
 *  - `digits`: A string of significant digits expressed in scientific
 *    notation, where the first digit is the ones place, or an empty string for 0.
 *  - `scale`: The power of ten the digits are multiplied by, or 0 for 0.
 *  - `precision`: The number of digits found in digits (e.g. number of
 *    significant digits). Yes, this is redundant information with
 *    `digits.length` but it is convenient to access directly.
 *
 * @example deconstruct("-1.23e4") returns [-1, "123", 4, 3]
 * @category Et cetera
 */
export function deconstruct(
  value: unknown,
): [sign: 1 | -1 | 0, digits: string, scale: number, precision: number] {
  const parts = parse(value)
  if (!parts) {
    error("NOT_NUM", String(value))
  }
  let [, sign, integer, fractional, exponent] = parts
  return normalizeRepresentation(
    sign === "-" ? -1 : 1,
    fractional ? integer + fractional : integer,
    +(exponent || 0) + integer.length - 1,
  )
}

/**
 * Elements → decimal
 *
 * Construct a decimal from an internal representation
 *
 * Given a decimal's decomposed representation, return a canonical decimal value.
 *
 * @category Et cetera
 */
export function construct(
  sign: 1 | -1 | 0,
  digits: string,
  scale: number,
): decimal {
  const [signA, digitsA, scaleA, precisionA] = normalizeRepresentation(
    sign,
    digits,
    scale,
  )
  return print(signA, digitsA, precisionA, precisionA, scaleA + 1) as decimal
}

/**
 * Removes unnecessary leading or trailing zeros from the digits, adjusting
 * the scale and sign if necessary.
 *
 * @internal
 */
function normalizeRepresentation(
  sign: Sign,
  digits: string,
  scale: number,
): [sign: Sign, digits: string, scale: number, precision: number] {
  let precision = digits.length
  let leadingZeros = 0
  let trailingZeros = 0

  while (digits[leadingZeros] === "0") {
    leadingZeros++
    scale--
  }

  // Normalized zero
  if (leadingZeros === precision) {
    return [0, "", 0, 0]
  }

  while (digits[precision - 1 - trailingZeros] === "0") {
    trailingZeros++
  }

  if (leadingZeros || trailingZeros) {
    digits = digits.slice(leadingZeros, precision - trailingZeros)
  }

  return [sign, digits, scale, precision - leadingZeros - trailingZeros]
}

// Errors and validation

/**
 * Converts and validates a Numeric as an integer.
 *
 * @internal
 */
function expectInt(name: string, value: Numeric): number {
  if (!isInteger(value)) {
    error("NOT_INT", `${name}: ${value}`)
  }
  return toNumber(value)
}

/**
 * Throws an error with a `code` property set to `ErrorCode`.
 *
 * @internal
 */
function error(code: ErrorCode, message: unknown): never {
  const inst: any = new Error(`https://decimali.sh/#${code} ${message}`)
  inst.code = code
  throw inst
}

/**
 * Errors
 *
 * All errors thrown will include a `.code` property set to one of the possible
 * values of ErrorCode as well as a link to documentation describing the error.
 *
 * Detect this property in a catch clause to provide customized error handling
 * behavior. For example, to re-introduce `"Infinity"` as a result of division:
 *
 * ```
 * function customDivide(a: Numeric, b: Numeric): decimal | "Infinity" {
 *   try {
 *     return div(a, b)
 *   } catch (error) {
 *     if (error.code === "DIV_ZERO") {
 *       return "Infinity"
 *     }
 *     throw error
 *   }
 * }
 * ```
 *
 * @category Et cetera
 */
export type ErrorCode =
  /**
   * Not a number
   *
   * Thrown by any function when a value provided to a `Numeric` argument is not
   * numeric or finite; providing `Infinity` or `NaN` will throw this error.
   */
  | "NOT_NUM"

  /**
   * Not an integer
   *
   * Thrown when an integer was expected in an argument or property but not
   * received. For instance, the `RoundingRules.places` and
   * `RoundingRules.precision` fields require integers.
   */
  | "NOT_INT"

  /**
   * Not positive
   *
   * Thrown when a non-negative number was expected in an argument or property but
   * not received. For instance, the `exponent` in `pow()` must be a non-negative
   * integer.
   */
  | "NOT_POS"

  /**
   * Unknown rounding mode
   *
   * Thrown when a value provided to `mode` of `RoundingRules` is not one of the
   * expected options of `RoundingMode`.
   */
  | "NOT_MODE"

  /**
   * Cannot provide both
   *
   * Thrown when both `RoundingRules.places` and `RoundingRules.precision`
   * fields are simultaneously provided. Only one of these fields may be provided
   * per use.
   */
  | "NOT_BOTH"

  /**
   * Inexact result
   *
   * Thrown when an operation would return an inexact result and the provided
   * `RoundingMode` was `"exact"`.
   *
   * Also thrown by `toNumber()` when converting a `Numeric` would result in
   * loss of precision.
   *
   * @example div(1, 3, { mode: "exact" })
   */
  | "INEXACT"

  /**
   * Divide by zero
   *
   * Thrown when attempting to divide by zero, in which case there is no well
   * defined result. This behavior is different from JavaScript which may return
   * `Infinity` or `NaN`, however Decimalish does not support these non-finite
   * special values.
   */
  | "DIV_ZERO"

  /**
   * Square root of negative
   *
   * Thrown when attempting to square root a negative number, in which case
   * there is no real number result. This behavior is different from JavaScript
   * which returns `NaN`, however Decimalish does not support this special value.
   */
  | "SQRT_NEG"

// Constant keywords

// TODO: code golf whether inlining these is better for bytes
const ZERO = "0" as decimal
const PLACES = "places"
const PRECISION = "precision"
const MODE = "mode"
const UP = "up"
const DOWN = "down"
const CEIL = "ceil"
const FLOOR = "floor"
const HALF_UP = "half up"
const HALF_DOWN = "half down"
const HALF_CEIL = "half ceil"
const HALF_FLOOR = "half floor"
const HALF_EVEN = "half even"
const EUCLIDEAN = "euclidean"
const EXACT = "exact"
