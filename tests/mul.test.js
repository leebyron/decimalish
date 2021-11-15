import { mul } from '../decimalish'

describe('mul', () => {
  it('Multiplies two positive numbers', () => {
    expect(mul(99, 99)).toBe('9801')
    expect(mul(11, 11)).toBe('121')
    expect(mul(1234, 0.9876)).toBe('1218.6984')
    expect(mul(1234, 0)).toBe('0')
    expect(mul(0, 1234)).toBe('0')
    expect(mul(0, 0)).toBe('0')
  })
})
