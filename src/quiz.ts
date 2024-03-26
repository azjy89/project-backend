import { arrayBuffer } from 'stream/consumers';
import { getTrash, setTrash, getData, setData } from './dataStore';

import {
  ErrorObject,
  QuizListNameId,
  AdminQuizListReturn,
  QuizId,
  AdminQuizInfoReturn,
  Data,
  Quiz,
  QuestionBody,
  QuestionId,
  Question,
  AnswerInput,
  DupedQuestionId
} from './interfaces';

import HTTPError from 'http-errors';
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

export const adminQuizList = (authUserId: number): AdminQuizListReturn => {
  const data: Data = getData();
  const userQuizzes = data.quizzes.filter(quiz => quiz.quizOwnerId === authUserId);
  const quizList = userQuizzes.map((quiz: Quiz) => ({
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

export const adminQuizCreate = (authUserId: number, name: string, description: string): QuizId | ErrorObject => {
  const data: Data = getData();
  // Check if name contains valid characters
  if (!/^[a-zA-Z0-9 ]+$/.test(name)) {
    throw HTTPError(400, 'Quiz name must contain only alphanumeric characters and spaces');
  }

  // Check if the name is within the character limits
  if (name.length < minNameLength || name.length > maxNameLength) {
    throw HTTPError(400, 'Quiz name must be between 3 and 30 characters long');
  }

  // Check if the name is already being used
  const nameExists = data.quizzes.some(quiz => quiz.name === name && quiz.quizOwnerId === authUserId);
  if (nameExists) {
    throw HTTPError(400, 'Quiz name is already being used');
  }

  // Check if the description is within the character limit
  if (description.length > maxDescriptionLength) {
    throw HTTPError(400, 'Description must be 100 characters or less');
  }

  const newQuizId = data.quizzes.length > 0
    ? Math.max(...data.quizzes.map(quiz => quiz.quizId)) + 1
    : 1;

  const newQuiz: Quiz = {
    quizId: newQuizId,
    name: name,
    quizOwnerId: authUserId,
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
  const data: Data = getData();

  // Check if authUserId refers to a valid user
  const userExists = data.users.some(user => user.userId === authUserId);

  // Check if quizId refers to a valid quiz
  const quizIndex = data.quizzes.findIndex(quiz => quiz.quizId === quizId);
  if (quizIndex === -1) {
    throw HTTPError(400, 'quizId does not refer to a valid quiz');
  }

  // Check if the quiz belongs to the user with authUserId
  if (data.quizzes[quizIndex].quizOwnerId !== authUserId) {
    throw HTTPError(400, 'quizId does not refer to a quiz this user owns');
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
  const data: Data = getData();
  const userIndex = data.users.findIndex(user => user.userId === authUserId);
  const quizIndex = data.quizzes.findIndex(quiz => quiz.quizId === quizId);
  
  // Checks dataStore.quizzes to find if a quizId matches; else is invalid quiz.
  if (quizIndex === -1) {
    throw HTTPError(400, 'Quiz ID does not refer to valid quiz.');
  }

  // Checks dataStore.quizzes for a quiz.quizOwnerId that doesn't match authUserId.
  const quiz = data.quizzes[quizIndex];
  if (authUserId !== quiz.quizOwnerId) {
    throw HTTPError(400, 'Quiz ID does not refer to a quiz that this user owns.');
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
  const data: Data = getData();

  const userIndex = data.users.findIndex(user => user.userId === authUserId);

  const quizIndex = data.quizzes.findIndex(quiz => quiz.quizId === quizId);
  if (quizIndex === -1) {
    throw HTTPError(400, 'Quiz ID does not refer to valid quiz.');
  }

  if (authUserId !== data.quizzes[quizIndex].quizOwnerId) {
    throw HTTPError(400, 'Quiz ID does not refer to a quiz that this user owns.');
  }

  const regex = /^[a-zA-Z0-9\s]*$/;
  if (!regex.test(name)) {
    throw HTTPError(400, 'Name contains invalid characters. Valid characters are alphanumeric and spaces.');
  }

  if (name.length > maxNameLength || name.length < minNameLength) {
    throw HTTPError(400, 'Name is either less than 3 characters long or more than 30 characters long.');
  }

  if (data.quizzes.find(q => q.name === name && q.quizOwnerId === authUserId)) {
    throw HTTPError(400, 'Name is already used by the current logged in user for another quiz.');
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
  const data: Data = getData();
  const userIndex = data.users.findIndex(user => user.userId === authUserId);
  const quizIndex = data.quizzes.findIndex(quiz => quiz.quizId === quizId);
  
  if (quizIndex === -1) {
    throw HTTPError(400, 'Quiz ID does not refer to a valid quiz');
  }

  const quiz = data.quizzes.find(quiz => quiz.quizId === quizId);
  if (quiz.quizOwnerId != authUserId) {
    throw HTTPError(400, 'Quiz ID does not refer to a quiz that this user own');
  }
  if (description.length >= maxDescriptionLength) {
    throw HTTPError(400, 'Description is more than 100 characters in length');
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

/**Given a particular quiz, add a question to that quiz
 * 
 * @param {int} quizId 
 * @param {int} authUserId 
 * @param {QuestionBody} questionBody 
 * @returns {}
 */
export function adminQuizQuestionCreate(quizId: number, authUserId: number, questionBody: QuestionBody): QuestionId | ErrorObject {
  return {};
}

/**
 * Update the relevant details of a particular question within a quiz. 
 * @param {int} quizId 
 * @param {int} questionId 
 * @param {int} authUserId 
 * @param {QuestionBody} questionBody 
 * @returns {}
 */
export function adminQuizQuestionUpdate(quizId: number, questionId: number, authUserId: number, questionBody: QuestionBody): ErrorObject | object {
  const data: Data = getData();
  const quiz = data.quizzes.find(quiz => quiz.quizOwnerId === authUserId);
  const question = quiz.questions.find(question => question.questionId === questionId);

  if (!quiz) {
    throw HTTPError(400, 'User Does Not Own Quiz');
  }
  if (!question) {
    throw HTTPError(400, 'Invalid QuestionId');
  }
  if (questionBody.question.length < 5 || questionBody.question.length > 50) {
    throw HTTPError(400, 'Invalid Question String Length');
  }
  if (questionBody.duration < 1) {
    throw HTTPError(400, 'Invalid Duration');
  }
  if (questionBody.answers.length < 2 || questionBody.answers.length > 6) {
    throw HTTPError(400, 'Invalid Number of Answers');
  }
  let totalDuration: number;
  for (const question of quiz.questions) {
    totalDuration += question.body.duration;
  }
  totalDuration += questionBody.duration;
  if (totalDuration > 180) {
    throw HTTPError(400, 'Quiz Exceeded Time Limit');
  }
  if (questionBody.points < 1 || questionBody.points > 10) {
    throw HTTPError(400, 'Invalid Question Points');
  }
  for (const answer of questionBody.answers) {
    if (answer.answer.length) {
      throw HTTPError(400, 'Invalid Answer Length');
    }
  }
  if (sameQuestionString(questionBody)) {
    throw HTTPError(400, 'Duplicate Answers');
  }
  if (!questionBody.answers.find(answer => answer.correct === true)) {
    throw HTTPError(400, 'No Correct Answers');
  }
  question.body = questionBody;
  quiz.timeLastEdited = Date.now();
  setData(data);
  return {};
}


const sameQuestionString = (questionBody: QuestionBody): boolean => {
  return questionBody.answers.some((answer: AnswerInput, index: number) => {
    return questionBody.answers.slice(index + 1).some(otherAnswer => {
      return answer.answer === otherAnswer.answer;
    })
  })
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

export function adminQuizQuestionRemove(quizId: number, questionId: number, authUserId: number): {} {
  const data: Data = getData();
  const quiz = data.quizzes.find(quiz => quiz.quizId === quizId);
  if (!quiz.questions.find(question => question.questionId === questionId)) {
    return { error: 'Question Not Found' };
  }
  quiz.questions.filter(question => question.questionId !== questionId);
  setData(data);
  return {};
};

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

export function adminQuizQuestionMove(quizId: number, questionId: number, newPosition: number): {} {
  const data: Data = getData();
  const quiz = data.quizzes.find(quiz => quiz.quizId === quizId);
  const questionIndex = quiz.questions.findIndex(question => question.questionId === questionId);
  if (!quiz.questions.find(question => question.questionId === questionId)) {
    return { error: 'Question Not Found' };
  }
  if (newPosition < 0 ||
      newPosition > quiz.questions.length || 
      newPosition === quiz.questions.findIndex(question => question.questionId === questionId)) {
    return { error: 'Invalid Position' };
  }
  let removedQuestion = quiz.questions.splice(questionIndex, 1)[0];
  quiz.questions.splice(newPosition, 0, removedQuestion);
  quiz.timeLastEdited = Date.now();
  setData(data);
  return {};
}

/**
 * A particular question gets duplicated to
 * immediately after where the source question is
 * 
 * @param {int} quizId 
 * @param {int} questionId 
 * @param {int} authUserId 
 * @returns {}
 */
export function adminQuizQuestionDuplicate(quizId: number, questionId: number, authUserId: number): Error | DupedQuestionId {
  return {};
}