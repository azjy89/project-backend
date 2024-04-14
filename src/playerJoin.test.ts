import {
  requestAuthRegister,
  requestClear,
  requestPlayerJoin,
  requestQuizCreate,
  requestQuizQuestionCreate,
  requestQuizSessionCreate,
  requestSessionStateUpdate,
  requestSessionStatus,
} from './httpRequests';
import {
  TokenReturn,
  QuizId,
  SessionId,
  QuestionBody,
  Actions,
  States,
} from './interfaces';

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

beforeEach(() => {
  requestClear();
});

afterEach(() => {
  requestClear();
});

// QUESTION: DO WE STILL NEED TO CHECK FOR STATUSCODE IF WE ARE THROWING ERRORS?
describe('Testing POST /v1/player/join', () => {
  let user: TokenReturn;
  let quiz: QuizId;
  let session: SessionId;
  // QUESTION: WHERE DO I GET SESSION ID FROM?
  beforeEach(() => {
    // create user and quiz
    user = requestAuthRegister('first@unsw.edu.au', 'FirstUser123', 'First', 'User');
    quiz = requestQuizCreate(user.token, 'COMP1531', 'A description of my quiz');
    // start a new session when there's at least one question
    requestQuizQuestionCreate(user.token, quiz.quizId, questionBody);
    session = requestQuizSessionCreate(user.token, quiz.quizId, 3);
  });

  // TODO: statusCode 200, OK
  test('Succesful return player Id, with empty name', () => {
    const response = requestPlayerJoin(session.sessionId, '');
    expect(response).toStrictEqual({ playerId: expect.any(Number) });
  });

  test('Succesful return player Id', () => {
    const response = requestPlayerJoin(session.sessionId, 'HAYDEN SMITH');
    expect(response).toStrictEqual({ playerId: expect.any(Number) });
  });

  test('Multiply players successfully joined the same session', () => {
    // Player 1 joined the session.
    requestPlayerJoin(session.sessionId, 'HAYDEN SMITH');
    // Test: layer 2 successfully joined the session.
    const response = requestPlayerJoin(session.sessionId, 'DENHAY SMITH');
    expect(response).toStrictEqual({ playerId: expect.any(Number) });
  });

  test('Two different players joining separate sessions', () => {
    // Create a second session
    const user2: TokenReturn = requestAuthRegister('second@unsw.edu.au', 'SecondUser123', 'Second', 'User');
    const quiz2: QuizId = requestQuizCreate(user2.token, 'COMP1511', 'A description of my quiz');
    requestQuizQuestionCreate(user2.token, quiz2.quizId, questionBody);
    const session2: SessionId = requestQuizSessionCreate(user2.token, quiz2.quizId, 3);

    // Test: Player 1 joins the first session; Player 2 joins the second session.
    requestPlayerJoin(session.sessionId, 'HAYDEN SMITH');
    const response = requestPlayerJoin(session2.sessionId, 'DENHAY SMITH');
    expect(response).toStrictEqual({ playerId: expect.any(Number) });
  });

  test('autoStartNum reached: quiz start automatically.', () => {
    requestPlayerJoin(session.sessionId, 'DENHAY SMITH');
    requestPlayerJoin(session.sessionId, 'HAY SMITH');
    requestPlayerJoin(session.sessionId, 'HAYDEN SMITH');
    // check session status
    const sessionStatus = requestSessionStatus(user.token, quiz.quizId, session.sessionId);
    console.log(sessionStatus);
    expect(sessionStatus.state).toStrictEqual(States.QUESTION_COUNTDOWN);
  });

  // TODO: statusCode 400, three error cases
  test('Not unique name', () => {
    // generate existing player:
    requestPlayerJoin(session.sessionId, 'HAYDEN SMITH');
    const response = requestPlayerJoin(session.sessionId, 'HAYDEN SMITH');
    expect(response).toStrictEqual({ error: 'Name of user entered is not unique' });
  });

  test('Invalid session', () => {
    const response = requestPlayerJoin(-1, 'HAYDEN SMITH');
    expect(response).toStrictEqual({ error: 'Session Id does not refer to a valid session' });
  });

  test('Session is not in LOBBY state', () => {
    // get quiz session status (to check state)
    requestSessionStateUpdate(user.token, quiz.quizId, session.sessionId, Actions.NEXT_QUESTION);
    const response = requestPlayerJoin(session.sessionId, 'HAYDEN SMITH');
    expect(response).toStrictEqual({ error: 'Session is not in LOBBY state' });
  });
});
