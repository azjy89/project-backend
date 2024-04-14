import { getData, setData } from './dataStore';
import {
  Data,
  Player,
  PlayerId,
  States,
  Actions,
  ReturnPlayerStatus,
} from './interfaces';
import {
  sessionStateUpdate,
} from './quiz';
import HTTPError from 'http-errors';

export const playerStatus = (playerId: number, sessionId: number): ReturnPlayerStatus => {
    const data: Data = getData();
    // Error Check: if player ID doesn't exist.
    const quizSession = data.quizSessions.find(session => session.sessionId === sessionId);
    const player = quizSession.players.find(player => player.playerId === playerId);
    if (!player) {
        throw HTTPError(400, 'Player Id does not exist');
    }
    //  Return Output
    return {
        state: player.state,
        numQuestions: player.numQuestions,
        atQuestion: player.atQuestion,
    };
};