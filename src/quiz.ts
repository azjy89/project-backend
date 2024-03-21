import { getTrash, setTrash, getData, setData } from './dataStore';

import {
  ErrorObject,
  QuizListNameId,
  AdminQuizListReturn,
  QuizId,
  AdminQuizInfoReturn,
  Data
} from './types';
// Global Variables
const maxNameLength = 30;
const minNameLength = 3;
const maxDescriptionLength = 100;

/**
 * Provide a list of all quizzes that are owned by the currently logged in user.
 *
 * @param {int} authUserId
 *
 * @returns {object}
 */

export const adminQuizList = (authUserId: number): AdminQuizListReturn | ErrorObject => {
  const data = getData();

  const userExists = data.users.some(user => user.userId === authUserId);
  if (!userExists) {
    return { error: 'authUserId does not refer to a valid user' };
  }
  const userQuizzes = data.quizzes.filter(quiz => quiz.quizCreatorId === authUserId);

  const quizList = userQuizzes.map(quiz => ({
    quizId: quiz.quizId,
    name: quiz.name,
  }));
  return { quizzes: quizList };
};

/**
 * Given basic details about a new quiz, create one for the logged in user.
 *
 * @param {int} authUserId
 * @param {string} name
 * @param {string} description
 *
 * @returns {int}
 */

export const adminQuizCreate = (authUserId: number, name: string, description:string): AdminQuizCreateReturn | ErrorObject => {
  const data = getData();

  // Check if the authUserId is valid
  const userExists = data.users.some(user => user.userId === authUserId);
  if (!userExists) {
    return { error: 'authUserId does not refer to a valid user' };
  }

  // Check if name contains valid characters
  if (!/^[a-zA-Z0-9 ]+$/.test(name)) {
    return { error: 'Quiz name must contain only alphanumeric characters and spaces' };
  }

  // Check if the name is within the character limits
  if (name.length < minNameLength || name.length > maxNameLength) {
    return { error: 'Quiz name must be between 3 and 30 characters long' };
  }

  // Check if the name is already being used
  const nameExists = data.quizzes.some(quiz => quiz.name === name && quiz.quizCreatorId === authUserId);
  if (nameExists) {
    return { error: 'Quiz name is already being used' };
  }

  // Check if the description is within the character limit
  if (description.length > maxDescriptionLength) {
    return { error: 'Description must be 100 characters or less' };
  }

  const newQuizId = data.quizzes.length > 0
    ? Math.max(...data.quizzes.map(quiz => quiz.quizId)) + 1
    : 1;

  const newQuiz: Quiz = {
    quizId: newQuizId,
    name: name,
    quizCreatorId: authUserId,
    timeCreated: Date.now(),
    timeLastEdited: Date.now(),
    description: description,
    questions: [],
    answers: []
  };

  data.quizzes.push(newQuiz);
  setData(data);

  return { quizId: newQuizId };
};

/**
 * Given a particular quiz, permanently remove the quiz.
 *
 * @param {int} authUserId
 * @param {int} quizId
 *
 * @returns {object}
 */

export const adminQuizRemove = (authUserId: number, quizId: number): object | ErrorObject => {
  const data = getData();

  // Check if authUserId refers to a valid user
  const userExists = data.users.some(user => user.userId === authUserId);
  if (!userExists) {
    return { error: 'authUserId does not refer to a valid user' };
  }

  // Check if quizId refers to a valid quiz
  const quizIndex = data.quizzes.findIndex(quiz => quiz.quizId === quizId);
  if (quizIndex === -1) {
    return { error: 'quizId does not refer to a valid quiz' };
  }

  // Check if the quiz belongs to the user with authUserId
  if (data.quizzes[quizIndex].quizCreatorId !== authUserId) {
    return { error: 'quizId does not refer to a quiz this user owns' };
  }

  data.quizzes.splice(quizIndex, 1);
  setData(data);
  return {};
};

/**
 * Get all of the relevant information about the current quiz.
 *
 * @param {int} authUserId
 * @param {int} quizId
 *
 * @returns {object}
 */

