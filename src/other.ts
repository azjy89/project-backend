import { setData, getTimerData } from './dataStore';

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
    quizSessions: [],
  });

  const timerData = getTimerData();
  for (const timer of timerData.timers) {
    clearTimeout(timer.timerId);
  }
  timerData.timers = [];
  return {};
};
