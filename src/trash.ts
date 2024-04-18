import HTTPError from 'http-errors';
import {
  getData,
  setData
} from './dataStore';

import {
  TrashQuizListReturn,
  Quiz,
  Data,
  ErrorObject
} from './interfaces';

/** View the quizzes that are currently in the trash for the logged in user
 *
 * @param {number} authUserId
 * @returns {object}
 */
export const trashQuizList = (authUserId: number): TrashQuizListReturn => {
  const data: Data = getData();
  const quizzes = data.trash.filter(quiz => quiz.ownerId === authUserId);
  const trashList = quizzes.map((quiz: Quiz) => ({
    quizId: quiz.quizId,
    name: quiz.name,
  }));
  return { quizzes: trashList };
};

/** Restore a particular quiz from the trash back to an active quiz.
 * This should update its timeLastEdited timestamp!!!!!
 *
 * @param {number} authUserId
 * @param {number} quizId
 * @returns {}
 */
export function trashQuizRestore(authUserId: number, quizId: number): object | ErrorObject {
  const data: Data = getData();

  const quizFind = data.trash.find(quizFind => quizFind.quizId === quizId);
  if (quizFind) {
    if (quizFind.ownerId !== authUserId) {
      throw HTTPError(403, 'authUserId does not own this quiz');
    }
  }
  if (!quizFind) {
    throw HTTPError(400, 'quizId is not in trash');
  }

  const nameExists = data.quizzes.some(quiz => quiz.name === quizFind.name);
  if (nameExists) {
    throw HTTPError(400, 'name is being used');
  }
  quizFind.timeLastEdited = Date.now();
  const quizIndex = data.trash.findIndex(quiz => quiz.quizId === quizId);
  const [restoreQuiz] = data.trash.splice(quizIndex, 1);
  data.quizzes.push(restoreQuiz);

  setData(data);
  return {};
}

/** Permanently delete specific quizzes currently sitting in the trash
 *
 * @param {number} authUserId
 * @param {number} quizIds
 * @returns {object}
 */
export function trashEmpty(authUserId: number, quizIds: number[]): ErrorObject | object {
  const data = getData();
  for (const quizId of quizIds) {
    const quizIndex = data.trash.findIndex(quiz => quiz.quizId === quizId);
    if (quizIndex !== -1) {
      if (data.trash[quizIndex].ownerId !== authUserId) {
        throw HTTPError(403, 'user does not own quiz');
      }
    }
  }

  for (const quizId of quizIds) {
    const quizIndex = data.trash.findIndex(quiz => quiz.quizId === quizId);
    if (quizIndex === -1) {
      throw HTTPError(400, 'quiz does not exist in trash');
    }
  }
  data.trash = data.trash.filter(quiz => !quizIds.includes(quiz.quizId));
  setData(data);
  return {};
}
