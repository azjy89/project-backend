import {
  requestAuthRegister,
  requestQuizCreate,
  requestClear,
  requestQuizQuestionCreate,
  requestAuthLogout,
  requestQuizRemove,
  requestSessionStateUpdate,
  requestSessionStatus,
  requestSessionsList,
  requestQuizSessionCreate
} from './httpRequests';

import {
  States,
  Actions,
} from './interfaces';

import { getData } from './dataStore';

beforeEach(() => {
  requestClear();
});

afterAll(() => {
  requestClear();
});

it('successfully starts a quiz session', () => {
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
  const sessionRes = requestQuizSessionCreate(registerRes.token, quizCreateRes.quizId, 4);
  expect(sessionRes).toStrictEqual({ sessionId: expect.any(Number) });
  const sessionStatusRes = requestSessionStatus(registerRes.token, quizCreateRes.quizId, sessionRes.sessionId);
  expect(sessionStatusRes.state).toStrictEqual(States.LOBBY);
  expect(sessionStatusRes.atQuestion).toStrictEqual(0);
  expect(sessionStatusRes.metadata.quizId).toStrictEqual(quizCreateRes.quizId);
  const list = requestSessionsList(registerRes.token, quizCreateRes.quizId);
  expect(list).toStrictEqual({
    activeSessions: [
      sessionRes.sessionId,
    ],
    inactiveSessions: [
    ],
  });
});

it('fails when autoStartNum is greater than 50', () => {
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
  const sessionRes = requestQuizSessionCreate(registerRes.token, quizCreateRes.quizId, 51);
  expect(sessionRes).toStrictEqual({ error: expect.any(String) });
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
  requestAuthLogout(registerRes.token);
  const sessionRes = requestQuizSessionCreate(registerRes.token, quizCreateRes.quizId, 4);
  expect(sessionRes).toStrictEqual({ error: expect.any(String) });
});

it('fails if user does not own quiz', () => {
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
  const sessionRes = requestQuizSessionCreate(registerRes2.token, quizCreateRes.quizId, 4);
  expect(sessionRes).toStrictEqual({ error: expect.any(String) });
});

it('fails if quiz has no questions in it', () => {
  const registerRes = requestAuthRegister(
    'users@unsw.edu.au',
    '1234abcd',
    'FirstName',
    'LastName'
  );
  const quizCreateRes = requestQuizCreate(registerRes.token, 'quiz', 'quiz', 'http://something.jpeg/');
  const sessionRes = requestQuizSessionCreate(registerRes.token, quizCreateRes.quizId, 4);
  expect(sessionRes).toStrictEqual({ error: expect.any(String) });
});

it('fails if quiz is in trash', () => {
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
  requestQuizRemove(registerRes.token, quizCreateRes.quizId);
  const sessionRes = requestQuizSessionCreate(registerRes.token, quizCreateRes.quizId, 4);
  expect(sessionRes).toStrictEqual({ error: expect.any(String) });
});

it('fails if at least 10 sessions not in end state already exist for this quiz', () => {
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
  requestQuizSessionCreate(registerRes.token, quizCreateRes.quizId, 4);
  requestQuizSessionCreate(registerRes.token, quizCreateRes.quizId, 4);
  requestQuizSessionCreate(registerRes.token, quizCreateRes.quizId, 4);
  requestQuizSessionCreate(registerRes.token, quizCreateRes.quizId, 4);
  requestQuizSessionCreate(registerRes.token, quizCreateRes.quizId, 4);
  requestQuizSessionCreate(registerRes.token, quizCreateRes.quizId, 4);
  requestQuizSessionCreate(registerRes.token, quizCreateRes.quizId, 4);
  requestQuizSessionCreate(registerRes.token, quizCreateRes.quizId, 4);
  requestQuizSessionCreate(registerRes.token, quizCreateRes.quizId, 4);
  const sessionRes = requestQuizSessionCreate(registerRes.token, quizCreateRes.quizId, 4);
  expect(sessionRes).toStrictEqual({ error: expect.any(String) });
});

it('succeeds if more than 10 sessions exist but less than ten are not in end state already exist for this quiz', () => {
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
  requestQuizSessionCreate(registerRes.token, quizCreateRes.quizId, 4);
  requestQuizSessionCreate(registerRes.token, quizCreateRes.quizId, 4);
  requestQuizSessionCreate(registerRes.token, quizCreateRes.quizId, 4);
  requestQuizSessionCreate(registerRes.token, quizCreateRes.quizId, 4);
  requestQuizSessionCreate(registerRes.token, quizCreateRes.quizId, 4);
  requestQuizSessionCreate(registerRes.token, quizCreateRes.quizId, 4);
  requestQuizSessionCreate(registerRes.token, quizCreateRes.quizId, 4);
  const sessionRes1 = requestQuizSessionCreate(registerRes.token, quizCreateRes.quizId, 4);
  const sessionRes2 = requestQuizSessionCreate(registerRes.token, quizCreateRes.quizId, 4);
  requestSessionStateUpdate(registerRes.token, quizCreateRes.quizId, sessionRes1.sessionId, Actions.END);
  requestSessionStateUpdate(registerRes.token, quizCreateRes.quizId, sessionRes2.sessionId, Actions.END);
  const sessionRes = requestQuizSessionCreate(registerRes.token, quizCreateRes.quizId, 4);
  expect(sessionRes).toStrictEqual({ sessionId: expect.any(Number) });
  const sessionStatusRes = requestSessionStatus(registerRes.token, quizCreateRes.quizId, sessionRes.sessionId);
  expect(sessionStatusRes.state).toStrictEqual(States.LOBBY);
  expect(sessionStatusRes.atQuestion).toStrictEqual(0);
  expect(sessionStatusRes.metadata.quizId).toStrictEqual(quizCreateRes.quizId);
});
