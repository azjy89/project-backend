import {
  requestClear,
  requestQuizCreate,
  requestAuthRegister,
  requestQuizQuestionCreate,
  requestQuizSessionCreate,
  requestPlayerJoin,
  requestPlayerAnswerSubmit,
  requestPlayerQuestionResults,
  requestSessionStateUpdate,
} from './httpRequests';

const ERROR = { error: expect.any(String) };
const NUMBER = expect.any(Number);

import {
  Token,
  ErrorObject,
  QuizId,
  SessionId,
  PlayerId,
  QuestionBody,
  Actions
} from './interfaces';

const firstName = 'Bobby';
const lastName = 'Builder';
const email = 'users@unsw.edu.au';
const password = '1234abcd';
const quizName = 'Construction sites';
const quizDescription = 'Test yourself against Bobbys knowledge of construction';
const questionBody: QuestionBody = {
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
const questionBody1 = {
  question: 'Why are you sleeping?',
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
    },
    {
      answer: 'Bobby the licker',
      correct: true
    }
  ],
  thumbnailUrl: 'https://steamuserimages-a.akamaihd.net/ugc/2287332779831334224/EF3F8F1CF9E9A1395686A5B39FC67C64C851BE0D/?imw=637&imh=358&ima=fit&impolicy=Letterbox&imcolor=%23000000&letterbox=true.jpeg',
};
const questionBody2 = {
  question: 'How are you sleeping?',
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

const player1 = 'Nonny';
const player2 = 'Rorry';
const player3 = 'Coccy';

beforeEach(() => {
  requestClear();
});

afterAll(() => {
  requestClear();
});

describe('Error handling', () => {
  let registerRes: Token | ErrorObject;
  let quizRes: QuizId | ErrorObject;
  let sessionRes: SessionId | ErrorObject;
  let playerRes1: PlayerId | ErrorObject;
  let playerRes2: PlayerId | ErrorObject;
  let playerRes3: PlayerId | ErrorObject;
  let token: Token;
  let quizId: QuizId;
  let sessionId: SessionId;
  let playerId1: PlayerId;
  let playerId2: PlayerId;
  let playerId3: PlayerId;
  beforeEach(() => {
    registerRes = requestAuthRegister(email, password, firstName, lastName);
    token = registerRes as Token;
    quizRes = requestQuizCreate(token.token, quizName, quizDescription);
    quizId = quizRes as QuizId;
    requestQuizQuestionCreate(token.token, quizId.quizId, questionBody);
    requestQuizQuestionCreate(token.token, quizId.quizId, questionBody1);
    sessionRes = requestQuizSessionCreate(token.token, quizId.quizId, 3);
    sessionId = sessionRes as SessionId;
    playerRes1 = requestPlayerJoin(sessionId.sessionId, player1);
    playerRes2 = requestPlayerJoin(sessionId.sessionId, player2);
    playerRes3 = requestPlayerJoin(sessionId.sessionId, player3);
    playerId1 = playerRes1 as PlayerId;
    playerId2 = playerRes2 as PlayerId;
    playerId3 = playerRes3 as PlayerId;
    requestPlayerAnswerSubmit(playerId1.playerId, 1, [0]);
    requestPlayerAnswerSubmit(playerId2.playerId, 1, [0]);
    requestPlayerAnswerSubmit(playerId3.playerId, 1, [1]);
  });

  test('Invalid state or ID of some form', () => {
    // Lobby state
    expect(requestPlayerQuestionResults(playerId1.playerId, 1)).toStrictEqual(ERROR);
    requestSessionStateUpdate(token.token, quizId.quizId, sessionId.sessionId, Actions.GO_TO_ANSWER);
    // Question position not reached yet
    expect(requestPlayerQuestionResults(playerId1.playerId, 2)).toStrictEqual(ERROR);
    // Questionposition doesnt exist
    expect(requestPlayerQuestionResults(playerId1.playerId, 10)).toStrictEqual(ERROR);
    // Playerid doesnt exist
    expect(requestPlayerQuestionResults(123, 2)).toStrictEqual(ERROR);
  });
});

describe('Successful playerquestionresults', () => {
  let registerRes: Token | ErrorObject;
  let quizRes: QuizId | ErrorObject;
  let sessionRes: SessionId | ErrorObject;
  let playerRes1: PlayerId | ErrorObject;
  let playerRes2: PlayerId | ErrorObject;
  let playerRes3: PlayerId | ErrorObject;
  let token: Token;
  let quizId: QuizId;
  let sessionId: SessionId;
  let playerId1: PlayerId;
  let playerId2: PlayerId;
  let playerId3: PlayerId;
  beforeEach(() => {
    registerRes = requestAuthRegister(email, password, firstName, lastName);
    token = registerRes as Token;
    quizRes = requestQuizCreate(token.token, quizName, quizDescription);
    quizId = quizRes as QuizId;
    requestQuizQuestionCreate(token.token, quizId.quizId, questionBody);
    requestQuizQuestionCreate(token.token, quizId.quizId, questionBody1);
    sessionRes = requestQuizSessionCreate(token.token, quizId.quizId, 3);
    sessionId = sessionRes as SessionId;
    playerRes1 = requestPlayerJoin(sessionId.sessionId, player1);
    playerRes2 = requestPlayerJoin(sessionId.sessionId, player2);
    playerRes3 = requestPlayerJoin(sessionId.sessionId, player3);
    playerId1 = playerRes1 as PlayerId;
    playerId2 = playerRes2 as PlayerId;
    playerId3 = playerRes3 as PlayerId;
    requestPlayerAnswerSubmit(playerId1.playerId, 1, [0]);
    requestPlayerAnswerSubmit(playerId2.playerId, 1, [0]);
    requestPlayerAnswerSubmit(playerId3.playerId, 1, [1]);
    requestSessionStateUpdate(token.token, quizId.quizId, sessionId.sessionId, Actions.GO_TO_ANSWER);
  });
  test('Successful', () => {
    expect(requestPlayerQuestionResults(playerId1.playerId, 1)).toStrictEqual({
      questionId: NUMBER,
      playersCorrectList: [
        'Rorry',
        'Nonny'
      ],
      averageAnswerTime: NUMBER,
      percentCorrect: 50
    });
    expect(requestPlayerQuestionResults(playerId2.playerId, 1)).toStrictEqual({
      questionId: NUMBER,
      playersCorrectList: [
        'Rorry',
        'Nonny'
      ],
      averageAnswerTime: NUMBER,
      percentCorrect: 50
    });
    expect(requestPlayerQuestionResults(playerId3.playerId, 1)).toStrictEqual({
      questionId: NUMBER,
      playersCorrectList: [
        'Rorry',
        'Nonny'
      ],
      averageAnswerTime: NUMBER,
      percentCorrect: 50
    });
    requestSessionStateUpdate(token.token, quizId.quizId, sessionId.sessionId, Actions.NEXT_QUESTION);
    requestPlayerAnswerSubmit(playerId1.playerId, 2, [0, 1]);
    requestPlayerAnswerSubmit(playerId2.playerId, 2, [1, 0]);
    requestPlayerAnswerSubmit(playerId3.playerId, 2, [0, 2]);
    requestSessionStateUpdate(token.token, quizId.quizId, sessionId.sessionId, Actions.GO_TO_ANSWER);
    expect(requestPlayerQuestionResults(playerId1.playerId, 2)).toStrictEqual(
      [
        {
          questionId: NUMBER,
          playersCorrectList: [
            'Rorry',
            'Coccy',
            'Nonny',
          ],
          averageAnswerTime: NUMBER,
          percentCorrect: 25
        },
        {
          questionId: NUMBER,
          playersCorrectList: [
            'Coccy',
          ],
          averageAnswerTime: NUMBER,
          percentCorrect: 25
        }
      ]
    );
    requestSessionStateUpdate(token.token, quizId.quizId, sessionId.sessionId, Actions.NEXT_QUESTION);
    requestSessionStateUpdate(token.token, quizId.quizId, sessionId.sessionId, Actions.GO_TO_ANSWER);
    expect(requestPlayerQuestionResults(playerId1.playerId, 3)).toStrictEqual(
      [
        {
          questionId: NUMBER,
          playersCorrectList: [
            
          ],
          averageAnswerTime: 0,
          percentCorrect: 0
        },
        {
          questionId: NUMBER,
          playersCorrectList: [
            
          ],
          averageAnswerTime: 0,
          percentCorrect: 0
        }
      ]
    );
  });
});