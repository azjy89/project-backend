import {
  requestAuthRegister,
  requestQuizCreate,
  requestClear,
  requestQuizQuestionCreate,
  requestAuthLogout,
  requestQuizInfo,
  requestQuizSessionCreate,
  requestSessionStatus,
} from './httpRequests';

import { States } from './interfaces';

beforeEach(() => {
  requestClear();
});

afterAll(() => {
  requestClear();
});

it('successfuly shows session info', () => {
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
  const sessionRes = requestQuizSessionCreate(registerRes.token, quizCreateRes.quizId, 2);
  const quizInfoRes = requestQuizInfo(registerRes.token, quizCreateRes.quizId);
  expect(requestSessionStatus(registerRes.token, quizCreateRes.quizId, sessionRes.sessionId)).toStrictEqual({
    state: States.LOBBY,
    atQuestion: 0,
    players: [],
    metadata: quizInfoRes,
  });
});

it('fails if token is empty or invalid', () => {
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
  const sessionRes = requestQuizSessionCreate(registerRes.token, quizCreateRes.quizId, 2);
  requestAuthLogout(registerRes.token);
  expect(requestSessionStatus(registerRes.token, quizCreateRes.quizId, sessionRes.sessionId)).toStrictEqual({ error: expect.any(String) });
});

it('fails if token is empty or invalid', () => {
  const registerRes = requestAuthRegister(
    'users@unsw.edu.au',
    '1234abcd',
    'FirstName',
    'LastName'
  );
  const registerRes2 = requestAuthRegister(
    'users2@unsw.edu.au',
    '1234abcd',
    'FirstName2',
    'LastName2'
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
  const sessionRes = requestQuizSessionCreate(registerRes.token, quizCreateRes.quizId, 2);
  expect(requestSessionStatus(registerRes2.token, quizCreateRes.quizId, sessionRes.sessionId)).toStrictEqual({ error: expect.any(String) });
});
