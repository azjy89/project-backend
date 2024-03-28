import { setData } from './dataStore';

/**
 * Reset the state of the application back to the start.
 *
 * @returns {}
 */

export const clear = (): object => {
  // Clears all arrays in data
  setData({
    users: [],
    quizzes: [],
    tokens: [],
    trash: [],
  });
  return {};
};
