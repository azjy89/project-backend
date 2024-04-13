import {
  requestAuthRegister,
  requestQuizCreate,
  requestQuizList,
  requestQuizRemove,
  requestTrashQuizList,
  requestTrashQuizRestore,
  requestTrashEmpty,
  requestClear
} from './httpRequests';

beforeEach(() => {
  requestClear();
});

afterAll(() => {
  requestClear();
});

describe('trashQuizList', () => {
  test('Successful run', () => {
    const resToken = requestAuthRegister('quiz@unsw.edu.au',
      'abcd1234', 'Bobby', 'Dickens');
    const resQuizId = requestQuizCreate(resToken.token, 'COMP1531', 'Welcome!');
    requestQuizRemove(resToken.token, resQuizId.quizId);
    const resTrash = requestTrashQuizList(resToken.token);
    expect(resTrash).toStrictEqual({
      quizzes: [
        {
          quizId: resQuizId.quizId,
          name: 'COMP1531'
        }
      ]
    });
  });
  test('Invalid token', () => {
    const resToken = requestAuthRegister('quiz@unsw.edu.au',
      'abcd1234', 'Bobby', 'Dickens');
    const resQuizId = requestQuizCreate(resToken.token, 'COMP1531', 'Welcome!');
    requestQuizRemove(resToken.token, resQuizId.quizId);
    const resTrash = requestTrashQuizList('1');
    expect(resTrash).toStrictEqual({ error: expect.any(String) });
  });
});

describe('Testing POST /v1/admin/quiz/{quizid}/restore', () => {
  test('Succesfully restore quiz', () => {
    const resToken = requestAuthRegister('quiz@unsw.edu.au',
      'abcd1234', 'Bobby', 'Dickens');
    const resQuizId = requestQuizCreate(resToken.token, 'COMP1531', 'Welcome!');
    requestQuizRemove(resToken.token, resQuizId.quizId);
    expect(requestTrashQuizRestore(resToken.token, resQuizId.quizId)).toStrictEqual({});
    expect(requestQuizList(resToken.token)).toStrictEqual({
      quizzes: [{
        quizId: resQuizId.quizId,
        name: 'COMP1531',
      }]
    });
  });
  test('Quiz name of the restored quiz is already used', () => {
    const resToken = requestAuthRegister('quiz@unsw.edu.au',
      'abcd1234', 'Bobby', 'Dickens');
    const resQuizId1 = requestQuizCreate(resToken.token, 'COMP1531', 'Welcome!');
    requestQuizRemove(resToken.token, resQuizId1.quizId);
    // eslint-disable-next-line
    const resQuizId2 = requestQuizCreate(resToken.token, 'COMP1531', 'HEHEHE');
    expect(requestTrashQuizRestore(resToken.token, resQuizId1.quizId)).toStrictEqual({ error: expect.any(String) });
  });
  test('Quiz is not currently in the trash', () => {
    const resToken = requestAuthRegister('quiz@unsw.edu.au',
      'abcd1234', 'Bobby', 'Dickens');
    const resQuizId1 = requestQuizCreate(resToken.token, 'COMP1531', 'Welcome!');
    expect(requestTrashQuizRestore(resToken.token, resQuizId1.quizId)).toStrictEqual({ error: expect.any(String) });
  });
  test('token doesnt exist', () => {
    const resToken = requestAuthRegister('quiz@unsw.edu.au',
      'abcd1234', 'Bobby', 'Dickens');
    const resQuizId1 = requestQuizCreate(resToken.token, 'COMP1531', 'Welcome!');
    requestQuizRemove(resToken.token, resQuizId1.quizId);
    expect(requestTrashQuizRestore('1', resQuizId1.quizId)).toStrictEqual({ error: expect.any(String) });
  });
  test('user is not an owner of this quiz', () => {
    const resToken1 = requestAuthRegister('quiz@unsw.edu.au',
      'abcd1234', 'Bobby', 'Dickens');
    const resToken2 = requestAuthRegister('quiz@unsw.edu.au',
      'abcd1234', 'Bobby', 'Dickens');
    const resQuizId1 = requestQuizCreate(resToken1.token, 'COMP1531', 'Welcome!');
    requestQuizRemove(resToken1.token, resQuizId1.quizId);
    expect(requestTrashQuizRestore(resToken2.token, resQuizId1.quizId)).toStrictEqual({ error: expect.any(String) });
  });
});

