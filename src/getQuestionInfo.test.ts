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
  requestQuizInfo, 
  requestSessionStatus
} from '../src/httpRequests';

import {
  States,
  Actions,
  TokenReturn,
  QuizId,
  Quiz,
  QuestionBody,
  QuestionId,
  Question,
  AdminQuizInfoReturn,
  QuizSession, 
} from './interfaces';


beforeEach(() => {
  requestClear();
});

afterAll(() => {
  requestClear();
});

describe('Testing GET /v1/player/{playerid}/question/{questionposition}', () => {
  let registerRes: TokenReturn;
  let quizCreateRes: QuizId;
  let question: Question;
  let sessionRes: QuizSession;
  let questionCreateRes1: Question;
  let questionCreateRes2: Question;
  beforeEach(() => {
    requestClear();
    registerRes = requestAuthRegister('quiz@unsw.edu.au', 'abcd1234', 'Bobby', 'Dickens');
    quizCreateRes = requestQuizCreate(registerRes.token, 'COMP1531', 'Welcome!');
    const questionBody1: QuestionBody = {
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
    questionCreateRes1 = requestQuizQuestionCreate(registerRes.token, quizCreateRes.quizId, questionBody1);
    questionCreateRes2 = requestQuizQuestionCreate(registerRes.token, quizCreateRes.quizId, questionBody2);
    sessionRes = requestQuizSessionCreate(registerRes.token, quizCreateRes.quizId, 4);
  });

  test('successfully get current question information', () => {
    const playerRes = requestPlayerJoin(sessionRes.sessionId, "Random Player");
    requestSessionStateUpdate(registerRes.token, quizCreateRes.quizId, sessionRes.sessionId, Actions.NEXT_QUESTION);
    requestSessionStateUpdate(registerRes.token, quizCreateRes.quizId, sessionRes.sessionId, Actions.SKIP_COUNTDOWN);
    const questionInfoRes = requestQuestionInfo(playerRes.playerId, 1);
    const questionStatus = requestSessionStatus(registerRes.token, quizCreateRes.quizId, sessionRes.sessionId);
    expect(questionInfoRes).toEqual({
      questionId: questionCreateRes1.questionId,
      question: questionStatus.metadata.questions[0].question,
      duration: questionStatus.metadata.questions[0].duration,
      thumbnailUrl: questionStatus.metadata.questions[0].thumbnailUrl,
      points: questionStatus.metadata.questions[0].points,
      answers: [
        {
          answerId: questionStatus.metadata.questions[0].answers[0].answerId,
          answer: questionStatus.metadata.questions[0].answers[0].answer,
          colour: questionStatus.metadata.questions[0].answers[0].colour,
        },
        {
          answerId: questionStatus.metadata.questions[0].answers[1].answerId,
          answer: questionStatus.metadata.questions[0].answers[1].answer,
          colour: questionStatus.metadata.questions[0].answers[1].colour,
        }
      ]
    })
  });

  test('fails when player ID does not exist', () => {
    const playerRes = requestPlayerJoin(sessionRes.sessionId, "Random Player");
    requestSessionStateUpdate(registerRes.token, quizCreateRes.quizId, sessionRes.sessionId, Actions.NEXT_QUESTION);
    requestSessionStateUpdate(registerRes.token, quizCreateRes.quizId, sessionRes.sessionId, Actions.SKIP_COUNTDOWN);
    const questionInfoRes = requestQuestionInfo(playerRes.playerId + 1, 1);
    expect(questionInfoRes).toStrictEqual({ error: expect.any(String) });
  });

  test('fails if question position is not valid for the session this player is in', () => {
    const playerRes = requestPlayerJoin(sessionRes.sessionId, "Random Player");
    requestSessionStateUpdate(registerRes.token, quizCreateRes.quizId, sessionRes.sessionId, Actions.NEXT_QUESTION);
    requestSessionStateUpdate(registerRes.token, quizCreateRes.quizId, sessionRes.sessionId, Actions.SKIP_COUNTDOWN);
    const questionInfoRes = requestQuestionInfo(playerRes.playerId, 3);
    expect(questionInfoRes).toStrictEqual({ error: expect.any(String) });
  });

  test('fails if session is not currently on this question', () => {
    const playerRes = requestPlayerJoin(sessionRes.sessionId, "Random Player");
    requestSessionStateUpdate(registerRes.token, quizCreateRes.quizId, sessionRes.sessionId, Actions.NEXT_QUESTION);
    requestSessionStateUpdate(registerRes.token, quizCreateRes.quizId, sessionRes.sessionId, Actions.SKIP_COUNTDOWN);
    const questionInfoRes = requestQuestionInfo(playerRes.playerId, 2);
    expect(questionInfoRes).toStrictEqual({ error: expect.any(String) });
  });

  test('fails if session is in LOBBY state', () => {
    const playerRes = requestPlayerJoin(sessionRes.sessionId, "Random Player");
    const questionInfoRes = requestQuestionInfo(playerRes.playerId, 1);
    expect(questionInfoRes).toStrictEqual({ error: expect.any(String) });
  });

  test('fails if session is in QUESTION_COUNTDOWN state', () => {
    const playerRes = requestPlayerJoin(sessionRes.sessionId, "Random Player");
    requestSessionStateUpdate(registerRes.token, quizCreateRes.quizId, sessionRes.sessionId, Actions.NEXT_QUESTION);
    const questionInfoRes = requestQuestionInfo(playerRes.playerId, 1);
    expect(questionInfoRes).toStrictEqual({ error: expect.any(String) });
  });

  test('fails if session is in END state', () => {
    const playerRes = requestPlayerJoin(sessionRes.sessionId, "Random Player");
    requestSessionStateUpdate(registerRes.token, quizCreateRes.quizId, sessionRes.sessionId, Actions.END);
    const questionInfoRes = requestQuestionInfo(playerRes.playerId, 1);
    expect(questionInfoRes).toStrictEqual({ error: expect.any(String) });
  });
});
