import clear from './other.js';

describe('clear', () => {
    test('succesful clear', () => {
        const result = clear();
        expect(result).toStrictEqual({});
    });
}) ;