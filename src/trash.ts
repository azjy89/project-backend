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
  return { trash: trashList };
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
  if (!quizFind) {
    return {
      error: 'quizId is not in trash'
    };
  }

  if (quizFind.ownerId !== authUserId) {
    return {
      error: 'authUserId does not own this quiz'
    };
  }

  const nameExists = data.quizzes.some(quiz => quiz.name === quizFind.name);
  if (nameExists) {
    return {
      error: 'Quiz name is already being used'
    };
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

    if (quizIndex === -1) {
      return {
        error: `Quiz with ID ${quizId} is not currently in the trash`
      };
    }
  }
  data.trash = data.trash.filter(quiz => !quizIds.includes(quiz.quizId));
  setData(data);
  return {};
}
