import {
  requestClear,
  requestQuizCreate,
  requestAuthRegister,
  requestQuizCreate,
  requestQuizQuestionCreate,
  requestSessionStart,
  requestPlayerJoin,
  requestAuthLogout,
  requestSessionResults,
  requestSessionStateUpdate,
  requestPlayerAnswerSubmit,
  requestSessionResultsCSV
} from './httpRequests';

const ERROR = { error: expect.any(String) };
const NUMBER = expect.any(Number);

const firstName = 'Bobby';
const lastName = 'Builder';
const email = 'users@unsw.edu.au';
const password = '1234abcd';
const quizName = 'Construction sites';
const quizDescription = 'Test yourself against Bobbys knowledge of construction';
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
  let sessionRes: SessionId | ErrorObject;
  let token: Token;
  let quizId: QuizId;
  let sessionId: SessionId;
  beforeEach(() => {
    registerRes = requestAuthRegister(
      email,
      password,
      firstName,
      lastName
    );
    token = registerRes as Token;
    quizRes = requestQuizCreate(token.token, quizName, quizDescription);
    quizId = quizRes as QuizId;
    requestQuizQuestionCreate(token.token, quizId.quizId, questionBody);
    sessionRes = requestSessionStart(token.token, quizId.quizId, 5);
    sessionId = sessionRes as SessionId;
    requestPlayerJoin(sessionId.sessionId, player1);
  });
  test('Invalid token', () => {
    expect(requestSessionResults('1', quizId.quizId, sessionId.sessionId)).toStrictEqual(ERROR);
    expect(requestSessionResultsCsv('1', quizId.quizId, sessionId.sessionId)).toStrictEqual(ERROR);
  });
  test('Invalid sessionId', () => {
    expect(requestSessionResults(token.token, quizId.quizId, sessionId.sessionId + 1)).toStrictEqual(ERROR);
    expect(requestSessionResultsCsv(token.token, quizId.quizId, sessionId.sessionId + 1)).toStrictEqual(ERROR);
  });
  test('Error conditions', () => {
    const newUser = requestAuthRegister('pewpew@gmail.com', 'abcd1234', 'ajlskdf', 'asldsdff');
    const newToken = newUser as Token;
    requestAuthLogout(newToken.token);
    // Invalid session token
    expect(requestSessionResults(newToken.token, quizId.quizId, sessionId.sessionId)).toStrictEqual(ERROR);
    expect(requestSessionResultsCsv(newToken.token, quizId.quizId, sessionId.sessionId)).toStrictEqual(ERROR);
    // Invalid lobby state
    expect(requestSessionResults(token.token, quizId.quizId, sessionId.sessionId)).toStrictEqual(ERROR);
    expect(requestSessionResultsCsv(token.token, quizId.quizId, sessionId.sessionId)).toStrictEqual(ERROR);
    // Transition state to final results
    requestSessionStateUpdate(token.token, quizId.quizId, sessionId.sessionId, 'NEXT_QUESTION');
    requestSessionStateUpdate(token.token, quizId.quizId, sessionId.sessionId, 'GO_TO_FINAL_RESULTS');
    // quizId does not refer to a valid quiz
    expect(requestSessionResults(token.token, 123, sessionId.sessionId)).toStrictEqual(ERROR);
    expect(requestSessionResultsCsv(token.token, 123, sessionId.sessionId)).toStrictEqual(ERROR);
    // user doesnt own the quiz
    const randomUser = requestAuthRegister('mewmew@gmail.com', 'asdbf1235', 'Joanna', 'Zhong');
    const randomToken = randomUser as Token;
    const randomQuiz = requestQuizCreate(randomUser.token, 'New Quiz', 'What is my name?');
    const randomQuizId = randomQuiz as QuizId;
    expect(requestSessionResults(token.token, randomQuizId.quizId, sessionId.sessionId)).toStrictEqual(ERROR);
    expect(requestSessionResultsCsv(token.token, randomQuizId.quizId, sessionId.sessionId)).toStrictEqual(ERROR);

    requestSessionStateUpdate(token.token, quizId.quizId, sessionId.sessionId, 'END');
    expect(requestSessionResults(token.token, quizId.quizId, sessionId.sessionId)).toStrictEqual(ERROR);
    expect(requestSessionResultsCsv(token.token, quizId.quizId, sessionId.sessionId)).toStrictEqual(ERROR);
  });
});

describe('Successful output for successful', () => {
  let registerRes: Token | ErrorObject;
  let quizRes: QuizId | ErrorObject;
  let sessionRes: SessionId | ErrorObject;
  let playerRes: PlayerId | ErrorObject;
  let question1: QuestionId | ErrorObject;
  let question2: QuestionId | ErrorObject;
  let question3: QuestionId | ErrorObject;
  let token: Token;
  let quizId: QuizId;
  let sessionId: SessionId;
  let playerId: PlayerId;
  let questionId1: QuestionId;
  let questionId2: QuestionId;
  let questionId3: QuestionId;
  beforeEach(() => {
    registerRes = requestAuthRegister(email, password, firstName, lastName);
    token = registerRes as Token;
    quizRes = requestQuizCreate(token.token, quizName, quizDescription);
    quizId = quizRes as QuizId;
    question1 = requestQuizQuestionCreate(token.token, quizId.quizId, questionBody);
    question2 = requestQuizQuestionCreate(token.token, quizId.quizId, questionBody1);
    question3 = requestQuizQuestionCreate(token.token, quizId.quizId, questionBody2);
    questionId1 = question1 as QuestionId;
    questionId2 = question2 as QuestionId;
    questionId3 = question3 as QuestionId;
    sessionRes = requestSessionStart(token.token, quizId.quizId, 5);
    sessionId = sessionRes as SessionId;
    playerRes = requestPlayerJoin(sessionId.sessionId, player1);
    playerId = playerRes as PlayerId;
  });
  test('Successful output', () => {
    // Simulate 2 players joining the quiz
    const playerRes2 = requestPlayerJoin(sessionId.sessionId, player2);
    const playerId2 = playerRes2 as PlayerId;
    const playerRes3 = requestPlayerJoin(sessionId.sessionId, player3);
    const playerId3 = playerRes3 as PlayerId;
    
    requestSessionStateUpdate(token.token, quizId.quizId, sessionId.sessionId, 'NEXT_QUESTION');
    requestPlayerAnswerSubmit(playerId.playerId, 1, [0]);
    requestPlayerAnswerSubmit(playerId2.playerId, 1, [1]);
    requestPlayerAnswerSubmit(playerId3.playerId, 1, [1]);
    requestSessionStateUpdate(token.token, quizId.quizId, sessionId.sessionId, 'NEXT_QUESTION');
    requestPlayerAnswerSubmit(playerId.playerId, 2, [0, 2]);
    requestPlayerAnswerSubmit(playerId2.playerId, 2, [0, 2]);
    requestPlayerAnswerSubmit(playerId3.playerId, 2, [1]);
    requestSessionStateUpdate(token.token, quizId.quizId, sessionId.sessionId, 'GO_TO_FINAL_RESULTS');
    expect(requestSessionResults(token.token, quizId.quizId, sessionId.sessionId)).toStrictEqual(
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
            ],
            averageAnswerTime: NUMBER,
            percentCorrect: NUMBER
          },
          {
            questionId: questionId3.questionId,
            playersCorrectList: [
            ],
            averageAnswerTime: NUMBER,
            percentCorrect: NUMBER
          },
        ],
      },
    )
    expect(requestSessionResultsCsv(token.token, quizId.quizId, sessionId.sessionId)).toStrictEqual({ url: expect.any(String) });
  });
});