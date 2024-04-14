import {
  requestAuthRegister,
  requestClear,
  requestPlayerJoin,
  requestQuizCreate,
  requestQuizQuestionCreate,
  requestQuizSessionCreate,
  requestSessionStateUpdate,
  requestSessionStatus,
  requestPlayerStatus,
} from './httpRequests';
import {
  TokenReturn,
  QuizId,
  SessionId,
  QuestionBody,
  Actions,
  States,
  PlayerId,
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

describe('Testing GET /v1/player/{playerId}', () => {
  let user: TokenReturn;
  let quiz: QuizId;
  let session: SessionId;
  let player: PlayerId;
  beforeEach(() => {
    // create user and quiz
    user = requestAuthRegister('first@unsw.edu.au', 'FirstUser123', 'First', 'User');
    quiz = requestQuizCreate(user.token, 'COMP1531', 'A description of my quiz');
    // start a new session when there's at least one question
    requestQuizQuestionCreate(user.token, quiz.quizId, questionBody);
    session = requestQuizSessionCreate(user.token, quiz.quizId, 3);
    player = requestPlayerJoin(session.sessionId, "HAYDEN SMITH");
  });

  // TODO: statusCode 200, OK
  test('Succesfully returned the playerStatus', ()  => {
    const response = requestPlayerStatus(session.sessionId, player.playerId)
    // FIX: ERROR ABOVE HERE.
    expect(response).toStrictEqual({
      state: expect.any(States),
      numQuestions: expect.any(Number),
      atQuestion: expect.any(Number),
    })
  });
  
  // TODO: statusCode400, one error case
  test('Player Id does not exist', () => {
    const response = requestPlayerStatus(session.sessionId, player.playerId)
    expect(response).toStrictEqual({ error: 'Player Id does not exist' });
  });
});