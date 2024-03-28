import {
  getData,
  setData
} from './dataStore';

import {
  AdminQuizListReturn,
  Quiz,
  Data
} from './interfaces';


/** View the quizzes that are currently in the trash for the logged in user
 * 
 * @param {number} authUserId 
 * @returns {object}
 */
export function trashQuizList(authUserId: number): Error | AdminQuizListReturn {
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
export function trashQuizRestore(authUserId: number, quizId: number): object | Error {
  const data = getData();
  const trash = getTrash();
  
  // Check if authUserId refers to a valid user

  const quizIndex = trash.quizzes.findIndex(quiz => quiz.quizId === quizId);
  const quizName = trash.quizzes[quizIndex].name;

  const nameExists = data.quizzes.some(quiz => quiz.name === quizName);
  if (nameExists) {
    return { error: 'Quiz name is already being used' };
  }
  if (!quizIndex) {
    return { error: 'Quiz is not currently in the trash' };
  }
  const userExists = data.users.some(user => user.userId === authUserId);
  if (!userExists) {
    return { error: 'authUserId does not refer to a valid user'};
  }
  if (userExists && trash.quizzes[quizIndex].quizCreatorId != authUserId) {
    return { error: 'user is not an owner of this quiz'};
  }

  trash.quizzes.splice(quizIndex, 1);
  setTrash(trash);

  data.quizzes.push(data.quizzes[quizIndex]);
  data.quizzes[quizIndex].timeLastEdited = Date.now();

  setData(data);
  return{};
};

/** Permanently delete specific quizzes currently sitting in the trash
 * 
 * @param {number} authUserId 
 * @param {number} quizIds 
 * @returns {object}
 */
export function trashEmpty(authUserId: number, quizIds: number[]): Error | object {
  const data = getData();
  const trash = getTrash();

  const userExists = data.users.some(user => user.userId === authUserId);
  if (!userExists) {
    return { error: 'authUserId does not refer to a valid user'};
  }

  for (const quizId of quizIds) {
    const quizIndex = trash.quizzes.findIndex(quiz => quiz.quizId === quizId);

    if (quizIndex === -1) {
      return { error: `Quiz with ID ${quizId} is not currently in the trash` };
    }

    if (userExists && trash.quizzes[quizIndex].quizCreatorId != authUserId) {
    return { error: 'user is not an owner of this quiz'};
  }

    trash.quizzes.splice(quizIndex, 1);
  }

  setTrash(trash);

  return {};
}