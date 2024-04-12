import {
  requestAuthRegister,
  requestQuizCreate,
  requestClear,
  requestQuizQuestionCreate,
  requestAuthLogout,
  requestQuizSessionCreate,
  requestSessionStatus,
  requestSessionStateUpdate,
} from './httpRequests';

import { States, Actions } from './interfaces';

import { getData, getTimerData } from './dataStore';

import { sleepSync } from './helpers';

beforeEach(() => {
  requestClear();
});

afterAll(() => {
  requestClear();
});

it('successfully updates a session from lobby to countdown', () => {
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
  const stateUpdateRes = requestSessionStateUpdate(registerRes.token, quizCreateRes.quizId, sessionRes.sessionId, Actions.NEXT_QUESTION);
  expect(stateUpdateRes).toStrictEqual({});
  const statusRes1 = requestSessionStatus(registerRes.token, quizCreateRes.quizId, sessionRes.sessionId);
  expect(statusRes1.state).toStrictEqual(States.QUESTION_COUNTDOWN);
  sleepSync(3 * 1000);
  const statusRes2 = requestSessionStatus(registerRes.token, quizCreateRes.quizId, sessionRes.sessionId);
  expect(statusRes2.state).toStrictEqual(States.QUESTION_OPEN);
  sleepSync(5 * 1000);
  const statusRes3 = requestSessionStatus(registerRes.token, quizCreateRes.quizId, sessionRes.sessionId);
  expect(statusRes3.state).toStrictEqual(States.QUESTION_CLOSE);
});

it('successfully udpates a session to end', () => {
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
  const stateUpdateRes = requestSessionStateUpdate(registerRes.token, quizCreateRes.quizId, sessionRes.sessionId, Actions.END);
  expect(stateUpdateRes).toStrictEqual({});
  const statusRes = requestSessionStatus(registerRes.token, quizCreateRes.quizId, sessionRes.sessionId);
  expect(statusRes.state).toStrictEqual(States.END);
});

it('successfully skips countdown', () => {
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
  const stateUpdateRes1 = requestSessionStateUpdate(registerRes.token, quizCreateRes.quizId, sessionRes.sessionId, Actions.NEXT_QUESTION);
  expect(stateUpdateRes1).toStrictEqual({});
  const statusRes1 = requestSessionStatus(registerRes.token, quizCreateRes.quizId, sessionRes.sessionId);
  expect(statusRes1.state).toStrictEqual(States.QUESTION_COUNTDOWN);
  const stateUpdateRes2 = requestSessionStateUpdate(registerRes.token, quizCreateRes.quizId, sessionRes.sessionId, Actions.SKIP_COUNTDOWN);
  expect(stateUpdateRes2).toStrictEqual({});
  const statusRes2 = requestSessionStatus(registerRes.token, quizCreateRes.quizId, sessionRes.sessionId);
  expect(statusRes2.state).toStrictEqual(States.QUESTION_OPEN);
  sleepSync(questionBody.duration * 1000);
  const statusRes3 = requestSessionStatus(registerRes.token, quizCreateRes.quizId, sessionRes.sessionId);
  expect(statusRes3.state).toStrictEqual(States.QUESTION_CLOSE);
});

