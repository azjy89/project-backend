import {
  requestAuthRegister,
  requestQuizCreate,
  requestClear,
  requestQuizQuestionCreate,
  requestPlayerJoin,
  requestQuizSessionCreate,
  requestMessagesList,
  requestMessageSend,
} from './httpRequests';

beforeEach(() => {
  requestClear();
});

afterAll(() => {
  requestClear();
});

const validMessage = 'Hello everyone! Nice to chat.';

it('successfully lists a messsage', () => {
  const registerRes = requestAuthRegister(
    'users@unsw.edu.au',
    '1234abcd',
    'FirstName',
    'LastName'
  );
  const quizCreateRes = requestQuizCreate(registerRes.token, 'quiz', 'quiz');
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
  const joinRes = requestPlayerJoin(sessionRes.sessionId, 'name');
  const messageRes = requestMessageSend(joinRes.playerId, validMessage);
  expect(messageRes).toStrictEqual({});
  const listRes = requestMessagesList(joinRes.playerId);
  expect(listRes.messages).toStrictEqual([
    {
      messageBody: `${validMessage}`,
      playerId: joinRes.playerId,
      playerName: 'name',
      timeSent: expect.any(Number),
    }
  ]);
});

it('successfully lists a messsage', () => {
  const registerRes = requestAuthRegister(
    'users@unsw.edu.au',
    '1234abcd',
    'FirstName',
    'LastName'
  );
  const quizCreateRes = requestQuizCreate(registerRes.token, 'quiz', 'quiz');
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
  const joinRes = requestPlayerJoin(sessionRes.sessionId, 'name');
  requestMessageSend(joinRes.playerId, validMessage);
  const listRes = requestMessagesList(joinRes.playerId);
  expect(listRes).toStrictEqual({
    messages: [
      {
        messageBody: `${validMessage}`,
        playerId: joinRes.playerId,
        playerName: 'name',
        timeSent: expect.any(Number),
      }
    ]
  });
});

it('two players successfully lists two messsages from two different players', () => {
  const registerRes = requestAuthRegister(
    'users@unsw.edu.au',
    '1234abcd',
    'FirstName',
    'LastName'
  );
  const quizCreateRes = requestQuizCreate(registerRes.token, 'quiz', 'quiz');
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
  const joinRes = requestPlayerJoin(sessionRes.sessionId, 'name');
  const joinRes2 = requestPlayerJoin(sessionRes.sessionId, 'name2');
  const messageRes = requestMessageSend(joinRes.playerId, validMessage);
  const messageRes2 = requestMessageSend(joinRes2.playerId, validMessage);
  expect(messageRes).toStrictEqual({});
  expect(messageRes2).toStrictEqual({});
  const listRes = requestMessagesList(joinRes.playerId);
  expect(listRes).toStrictEqual({
    messages: [
      {
        messageBody: `${validMessage}`,
        playerId: joinRes.playerId,
        playerName: 'name',
        timeSent: expect.any(Number),
      },
      {
        messageBody: `${validMessage}`,
        playerId: joinRes2.playerId,
        playerName: 'name2',
        timeSent: expect.any(Number),
      }
    ]
  });
});

it('fails if playerId does not exist', () => {
  const registerRes = requestAuthRegister(
    'users@unsw.edu.au',
    '1234abcd',
    'FirstName',
    'LastName'
  );
  const quizCreateRes = requestQuizCreate(registerRes.token, 'quiz', 'quiz');
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
  const joinRes = requestPlayerJoin(sessionRes.sessionId, 'name');
  requestMessageSend(joinRes.playerId, validMessage);
  const listRes = requestMessagesList(joinRes.playerId + 1);
  expect(listRes).toStrictEqual({ error: expect.any(String) });
});
