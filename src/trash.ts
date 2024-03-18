import {
  getData,
  setData,
  getTrash,
  setTrash
} from './dataStore';


import {
  AdminQuizListReturn
} from './dataStore.ts';



/** View the quizzes that are currently in the trash for the logged in user
 * 
 * @param {number} authUserId 
 * @returns {object}
 */
export function trashQuizList(authUserId: number): Error | {quizzes: AdminQuizListReturn} {
  return { quizzes };
}

/** Restore a particular quiz from the trash back to an active quiz. 
 * This should update its timeLastEdited timestamp!!!!!
 * 
 * @param {number} authUserId 
 * @param {number} quizId 
 * @returns {}
 */
export function trashQuizRestore(authUserId: number, quizId: number): Error | Record<string, never> {
  return {};
}

/** Permanently delete specific quizzes currently sitting in the trash
 * 
 * @param {number} authUserId 
 * @param {number} quizIds 
 * @returns {object}
 */
export function trashEmpty(authUserId: number, quizIds: number[]): Error | object {
  return {};
}