describe('Testing DELETE /v1/admin/quiz/trash/empty', () => {
  test('Succesfully empty trash', () => {
    const resToken = requestAuthRegister('quiz@unsw.edu.au',
      'abcd1234', 'Bobby', 'Dickens');
    const resQuizId = requestQuizCreate(resToken.token, 'COMP1531', 'Welcome!');
    requestQuizRemove(resToken.token, resQuizId.quizId);
    expect(requestTrashEmpty(resToken.token, [resQuizId.quizId])).toStrictEqual({});
    expect(requestTrashQuizList(resToken.token)).toStrictEqual({
      quizzes: []
    });
  });

  test('Succesfully empty trash with multiple quizzes', () => {
    const resToken = requestAuthRegister('quiz@unsw.edu.au',
      'abcd1234', 'Bobby', 'Dickens');
    const resQuizId1 = requestQuizCreate(resToken.token, 'COMP1531', 'Welcome!');
    const resQuizId2 = requestQuizCreate(resToken.token, 'COMP1532', 'Welcome!');
    const resQuizId3 = requestQuizCreate(resToken.token, 'COMP1533', 'Welcome!');

    expect(requestQuizRemove(resToken.token, resQuizId1.quizId)).toEqual({});
    expect(requestQuizRemove(resToken.token, resQuizId2.quizId)).toEqual({});
    expect(requestQuizRemove(resToken.token, resQuizId3.quizId)).toEqual({});
    expect(requestTrashEmpty(resToken.token, [resQuizId1.quizId, resQuizId2.quizId, resQuizId3.quizId])).toStrictEqual({});
    expect(requestTrashQuizList(resToken.token)).toStrictEqual({
      quizzes: [

      ]
    });
  });
  test('Quiz is not currently in the trash', () => {
    const resToken = requestAuthRegister('quiz@unsw.edu.au',
      'abcd1234', 'Bobby', 'Dickens');
    const resQuizId1 = requestQuizCreate(resToken.token, 'COMP1531', 'Welcome!');
    expect(requestTrashEmpty(resToken.token, [resQuizId1.quizId])).toStrictEqual({ error: expect.any(String) });
  });
  test('Multiple Quiz are not currently in the trash', () => {
    const resToken = requestAuthRegister('quiz@unsw.edu.au',
      'abcd1234', 'Bobby', 'Dickens');
    const resQuizId1 = requestQuizCreate(resToken.token, 'COMP1531', 'Welcome!');
    const resQuizId2 = requestQuizCreate(resToken.token, 'COMP1532', 'Welcome!');
    const resQuizId3 = requestQuizCreate(resToken.token, 'COMP1533', 'Welcome!');
    expect(requestTrashEmpty(resToken.token, [resQuizId1.quizId, resQuizId2.quizId, resQuizId3.quizId])).toStrictEqual({ error: expect.any(String) });
  });
  test('token doesnt exist', () => {
    const resToken = requestAuthRegister('quiz@unsw.edu.au',
      'abcd1234', 'Bobby', 'Dickens');
    const resQuizId1 = requestQuizCreate(resToken.token, 'COMP1531', 'Welcome!');
    requestQuizRemove(resToken.token, resQuizId1.quizId);
    expect(requestTrashEmpty(resToken.token + 1, [resQuizId1.quizId])).toStrictEqual({ error: expect.any(String) });
  });
  test('user is not an owner of this quiz', () => {
    const resToken1 = requestAuthRegister('quiz@unsw.edu.au',
      'abcd1234', 'Bobby', 'Dickens');
    const resToken2 = requestAuthRegister('quiz@unsw.edu.au',
      'abcd1234', 'Bobby', 'Dickens');
    const resQuizId1 = requestQuizCreate(resToken1.token, 'COMP1531', 'Welcome!');
    const resQuizId2 = requestQuizCreate(resToken1.token, 'COMP1532', 'Welcome!');
    const resQuizId3 = requestQuizCreate(resToken1.token, 'COMP1533', 'Welcome!');
    requestQuizRemove(resToken1.token, resQuizId1.quizId);
    requestQuizRemove(resToken1.token, resQuizId2.quizId);
    requestQuizRemove(resToken1.token, resQuizId3.quizId);

    expect(requestTrashEmpty(resToken2.token, [resQuizId1.quizI, resQuizId2.quizId, resQuizId3.quizId])).toStrictEqual({ error: expect.any(String) });
  });
});