it('successfully moves from question open toquestion close to countdown then to open then to close then to answer show then to final results', () => {
  const registerRes = requestAuthRegister(
    'users@unsw.edu.au',
    '1234abcd',
    'FirstName',
    'LastName'
  );
  const quizCreateRes = requestQuizCreate(registerRes.token, 'quiz', 'quiz', 'http://something.jpeg/');
  const questionBody = {
    question: 'When are you sleeping?',
    duration: 1,
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
  const questionBody2 = {
    question: 'When are you not sleeping?',
    duration: 2,
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
  requestQuizQuestionCreate(registerRes.token, quizCreateRes.quizId, questionBody2);
  const sessionRes = requestQuizSessionCreate(registerRes.token, quizCreateRes.quizId, 2);
  requestSessionStateUpdate(registerRes.token, quizCreateRes.quizId, sessionRes.sessionId, Actions.NEXT_QUESTION);
  requestSessionStateUpdate(registerRes.token, quizCreateRes.quizId, sessionRes.sessionId, Actions.SKIP_COUNTDOWN);
  sleepSync(questionBody.duration * 1000);
  const statusRes1 = requestSessionStatus(registerRes.token, quizCreateRes.quizId, sessionRes.sessionId);
  expect(statusRes1.state).toStrictEqual(States.QUESTION_CLOSE);
  requestSessionStateUpdate(registerRes.token, quizCreateRes.quizId, sessionRes.sessionId, Actions.NEXT_QUESTION);
  requestSessionStateUpdate(registerRes.token, quizCreateRes.quizId, sessionRes.sessionId, Actions.SKIP_COUNTDOWN);
  sleepSync(1 * 1000);
  requestSessionStateUpdate(registerRes.token, quizCreateRes.quizId, sessionRes.sessionId, Actions.GO_TO_ANSWER);
  const statusRes2 = requestSessionStatus(registerRes.token, quizCreateRes.quizId, sessionRes.sessionId);
  expect(statusRes2.state).toStrictEqual(States.ANSWER_SHOW);
  requestSessionStateUpdate(registerRes.token, quizCreateRes.quizId, sessionRes.sessionId, Actions.GO_TO_FINAL_RESULTS);
  const statusRes3 = requestSessionStatus(registerRes.token, quizCreateRes.quizId, sessionRes.sessionId);
  expect(statusRes3.state).toStrictEqual(States.FINAL_RESULTS);
});

it('fails if sessionId is invalid', () => {
  const registerRes = requestAuthRegister(
    'users@unsw.edu.au',
    '1234abcd',
    'FirstName',
    'LastName'
  );
  const quizCreateRes = requestQuizCreate(registerRes.token, 'quiz', 'quiz', 'http://something.jpeg/');
  const quizCreateRes2 = requestQuizCreate(registerRes.token, 'quiz2', 'quiz2', 'http://something.jpeg/');
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
  requestQuizQuestionCreate(registerRes.token, quizCreateRes2.quizId, questionBody);
  requestQuizSessionCreate(registerRes.token, quizCreateRes.quizId, 2);
  const sessionRes2 = requestQuizSessionCreate(registerRes.token, quizCreateRes2.quizId, 2);
  const stateUpdateRes = requestSessionStateUpdate(registerRes.token, quizCreateRes.quizId, sessionRes2.sessionId, Actions.END);
  expect(stateUpdateRes).toStrictEqual({ error: expect.any(String) });
});

it('fails if invalid action enum', () => {
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
  const stateUpdateRes = requestSessionStateUpdate(registerRes.token, quizCreateRes.quizId, sessionRes.sessionId, Actions.END - 1000);
  expect(stateUpdateRes).toStrictEqual({ error: expect.any(String) });
});

it('fails if invalid token', () => {
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
  const stateUpdateRes = requestSessionStateUpdate(registerRes.token, quizCreateRes.quizId, sessionRes.sessionId, Actions.END);
  expect(stateUpdateRes).toStrictEqual({ error: expect.any(String) });
});

it('fails if token is valid but user does not own quiz', () => {
  const registerRes = requestAuthRegister(
    'users@unsw.edu.au',
    '1234abcd',
    'FirstName',
    'LastName'
  );
  const registerRes2 = requestAuthRegister(
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
  const stateUpdateRes = requestSessionStateUpdate(registerRes2.token, quizCreateRes.quizId, sessionRes.sessionId, Actions.END);
  expect(stateUpdateRes).toStrictEqual({ error: expect.any(String) });
});

it('fails if cannot go to answer', () => {
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
  const stateUpdateRes = requestSessionStateUpdate(registerRes.token, quizCreateRes.quizId, sessionRes.sessionId, Actions.GO_TO_ANSWER);
  expect(stateUpdateRes).toStrictEqual({ error: expect.any(String) });
});

it('fails if cannot go to finals results', () => {
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
  const stateUpdateRes = requestSessionStateUpdate(registerRes.token, quizCreateRes.quizId, sessionRes.sessionId, Actions.GO_TO_FINAL_RESULTS);
  expect(stateUpdateRes).toStrictEqual({ error: expect.any(String) });
});

it('fails if cannot go to end', () => {
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
  requestSessionStateUpdate(registerRes.token, quizCreateRes.quizId, sessionRes.sessionId, Actions.NEXT_QUESTION);
  requestSessionStateUpdate(registerRes.token, quizCreateRes.quizId, sessionRes.sessionId, Actions.SKIP_COUNTDOWN);
  requestSessionStateUpdate(registerRes.token, quizCreateRes.quizId, sessionRes.sessionId, Actions.GO_TO_ANSWER);
  const stateUpdateRes = requestSessionStateUpdate(registerRes.token, quizCreateRes.quizId, sessionRes.sessionId, Actions.END);
  expect(stateUpdateRes).toStrictEqual({ error: expect.any(String) });
});

it('fails if cannot go to next question', () => {
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
  requestSessionStateUpdate(registerRes.token, quizCreateRes.quizId, sessionRes.sessionId, Actions.NEXT_QUESTION);
  requestSessionStateUpdate(registerRes.token, quizCreateRes.quizId, sessionRes.sessionId, Actions.SKIP_COUNTDOWN);
  requestSessionStateUpdate(registerRes.token, quizCreateRes.quizId, sessionRes.sessionId, Actions.GO_TO_ANSWER);
  requestSessionStateUpdate(registerRes.token, quizCreateRes.quizId, sessionRes.sessionId, Actions.GO_TO_FINAL_RESULTS);
  const stateUpdateRes = requestSessionStateUpdate(registerRes.token, quizCreateRes.quizId, sessionRes.sessionId, Actions.NEXT_QUESTION);
  expect(stateUpdateRes).toStrictEqual({ error: expect.any(String) });
});

it('fails if cannot skip countdown', () => {
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
  const stateUpdateRes = requestSessionStateUpdate(registerRes.token, quizCreateRes.quizId, sessionRes.sessionId, Actions.SKIP_COUNTDOWN);
  expect(stateUpdateRes).toStrictEqual({ error: expect.any(String) });
});
