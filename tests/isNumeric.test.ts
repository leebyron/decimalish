import { isNumeric } from "../decimalish"

describe("isNumeric", () => {
  it("Returns true of a number is considered Numeric", () => {
    expect(isNumeric(0n)).toBe(true)
    expect(isNumeric("0")).toBe(true)
    expect(isNumeric(0)).toBe(true)
    expect(isNumeric("123")).toBe(true)
    expect(isNumeric(123)).toBe(true)
    expect(isNumeric("-123")).toBe(true)
    expect(isNumeric(-123)).toBe(true)
    expect(isNumeric("123.0")).toBe(true)
    expect(isNumeric(123.0)).toBe(true)
    expect(isNumeric("1.23e2")).toBe(true)
    expect(isNumeric(1.23e2)).toBe(true)
    expect(isNumeric("1.23e1")).toBe(true)
    expect(isNumeric(1.23e1)).toBe(true)
    expect(isNumeric("1.23")).toBe(true)
    expect(isNumeric(1.23)).toBe(true)

    // Supported variations of number formatting
    expect(isNumeric("-123")).toBe(true)
    expect(isNumeric("+123")).toBe(true)
    expect(isNumeric("1.23E1")).toBe(true)
    expect(isNumeric("1.23E0")).toBe(true)
    expect(isNumeric("1.23E-1")).toBe(true)
    expect(isNumeric("1.23E-123")).toBe(true)
    expect(isNumeric("1.23E+123")).toBe(true)
    expect(isNumeric("1.23e+123")).toBe(true)
    expect(isNumeric("-1.23e+123")).toBe(true)
    expect(isNumeric("+1.23e+123")).toBe(true)
    expect(isNumeric(".123")).toBe(true)
    expect(isNumeric("+.123")).toBe(true)
    expect(isNumeric("-.123")).toBe(true)
    expect(isNumeric("123.")).toBe(true)
    expect(isNumeric("+123.")).toBe(true)
    expect(isNumeric("-123.")).toBe(true)
    expect(isNumeric("-123.")).toBe(true)
    expect(isNumeric("0.")).toBe(true)
    expect(isNumeric(".0")).toBe(true)

    // Outside the format
    expect(isNumeric("1.23.0")).toBe(false)
    expect(isNumeric("1.23e")).toBe(false)
    expect(isNumeric("1.23e1.2")).toBe(false)
    expect(isNumeric(".")).toBe(false)

    // Prefix and postfix
    expect(isNumeric("a1.23")).toBe(false)
    expect(isNumeric("1.23a")).toBe(false)

    // Booleans
    expect(isNumeric(true)).toBe(true)
    expect(isNumeric(false)).toBe(true)

    // Other primitives
    expect(isNumeric("abc")).toBe(false)
    expect(isNumeric(Symbol("3"))).toBe(false)
    expect(isNumeric(null)).toBe(false)
    expect(isNumeric(undefined)).toBe(false)

    // Dates are considered numeric
    expect(isNumeric(new Date())).toBe(true)

    // Objects with toString (and valueOf) that return Numeric
    expect(isNumeric({ toString: () => "3" })).toBe(true)
    expect(isNumeric({ valueOf: () => 3 })).toBe(true)
  })
})
