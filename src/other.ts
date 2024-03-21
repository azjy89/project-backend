import { Data, setData } from './dataStore';

/**
 * Reset the state of the application back to the start.
 *
 * @returns {}
 */

export const clear = (): object => {
  const data: Data = {
    users: [],
    quizzes: [],
  };
  setData(data);
  return {};
}

