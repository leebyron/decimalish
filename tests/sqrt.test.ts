import { Numeric, RoundingMode, sqrt } from "../decimalish"

describe("sqrt", () => {
  it("Does not allow negative numbers", () => {
    expect(() => sqrt(-1)).toThrow("https://decimali.sh/#SQRT_NEG -1")
  })

  it("Supports sqrt of 0", () => {
    expect(sqrt(0)).toBe("0")
  })

  it("converges before rounding to few places", () => {
    expect(sqrt("2", { places: 0 })).toBe("1")
    expect(sqrt("0.0002", { places: 2 })).toBe("0.01")
    expect(sqrt("0.0002", { precision: 2 })).toBe("0.014")
    expect(sqrt("2e-40", { places: 22 })).toBe("0.0000000000000000000141")
  })

  it("rounds exact midpoints according to the mode", () => {
    const cases: [RoundingMode, string, string][] = [
      ["down", "1", "2"],
      ["floor", "1", "2"],
      ["euclidean", "1", "2"],
      ["up", "2", "3"],
      ["ceil", "2", "3"],
      ["half up", "2", "3"],
      ["half ceil", "2", "3"],
      ["half down", "1", "2"],
      ["half floor", "1", "2"],
      ["half even", "2", "2"],
    ]
    for (const [mode, odd, even] of cases) {
      expect(sqrt("2.25", { places: 0, mode })).toBe(odd)
      expect(sqrt("6.25", { places: 0, mode })).toBe(even)
    }
  })

  it("distinguishes values arbitrarily close to rounding boundaries", () => {
    const below = ("2.24" + "9".repeat(80)) as Numeric
    const above = ("2.25" + "0".repeat(80) + "1") as Numeric
    expect(sqrt(below, { places: 0 })).toBe("1")
    expect(sqrt(above, { places: 0, mode: "half down" })).toBe("2")
    expect(
      sqrt(("3." + "9".repeat(80)) as Numeric, { places: 0, mode: "down" }),
    ).toBe("1")
    expect(
      sqrt(("4." + "0".repeat(80) + "1") as Numeric, { places: 0, mode: "up" }),
    ).toBe("3")
  })

  it("handles rounding units larger than the root", () => {
    expect(sqrt("2", { places: -1 })).toBe("0")
    expect(sqrt("2", { places: -1, mode: "up" })).toBe("10")
    expect(sqrt("2500", { places: -2 })).toBe("0")
    expect(sqrt("2500", { places: -2, mode: "half up" })).toBe("100")
    expect(sqrt("2501", { precision: 0 })).toBe("100")
    expect(sqrt("2", { precision: -1 })).toBe("0")
    expect(sqrt("2", { places: -10000000000 })).toBe("0")
  })

  it("requires the rounded root to be exact in exact mode", () => {
    expect(sqrt("2.25", { places: 1, mode: "exact" })).toBe("1.5")
    expect(() => sqrt("2", { places: 0, mode: "exact" })).toThrow(
      "https://decimali.sh/#INEXACT sqrt 2",
    )
    expect(() => sqrt("4", { places: -1, mode: "exact" })).toThrow(
      "https://decimali.sh/#INEXACT sqrt 4",
    )
    expect(() =>
      sqrt(("4." + "0".repeat(80) + "1") as Numeric, {
        places: 0,
        mode: "exact",
      }),
    ).toThrow("https://decimali.sh/#INEXACT")
  })

  it("Performs accurate sqrt", () => {
    expect(sqrt("1524157875019052100")).toBe("1234567890")
    expect(sqrt(7)).toBe("2.64575131106459059050161575363926")
    expect(sqrt(9876543210)).toBe("99380.7990006117831674890524947177")
  })

  it("Generate arbitrarily precise sqrt", () => {
    expect(sqrt(2, { places: 300 })).toBe(
      "1.41421356237309504880168872420969807856967187537694807317667973799073247846210703885038753432764157273501384623091229702492483605585073721264412149709993583141322266592750559275579995050115278206057147010955997160597027453459686201472851741864088919860955232923048430871432145083976260362799525140799",
    )
  })

  it("Accepts very large and precise input", () => {
    const bigNum =
      "1234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890" as Numeric
    expect(sqrt(bigNum)).toBe(
      "35136418288201442531112223816998830000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000",
    )
    // Or set to no decimal places to get an exact integer result
    expect(sqrt(bigNum, { places: 0 })).toBe(
      "35136418288201442531112223816998829391748408772394003368165480068665646116465388194949300644461930324595395982930269502735974683340402495738034308205577672",
    )
  })
})
