import { toParts } from '../decimalish'

describe('toParts', () => {
  it('Produces normalized parts', () => {
    expect(toParts(99)).toStrictEqual([1, '99', 1, 2])
    expect(toParts(-1.23e4)).toStrictEqual([-1, '123', 4, 3])
    expect(toParts(0)).toStrictEqual([0, '', 0, 0])
    expect(toParts(-0)).toStrictEqual([0, '', 0, 0])
    expect(toParts('0000.0000')).toStrictEqual([0, '', 0, 0])
  })
})
