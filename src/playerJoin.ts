import { getData, setData } from './dataStore';
import {
    Data,
    Player,
    QuizSession,
    PlayerId,
    ErrorObject,
    States,
} from './interfaces';
import HTTPError from 'http-errors';

// Goal: generate string of 5-letter,3-digit
const createRandomName = (): string => {
    var random_string = '';
    var letters = 'abcdefghijklmnopqrstuvwxyz', numbers = '0123456789'
    const lettersLength = 5, numbersLength = 3;
    for (var i = 0; i < lettersLength; i++) {
        random_string += letters.charAt(Math.floor(Math.random()*lettersLength));
    };
    for (var i = 0; i < numbersLength; i++) {
        random_string += numbers.charAt(Math.floor(Math.random()*numbersLength));
    };
    return random_string;
};

// Goal: Create a new player and add them to the player list (array).
// Return: playerId
// QUESTION: Do I still need type "ErrorObject" when I'm throwing the errors?
export const playerJoin = (sessionId: number, name: string): PlayerId => {
    const data: Data = getData();
    if (name === '') {
        // create 5-letter,4-digit string
        name = createRandomName();
    }

    // ERROR CHECKS:
    const currQuizSession: QuizSession = data.quizSessions.find(session => session.sessionId === sessionId);
    if (!currQuizSession) {
        throw HTTPError(400, 'Session Id does not refer to a valid session');
    }
    const searchName = currQuizSession.players.find(player => player.name === name);
    if (searchName) {
        throw HTTPError(400, 'Name of user entered is not unique');
    }
    if (currQuizSession.state !== States.LOBBY) {
        throw HTTPError(400, 'Session is not in LOBBY state');
    }

    // Find numQuestions: (assuming there is a quiz and corresponding quizId)
    const quizIndex = data.quizzes.findIndex(quiz =>quiz.quizId === currQuizSession.quizId);
    const quiz = data.quizzes[quizIndex];

    // Create new player.
    const newPlayerId = currQuizSession.players.length;
    const newPlayer: Player = {
        playerId: newPlayerId,
        name: name,
        score: 0,
        state: States.LOBBY, 
        numQuestions: quiz.questions.length,
        atQuestion: 0,
    }
    currQuizSession.players.push(newPlayer);

    setData(data);
    return { 
        playerId: newPlayerId
    };
};