import { getData } from './dataStore';
import {
  Data,
  Player,
  ReturnPlayerStatus,
  QuizSession,
  States
} from './interfaces';

import HTTPError from 'http-errors';

// ========================================================================== //
//  ========================= HELPER FUNCTIONS =============================  //
// ========================================================================== //
export function findQuizSessionFromPlayerId(playerId: number): QuizSession {
  // TODO: iterate over your quiz sessions until you find one that has this player ID
  const data: Data = getData();
  for (const session of data.quizSessions) {
    if (session.players.find(player => player.playerId === playerId)) {
      return session;
    }
  }
  // ErrorCheck: playerId not found; invalid playerId.
  throw HTTPError(400, 'Player Id does not exist');
}

// ========================================================================== //

export const playerStatus = (playerId: number): ReturnPlayerStatus => {
  // Find quizSession (ErrorCheck included):
  const quizSession = findQuizSessionFromPlayerId(playerId);

  // Find player in quizSession:
  const player: Player = quizSession.players.find(player => player.playerId === playerId);

  //  Return Output
  return {
    state: States[player.state],
    numQuestions: player.numQuestions,
    atQuestion: player.atQuestion,
  };
};
