"use strict";
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
exports.__esModule = true;
exports.fromParts = exports.toParts = exports.sign = exports.round = exports.div = exports.mul = exports.sub = exports.add = exports.cmp = exports.lte = exports.lt = exports.gte = exports.gt = exports.eq = exports.neg = exports.abs = exports.decimal = void 0;
// Type conversion
/**
 * Converts any numeric value to a decimal.
 *
 * Throws a TypeError if the provided value cannot be translated to decimal.
 */
function decimal(value) {
    var _a = toParts(value), sign = _a[0], significand = _a[1], exponent = _a[2];
    return fromParts(sign, significand, exponent);
}
exports.decimal = decimal;
// Magnitude
/**
 * Absolute value, always positive.
 *
 * @equivalent Math.abs(value)
 */
function abs(value) {
    var _a = toParts(value), significand = _a[1], exponent = _a[2];
    return fromParts(1, significand, exponent);
}
exports.abs = abs;
/**
 * Negated value, same magnitude but opposite sign.
 *
 * @equivalent -value
 */
function neg(value) {
    var _a = toParts(value), sign = _a[0], significand = _a[1], exponent = _a[2];
    return fromParts(-sign, significand, exponent);
}
exports.neg = neg;
// Comparisons
/**
 * Compares two numeric values and returns true if they are equivalent.
 *
 * @equivalent a == b
 */
function eq(a, b) {
    return cmp(a, b) === 0;
}
exports.eq = eq;
/**
 * Compares two numeric values and returns true if a is greater than b.
 *
 * @equivalent a > b
 */
function gt(a, b) {
    return cmp(a, b) === 1;
}
exports.gt = gt;
/**
 * Compares two numeric values and returns true if a is greater than or equal to b.
 *
 * @equivalent a >= b
 */
function gte(a, b) {
    return cmp(a, b) !== -1;
}
exports.gte = gte;
/**
 * Compares two numeric values and returns true if a is less than b.
 *
 * @equivalent a < b
 */
function lt(a, b) {
    return cmp(a, b) === -1;
}
exports.lt = lt;
/**
 * Compares two numeric values and returns true if a is less than or equal to b.
 *
 * @equivalent a <= b
 */
function lte(a, b) {
    return cmp(a, b) !== 1;
}
exports.lte = lte;
/**
 * Compares two numeric values and returns 1 if a is greater than b, -1 if b is
 * greater than a, and 0 if a and b are equivalent.
 *
 * Note: This is equivalent to the sign of the difference of a and b.
 *
 * @equivalant a == b ? 0 : a > b ? 1 : -1
 */
function cmp(a, b) {
    var _a = toParts(a), signA = _a[0], significandA = _a[1], exponentA = _a[2], precisionA = _a[3];
    var _b = toParts(b), signB = _b[0], significandB = _b[1], exponentB = _b[2], precisionB = _b[3];
    // Comparison to zero or differing signs
    if (!significandA)
        return (-signB | 0);
    if (!significandB || signA !== signB)
        return signA;
    // Compare absolute value and flip if negative.
    return (cmpAbs(significandA, exponentA, precisionA, significandB, exponentB, precisionB) * signA | 0);
}
exports.cmp = cmp;
/**
 * Compares two normalized absolute values
 *
 * @internal
 */
function cmpAbs(significandA, exponentA, precisionA, significandB, exponentB, precisionB) {
    if (exponentA !== exponentB)
        return exponentA > exponentB ? 1 : -1;
    for (var i = -1, j = precisionA < precisionB ? precisionA : precisionB; ++i < j;) {
        if (significandA[i] !== significandB[i])
            return significandA[i] > significandB[i] ? 1 : -1;
    }
    return precisionA === precisionB ? 0 : precisionA > precisionB ? 1 : -1;
}
// Mathematic operations
/**
 * Adds two numeric values as a decimal result.
 *
 * @equivalent a + b
 */
