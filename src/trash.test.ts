import { before } from 'node:test';
import { requestAuthRegister, requestQuizCreate, requestQuizList, requestQuizRemove, requestTrashQuizRestore , requestTrashEmpty, requestUserPasswordUpdate, requestClear } from './httpRequests';
import { response } from 'express';

beforeEach(() => {
  requestClear();
});

describe('Testing POST /v1/admin/quiz/{quizid}/restore', () => {
  test('Succesfully restore quiz', () => {
    const resToken = requestAuthRegister('quiz@unsw.edu.au',
      'abcd1234', 'Bobby', 'Dickens');
    const resquizId = requestQuizCreate(resToken.token, 'COMP1531', 'Welcome!');
    expect(requestQuizRemove(resToken.token, resquizId.quizId)).toEqual({});
    expect(requestQuizList(resToken.token)).toStrictEqual({
      quizzes: []
    });
    expect(requestTrashQuizRestore(resquizId.quizId, resToken.token)).toStrictEqual({});
    expect(requestQuizList(resToken.token)).toStrictEqual({
      quizzes: [{
        quizId: resquizId.quizId,
        name: 'COMP1531',
      }]
    });
  });
  test('Quiz name of the restored quiz is already used', () => {
    const resToken = requestAuthRegister('quiz@unsw.edu.au',
      'abcd1234', 'Bobby', 'Dickens');
    const resquizId1 = requestQuizCreate(resToken.token, 'COMP1531', 'Welcome!');
    requestQuizRemove(resToken.token, resquizId1.quizId);
    const resquizId2 = requestQuizCreate(resToken.token, 'COMP1531', 'Welcome!');
    expect(requestTrashQuizRestore(resToken.token, resquizId1.quizId)).toStrictEqual({ error: expect.any(String) });
  });
  test('Quiz is not currently in the trash', () => {
    const resToken = requestAuthRegister('quiz@unsw.edu.au',
      'abcd1234', 'Bobby', 'Dickens');
    const resquizId1 = requestQuizCreate(resToken.token, 'COMP1531', 'Welcome!');
    expect(requestTrashQuizRestore(resToken.token, resquizId1.quizId)).toStrictEqual({ error: expect.any(String) });
  });
  test('token doesnt exist', () => {
    const resToken = requestAuthRegister('quiz@unsw.edu.au',
      'abcd1234', 'Bobby', 'Dickens');
    const resquizId1 = requestQuizCreate(resToken.token, 'COMP1531', 'Welcome!');
    requestQuizRemove(resToken.token, resquizId1.quizId);
    expect(requestTrashQuizRestore(resToken.token + 1, resquizId1.quizId)).toStrictEqual({ error: expect.any(String) });
  });
  test('user is not an owner of this quiz', () => {
    const resToken1 = requestAuthRegister('quiz@unsw.edu.au',
      'abcd1234', 'Bobby', 'Dickens');
    const resToken2 = requestAuthRegister('quiz@unsw.edu.au',
    'abcd1234', 'Bobby', 'Dickens');
    const resquizId1 = requestQuizCreate(resToken1.token, 'COMP1531', 'Welcome!');
    requestQuizRemove(resToken1.token, resquizId1.quizId);
    expect(requestTrashQuizRestore(resToken2.token, resquizId1.quizId)).toStrictEqual({ error: expect.any(String) });
  });
});

describe('Testing DELETE /v1/admin/quiz/trash/empty', () => {
  test('Succesfully empty trash', () => {
    const resToken = requestAuthRegister('quiz@unsw.edu.au',
      'abcd1234', 'Bobby', 'Dickens');
    const resquizId = requestQuizCreate(resToken.token, 'COMP1531', 'Welcome!');
    expect(requestQuizRemove(resToken.token, resquizId.quizId)).toEqual({});
    expect(requestTrashEmpty(resToken.token, [resquizId.quizId])).toStrictEqual({}); 
  });
  
  test('Succesfully empty trash with multiple quizzes', () => {
    const resToken = requestAuthRegister('quiz@unsw.edu.au',
      'abcd1234', 'Bobby', 'Dickens');
    const resquizId1 = requestQuizCreate(resToken.token, 'COMP1531', 'Welcome!');
    const resquizId2 = requestQuizCreate(resToken.token, 'COMP1532', 'Welcome!');
    const resquizId3 = requestQuizCreate(resToken.token, 'COMP1533', 'Welcome!');

    expect(requestQuizRemove(resToken.token, resquizId1.quizId)).toEqual({});
    expect(requestQuizRemove(resToken.token, resquizId2.quizId)).toEqual({});
    expect(requestQuizRemove(resToken.token, resquizId3.quizId)).toEqual({});
    expect(requestTrashEmpty(resToken.token, [resquizId1.quizId, resquizId2.quizId, resquizId3.quizId])).toStrictEqual({});
  });
  test('Quiz is not currently in the trash', () => {
    const resToken = requestAuthRegister('quiz@unsw.edu.au',
      'abcd1234', 'Bobby', 'Dickens');
    const resquizId1 = requestQuizCreate(resToken.token, 'COMP1531', 'Welcome!');
    expect(requestTrashEmpty(resToken.token, [resquizId1.quizId])).toStrictEqual({ error: expect.any(String) });
  });
  test('Multiple Quiz are not currently in the trash', () => {
    const resToken = requestAuthRegister('quiz@unsw.edu.au',
      'abcd1234', 'Bobby', 'Dickens');
    const resquizId1 = requestQuizCreate(resToken.token, 'COMP1531', 'Welcome!');
    const resquizId2 = requestQuizCreate(resToken.token, 'COMP1532', 'Welcome!');
    const resquizId3 = requestQuizCreate(resToken.token, 'COMP1533', 'Welcome!');
    expect(requestTrashEmpty(resToken.token, [resquizId1.quizId, resquizId2.quizId, resquizId3.quizId])).toStrictEqual({ error: expect.any(String) });
  });
  test('token doesnt exist', () => {
    const resToken = requestAuthRegister('quiz@unsw.edu.au',
      'abcd1234', 'Bobby', 'Dickens');
    const resquizId1 = requestQuizCreate(resToken.token, 'COMP1531', 'Welcome!');
    requestQuizRemove(resToken.token, resquizId1.quizId);
    expect(requestTrashEmpty(resToken.token + 1, [resquizId1.quizId])).toStrictEqual({ error: expect.any(String) });
  });
  test('user is not an owner of this quiz', () => {
    const resToken1 = requestAuthRegister('quiz@unsw.edu.au',
      'abcd1234', 'Bobby', 'Dickens');
    const resToken2 = requestAuthRegister('quiz@unsw.edu.au',
    'abcd1234', 'Bobby', 'Dickens');
    const resquizId1 = requestQuizCreate(resToken1.token, 'COMP1531', 'Welcome!');
    const resquizId2 = requestQuizCreate(resToken1.token, 'COMP1532', 'Welcome!');
    const resquizId3 = requestQuizCreate(resToken1.token, 'COMP1533', 'Welcome!');
    requestQuizRemove(resToken1.token, resquizId1.quizId);
    requestQuizRemove(resToken1.token, resquizId2.quizId);
    requestQuizRemove(resToken1.token, resquizId3.quizId);

    expect(requestTrashEmpty(resToken2.token, [resquizId1.quizI, resquizId2.quizId, resquizId3.quizId])).toStrictEqual({ error: expect.any(String) });
  });
})