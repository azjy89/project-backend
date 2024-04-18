import { ErrorObject, QuizSession, MessagesListReturn } from './interfaces';
import { getData } from './dataStore';
import HTTPError from 'http-errors';

export function messagesList(playerId: number): MessagesListReturn | ErrorObject {
  const data = getData();
  let currSession: QuizSession;
  let idIsValid = false;
  for (const session of data.quizSessions) {
    const playerIndex = session.players.findIndex(player => player.playerId === playerId);
    if (playerIndex !== -1) {
      currSession = session;
      idIsValid = true;
      break;
    }
  }

  if (!idIsValid) {
    throw HTTPError(400, 'PlayerId does not exist');
  }

  const list: MessagesListReturn = {
    messages: [],
  };

  for (const message of currSession.messages) {
    list.messages.push(message);
  }

  return list;
}
