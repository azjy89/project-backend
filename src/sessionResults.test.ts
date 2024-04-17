import * as path from 'path';
import { deleteFolderRecursive } from './helpers';

import {
  requestClear,
  requestQuizCreate,
  requestAuthRegister,
  requestQuizQuestionCreate,
  requestQuizSessionCreate,
  requestPlayerJoin,
  requestSessionResults,
  requestSessionStateUpdate,
  requestQuestionSubmit,
  requestSessionResultsCsv,
} from './httpRequests';

import {
  Token,
  ErrorObject,
  QuizId,
  SessionId,
  PlayerId,
  QuestionBody,
  Actions,
  QuestionId
} from './interfaces';

const ERROR = { error: expect.any(String) };
const NUMBER = expect.any(Number);

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
  let sessionRes;
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

    requestSessionStateUpdate(token.token, quizId.quizId, sessionId.sessionId, Actions.SKIP_COUNTDOWN);
    requestQuestionSubmit(playerId1.playerId, 1, [0]);
    requestQuestionSubmit(playerId2.playerId, 1, [0]);
    requestQuestionSubmit(playerId3.playerId, 1, [1]);
  });

  test('Error conditions', () => {
    // lobby state
    expect(requestSessionResults(token.token, quizId.quizId, sessionId.sessionId)).toStrictEqual(ERROR);
    expect(requestSessionResultsCsv(token.token, quizId.quizId, sessionId.sessionId)).toStrictEqual(ERROR);

    // Invalid token
    requestSessionStateUpdate(token.token, quizId.quizId, sessionId.sessionId, Actions.GO_TO_ANSWER);
    requestSessionStateUpdate(token.token, quizId.quizId, sessionId.sessionId, Actions.GO_TO_FINAL_RESULTS);
    expect(requestSessionResults('123', quizId.quizId, sessionId.sessionId)).toStrictEqual(ERROR);
    expect(requestSessionResultsCsv('123', quizId.quizId, sessionId.sessionId)).toStrictEqual(ERROR);

    // user doesnt own the quiz
    const randomUser = requestAuthRegister('mewmew@gmail.com', 'asdbf1235', 'Joanna', 'Zhong');
    const randomToken = randomUser as Token;
    expect(requestSessionResults(randomToken.token, quizId.quizId, sessionId.sessionId)).toStrictEqual(ERROR);
    expect(requestSessionResultsCsv(randomToken.token, quizId.quizId, sessionId.sessionId)).toStrictEqual(ERROR);

    // session id doesnt exist
    expect(requestSessionResults(token.token, quizId.quizId, 123)).toStrictEqual(ERROR);
    expect(requestSessionResultsCsv(token.token, quizId.quizId, 123)).toStrictEqual(ERROR);

    // check lobby state again
    requestSessionStateUpdate(token.token, quizId.quizId, sessionId.sessionId, Actions.END);
    expect(requestSessionResults(token.token, quizId.quizId, sessionId.sessionId)).toStrictEqual(ERROR);
    expect(requestSessionResultsCsv(token.token, quizId.quizId, sessionId.sessionId)).toStrictEqual(ERROR);
  });
});

describe('Successful case', () => {
  let registerRes: Token | ErrorObject;
  let quizRes: QuizId | ErrorObject;
  let sessionRes;
  let playerRes1: PlayerId | ErrorObject;
  let playerRes2: PlayerId | ErrorObject;
  let playerRes3: PlayerId | ErrorObject;
  let token: Token;
  let quizId: QuizId;
  let sessionId: SessionId;
  let playerId1: PlayerId;
  let playerId2: PlayerId;
  let playerId3: PlayerId;
  let questionId1: QuestionId;
  let questionId2: QuestionId;
  let question1: QuestionId | ErrorObject;
  let question2: QuestionId | ErrorObject;
  beforeEach(() => {
    registerRes = requestAuthRegister(email, password, firstName, lastName);
    token = registerRes as Token;
    quizRes = requestQuizCreate(token.token, quizName, quizDescription);
    quizId = quizRes as QuizId;
    question1 = requestQuizQuestionCreate(token.token, quizId.quizId, questionBody1);
    question2 = requestQuizQuestionCreate(token.token, quizId.quizId, questionBody2);
    questionId1 = question1 as QuestionId;
    questionId2 = question2 as QuestionId;
    sessionRes = requestQuizSessionCreate(token.token, quizId.quizId, 3);
    sessionId = sessionRes as SessionId;
    playerRes1 = requestPlayerJoin(sessionId.sessionId, player1);
    playerRes2 = requestPlayerJoin(sessionId.sessionId, player2);
    playerRes3 = requestPlayerJoin(sessionId.sessionId, player3);
    playerId1 = playerRes1 as PlayerId;
    playerId2 = playerRes2 as PlayerId;
    playerId3 = playerRes3 as PlayerId;

    requestSessionStateUpdate(token.token, quizId.quizId, sessionId.sessionId, Actions.SKIP_COUNTDOWN);
    requestQuestionSubmit(playerId1.playerId, 1, [0]);
    requestQuestionSubmit(playerId2.playerId, 1, [0]);
    requestQuestionSubmit(playerId3.playerId, 1, [1]);
    requestSessionStateUpdate(token.token, quizId.quizId, sessionId.sessionId, Actions.GO_TO_ANSWER);
    requestSessionStateUpdate(token.token, quizId.quizId, sessionId.sessionId, Actions.NEXT_QUESTION);
    requestSessionStateUpdate(token.token, quizId.quizId, sessionId.sessionId, Actions.SKIP_COUNTDOWN);
    requestQuestionSubmit(playerId1.playerId, 2, [0]);
    requestQuestionSubmit(playerId2.playerId, 2, [0]);
    requestQuestionSubmit(playerId3.playerId, 2, [1]);
  });

  test('Successful output', () => {
    requestSessionStateUpdate(token.token, quizId.quizId, sessionId.sessionId, Actions.GO_TO_ANSWER);
    requestSessionStateUpdate(token.token, quizId.quizId, sessionId.sessionId, Actions.GO_TO_FINAL_RESULTS);
    const boom = requestSessionResults(token.token, quizId.quizId, sessionId.sessionId);
    expect(boom).toStrictEqual(
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
              player1,
              player2
            ],
            averageAnswerTime: NUMBER,
            percentCorrect: NUMBER
          },
          {
            questionId: questionId2.questionId,
            playersCorrectList: [
              player1,
              player2
            ],
            averageAnswerTime: NUMBER,
            percentCorrect: NUMBER
          },
        ],
      }
    );
    expect(requestSessionResultsCsv(token.token, quizId.quizId, sessionId.sessionId)).toStrictEqual({ url: expect.any(String) });
    deleteFolderRecursive(path.join(__dirname, '../results'));
    expect(requestSessionResultsCsv(token.token, quizId.quizId, sessionId.sessionId)).toStrictEqual({ url: expect.any(String) });
  });
});
