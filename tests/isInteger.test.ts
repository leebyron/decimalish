import { isInteger } from "../decimalish"

describe("isInteger", () => {
  it("Determines if a Numeric is an integer or not", () => {
    expect(isInteger(0n)).toBe(true)
    expect(isInteger("0")).toBe(true)
    expect(isInteger(0)).toBe(true)
    expect(isInteger("123")).toBe(true)
    expect(isInteger(123)).toBe(true)
    expect(isInteger("-123")).toBe(true)
    expect(isInteger(-123)).toBe(true)
    expect(isInteger("123.0")).toBe(true)
    expect(isInteger(123.0)).toBe(true)
    expect(isInteger("1.23e2")).toBe(true)
    expect(isInteger(1.23e2)).toBe(true)
    expect(isInteger("1.23e1")).toBe(false)
    expect(isInteger(1.23e1)).toBe(false)
    expect(isInteger("1.23")).toBe(false)
    expect(isInteger(1.23)).toBe(false)
    expect(isInteger("abc")).toBe(false)
    expect(isInteger(true)).toBe(true)
    expect(isInteger(false)).toBe(true)
  })
})
