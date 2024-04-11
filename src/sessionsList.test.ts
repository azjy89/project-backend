import {
  requestAuthRegister,
  requestQuizCreate,
  requestClear,
  requestQuizQuestionCreate,
  requestAuthLogout,
} from './httpRequests';

import { requestQuizSessionCreate, requestSessionStateUpdate, requestSessionsList } from './httpRequests';

import { Actions } from './interfaces';

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
    activeSessions: [
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
