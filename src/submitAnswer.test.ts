import {
  requestAuthRegister,
  requestQuizCreate,
  requestClear,
  requestQuizQuestionCreate,
  requestSessionStatus,
  requestSessionStateUpdate,
  requestQuizSessionCreate,
  requestPlayerJoin,
  requestQuestionSubmit,
  requestPlayerQuestionResults,
} from '../src/httpRequests';

import {
  States,
  Actions,
  TokenReturn,
  QuizId,
  QuestionBody,
  QuizSession,
  QuestionId,
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
  let questionRes1: QuestionId;
  let sessionRes: QuizSession;
  beforeEach(() => {
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
          answer: 'Answer 1',
          correct: true
        },
        {
          answer: 'Answer 2',
          correct: false
        }
      ],
      thumbnailUrl: 'https://steamuserimages-a.akamaihd.net/ugc/2287332779831334224/EF3F8F1CF9E9A1395686A5B39FC67C64C851BE0D/?imw=637&imh=358&ima=fit&impolicy=Letterbox&imcolor=%23000000&letterbox=true.jpeg',
    };
    questionRes1 = requestQuizQuestionCreate(registerRes.token, quizCreateRes.quizId, questionBody1);
    requestQuizQuestionCreate(registerRes.token, quizCreateRes.quizId, questionBody2);
    sessionRes = requestQuizSessionCreate(registerRes.token, quizCreateRes.quizId, 4);
  });

  test('successfully submit answer', () => {
    const playerRes = requestPlayerJoin(sessionRes.sessionId, 'Random Player');
    requestSessionStateUpdate(registerRes.token, quizCreateRes.quizId, sessionRes.sessionId, Actions.NEXT_QUESTION);
    requestSessionStateUpdate(registerRes.token, quizCreateRes.quizId, sessionRes.sessionId, Actions.SKIP_COUNTDOWN);
    const questionStatus = requestSessionStatus(registerRes.token, quizCreateRes.quizId, sessionRes.sessionId);
    expect(questionStatus.state).toStrictEqual(States.QUESTION_OPEN);
    const questionAnswerId = questionStatus.metadata.questions[0].answers[0].answerId;
    const submitAnswerRes = requestQuestionSubmit(playerRes.playerId, 1, [questionAnswerId]);
    expect(submitAnswerRes).toStrictEqual({});
    requestSessionStateUpdate(registerRes.token, quizCreateRes.quizId, sessionRes.sessionId, Actions.GO_TO_ANSWER);
    const resultRes = requestPlayerQuestionResults(playerRes.playerId, 1);
    expect(resultRes).toStrictEqual({
      questionId: questionRes1.questionId,
      playersCorrectList: ['Random Player'],
      averageAnswerTime: expect.any(Number),
      percentCorrect: 100,
    });
  });

  test('successfully submit answer2', () => {
    const playerRes = requestPlayerJoin(sessionRes.sessionId, 'Random Player');
    const playerRes2 = requestPlayerJoin(sessionRes.sessionId, 'Random Player2');
    requestSessionStateUpdate(registerRes.token, quizCreateRes.quizId, sessionRes.sessionId, Actions.NEXT_QUESTION);
    requestSessionStateUpdate(registerRes.token, quizCreateRes.quizId, sessionRes.sessionId, Actions.SKIP_COUNTDOWN);
    const questionStatus = requestSessionStatus(registerRes.token, quizCreateRes.quizId, sessionRes.sessionId);
    expect(questionStatus.state).toStrictEqual(States.QUESTION_OPEN);
    const questionAnswerId = questionStatus.metadata.questions[0].answers[0].answerId;
    const questionAnswerId2 = questionStatus.metadata.questions[0].answers[1].answerId;
    const submitAnswerRes = requestQuestionSubmit(playerRes.playerId, 1, [questionAnswerId]);
    const submitAnswerRes2 = requestQuestionSubmit(playerRes2.playerId, 1, [questionAnswerId2]);
    expect(submitAnswerRes2).toStrictEqual({});
    expect(submitAnswerRes).toStrictEqual({});
    requestSessionStateUpdate(registerRes.token, quizCreateRes.quizId, sessionRes.sessionId, Actions.GO_TO_ANSWER);
    const resultRes = requestPlayerQuestionResults(playerRes.playerId, 1);
    expect(resultRes).toStrictEqual({
      questionId: questionRes1.questionId,
      playersCorrectList: ['Random Player'],
      averageAnswerTime: expect.any(Number),
      percentCorrect: 50,
    });
  });

  test('fails when player ID does not exist', () => {
    const playerRes = requestPlayerJoin(sessionRes.sessionId, 'Random Player');
    requestSessionStateUpdate(registerRes.token, quizCreateRes.quizId, sessionRes.sessionId, Actions.NEXT_QUESTION);
    requestSessionStateUpdate(registerRes.token, quizCreateRes.quizId, sessionRes.sessionId, Actions.SKIP_COUNTDOWN);
    const questionStatus = requestSessionStatus(registerRes.token, quizCreateRes.quizId, sessionRes.sessionId);
    const questionAnswerId = questionStatus.metadata.questions[0].answers[0].answerId;
    const submitAnswerRes = requestQuestionSubmit(playerRes.playerId + 1, 1, [questionAnswerId]);
    expect(submitAnswerRes).toStrictEqual({ error: expect.any(String) });
  });

  test('fails when question position is not valid for the session this player is in', () => {
    const playerRes = requestPlayerJoin(sessionRes.sessionId, 'Random Player');
    requestSessionStateUpdate(registerRes.token, quizCreateRes.quizId, sessionRes.sessionId, Actions.NEXT_QUESTION);
    requestSessionStateUpdate(registerRes.token, quizCreateRes.quizId, sessionRes.sessionId, Actions.SKIP_COUNTDOWN);
    const questionStatus = requestSessionStatus(registerRes.token, quizCreateRes.quizId, sessionRes.sessionId);
    const questionAnswerId = questionStatus.metadata.questions[0].answers[0].answerId;
    const submitAnswerRes = requestQuestionSubmit(playerRes.playerId, 3, [questionAnswerId]);
    expect(submitAnswerRes).toStrictEqual({ error: expect.any(String) });
  });

  test('fails if session is not in QUESTION_OPEN state', () => {
    const playerRes = requestPlayerJoin(sessionRes.sessionId, 'Random Player');
    const questionStatus = requestSessionStatus(registerRes.token, quizCreateRes.quizId, sessionRes.sessionId);
    const questionAnswerId = questionStatus.metadata.questions[0].answers[0].answerId;
    const submitAnswerRes = requestQuestionSubmit(playerRes.playerId, 1, [questionAnswerId]);
    expect(submitAnswerRes).toStrictEqual({ error: expect.any(String) });
  });

  test('fails if session is in QUESTION_COUNTDOWN state', () => {
    const playerRes = requestPlayerJoin(sessionRes.sessionId, 'Random Player');
    requestSessionStateUpdate(registerRes.token, quizCreateRes.quizId, sessionRes.sessionId, Actions.NEXT_QUESTION);
    const questionStatus = requestSessionStatus(registerRes.token, quizCreateRes.quizId, sessionRes.sessionId);
    const questionAnswerId = questionStatus.metadata.questions[0].answers[0].answerId;
    const submitAnswerRes = requestQuestionSubmit(playerRes.playerId, 1, [questionAnswerId]);
    expect(submitAnswerRes).toStrictEqual({ error: expect.any(String) });
  });

  test('fails if session is not yet up to this question', () => {
    const playerRes = requestPlayerJoin(sessionRes.sessionId, 'Random Player');
    requestSessionStateUpdate(registerRes.token, quizCreateRes.quizId, sessionRes.sessionId, Actions.NEXT_QUESTION);
    requestSessionStateUpdate(registerRes.token, quizCreateRes.quizId, sessionRes.sessionId, Actions.SKIP_COUNTDOWN);
    const questionStatus = requestSessionStatus(registerRes.token, quizCreateRes.quizId, sessionRes.sessionId);
    const questionAnswerId = questionStatus.metadata.questions[0].answers[0].answerId;
    const submitAnswerRes = requestQuestionSubmit(playerRes.playerId, 2, [questionAnswerId]);
    expect(submitAnswerRes).toStrictEqual({ error: expect.any(String) });
  });

  test('Answer IDs are not valid for this particular question', () => {
    const playerRes = requestPlayerJoin(sessionRes.sessionId, 'Random Player');
    requestSessionStateUpdate(registerRes.token, quizCreateRes.quizId, sessionRes.sessionId, Actions.NEXT_QUESTION);
    requestSessionStateUpdate(registerRes.token, quizCreateRes.quizId, sessionRes.sessionId, Actions.SKIP_COUNTDOWN);
    const questionStatus = requestSessionStatus(registerRes.token, quizCreateRes.quizId, sessionRes.sessionId);
    const question2AnswerId = questionStatus.metadata.questions[1].answers[1].answerId;
    const submitAnswerRes = requestQuestionSubmit(playerRes.playerId, 1, [question2AnswerId + 10]);
    expect(submitAnswerRes).toStrictEqual({ error: expect.any(String) });
  });

  test('There are duplicate answer IDs provided', () => {
    const playerRes = requestPlayerJoin(sessionRes.sessionId, 'Random Player');
    requestSessionStateUpdate(registerRes.token, quizCreateRes.quizId, sessionRes.sessionId, Actions.NEXT_QUESTION);
    requestSessionStateUpdate(registerRes.token, quizCreateRes.quizId, sessionRes.sessionId, Actions.SKIP_COUNTDOWN);
    const questionStatus = requestSessionStatus(registerRes.token, quizCreateRes.quizId, sessionRes.sessionId);
    const questionAnswerId = questionStatus.metadata.questions[0].answers[0].answerId;
    const submitAnswerRes = requestQuestionSubmit(playerRes.playerId, 1, [questionAnswerId, questionAnswerId]);
    expect(submitAnswerRes).toStrictEqual({ error: expect.any(String) });
  });

  test('Less than 1 answer ID was submitted', () => {
    const playerRes = requestPlayerJoin(sessionRes.sessionId, 'Random Player');
    requestSessionStateUpdate(registerRes.token, quizCreateRes.quizId, sessionRes.sessionId, Actions.NEXT_QUESTION);
    requestSessionStateUpdate(registerRes.token, quizCreateRes.quizId, sessionRes.sessionId, Actions.SKIP_COUNTDOWN);
    const submitAnswerRes = requestQuestionSubmit(playerRes.playerId, 1, []);
    expect(submitAnswerRes).toStrictEqual({ error: expect.any(String) });
  });
});
