import * as Decimal from '../decimalish'

describe('namespace', () => {
  it('can be imported and used as a namespace', () => {
    expect(Decimal.decimal('1e4')).toBe('10000')
    expect(Decimal.add('6', '5')).toBe('11')
  })
})
