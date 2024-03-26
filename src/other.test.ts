import { requestClear } from './httpRequests';

describe('clear', () => {
  test('successful clear', () => {
    const result = requestClear();
    expect(result).toEqual({});
  });
});
