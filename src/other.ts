import { setData } from './dataStore';

/**
 * Reset the state of the application back to the start.
 *
 * @returns {}
 */

export const clear = (): object => {
  setData({
    users: [],
    quizzes: [],
    tokens: [],
    trash: [],
  });
  return {};
};

=======
>>>>>>> src/other.ts
