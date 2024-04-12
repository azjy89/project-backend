import { getData, setData } from './dataStore';
import HTTPError from 'http-errors';
import Player from 'interfaces';
import Message from 'interfaces';

// Global Variables
const maxMessageLength = 100;
const minMessageLength = 1;

/**
 * Return all messages that are in the same session as the player, in the order they were sent
 *
 * @param {path} playerId
 *
 * @returns {object}
 */

export const playerChatSession = (playerId: number, messageBody: string, timeSent: number, name: string) => {
    const data: Data = getData();

// find playerId
const findPlayerId = data.messages.find(findPlayerId => findPlayerId.playerId == playerId);

// Check playerId exists
if (findPlayerId === -1) {
    throw HTTPError(400, 'Player ID does not exist');
  }

    return {
        messageBody,
        playerId,
        playerName,
        timeSent
    }

}

/**
 * Send a new chat message to everyone in the session
 *
 * @param {path} playerId
 * @param {body} message
 *
 * @returns {}
 */

export const sendChat = (playerId: number, messageBody: string) => {
    const data: Data = getData();

// find playerId
const findPlayerId = data.messages.find(findPlayerId => findPlayerId.playerId == playerId);

// Check playerId exists
if (findPlayerId === -1) {
    throw HTTPError(400, 'Player ID does not exist');
  }


// Check Max Length
if (message.length > maxMessageLength) {
    throw HTTPError(400, 'Message must be 100 characters or less');
  };

// Check Min Length
  if (message.length < minMessageLength) {
    throw HTTPError(400, 'Message must be 1 character or more');
  };

  return {};
};