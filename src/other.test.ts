import {
  requestClear,
  requestAuthRegister,
  requestQuizCreate,
  requestQuizList,
  requestUserDetails
} from './httpRequests';

const ERROR = { error: expect.any(String) };

afterAll(() => {
  requestClear();
});

describe('clear', () => {
  test('successful clear', () => {
    const result = requestClear();
    expect(result).toEqual({});
  });
  test('adding something then clearing', () => {
    requestClear();
    const email = 'quiz@unsw.edu.au';
    const password = 'abcd1234';
    expect(requestUserDetails(requestAuthRegister(email, password, 'Bobby', 'Dickens'))).toEqual(ERROR);
    requestQuizCreate(requestAuthRegister(email, password, 'Bobby', 'Dickens'), 'Bobby', 'Ricky');
    requestClear();
    expect(requestQuizList(requestAuthRegister(email, password, 'Bobby', 'Dickens'))).toStrictEqual(ERROR);
    expect(requestUserDetails(requestAuthRegister(email, password, 'Bobby', 'Dickens'))).toStrictEqual(ERROR);
  });
});
