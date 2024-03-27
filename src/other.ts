import { setData, setTrash } from './dataStore';

/**
 * Reset the state of the application back to the start.
 *
 * @returns {}
 */

export const clear = (): object => {
  setData({
    users: [],
    quizzes: [],
    tokens: []
  });
  setTrash({
    users: [],
    quizzes: [],
    tokens: []
  })
  return {};
};
