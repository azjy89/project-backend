import { requestAuthRegister, requestClear, requestPlayerJoin, requestQuizCreate, requestQuizSessionCreate, requestSessionStatus } from './httpRequests';
import {Player, TokenReturn, Quiz, QuizSession, SessionId} from './interfaces'

beforeEach(() => {
    requestClear();    
});

// QUESTION: DO WE STILL NEED TO CHECK FOR STATUSCODE IF WE ARE THROWING ERRORS?

describe('Testing POST /v1/player/join',() => {
    let user: TokenReturn;
    let quiz: Quiz;
    let session: SessionId;
    // QUESTION: WHERE DO I GET SESSION ID FROM?
    beforeEach(() => {
        // create user and quiz
        user = requestAuthRegister('first@unsw.edu.au', 'FirstUser123', 'First', 'User');
        quiz = requestQuizCreate(user.token, 'COMP1531', 'A description of my quiz', 'https://steamuserimages-a.akamaihd.net/ugc/2287332779831334224/EF3F8F1CF9E9A1395686A5B39FC67C64C851BE0D/?imw=637&imh=358&ima=fit&impolicy=Letterbox&imcolor=%23000000&letterbox=true.jpeg');
        // start a new session; return sessionId.
        session = requestQuizSessionCreate(user.token, quiz.quizId, 5);
    })

    // TODO: statusCode 200, OK
    test('Succesful return player Id', () => {
        const response = requestPlayerJoin(session.sessionId, "HAYDEN SMITH")
        expect(response).toStrictEqual({playerId: expect.any(Number)});
    });
    // TODO: statusCode 400, three error cases
    test('Not unique name', () => {
        // generate existing player:
        requestPlayerJoin(session.sessionId, "HAYDEN SMITH");
        const response = requestPlayerJoin(session.sessionId, "HAYDEN SMITH")
        expect(response).toStrictEqual({ error: 'Name of user entered is not unique'})
    })

    test('Invalid session', () => {
        const response = requestPlayerJoin(-1, "HAYDEN SMITH")
        expect(response).toStrictEqual({ error: 'Session Id does not refer to a valid session'});
    })

    test('Session is not in LOBBY state', () => {
        // get quiz session status (to check state)
        const sessionStatus = requestSessionStatus(user.token, quiz.quizId, session.sessionId);
        sessionStatus.state = 1; // NOT LOBBY state, which is 0.
        const response = requestPlayerJoin(session.sessionId, "HAYDEN SMITH")
        expect(response).toStrictEqual({ error: 'Session is not in LOBBY state'});
    })

})