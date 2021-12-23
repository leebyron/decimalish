import { sub } from "../decimalish"

describe("sub", () => {
  it("is equivalent to adding a negated number", () => {
    expect(sub(100, 50)).toBe("50")
    expect(sub(50, 100)).toBe("-50")
    expect(sub(100, 0)).toBe("100")
    expect(sub(0, 100)).toBe("-100")
  })
})
