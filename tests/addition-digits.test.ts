import { add, NumericString } from "../decimalish"
import Big from "big.js"
describe("addition digit buffers", () => {
  it("matches exact arithmetic across carries, borrows and alignment gaps", () => {
    for (let i = 1; i <= 80; i++) {
      const a = ("9".repeat(i) + ".001") as NumericString
      for (const b of [
        "0.999",
        "-0.002",
        "1e-20",
        "-" + a,
      ] as NumericString[]) {
        expect(add(a, b)).toBe(new Big(a).plus(b).toFixed())
        expect(add(b, a)).toBe(new Big(b).plus(a).toFixed())
      }
    }
  })
})