function add(a, b) {
    var _a = toParts(a), signA = _a[0], significandA = _a[1], exponentA = _a[2], precisionA = _a[3];
    var _b = toParts(b), signB = _b[0], significandB = _b[1], exponentB = _b[2], precisionB = _b[3];
    // Result normalized form
    var sign = signA;
    var significand;
    var exponent = exponentA > exponentB ? exponentA : exponentB;
    // Operate right to left starting from the most precise digit
    var pos = precisionA - exponentA > precisionB - exponentB ? precisionA - exponentA : precisionB - exponentB;
    var digits = new Array(pos + exponent);
    var result = 0;
    // If the operands have the same sign, add the significands.
    if (signA === signB) {
        while (pos-- > -exponent) {
            result += +(significandA[pos + exponentA] || 0) + +(significandB[pos + exponentB] || 0);
            digits[pos + exponent] = result % 10;
            result = result > 9 ? 1 : 0;
        }
        significand = digits.join('');
        // Prepend the final sum's carried-over result.
        if (result) {
            significand = result + significand;
            exponent++;
        }
        // Otherwise, the signs differ; subtract the significands.
    }
    else {
        // Compare the absolute values of A and B to ensure the smaller is
        // subtracted from the larger.
        var direction = cmpAbs(significandA, exponentA, precisionA, significandB, exponentB, precisionB);
        // If the two numbers are equivalent (A == B), then: A - B == 0
        if (direction === 0) {
            return '0';
        }
        // Correct the resulting sign for the subtraction direction.
        sign = (sign * direction);
        while (pos-- > -exponent) {
            result += 10 + direction * (+(significandA[pos + exponentA] || 0) - +(significandB[pos + exponentB] || 0));
            digits[pos + exponent] = result % 10;
            result = result > 9 ? 0 : -1;
        }
        significand = digits.join('');
    }
    return fromParts(sign, significand, exponent);
}
exports.add = add;
/**
 * Subtracts the numeric b from the numeric a, returning a decimal result.
 *
 * @equivalent a - b
 */
function sub(a, b) {
    // a - b is equivalent to a + -b
    return add(a, neg(b));
}
exports.sub = sub;
/**
 * Multiplies two numeric values as a decimal result.
 *
 * @equivalent a * b
 */
