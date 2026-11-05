import { decimal, isDecimal } from "../decimalish"
describe("canonical decimal validation", () => {
  it("agrees with normalization for numeric strings", () => {
    for (const value of [
      "0",
      "-0",
      "+0",
      "000",
      "0.1",
      "-0.01",
      "1",
      "10",
      "100.01",
      "1.0",
      "01",
      "1.",
      ".1",
      "1e3",
      "1e-3",
      "-123.456",
      "001.200",
    ]) {
      expect(isDecimal(value)).toBe(decimal(value) === value)
    }
  })
  it("rejects invalid strings without rendering or coercing them", () => {
    for (const value of [
      "",
      ".",
      "-",
      "1\n",
      "1\r\n",
      "1\u2028",
      " 1",
      "1 ",
      "0x10",
      "NaN",
      "Infinity",
      "１",
      "1e999999999",
    ])
      expect(isDecimal(value)).toBe(false)
  })
  it("preserves object coercion behavior", () => {
    const value = {
      valueOf: () => {
        throw new Error("coercion")
      },
    }
    expect(() => isDecimal(value)).toThrow("coercion")
  })
})
