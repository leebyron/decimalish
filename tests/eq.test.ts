import { eq } from "../decimalish"

describe("eq", () => {
  it("Compares two numeric values", () => {
    expect(eq(0, 0)).toBe(true)
    expect(eq(0, 1)).toBe(false)
    expect(eq("123", 123)).toBe(true)
    expect(eq(123, "123")).toBe(true)
    expect(eq(-123, "-123")).toBe(true)
    expect(eq("123", "-123")).toBe(false)
    expect(eq("123", 1.23e2)).toBe(true)
    expect(eq("-0", "0")).toBe(true)
    expect(eq("0", "-0")).toBe(true)
    expect(eq(0, -0)).toBe(true)
    expect(eq("123", 123n)).toBe(true)
    expect(eq(123n, "123")).toBe(true)
    expect(eq("12345678901234567890", "12345678901234567890")).toBe(true)
    // False since number cannot represent this precision
    expect(eq("12345678901234567890", 12345678901234567890)).toBe(false)
  })
})
