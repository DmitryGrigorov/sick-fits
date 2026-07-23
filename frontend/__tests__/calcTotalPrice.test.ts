import calcTotalPrice from '../lib/calcTotalPrice';
import { fakeCartItem } from '../lib/testUtils';

describe('calcTotalPrice Function', () => {
  it('sums quantity * price across the cart', () => {
    const cart = [fakeCartItem({ quantity: 2 }), fakeCartItem({ quantity: 3 })];
    expect(calcTotalPrice(cart)).toEqual(2 * 5000 + 3 * 5000);
  });

  it('ignores cart items whose linked item was deleted', () => {
    const cart = [fakeCartItem({ item: null, quantity: 5 }), fakeCartItem({ quantity: 1 })];
    expect(calcTotalPrice(cart)).toEqual(5000);
  });

  it('returns 0 for an empty cart', () => {
    expect(calcTotalPrice([])).toEqual(0);
  });
});
