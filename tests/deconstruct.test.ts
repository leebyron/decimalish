import { deconstruct } from "../decimalish"

describe("toParts", () => {
  it("Produces normalized parts", () => {
    expect(deconstruct(99)).toStrictEqual([1, "99", 1, 2])
    expect(deconstruct(-1.23e4)).toStrictEqual([-1, "123", 4, 3])
    expect(deconstruct(0)).toStrictEqual([0, "", 0, 0])
    expect(deconstruct(-0)).toStrictEqual([0, "", 0, 0])
    expect(deconstruct("0000.0000")).toStrictEqual([0, "", 0, 0])
  })
})
