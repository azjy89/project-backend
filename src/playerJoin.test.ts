import {
  requestAuthRegister,
  requestClear,
  requestPlayerJoin,
  requestQuizCreate,
  requestQuizQuestionCreate,
  requestQuizSessionCreate,
  requestSessionStateUpdate,
} from './httpRequests';
import {
  TokenReturn,
  QuizId,
  SessionId,
  QuestionBody,
  Actions,
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
    session = requestQuizSessionCreate(user.token, quiz.quizId, 5);
  });

  // TODO: statusCode 200, OK
  test('Succesful return player Id, with empty name', () => {
    const response = requestPlayerJoin(session.sessionId, '');
    console.log(response);
    expect(response).toStrictEqual({ playerId: expect.any(Number) });
  });

  test('Succesful return player Id', () => {
    const response = requestPlayerJoin(session.sessionId, 'HAYDEN SMITH');
    console.log(response);
    expect(response).toStrictEqual({ playerId: expect.any(Number) });
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