export const adminQuizInfo = (authUserId: number, quizId: number): AdminQuizInfoReturn | ErrorObject => {
  const data = getData();
  const userIndex = data.users.findIndex(user => user.userId === authUserId);
  const quizIndex = data.quizzes.findIndex(quiz => quiz.quizId === quizId);

  // Checks dataStore.users to find if a userId matches; else is invalid user.
  if (userIndex === -1) {
    return { error: 'AuthUserId is not a valid user.' };
  }

  // Checks dataStore.quizzes to find if a quizId matches; else is invalid quiz.
  if (quizIndex === -1) {
    return { error: ' Quiz ID does not refer to valid quiz.' };
  }

  // Checks dataStore.quizzes for a quiz.quizCreatorId that doesn't match authUserId.
  const quiz = data.quizzes[quizIndex];
  if (authUserId !== quiz.quizCreatorId) {
    return { error: ' Quiz ID does not refer to a quiz that this user owns.' };
  }

  const name = quiz.name;
  const timeCreated = quiz.timeCreated;
  const timeLastEdited = quiz.timeLastEdited;
  const description = quiz.description;

  return {
    quizId,
    name,
    timeCreated,
    timeLastEdited,
    description
  };
};

/**
 * Update the name of the relevant quiz.
 *
 * @param {int} authUserId
 * @param {int} quizId
 * @param {string} name
 *
 * @returns {}
 */

export const adminQuizNameUpdate = (authUserId: number, quizId: number, name: string): object | ErrorObject => {
  const data = getData();

  const userIndex = data.users.findIndex(user => user.userId === authUserId);
  if (userIndex === -1) {
    return { error: 'AuthUserId is not a valid user.' };
  }

  const quizIndex = data.quizzes.findIndex(quiz => quiz.quizId === quizId);
  if (quizIndex === -1) {
    return { error: 'Quiz ID does not refer to valid quiz.' };
  }

  if (authUserId !== data.quizzes[quizIndex].quizCreatorId) {
    return { error: 'Quiz ID does not refer to a quiz that this user owns.' };
  }

  const regex = /^[a-zA-Z0-9\s]*$/;
  if (!regex.test(name)) {
    return { error: 'Name contains invalid characters. Valid characters are alphanumeric and spaces.' };
  }

  if (name.length > maxNameLength || name.length < minNameLength) {
    return { error: 'Name is either less than 3 characters long or more than 30 characters long.' };
  }

  if (data.quizzes.find(q => q.name === name && q.quizCreatorId === authUserId)) {
    return { error: 'Name is already used by the current logged in user for another quiz.' };
  }

  // Update the quiz name in the data store
  data.quizzes[quizIndex].name = name;
  data.quizzes[quizIndex].timeLastEdited = Date.now();
  setData(data);

  // Return success response
  return {};
};

/**
 * Update the description of the relevant quiz.
 *
 * @param {int} authUserId
 * @param {int} quizId
 * @param {string} description
 *
 * @returns {}
 */

export const adminQuizDescriptionUpdate = (authUserId: number, quizId: number, description: string): object | ErrorObject => {
  const data = getData();
  const userIndex = data.users.findIndex(user => user.userId === authUserId);
  const quizIndex = data.quizzes.findIndex(quiz => quiz.quizId === quizId);
  if (userIndex === -1) {
    return {
      error: 'AuthUserId is not a valid user'
    };
  }
  if (quizIndex === -1) {
    return {
      error: 'Quiz ID does not refer to a valid quiz'
    };
  }

  const quiz = data.quizzes.find(quiz => quiz.quizId === quizId);
  if (quiz.quizCreatorId != authUserId) {
    return {
      error: 'Quiz ID does not refer to a quiz that this user own'
    };
  }
  if (description.length >= maxDescriptionLength) {
    return {
      error: 'Description is more than 100 characters in length'
    };
  }

  data.quizzes[quizIndex].description = description;
  data.quizzes[quizIndex].timeLastEdited = Date.now();

  setData(data);
  return {};
}

/**
 * Transfer ownership of a quiz to a different user based on their email
 * 
 * @param {int} authUserId 
 * @param {int} quizId 
 * @param {string} userEmail 
 * @returns {}
 */
export function adminQuizTransfer(authUserId: number, quizId: number, userEmail: string): {} {
  return {};
}



/**
 * Delete a particular question from a quiz
 *
 * @param {int} quizId
 * @param {int} questionId
 * @param {string} token
 *
 * @returns {}
 */

export function adminQuizQuestionRemove(quizId: number, questionId: number, token: string): {} {

    return {};
}

/**
 * Move a question from one particular position in the quiz to another
 * When this route is called, the timeLastEdited is updated
 *
 * @param {number} quizId - The ID of the quiz.
 * @param {number} questionId - The ID of the question to delete.
 * @param {object} body - The request body.
 *
 * @returns {void}
 */

export function adminQuizQuestionMove(quizId: number, questionId: number, body: object): {} {

    return {};
}
