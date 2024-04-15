import {
  requestAuthRegister,
  requestQuizCreate,
  requestClear,
  requestQuizQuestionCreate,
  requestSessionStatus,
  requestSessionStateUpdate,
  requestQuizSessionCreate, 
  requestPlayerJoin,
  requestPlayerStatus,
  requestQuestionInfo,
  requestQuizInfo,
  requestSubmitAnswer
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

describe('Testing PUT /v1/player/{playerid}/question/{questionposition}/answer', () => {
  let registerRes: TokenReturn;
  let quizCreateRes: QuizId;
  let question: Question;
  let sessionRes: Session;
  beforeEach(() => {
    registerRes = requestAuthRegister('quiz@unsw.edu.au', 'abcd1234', 'Bobby', 'Dickens');
    quizCreateRes = requestQuizCreate(resToken.token, 'COMP1531', 'Welcome!');
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
    questionCreateRes = requestQuizQuestionCreate(resToken.token, quizCreateRes.quizId, questionBody1);
    questionCreateRes = requestQuizQuestionCreate(resToken.token, quizCreateRes.quizId, questionBody2);
    sessionRes = requestQuizSessionCreate(registerRes.token, quizCreateRes.quizId, 4);
  });

  test('successfully submit answer', () => {
    const playerRes = requestPlayerJoin(sessionRes.sessionId, "Random Player");
    requestSessionStateUpdate(registerRes.token, quizCreateRes.quizId, sessionRes.sessionId, Actions.NEXT_QUESTION);
    requestSessionStateUpdate(registerRes.token, quizCreateRes.quizId, sessionRes.sessionId, Actions.SKIP_COUNTDOWN);
    const questionInfoRes = requestQuestionInfo(playerRes.playerId, 1);
    const questionAnswerId = questionInfoRes.answers[0].answerId;
    const submitAnswerRes = requestSubmitAnswer([questionAnswerId], playerRes.playerid, 1);
    expect(submitAnswerRes).toStrictEqual({});
  });

  test('fails when player ID does not exist', () => {
    const playerRes = requestPlayerJoin(sessionRes.sessionId, "Random Player");
    requestSessionStateUpdate(registerRes.token, quizCreateRes.quizId, sessionRes.sessionId, Actions.NEXT_QUESTION);
    requestSessionStateUpdate(registerRes.token, quizCreateRes.quizId, sessionRes.sessionId, Actions.SKIP_COUNTDOWN);
    const questionInfoRes = requestQuestionInfo(playerRes.playerId, 1);
    const questionAnswerId = questionInfoRes.answers[0].answerId;
    const submitAnswerRes = requestSubmitAnswer([questionAnswerId], playerRes.playerid + 1, 1);
    expect(submitAnswerRes).toStrictEqual({ error: expect.any(String) });
  });

  test('fails when question position is not valid for the session this player is in', () => {
    const playerRes = requestPlayerJoin(sessionRes.sessionId, "Random Player");
    requestSessionStateUpdate(registerRes.token, quizCreateRes.quizId, sessionRes.sessionId, Actions.NEXT_QUESTION);
    requestSessionStateUpdate(registerRes.token, quizCreateRes.quizId, sessionRes.sessionId, Actions.SKIP_COUNTDOWN);
    const questionInfoRes = requestQuestionInfo(playerRes.playerId, 1);
    const questionAnswerId = questionInfoRes.answers[0].answerId;
    const submitAnswerRes = requestSubmitAnswer([questionAnswerId], playerRes.playerid, 3);
    expect(submitAnswerRes).toStrictEqual({ error: expect.any(String) });
  });

  test('fails if session is not in QUESTION_OPEN state', () => {
    const playerRes = requestPlayerJoin(sessionRes.sessionId, "Random Player");
    const questionInfoRes = requestQuestionInfo(playerRes.playerId, 1);
    const questionAnswerId = questionInfoRes.answers[0].answerId;
    const submitAnswerRes = requestSubmitAnswer([questionAnswerId], playerRes.playerid, 1);
    expect(submitAnswerRes).toStrictEqual({ error: expect.any(String) });
  });

  test('fails if session is in QUESTION_COUNTDOWN state', () => {
    const playerRes = requestPlayerJoin(sessionRes.sessionId, "Random Player");
    requestSessionStateUpdate(registerRes.token, quizCreateRes.quizId, sessionRes.sessionId, Actions.NEXT_QUESTION);
    const questionInfoRes = requestQuestionInfo(playerRes.playerId, 1);
    const questionAnswerId = questionInfoRes.answers[0].answerId;
    const submitAnswerRes = requestSubmitAnswer([questionAnswerId], playerRes.playerid, 1);
    expect(submitAnswerRes).toStrictEqual({ error: expect.any(String) });
  });

  test('fails if session is not yet up to this question', () => {
    const playerRes = requestPlayerJoin(sessionRes.sessionId, "Random Player");
    requestSessionStateUpdate(registerRes.token, quizCreateRes.quizId, sessionRes.sessionId, Actions.NEXT_QUESTION);
    requestSessionStateUpdate(registerRes.token, quizCreateRes.quizId, sessionRes.sessionId, Actions.SKIP_COUNTDOWN);
    const questionInfoRes = requestQuestionInfo(playerRes.playerId, 1);
    const questionAnswerId = questionInfoRes.answers[0].answerId;
    const submitAnswerRes = requestSubmitAnswer([questionAnswerId], playerRes.playerid, 2);
    expect(submitAnswerRes).toStrictEqual({ error: expect.any(String) });
  });

  test('Answer IDs are not valid for this particular question', () => {
    const playerRes = requestPlayerJoin(sessionRes.sessionId, "Random Player");
    const questionInfoRes = requestQuestionInfo(playerRes.playerId, 1);
    const questionAnswerId = questionInfoRes.answers[0].answerId;
    const submitAnswerRes = requestSubmitAnswer([questionAnswerId + 1], playerRes.playerid, 1);
    expect(submitAnswerRes).toStrictEqual({ error: expect.any(String) });
  });

  test('There are duplicate answer IDs provided', () => {
    const playerRes = requestPlayerJoin(sessionRes.sessionId, "Random Player");
    const questionInfoRes = requestQuestionInfo(playerRes.playerId, 1);
    const questionAnswerId = questionInfoRes.answers[0].answerId;
    const submitAnswerRes = requestSubmitAnswer([questionAnswerId, questionAnswerId], playerRes.playerid, 1);
    expect(submitAnswerRes).toStrictEqual({ error: expect.any(String) });
  });

  test('Less than 1 answer ID was submitted', () => {
    const playerRes = requestPlayerJoin(sessionRes.sessionId, "Random Player");
    const questionInfoRes = requestQuestionInfo(playerRes.playerId, 1);
    const questionAnswerId = questionInfoRes.answers[0].answerId;
    const submitAnswerRes = requestSubmitAnswer([], playerRes.playerid, 1);
    expect(submitAnswerRes).toStrictEqual({ error: expect.any(String) });
  });
});






