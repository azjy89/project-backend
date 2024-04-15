import { ErrorObject, QuizSession, Message } from './interfaces';
import { getData, setData } from './dataStore';
import HTTPError from 'http-errors';

export function messageSend(playerId: number, messageBody: string): object | ErrorObject {
  if (messageBody.length < 1 || messageBody.length > 100) {
    throw HTTPError(400, 'Message is too long or too short');
  }

  const data = getData();
  let currSession: QuizSession;
  let idIsValid = false;
  let playerName: string;
  for (const session of data.quizSessions) {
    const playerIndex = session.players.findIndex(player => player.playerId === playerId);
    if (playerIndex !== -1) {
      currSession = session;
      playerName = session.players[playerIndex].name;
      idIsValid = true;
      break;
    }
  }

  if (!idIsValid) {
    throw HTTPError(400, 'PlayerId does not exist');
  }

  const newMessage: Message = {
    messageBody: messageBody,
    playerId: playerId,
    playerName: playerName,
    timeSent: Date.now(),
  };

  currSession.messages.push(newMessage);
  setData(data);

  return {};
}
