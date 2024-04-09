import request from 'sync-request-curl';
import { port, url } from '../src/config.json';
const SERVER_URL = `${url}:${port}`;

import {
  requestAuthRegister,
  requestQuizCreate,
  requestClear,
  requestQuizQuestionCreate,
  requestAuthLogout,
} from '../src/httpRequests';

import { requestQuizSessionCreate } from './quizSessionCreate.test';

import { requestSessionStateUpdate } from './sessionStateUpdate.test';

import { Actions } from '../src/interfaces';

export const requestSessionsList = (token: string, quizId: number) => {
  const res = request(
    'PUT',
    SERVER_URL + `/v1/admin/quiz/${quizId}/sessions`,
    {
      headers: {
        'Content-type': 'application/json',
        token: `${token}`,
      },
    }
  );
  return JSON.parse(res.body.toString());
};

beforeEach(() => {
  requestClear();
});

afterAll(() => {
  requestClear();
});

it('successfully lists active and inactive sessions', () => {
  const registerRes = requestAuthRegister(
    'users@unsw.edu.au',
    '1234abcd',
    'FirstName',
    'LastName'
  );
  const quizCreateRes = requestQuizCreate(registerRes.token, 'quiz', 'quiz', 'http://something.jpeg/');
  const questionBody = {
    question: 'When are you sleeping?',
    duration: 5,
    points: 5,
    answers: [
      {
        answer: 'Bobby the builder',
        correct: true
      },
      {
        answer: 'Bobby the breaker',
        correct: false
      }
    ],
    thumbnailUrl: 'https://steamuserimages-a.akamaihd.net/ugc/2287332779831334224/EF3F8F1CF9E9A1395686A5B39FC67C64C851BE0D/?imw=637&imh=358&ima=fit&impolicy=Letterbox&imcolor=%23000000&letterbox=true.jpeg',
  };
  requestQuizQuestionCreate(registerRes.token, quizCreateRes.quizId, questionBody);
  const sessionRes1 = requestQuizSessionCreate(registerRes.token, quizCreateRes.quizId, 4);
  const sessionRes2 = requestQuizSessionCreate(registerRes.token, quizCreateRes.quizId, 4);
  const sessionRes3 = requestQuizSessionCreate(registerRes.token, quizCreateRes.quizId, 4);
  const sessionRes4 = requestQuizSessionCreate(registerRes.token, quizCreateRes.quizId, 4);
  requestSessionStateUpdate(registerRes.token, quizCreateRes.quizId, sessionRes3.sessionId, Actions.END);
  requestSessionStateUpdate(registerRes.token, quizCreateRes.quizId, sessionRes4.sessionId, Actions.END);
  const listRes = requestSessionsList(registerRes.token, quizCreateRes.quizId);
  expect(listRes).toStrictEqual({
    activeSession: [
      sessionRes1.sessionId,
      sessionRes2.sessionId,
    ],
    inactiveSessions: [
      sessionRes3.sessionId,
      sessionRes4.sessionId,
    ]
  });
});

it('fails if token is invalid', () => {
  const registerRes = requestAuthRegister(
    'users@unsw.edu.au',
    '1234abcd',
    'FirstName',
    'LastName'
  );
  const quizCreateRes = requestQuizCreate(registerRes.token, 'quiz', 'quiz', 'http://something.jpeg/');
  const questionBody = {
    question: 'When are you sleeping?',
    duration: 5,
    points: 5,
    answers: [
      {
        answer: 'Bobby the builder',
        correct: true
      },
      {
        answer: 'Bobby the breaker',
        correct: false
      }
    ],
    thumbnailUrl: 'https://steamuserimages-a.akamaihd.net/ugc/2287332779831334224/EF3F8F1CF9E9A1395686A5B39FC67C64C851BE0D/?imw=637&imh=358&ima=fit&impolicy=Letterbox&imcolor=%23000000&letterbox=true.jpeg',
  };
  requestQuizQuestionCreate(registerRes.token, quizCreateRes.quizId, questionBody);
  requestQuizSessionCreate(registerRes.token, quizCreateRes.quizId, 4);
  requestAuthLogout(registerRes.token);
  const listRes = requestSessionsList(registerRes.token, quizCreateRes.quizId);
  expect(listRes).toStrictEqual({ error: expect.any(String) });
});

it('fails if token is valid but user is not owner of quiz ', () => {
  const registerRes = requestAuthRegister(
    'users@unsw.edu.au',
    '1234abcd',
    'FirstName',
    'LastName'
  );
  const registerRes2 = requestAuthRegister(
    'userse@unsw.edu.au',
    '1234abcd',
    'FirstNames',
    'LastNames'
  );
  const quizCreateRes = requestQuizCreate(registerRes.token, 'quiz', 'quiz', 'http://something.jpeg/');
  const questionBody = {
    question: 'When are you sleeping?',
    duration: 5,
    points: 5,
    answers: [
      {
        answer: 'Bobby the builder',
        correct: true
      },
      {
        answer: 'Bobby the breaker',
        correct: false
      }
    ],
    thumbnailUrl: 'https://steamuserimages-a.akamaihd.net/ugc/2287332779831334224/EF3F8F1CF9E9A1395686A5B39FC67C64C851BE0D/?imw=637&imh=358&ima=fit&impolicy=Letterbox&imcolor=%23000000&letterbox=true.jpeg',
  };
  requestQuizQuestionCreate(registerRes.token, quizCreateRes.quizId, questionBody);
  requestQuizSessionCreate(registerRes.token, quizCreateRes.quizId, 4);
  requestAuthLogout(registerRes.token);
  const listRes = requestSessionsList(registerRes2.token, quizCreateRes.quizId);
  expect(listRes).toStrictEqual({ error: expect.any(String) });
});
