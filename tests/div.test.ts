import { div } from '../decimalish'

describe('div', () => {

  it('throws for divide by zero', () => {
    expect(() => div(1, 0)).toThrow('Divide by 0')
  })

})
