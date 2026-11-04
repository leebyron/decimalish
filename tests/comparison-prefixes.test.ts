import { cmp, NumericString } from "../decimalish"
import Big from "big.js"
describe("normalized string comparison", () => {
  it("orders prefixes, equivalent spellings, scales and signs", () => {
    const values = [
      "0",
      "1.2",
      "1.2000",
      "1.20001",
      "1.201",
      "12",
      "0.12",
      "1.2e3",
      "1." + "2".repeat(1000) + "3",
    ] as NumericString[]
    for (const a of values)
      for (const b of values) {
        expect(cmp(a, b)).toBe(new Big(a).cmp(b))
        expect(
          cmp(("-" + a) as NumericString, ("-" + b) as NumericString),
        ).toBe(new Big("-" + a).cmp("-" + b))
      }
  })
})
