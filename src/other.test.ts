import { clear } from './other';

describe('clear', () => {
  test('successful clear', () => {
    const result = clear();
    expect(result).toEqual({});
  });
});
