import clear from './other.js';

describe('clear', () => {
    test('successful clear', () => {
        const result = clear();
        expect(result).toStrictEqual({});
    });
}) ;