import { intFrac } from "../decimalish"

describe("intFrac", () => {
  it("Splits a value by integer and fractional parts", () => {
    expect(intFrac("100.001")).toStrictEqual(["100", "0.001"])
    expect(intFrac("-100.001")).toStrictEqual(["-100", "-0.001"])
    expect(intFrac("999.999")).toStrictEqual(["999", "0.999"])
    expect(intFrac("-999.999")).toStrictEqual(["-999", "-0.999"])
    expect(intFrac("12345678901234567890.1234567890123456789")).toStrictEqual([
      "12345678901234567890",
      "0.1234567890123456789",
    ])
  })

  it("Returns 0 for the fractional when provided an integer", () => {
    expect(intFrac("123")).toStrictEqual(["123", "0"])
    expect(intFrac(123n)).toStrictEqual(["123", "0"])
    expect(intFrac(123)).toStrictEqual(["123", "0"])
  })
})
