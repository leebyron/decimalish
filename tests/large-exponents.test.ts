import { pow } from "../decimalish"
describe("exponents beyond 32 bits", () => {
  it("preserves parity without signed or unsigned truncation", () => {
    for (const exponent of [
      2147483648, 2147483649, 4294967296, 4294967297, 9007199254740991,
    ]) {
      expect(pow(0, exponent)).toBe("0")
      expect(pow(1, exponent)).toBe("1")
      expect(pow(-1, exponent)).toBe(exponent % 2 ? "-1" : "1")
    }
    expect(pow(0, 0)).toBe("1")
    expect(pow(0, "4294967296")).toBe("0")
    expect(pow(-1, 4294967297n)).toBe("-1")
  })
})
