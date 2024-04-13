import {
  requestAuthRegister,
  requestQuizCreate,
  requestClear,
  requestQuizQuestionCreate,
  requestSessionStateUpdate,
  requestQuizSessionCreate, 
  requestPlayerJoin,
  requestPlayerStatus,
  requestQuestionInfo,
  requestQuizInfo
} from '../src/httpRequests';

import {
  States,
  Actions,
} from '../src/interfaces';

beforeEach(() => {
  requestClear();
});

afterAll(() => {
  requestClear();
});

it('successfully get current question information', () => {
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
  const questionCreateRes = requestQuizQuestionCreate(registerRes.token, quizCreateRes.quizId, questionBody);
  const sessionRes = requestQuizSessionCreate(registerRes.token, quizCreateRes.quizId, 4);
  expect(sessionRes).toStrictEqual({ sessionId: expect.any(Number) });
  requestSessionStateUpdate(registerRes.token, quizCreateRes.quizId, sessionRes.sessionId, Actions.NEXT_QUESTION);
  requestSessionStateUpdate(registerRes.token, quizCreateRes.quizId, sessionRes.sessionId, Actions.SKIP_COUNTDOWN);
  const playerRes = requestPlayerJoin(sessionRes.sessionId, "Random Player");
  const questionInfoRes = requestQuestionInfo(playerRes.playerid, 1);
  const quizInfoRes = requestQuizInfo(registerRes.token, quizCreateRes.quizId);
  expect(questionInfoRes).toStrictEqual({
    questionId: questionCreateRes.questionId,
    question: 'When are you sleeping?',
    duration: 5,
    thumbnailUrl: 'https://steamuserimages-a.akamaihd.net/ugc/2287332779831334224/EF3F8F1CF9E9A1395686A5B39FC67C64C851BE0D/?imw=637&imh=358&ima=fit&impolicy=Letterbox&imcolor=%23000000&letterbox=true.jpeg',
    points: 5,
    answers: [
      {
        answerId: expect.any(Number),
        answer: 'Bobby the builder',
        colour: 'red'
      },
      {
        answerId: expect.any(Number),
        answer: 'Bobby the breaker',
        colour: 'blue'
      }
    ]
  })
});

it('fails when player ID does not exist', () => {
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
  const questionCreateRes = requestQuizQuestionCreate(registerRes.token, quizCreateRes.quizId, questionBody);
  const sessionRes = requestQuizSessionCreate(registerRes.token, quizCreateRes.quizId, 4);
  expect(sessionRes).toStrictEqual({ sessionId: expect.any(Number) });
  requestSessionStateUpdate(registerRes.token, quizCreateRes.quizId, sessionRes.sessionId, Actions.NEXT_QUESTION);
  requestSessionStateUpdate(registerRes.token, quizCreateRes.quizId, sessionRes.sessionId, Actions.SKIP_COUNTDOWN);
  const playerRes = requestPlayerJoin(sessionRes.sessionId, "Random Player");
  const questionInfoRes = requestQuestionInfo(playerRes.playerid + 1, 1);
  expect(questionInfoRes).toStrictEqual({ error: expect.any(String) });
});

it('fails if question position is not valid for the session this player is in', () => {
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
  const questionCreateRes = requestQuizQuestionCreate(registerRes.token, quizCreateRes.quizId, questionBody);
  const sessionRes = requestQuizSessionCreate(registerRes.token, quizCreateRes.quizId, 4);
  expect(sessionRes).toStrictEqual({ sessionId: expect.any(Number) });
  requestSessionStateUpdate(registerRes.token, quizCreateRes.quizId, sessionRes.sessionId, Actions.NEXT_QUESTION);
  requestSessionStateUpdate(registerRes.token, quizCreateRes.quizId, sessionRes.sessionId, Actions.SKIP_COUNTDOWN);
  const playerRes = requestPlayerJoin(sessionRes.sessionId + 1, "Random Player");
  const questionInfoRes = requestQuestionInfo(playerRes.playerid, 1);
  expect(questionInfoRes).toStrictEqual({ error: expect.any(String) });
});

