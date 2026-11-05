import { construct, decimal, toFixed, toExponential } from "../decimalish"
describe("block padding", () => {
  it("preserves fixed and scientific output over block boundaries", () => {
    for (const count of [0, 1, 2, 3, 7, 8, 9, 31, 32, 33, 1000]) {
      const zeros = "0".repeat(count)
      expect(decimal("1e" + count)).toBe("1" + zeros)
      expect(construct(-1, "1", -count - 1)).toBe("-0." + zeros + "1")
      expect(toFixed("-1", { places: count })).toBe(
        "-1" + (count ? "." + zeros : ""),
      )
      expect(toExponential("1", { places: count })).toBe(
        "1" + (count ? "." + zeros : "") + "e+0",
      )
    }
    expect(toFixed("0", { places: 3 })).toBe("0.000")
  })
})
