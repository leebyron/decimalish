import { toNumber } from "../decimalish"

describe("toNumber", () => {
  it("Converts a numeric back to a number", () => {
    expect(toNumber(10)).toBe(10)
    expect(toNumber("10")).toBe(10)
    expect(toNumber(10n)).toBe(10)
    expect(toNumber("0")).toBe(0)
    expect(toNumber("0.1")).toBe(0.1)
  })

  it("Does not allow implicit precision loss", () => {
    expect(() => toNumber(12345678901234567890n)).toThrow(
      "https://decimali.sh/#INEXACT toNumber(12345678901234567890)"
    )
    expect(() => toNumber("12345678901234567890")).toThrow(
      "https://decimali.sh/#INEXACT toNumber(12345678901234567890)"
    )
    expect(() => toNumber("12345678901234567890", { exact: true })).toThrow(
      "https://decimali.sh/#INEXACT toNumber(12345678901234567890)"
    )
    expect(() => toNumber("12345678901234567890", {})).toThrow(
      "https://decimali.sh/#INEXACT toNumber(12345678901234567890)"
    )
    expect(toNumber("12345678901234567890", { exact: false })).toBe(
      12345678901234567000
    )
  })
})