it('fails if session is not currently on this question', () => {
  const registerRes = requestAuthRegister(
    'users@unsw.edu.au',
    '1234abcd',
    'FirstName',
    'LastName'
  );
  const quizCreateRes = requestQuizCreate(registerRes.token, 'quiz', 'quiz', 'http://something.jpeg/');
  const questionBody1 = {
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
  const questionCreateRes = requestQuizQuestionCreate(registerRes.token, quizCreateRes.quizId, questionBody1);
  const sessionRes = requestQuizSessionCreate(registerRes.token, quizCreateRes.quizId, 4);
  expect(sessionRes).toStrictEqual({ sessionId: expect.any(Number) });
  requestSessionStateUpdate(registerRes.token, quizCreateRes.quizId, sessionRes.sessionId, Actions.NEXT_QUESTION);
  requestSessionStateUpdate(registerRes.token, quizCreateRes.quizId, sessionRes.sessionId, Actions.SKIP_COUNTDOWN);
  const playerRes = requestPlayerJoin(sessionRes.sessionId, "Random Player");
  const questionBody2 = {
    question: 'When are you eating?',
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
  const questionCreateRes = requestQuizQuestionCreate(registerRes.token, quizCreateRes.quizId, questionBody2);
  const questionInfoRes = requestQuestionInfo(playerRes.playerid, 2);
  expect(questionInfoRes).toStrictEqual({ error: expect.any(String) });
});

it('fails if session is in LOBBY state', () => {
  const registerRes = requestAuthRegister(
    'users@unsw.edu.au',
    '1234abcd',
    'FirstName',
    'LastName'
  );
  const quizCreateRes = requestQuizCreate(registerRes.token, 'quiz', 'quiz', 'http://something.jpeg/');
  const questionBody1 = {
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
  const questionCreateRes = requestQuizQuestionCreate(registerRes.token, quizCreateRes.quizId, questionBody1);
  const sessionRes = requestQuizSessionCreate(registerRes.token, quizCreateRes.quizId, 4);
  expect(sessionRes).toStrictEqual({ sessionId: expect.any(Number) });
  const playerRes = requestPlayerJoin(sessionRes.sessionId, "Random Player");
  const questionInfoRes = requestQuestionInfo(playerRes.playerid, 1);
  expect(questionInfoRes).toStrictEqual({ error: expect.any(String) });
});

it('fails if session is in QUESTION_COUNTDOWN state', () => {
  const registerRes = requestAuthRegister(
    'users@unsw.edu.au',
    '1234abcd',
    'FirstName',
    'LastName'
  );
  const quizCreateRes = requestQuizCreate(registerRes.token, 'quiz', 'quiz', 'http://something.jpeg/');
  const questionBody1 = {
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
  const questionCreateRes = requestQuizQuestionCreate(registerRes.token, quizCreateRes.quizId, questionBody1);
  const sessionRes = requestQuizSessionCreate(registerRes.token, quizCreateRes.quizId, 4);
  expect(sessionRes).toStrictEqual({ sessionId: expect.any(Number) });
  requestSessionStateUpdate(registerRes.token, quizCreateRes.quizId, sessionRes.sessionId, Actions.NEXT_QUESTION);
  const playerRes = requestPlayerJoin(sessionRes.sessionId, "Random Player");
  const questionInfoRes = requestQuestionInfo(playerRes.playerid, 1);
  expect(questionInfoRes).toStrictEqual({ error: expect.any(String) });
});

it('fails if session is in QUESTION_COUNTDOWN state', () => {
  const registerRes = requestAuthRegister(
    'users@unsw.edu.au',
    '1234abcd',
    'FirstName',
    'LastName'
  );
  const quizCreateRes = requestQuizCreate(registerRes.token, 'quiz', 'quiz', 'http://something.jpeg/');
  const questionBody1 = {
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
  const questionCreateRes = requestQuizQuestionCreate(registerRes.token, quizCreateRes.quizId, questionBody1);
  const sessionRes = requestQuizSessionCreate(registerRes.token, quizCreateRes.quizId, 4);
  expect(sessionRes).toStrictEqual({ sessionId: expect.any(Number) });
  requestSessionStateUpdate(registerRes.token, quizCreateRes.quizId, sessionRes.sessionId, Actions.END);
  const playerRes = requestPlayerJoin(sessionRes.sessionId, "Random Player");
  const questionInfoRes = requestQuestionInfo(playerRes.playerid, 1);
  expect(questionInfoRes).toStrictEqual({ error: expect.any(String) });
});
