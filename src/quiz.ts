import { getData, setData } from './dataStore';
import {
  ErrorObject,
  AdminQuizListReturn,
  QuizId,
  Data,
  Quiz,
  QuestionBody,
  QuestionId,
  Question,
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
  // Filters out all quizzes which match the authUserId
  const userQuizzes = data.quizzes.filter(quiz => quiz.ownerId === authUserId);
  // Separates out the two required fields and creates an array mapping these together
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
  const nameExists = data.quizzes.some(quiz => quiz.name === name && quiz.ownerId === authUserId);
  if (nameExists) {
    throw HTTPError(400, 'Quiz name is already being used');
  }
  // Check if the description is within the character limit
  if (description.length > maxDescriptionLength) {
    throw HTTPError(400, 'Description must be 100 characters or less');
  }
  // Looks through quizzes and finds the highest quizId and adds 1 for new Id
  const newQuizId = data.quizzes.length > 0
    ? Math.max(...data.quizzes.map(quiz => quiz.quizId)) + 1
    : 1;
  // Prepares the return object
  const newQuiz: Quiz = {
    quizId: newQuizId,
    name: name,
    ownerId: authUserId,
    timeCreated: Date.now(),
    timeLastEdited: Date.now(),
    description: description,
    questions: [],
    duration: 0,
    thumbnailUrl: '',
  };
  // Saves data
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
  // Finds quiz with quizId
  const quizFind = data.quizzes.find(quizFind => quizFind.quizId === quizId);
  // Quiz isn't owned by user
  if (quizFind.ownerId !== authUserId) {
    throw HTTPError(403, 'authUserId does not own this quiz');
  }
  // Quiz not found
  if (!quizFind) {
    throw HTTPError(400, 'Invalid quizId');
  }
  // Find index of the quiz
  const quizIndex = data.quizzes.findIndex(quiz => quiz.quizId === quizId);
  // Removes quiz and stores that element in removedQuiz
  const [removedQuiz] = data.quizzes.splice(quizIndex, 1);
  // Store this quiz in the trash
  data.trash.push(removedQuiz);
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

export const adminQuizInfo = (authUserId: number, quizId: number): Quiz | ErrorObject => {
  const data: Data = getData();
  // Finds the quiz index
  const quizIndex = data.quizzes.findIndex(quiz => quiz.quizId === quizId);
  // Checks dataStore.quizzes for a quiz.ownerId that doesn't match authUserId.
  const quiz = data.quizzes[quizIndex];
  if (authUserId !== quiz.ownerId) {
    throw HTTPError(403, 'Quiz ID does not refer to a quiz that this user owns.');
  }

  // Checks dataStore.quizzes to find if a quizId matches; else is invalid quiz.
  if (quizIndex === -1) {
    throw HTTPError(400, 'Quiz id does not refer to valid quiz.');
  }

  return {
    quizId: quizId,
    name: quiz.name,
    ownerId: quiz.ownerId,
    timeCreated: quiz.timeCreated,
    timeLastEdited: quiz.timeLastEdited,
    description: quiz.description,
    questions: quiz.questions,
    duration: quiz.duration,
    thumbnailUrl: quiz.thumbnailUrl,
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
  // Finds quiz index
  const quizIndex = data.quizzes.findIndex(quiz => quiz.quizId === quizId);
  // Quiz is not owned by the user
  if (authUserId !== data.quizzes[quizIndex].ownerId) {
    throw HTTPError(403, 'Quiz ID does not refer to a quiz that this user owns.');
  }

  // Quiz not found
  if (quizIndex === -1) {
    throw HTTPError(400, 'Quiz ID does not refer to valid quiz.');
  }
  // Verifies the name is of valid structure
  const regex = /^[a-zA-Z0-9\s]*$/;
  if (!regex.test(name)) {
    throw HTTPError(400, 'Name contains invalid characters. Valid characters are alphanumeric and spaces.');
  }
  // Invalid name length
  if (name.length > maxNameLength || name.length < minNameLength) {
    throw HTTPError(400, 'Name is either less than 3 characters long or more than 30 characters long.');
  }
  // Name is already used in another quiz
  if (data.quizzes.find(q => q.name === name && q.ownerId === authUserId)) {
    throw HTTPError(400, 'Name is already used by the current logged in user for another quiz.');
  }
  // Update the quiz name in the data store
  data.quizzes[quizIndex].name = name;
  data.quizzes[quizIndex].timeLastEdited = Date.now();

  setData(data);

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
  // Finds quiz index
  const quizIndex = data.quizzes.findIndex(quiz => quiz.quizId === quizId);
  // Quiz not owned by user
  const quiz = data.quizzes.find(quiz => quiz.quizId === quizId);
  if (quiz.ownerId !== authUserId) {
    throw HTTPError(403, 'Quiz ID does not refer to a quiz that this user own');
  }
  // Quiz not found
  if (quizIndex === -1) {
    throw HTTPError(400, 'Quiz ID does not refer to a valid quiz');
  }
  // Description is too long
  if (description.length >= maxDescriptionLength) {
    throw HTTPError(400, 'Description is more than 100 characters in length');
  }
  // Updates description
  data.quizzes[quizIndex].description = description;
  data.quizzes[quizIndex].timeLastEdited = Date.now();

  setData(data);

  return {};
};

/**
 * Transfer ownership of a quiz to a different user based on their email
 *
 * @param {int} authUserId
 * @param {int} quizId
 * @param {string} userEmail
 * @returns {}
 */
export const adminQuizTransfer = (authUserId: number, quizId: number, userEmail: string): ErrorObject | object => {
  const data = getData();
  // Finds user with the email
  const targetUser = data.users.find(user => user.email === userEmail);
  // User not found
  if (!targetUser) {
    throw HTTPError(400, 'userEmail is not a real user');
  }
  // Email is the user's, not the one they want to transfer to
  if (targetUser.userId === authUserId) {
    throw HTTPError(400, 'userEmail is the current logged in user');
  }
  // Find quiz
  const quiz = data.quizzes.find(quiz => quiz.quizId === quizId);
  // Quiz is not owned by user
  if (quiz.ownerId !== authUserId) {
    throw HTTPError(403, 'Quiz ID does not refer to a quiz that this user own');
  }
  // Quiz not found
  if (!quiz) {
    throw HTTPError(400, 'QuizId does not refer to a valid quiz');
  }
  // Find same quiz name
  const similarNameFound = data.quizzes.some(q => q.ownerId === targetUser.userId && q.name === quiz.name);
  // Same quiz name found
  if (similarNameFound) {
    throw HTTPError(400, 'Quiz ID refers to a quiz that has a name that is already used by the target user');
  }
  // Find user index
  const currentUserIndex = data.users.findIndex(user => user.userId === authUserId);
  // User not found
  if (currentUserIndex === -1) {
    throw HTTPError(400, 'AuthUserId is not a valid user');
  }
  // Successful Transfer, i.e. change ownerId of current quiz to the targetUser's userId.
  quiz.ownerId = targetUser.userId;
  quiz.timeLastEdited = Date.now();

  setData(data);

  return {};
};

/** Given a particular quiz, add a question to that quiz
 *
 * @param {int} quizId
 * @param {int} authUserId
 * @param {QuestionBody} questionBody
 * @returns {}
 */
export function adminQuizQuestionCreate(quizId: number, authUserId: number, questionBody: QuestionBody): QuestionId | ErrorObject {
  const data: Data = getData();
  // Find quiz
  const quizFind = data.quizzes.find(quizFind => quizFind.quizId === quizId);
  // Quiz is not owned by user
  if (quizFind.ownerId !== authUserId) {
    throw HTTPError(403, 'authUserId does not own this quiz');
  }
  // Quiz not found
  if (!quizFind) {
    throw HTTPError(400, 'Invalid quizId');
  }
  // Invalid question length
  if (questionBody.question.length < 5 || questionBody.question.length > 50) {
    throw HTTPError(400, 'Invalid question string length');
  }
  // Invalid number of answer choices
  if (questionBody.answers.length < 2 || questionBody.answers.length > 6) {
    throw HTTPError(400, 'Question must have between 2 and 6 answer choices inclusive');
  }
  // Quiz duration too long
  if (questionBody.duration + quizFind.duration > 180) {
    throw HTTPError(400, 'Quiz duration exceeds 3 minutes');
  }
  // Quiz duration too short
  if (questionBody.duration <= 0) {
    throw HTTPError(400, 'Question duration must be at least 1 second');
  }
  // Invalid question points
  if (questionBody.points < 1 || questionBody.points > 10) {
    throw HTTPError(400, 'Invalid question points rewarded');
  }
  // Checking every answer for correct length
  for (const i of questionBody.answers) {
    if (i.answer.length < 1 || i.answer.length > 30) {
      throw HTTPError(400, 'Answer length must be between 1 and 30 characters long inclusive');
    }
  }
  // Checking for duplicate answer choices
  for (let i = 0; i < questionBody.answers.length - 1; i++) {
    for (let j = i + 1; j < questionBody.answers.length; j++) {
      if (questionBody.answers[i].answer === questionBody.answers[j].answer) {
        throw HTTPError(400, 'Cannot be duplicate answers for a question');
      }
    }
  }
  // Checking for at least one correct answer
  const findOneTrue = questionBody.answers.some(answer => answer.correct === true);
  // One correct answer not found
  if (!findOneTrue) {
    throw HTTPError(400, 'At least one answer must be correct');
  }

  if (!(questionBody.thumbnailUrl.endsWith('.jpeg')) && !(questionBody.thumbnailUrl.endsWith('.jpg')) && !(questionBody.thumbnailUrl.endsWith('.png'))) {
    throw HTTPError(400, 'Invalid url');
  }

  if (!(questionBody.thumbnailUrl.startsWith('http://')) && !(questionBody.thumbnailUrl.startsWith('https://'))) {
    throw HTTPError(400, 'Invalid url');
  }

  // Generating newQuestionId (which is just a random 6 digit number)
  // Searches questions to see if questionId has been used yet
  let newQuestionId: number;
  do {
    newQuestionId = Math.floor(100000 + Math.random() * 900000);
  } while (data.quizzes.some(quiz => quiz.questions && quiz.questions.some(question => question.questionId === newQuestionId)));

  // Prepares object for saving data
  const newQuestion: Question = {
    questionBody: questionBody,
    questionId: newQuestionId
  };

  // Saving data
  quizFind.questions.push(newQuestion);

  // Updating values
  quizFind.duration += questionBody.duration;
  quizFind.timeLastEdited = Date.now();

  setData(data);

  return {
    questionId: newQuestionId
  };
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
  // Finds quiz
  const quizFind = data.quizzes.find(quizFind => quizFind.quizId === quizId);
  // Quiz is not owned by user
  if (quizFind.ownerId !== authUserId) {
    throw HTTPError(403, 'Quiz does not belong to user');
  }
  // Quiz not found
  if (!quizFind) {
    throw HTTPError(400, 'Invalid quizId');
  }
  // Finds question
  const questionFind = quizFind.questions.find(questionFind => questionFind.questionId === questionId);
  // Question not found
  if (!questionFind) {
    throw HTTPError(400, 'QuestionId does not exist under the quiz');
  }
  // Invalid question length
  if (questionBody.question.length < 5 || questionBody.question.length > 50) {
    throw HTTPError(400, 'Invalid Question String Length');
  }
  // Duration too short
  if (questionBody.duration < 1) {
    throw HTTPError(400, 'Invalid Duration');
  }
  // Invalid number of answers
  if (questionBody.answers.length < 2 || questionBody.answers.length > 6) {
    throw HTTPError(400, 'Invalid Number of Answers');
  }
  // Checks every answer for correct length
  for (const i of questionBody.answers) {
    if (i.answer.length < 1 || i.answer.length > 30) {
      throw HTTPError(400, 'Answer length must be between 1 and 30 characters long inclusive');
    }
  }
  // Checks for duplicate answers
  for (let i = 0; i < questionBody.answers.length - 1; i++) {
    for (let j = i + 1; j < questionBody.answers.length; j++) {
      if (questionBody.answers[i].answer === questionBody.answers[j].answer) {
        throw HTTPError(400, 'Cannot be duplicate answers for a question');
      }
    }
  }
  // Invalid question points
  if (questionBody.points < 1 || questionBody.points > 10) {
    throw HTTPError(400, 'Invalid Question Points');
  }
  // Searches for at least one correct answer
  const findOneTrue = questionBody.answers.some(answer => answer.correct === true);
  if (!findOneTrue) {
    throw HTTPError(400, 'At least one answer must be correct');
  }
  // Duration too long
  if (questionBody.duration + quizFind.duration - questionFind.questionBody.duration > 180) {
    throw HTTPError(400, 'Quiz duration exceeds 3 minutes');
  }

  if (!(questionBody.thumbnailUrl.endsWith('.jpeg')) && !(questionBody.thumbnailUrl.endsWith('.jpg')) && !(questionBody.thumbnailUrl.endsWith('.png'))) {
    throw HTTPError(400, 'Invalid url');
  }

  if (!(questionBody.thumbnailUrl.startsWith('http://')) && !(questionBody.thumbnailUrl.startsWith('https://'))) {
    throw HTTPError(400, 'Invalid url');
  }

  // Updates details
  questionFind.questionBody = questionBody;
  quizFind.timeLastEdited = Date.now();
  quizFind.duration += (questionBody.duration - questionFind.questionBody.duration);

  setData(data);

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

export function adminQuizQuestionRemove(quizId: number, questionId: number, authUserId: number): object {
  const data: Data = getData();
  // Finds quiz
  const quiz = data.quizzes.find(quiz => quiz.quizId === quizId);
  // Quiz is not owned by user
  if (quiz.ownerId !== authUserId) {
    throw HTTPError(403, 'authUserId does not own this quiz');
  }
  // Quiz not found
  if (!quiz) {
    throw HTTPError(400, 'Invalid quizId');
  }
  // Checks if there is a question in that quiz
  if (!quiz.questions.find(question => question.questionId === questionId)) {
    throw HTTPError(400, 'Question Not Found');
  }
  // Removes the question from the quiz
  quiz.questions.filter(question => question.questionId !== questionId);

  setData(data);

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

export function adminQuizQuestionMove(quizId: number, questionId: number, authUserId: number, newPosition: number): object {
  const data: Data = getData();
  // Finds quiz
  const quizFind = data.quizzes.find(quizFind => quizFind.quizId === quizId);
  // Quiz not owned by user
  if (quizFind.ownerId !== authUserId) {
    throw HTTPError(403, 'Quiz does not belong to user');
  }
  // Quiz not found
  if (!quizFind) {
    throw HTTPError(400, 'Invalid quizId');
  }
  // Finds question
  const questionFind = quizFind.questions.find(questionFind => questionFind.questionId === questionId);
  // Question not found
  if (!questionFind) {
    throw HTTPError(400, 'QuestionId does not exist under the quiz');
  }
  // Gets index of question
  const questionIndex = quizFind.questions.findIndex(question => question.questionId === questionId);
  // Checks for valid position
  if (newPosition < 0 ||
      newPosition > quizFind.questions.length - 1 ||
      newPosition === questionIndex) {
    throw HTTPError(400, 'Invalid Position');
  }
  // Removes and inserts question from original position to new position
  const removedQuestion = quizFind.questions.splice(questionIndex, 1)[0];
  quizFind.questions.splice(newPosition, 0, removedQuestion);
  quizFind.timeLastEdited = Date.now();

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

export function adminQuizQuestionDuplicate(quizId: number, questionId: number, authUserId: number): ErrorObject | DupedQuestionId {
  const data: Data = getData();
  // Finds quiz, question and gets question index
  const quiz: Quiz = data.quizzes.find(quiz => quiz.quizId === quizId);
  const question: Question = quiz.questions.find(question => question.questionId === questionId);
  const questionIndex = quiz.questions.findIndex(question => question.questionId === questionId);
  // Error: Valid authUserId, but not quiz owner.
  if (quiz.ownerId !== authUserId) {
    throw HTTPError(403, 'Quiz ID does not refer to a quiz that this user own');
  }
  // Question not found
  if (!question) {
    throw HTTPError(400, 'Question Id does not refer to a valid question within this quiz');
  }
  // Error: Invalid authUserId
  const userIndex = data.users.findIndex(user => user.userId === authUserId);
  if (userIndex === -1) {
    throw HTTPError(400, 'AuthUserId is not a valid user');
  }
  // Generates a newQuestionId (a random 6 digit number)
  // Keeps doing it until a new ID is generated
  let newQuestionId: number;
  do {
    newQuestionId = Math.floor(100000 + Math.random() * 900000);
  } while (data.quizzes.some(quiz => quiz.questions && quiz.questions.some(question => question.questionId === newQuestionId)));

  const newQuestion: Question = {
    questionBody: question.questionBody,
    questionId: newQuestionId
  };

  // splice to right after quiz location
  quiz.questions.splice(questionIndex + 1, 0, newQuestion);
  // update timeLastEdited of quiz.
  quiz.timeLastEdited = Date.now();

  setData(data);

  return {
    newQuestionId: newQuestion.questionId
  };
}

/**
 * Update the thumbnail for the quiz. When this route is
 * called, the timeLastEdited is updated.
 *
 * @param {number} authUserId
 * @param {number} quizId
 * @param {string} imgUrl
 * @returns
 */
export function adminQuizThumbnailUpdate(authUserId: number, quizId: number, imgUrl: string): ErrorObject | object {
  const data = getData();
  const quiz = data.quizzes.find(quiz => quiz.quizId === quizId);
  if (quiz.ownerId !== authUserId) {
    throw HTTPError(403, 'User does not own quiz');
  }

  if (!(imgUrl.endsWith('.jpeg')) && !(imgUrl.endsWith('.jpg')) && !(imgUrl.endsWith('.png'))) {
    throw HTTPError(400, 'Invalid url');
  }

  if (!(imgUrl.startsWith('http://')) && !(imgUrl.startsWith('https://'))) {
    throw HTTPError(400, 'Invalid url');
  }

  quiz.thumbnailUrl = imgUrl;
  setData(data);

  return {};
}
