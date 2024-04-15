import {
  requestClear,
  requestQuizCreaste,
  requestAuthRegister,
  requestQuizQuestionCreate,
  requestSessionCreate,
  requestPlayerJoin,
  requestPlayerAnswerSubmit,
  requestSessionStateUpdate,
  requestPlayerFinalResults
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
  let token: Token;
  let quizId: QuizId;
  let sessionId: SessionId;
  let playerId1: PlayerId;
  beforeEach(() => {
    registerRes = requestAuthRegister(email, password, firstName, lastName);
    token = registerRes as Token;
    quizRes = requestQuizCreate(token.token, quizName, quizDescription);
    quizId = quizRes as QuizId;
    requestQuizQuestionCreate(token.token, quizId.quizId, questionBody);
    sessionRes = requestSessionCreate(token.token, quizId.quizId, 5);
    sessionId = sessionRes as SessionId;
    playerRes1 = requestPlayerJoin(sessionId.sessionId, player1);
    playerId1 = playerRes1 as PlayerId;
  });

  test('Invalid state or ID of some form', () => {
    // Lobby state
    expect(requestPlayerFinalResults(playerId1.playerId)).toStrictEqual(ERROR);
    requestSessionStateUpdate(token.token, quizId.quizId, sessionId.sessionId, 'NEXT_QUESTION');
    requestSessionStateUpdate(token.token, quizId.quizId, sessionId.sessionId, 'GO_TO_FINAL_RESULTS');
    // Playerid doesnt exist
    expect(requestPlayerFinalResults(123)).toStrictEqual(ERROR);
  });
});

describe('Successful playerfinalresults', () => {
  let sessionRes: SessionId | ErrorObject;
  let playerRes1: PlayerId | ErrorObject;
  let token: Token;
  let quizId: QuizId;
  let sessionId: SessionId;
  let playerId1: PlayerId;
  beforeEach(() => {
    registerRes = requestAuthRegister(email, password, firstName, lastName);
    token = registerRes as Token;
    quizRes = requestQuizCreate(token.token, quizName, quizDescription);
    quizId = quizRes as QuizId;
    question1 = requestQuizQuestionCreate(token.token, quizId.quizId, questionBody);
    question2 = requestQuizQuestionCreate(token.token, quizId.quizId, questionBody1);
    questionId1 = question1 as QuestionId;
    questionId2 = question2 as QuestionId;
    sessionRes = requestSessionCreate(token.token, quizId.quizId, 3);
    sessionId = sessionRes as SessionId;
    playerRes1 = requestPlayerJoin(sessionId.sessionId, player1);
    playerId1 = playerRes1 as PlayerId;
  });

  test('Correct Output', () => {
    const playerRes2 = requestPlayerJoin(sessionId.sessionId, player2);
    const playerRes3 = requestPlayerJoin(sessionId.sessionId, player3);
    const playerId2 = playerRes2 as PlayerId;
    const playerId3 = playerRes3 as PlayerId;

    requestSessionStateUpdate(token.token, quizId.quizId, sessionId.sessionId, 'NEXT_QUESTION');
    requestPlayerAnswerSubmit(playerId1.playerId, 1, [0]);
    requestPlayerAnswerSubmit(playerId2.playerId, 1, [1]);
    requestPlayerAnswerSubmit(playerId3.playerId, 1, [1]);
    requestSessionStateUpdate(token.token, quizId.quizId, sessionId.sessionId, 'NEXT_QUESTION');
    requestPlayerAnswerSubmit(playerId1.playerId, 2, [0, 2]);
    requestPlayerAnswerSubmit(playerId2.playerId, 2, [0, 2]);
    requestPlayerAnswerSubmit(playerId3.playerId, 2, [1]);
    requestSessionStateUpdate(token.token, quizId.quizId, sessionId.sessionId, 'GO_TO_FINAL_RESULTS');
    expect(requestPlayerFinalResults(playerId.playerId)).toStrictEqual(
      {
        usersRankedByScore: [
          {
            name: player1,
            score: NUMBER
          },
          {
            name: player2,
            score: NUMBER
          },
          {
            name: player3,
            score: NUMBER
          }
        ],
        questionResults: [
          {
            questionId: questionId1.questionId,
            playersCorrectList: [
              player1
            ],
            averageAnswerTime: NUMBER,
            percentCorrect: NUMBER
          },
          {
            questionId: questionId2.questionId,
            playersCorrectList: [
              player1,
              player2
            ]
          }
        ],
        averageAnswerTime: NUMBER,
        percentCorrect: NUMBER
      }
    )
  });
});