function mul(a, b) {
    var _a = toParts(a), signA = _a[0], significandA = _a[1], exponentA = _a[2], precisionA = _a[3];
    var _b = toParts(b), signB = _b[0], significandB = _b[1], exponentB = _b[2], precisionB = _b[3];
    var digits = new Array(precisionA + precisionB);
    var result = 0;
    for (var i = precisionA; i--;) {
        result = 0;
        for (var j = precisionB; j--;) {
            result += (digits[i + j + 1] || 0) + +(significandA[i] || 0) * +(significandB[j] || 0);
            digits[i + j + 1] = result % 10;
            result = result / 10 | 0;
        }
        digits[i] = result;
    }
    return fromParts((signA * signB), digits.join(''), exponentA + exponentB + 1);
}
exports.mul = mul;
function div(a, b, roundingRules) {
    var _a;
    var _b = toParts(a), signA = _b[0], significandA = _b[1], exponentA = _b[2], precisionA = _b[3];
    var _c = toParts(b), signB = _c[0], significandB = _c[1], exponentB = _c[2], precisionB = _c[3];
    if (!significandB)
        throw new TypeError('Divide by 0');
    if (!significandA)
        return '0';
    var exponent = exponentA - exponentB;
    // TODO factor out validating and determining precision as a function of rules and exponent
    var maxPrecision = ((_a = roundingRules === null || roundingRules === void 0 ? void 0 : roundingRules.precision) !== null && _a !== void 0 ? _a : (((roundingRules === null || roundingRules === void 0 ? void 0 : roundingRules.places) || 0) + exponent)) + 1;
    // Remainder is a mutable list of digits, starting as a copy of the dividend (a).
    var remainder = [];
    for (var i = 0; i < precisionA; i++) {
        remainder[i] = +significandA[i];
    }
    var digits = [];
    var place = 0;
    // most significant digit of the remainder. Incremented as leading zeros are produced
    var msd = 0;
    // TODO:
    // repeat either until 1 more digit than the desired precision is reached,
    //            or until all digits of a are used and the remainder is 0
    while (true) {
        // Count how many times divisor (b) can be subtracted from remainder at the
        // current place.
        var digit = 0;
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
    return fromParts((signA * signB), digits.join(''), exponent);
}
exports.div = div;
var roundingMode = {
    'up': 1,
    'down': 2,
    'ceiling': 3,
    'floor': 4,
    'half up': 5,
    'half down': 6,
    'half even': 7,
    'unnecessary': 8
};
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
function round(value, rules) {
    var _a = toParts(value), sign = _a[0], significand = _a[1], exponent = _a[2];
    // // TODO: validate and throw TypeError if necessary
    // const mode = roundingMode[rules?.mode] || 3
    // // TODO: this could result in "negative precision" eg round(5, -2) === 100
    // // Expressed as "precision" this only makes sense for positive values.
    // // Maybe this can be explained as removing precision from a value?
    // // eg {precision:0} will take any value and round it to the next higher power:
    // // round(789, { precision: 0 }) === 1000
    // const precision = rules?.precision ?? ((rules?.places || 0) + exponent)
    return fromParts(sign, significand, exponent);
}
exports.round = round;
var decimalRegex = /^([-+])?(?:(\d+)|(?=\.\d))(?:\.(\d+)?)?(?:e([-+]?\d+))?$/i;
/**
 * Returns a positive or negative 1 indicating the sign of the provided number.
 * If the provided number is 0, it will return 0. Note that decimal does not
 * represent negative zero.
 *
 * @equivalent Math.sign(value)
 */
function sign(value) {
    var sign = toParts(value)[0];
    return sign;
}
exports.sign = sign;
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
function toParts(value) {
    var match = decimalRegex.exec('' + value);
    if (!match)
        throw new TypeError("Expected a numeric string: " + value);
    var signStr = match[1], _a = match[2], integer = _a === void 0 ? '' : _a, _b = match[3], fractional = _b === void 0 ? '' : _b, _c = match[4], exponentStr = _c === void 0 ? '0' : _c;
    return normalizeParts(signStr === '-' ? -1 : 1, integer + fractional, +exponentStr + integer.length - 1);
}
exports.toParts = toParts;
/**
 * Given a decimal's three parts, produce a canonical decimal value.
 */
function fromParts(sign, significand, exponent) {
    var _a;
    // Some mathematical algorithms may leave insignificant zeros in the
    // significand. Normalize the parts before printing a canonical decimal value.
    var precision;
    _a = normalizeParts(sign, significand, exponent), sign = _a[0], significand = _a[1], exponent = _a[2], precision = _a[3];
    var result = sign < 0 ? '-' : '';
    if (!significand) {
        result = '0';
    }
    else if (exponent < 0) {
        result += '0.';
        while (++exponent)
            result += '0';
        result += significand;
    }
    else {
        if (++exponent < precision) {
            result += significand.slice(0, exponent) + '.' + significand.slice(exponent);
        }
        else {
            result += significand;
            while (exponent-- > precision)
                result += '0';
        }
    }
    return result;
}
exports.fromParts = fromParts;
/**
 * Removes unnecessary leading or trailing zeros from the significand, adjusting
 * the exponent and sign if necessary.
 *
 * @internal
 */
function normalizeParts(sign, significand, exponent) {
    var precision = significand.length;
    var leadingZeros = 0;
    var trailingZeros = 0;
    while (significand[leadingZeros] === '0') {
        leadingZeros++;
        exponent--;
    }
    while (significand[precision - 1 - trailingZeros] === '0') {
        trailingZeros++;
    }
    if (leadingZeros || trailingZeros) {
        significand = significand.slice(leadingZeros, precision - trailingZeros);
    }
    if (!significand) {
        sign = 0;
        exponent = 0;
    }
    return [sign, significand, exponent, precision - leadingZeros - trailingZeros];
}
