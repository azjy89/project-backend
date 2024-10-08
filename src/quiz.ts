import { getData, getTimerData, setData } from './dataStore';
import fs from 'fs';
import path from 'path';
import {
  ErrorObject,
  AdminQuizListReturn,
  QuizId,
  Data,
  Quiz,
  QuestionBody,
  QuestionId,
  Question,
  DupedQuestionId,
  SessionId,
  Actions,
  States,
  QuizSession,
  SessionList,
  SessionStatus,
  AdminQuizInfoReturn,
  SessionResults,
  Player,
  QuestionResultReturn,
  QuestionResult
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
    timeCreated: Math.floor(Date.now() / 1000),
    timeLastEdited: Math.floor(Date.now() / 1000),
    description: description,
    questions: [],
    duration: 0,
    thumbnailUrl: undefined,
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
  if (quizFind) {
    if (quizFind.ownerId !== authUserId) {
      throw HTTPError(403, 'authUserId does not own this quiz');
    }
  }
  // Quiz not found
  if (!quizFind) {
    throw HTTPError(400, 'Invalid quizId');
  }

  if (data.quizSessions.find(session => session.quizId === quizId && session.state !== States.END)) {
    throw HTTPError(400, 'Quiz has active sessions');
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

export const adminQuizInfo = (authUserId: number, quizId: number): AdminQuizInfoReturn | ErrorObject => {
  const data: Data = getData();
  // Finds the quiz index
  const quizIndex = data.quizzes.findIndex(quiz => quiz.quizId === quizId);
  // Checks dataStore.quizzes for a quiz.ownerId that doesn't match authUserId.
  const quiz = data.quizzes[quizIndex];
  if (quizIndex !== -1) {
    if (authUserId !== quiz.ownerId) {
      throw HTTPError(403, 'Quiz ID does not refer to a quiz that this user owns.');
    }
  }
  // Checks dataStore.quizzes to find if a quizId matches; else is invalid quiz.
  if (quizIndex === -1) {
    throw HTTPError(400, 'Quiz id does not refer to valid quiz.');
  }

  const info = {
    quizId: quizId,
    name: quiz.name,
    timeCreated: quiz.timeCreated,
    timeLastEdited: quiz.timeLastEdited,
    description: quiz.description,
    numQuestions: quiz.questions.length,
    questions: quiz.questions,
    duration: quiz.duration,
    thumbnailUrl: quiz.thumbnailUrl,
  };

  return info;
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
  if (quizIndex !== -1) {
    if (authUserId !== data.quizzes[quizIndex].ownerId) {
      throw HTTPError(403, 'Quiz ID does not refer to a quiz that this user owns.');
    }
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
  data.quizzes[quizIndex].timeLastEdited = Math.floor(Date.now() / 1000);

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
  if (quiz) {
    if (quiz.ownerId !== authUserId) {
      throw HTTPError(403, 'Quiz ID does not refer to a quiz that this user own');
    }
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
  data.quizzes[quizIndex].timeLastEdited = Math.floor(Date.now() / 1000);

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
  const quiz = data.quizzes.find(quiz => quiz.quizId === quizId);
  if (quiz.ownerId !== authUserId) {
    throw HTTPError(403, 'authUserId does not own this quiz');
  }
  // User not found
  if (!targetUser) {
    throw HTTPError(400, 'userEmail is not a real user');
  }
  // Email is the user's, not the one they want to transfer to
  if (targetUser.userId === authUserId) {
    throw HTTPError(400, 'userEmail is the current logged in user');
  }
  // Find same quiz name
  const similarNameFound = data.quizzes.some(q => q.ownerId === targetUser.userId && q.name === quiz.name);
  // Same quiz name found
  if (similarNameFound) {
    throw HTTPError(400, 'Quiz ID refers to a quiz that has a name that is already used by the target user');
  }

  if (data.quizSessions.find(session => session.quizId === quizId && session.state !== States.END)) {
    throw HTTPError(400, 'Quiz has active sessions');
  }

  // Successful Transfer, i.e. change ownerId of current quiz to the targetUser's userId.
  quiz.ownerId = targetUser.userId;
  quiz.timeLastEdited = Math.floor(Date.now() / 1000);

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
  if (quizFind) {
    if (quizFind.ownerId !== authUserId) {
      throw HTTPError(403, 'authUserId does not own this quiz');
    }
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
    questionId: newQuestionId,
    question: questionBody.question,
    duration: questionBody.duration,
    thumbnailUrl: questionBody.thumbnailUrl,
    points: questionBody.points,
    answers: [],
  };

  const colours = ['red', 'blue', 'green', 'yellow'];
  for (const answer of questionBody.answers) {
    const randomIndex = Math.floor(Math.random() * colours.length);
    newQuestion.answers.push({
      answerId: newQuestion.answers.length,
      answer: answer.answer,
      colour: colours[randomIndex],
      correct: answer.correct,
    });
  }

  // Saving data
  quizFind.questions.push(newQuestion);

  // Updating values
  quizFind.duration += questionBody.duration;
  quizFind.timeLastEdited = Math.floor(Date.now() / 1000);

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
    throw HTTPError(403, 'authUserId does not own this quiz');
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
  if (questionBody.duration + quizFind.duration - questionFind.duration > 180) {
    throw HTTPError(400, 'Quiz duration exceeds 3 minutes');
  }

  if (!(questionBody.thumbnailUrl.endsWith('.jpeg')) && !(questionBody.thumbnailUrl.endsWith('.jpg')) && !(questionBody.thumbnailUrl.endsWith('.png'))) {
    throw HTTPError(400, 'Invalid url');
  }

  if (!(questionBody.thumbnailUrl.startsWith('http://')) && !(questionBody.thumbnailUrl.startsWith('https://'))) {
    throw HTTPError(400, 'Invalid url');
  }

  // Updates details
  const quizIndex = data.quizzes.findIndex(quiz => quizFind.quizId === quizId);
  const questionIndex = quizFind.questions.findIndex(question => questionFind.questionId === questionId);
  data.quizzes[quizIndex].questions[questionIndex].question = questionBody.question;
  data.quizzes[quizIndex].questions[questionIndex].points = questionBody.points;
  const colours = ['red', 'blue', 'green', 'yellow'];
  data.quizzes[quizIndex].questions[questionIndex].answers = [];

  for (const answer of questionBody.answers) {
    const randomIndex = Math.floor(Math.random() * colours.length);
    data.quizzes[quizIndex].questions[questionIndex].answers.push({
      answerId: data.quizzes[quizIndex].questions[questionIndex].answers.length,
      answer: answer.answer,
      colour: colours[randomIndex],
      correct: answer.correct,
    });
  }

  data.quizzes[quizIndex].timeLastEdited = Math.floor(Date.now() / 1000);
  data.quizzes[quizIndex].duration += (questionBody.duration - data.quizzes[quizIndex].questions[questionIndex].duration);

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
  // Checks if there is a question in that quiz
  if (!quiz.questions.find(question => question.questionId === questionId)) {
    throw HTTPError(400, 'Question Not Found');
  }

  if (data.quizSessions.find(session => session.quizId === quizId && session.state !== States.END)) {
    throw HTTPError(400, 'Quiz has active sessions');
  }

  // Removes the question from the quiz
  quiz.questions = quiz.questions.filter(question => question.questionId !== questionId);

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
    throw HTTPError(403, 'authUserId does not own this quiz');
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
  quizFind.timeLastEdited = Math.floor(Date.now() / 1000);

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
    throw HTTPError(403, 'authUserId does not own this quiz');
  }
  // Question not found
  if (!question) {
    throw HTTPError(400, 'Question Id does not refer to a valid question within this quiz');
  }
  // Generates a newQuestionId (a random 6 digit number)
  // Keeps doing it until a new ID is generated
  let newQuestionId: number;
  do {
    newQuestionId = Math.floor(100000 + Math.random() * 900000);
  } while (data.quizzes.some(quiz => quiz.questions && quiz.questions.some(question => question.questionId === newQuestionId)));

  const newQuestion: Question = {
    questionId: newQuestionId,
    question: question.question,
    duration: question.duration,
    thumbnailUrl: question.thumbnailUrl,
    points: question.points,
    answers: [],
  };

  const colours = ['red', 'blue', 'green', 'yellow'];
  for (const answer of question.answers) {
    const randomIndex = Math.floor(Math.random() * colours.length);
    newQuestion.answers.push({
      answerId: newQuestion.answers.length,
      answer: answer.answer,
      colour: colours[randomIndex],
      correct: answer.correct,
    });
  }

  // splice to right after quiz location
  quiz.questions.splice(questionIndex + 1, 0, newQuestion);
  // update timeLastEdited of quiz.
  quiz.timeLastEdited = Math.floor(Date.now() / 1000);

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

  quiz.timeLastEdited = Math.floor(Date.now() / 1000);
  quiz.thumbnailUrl = imgUrl;
  setData(data);

  return {};
}

/**
 * Start a new quiz session
 *
 * @param authUserId
 * @param quizId
 * @param autoStartNum
 * @returns
 */
export function adminQuizSessionCreate(authUserId: number, quizId: number, autoStartNum: number): ErrorObject | SessionId {
  const data = getData();
  const quiz = data.quizzes.find(quiz => quiz.quizId === quizId);
  if (quiz) {
    if (quiz.ownerId !== authUserId) {
      throw HTTPError(403, 'token is valid but user does not own quiz');
    }
  }

  if (!quiz) {
    throw HTTPError(400, 'invalid quizId');
  }

  if (autoStartNum > 50) {
    throw HTTPError(400, 'autoStartNum too high');
  }

  if (data.quizSessions.filter(session => session.state !== States.END && session.quizId === quizId).length >= 10) {
    throw HTTPError(400, 'too many sessions');
  }

  if (quiz.questions.length === 0) {
    throw HTTPError(400, 'quiz has no questions');
  }

  const newSessionId = Math.floor(Math.random() * (1000000 - 10000 + 1)) + 10000;
  const newQuestionResults: QuestionResult[] = [];
  for (const question of quiz.questions) {
    newQuestionResults.push({
      questionId: question.questionId,
      playersCorrectList: [],
      averageAnswerTime: 0,
      percentCorrect: 0,
    });
  }
  const newSession: QuizSession = {
    sessionId: newSessionId,
    quizId: quizId,
    atQuestion: 0,
    autoStartNum: autoStartNum,
    state: States.LOBBY,
    players: [],
    messages: [],
    quiz: JSON.parse(JSON.stringify(quiz)),
    questionResults: [],
    questionStartTimes: [],
  };

  data.quizSessions.push(newSession);
  setData(data);
  return { sessionId: newSessionId };
}

/**
 * list active and inactive sessions
 *
 * @param authUserId
 * @param quizId
 * @returns
 */
export function sessionsList(authUserId: number, quizId: number): SessionList {
  const data = getData();
  const quiz = data.quizzes.find(quiz => quiz.quizId === quizId);
  if (quiz.ownerId !== authUserId) {
    throw HTTPError(403, 'User does not own quiz');
  }

  const activeSessions = data.quizSessions.filter(session => session.state !== States.END && session.quizId === quizId).map(session => session.sessionId);
  const inactiveSessions = data.quizSessions.filter(session => session.state === States.END && session.quizId === quizId).map(session => session.sessionId);
  setData(data);
  return {
    activeSessions: activeSessions,
    inactiveSessions: inactiveSessions,
  };
}

/**
 * Returns all status info about a specified session
 *
 * @param authUserId
 * @param quizId
 * @param sessionId
 * @returns
 */
export function sessionStatus(authUserId: number, quizId: number, sessionId: number): SessionStatus {
  const data = getData();
  const quiz = data.quizzes.find(quiz => quiz.quizId === quizId);
  if (quiz.ownerId !== authUserId) {
    throw HTTPError(403, 'User does not own quiz');
  }

  if (!data.quizSessions.find(session => session.sessionId === sessionId && session.quizId === quizId)) {
    throw HTTPError(400, 'Session Id does not refer to a valid session within this quiz');
  }

  const metadata = adminQuizInfo(authUserId, quizId) as AdminQuizInfoReturn;
  const session = data.quizSessions.find(session => session.sessionId === sessionId);
  setData(data);
  return {
    state: session.state,
    atQuestion: session.atQuestion,
    players: session.players,
    metadata: metadata,
  };
}

export function sessionStateUpdate(authUserId: number, quizId: number, sessionId: number, action: Actions): object | ErrorObject {
  const data = getData();
  if (!data.quizSessions.find(session => session.sessionId === sessionId && session.quizId === quizId)) {
    throw HTTPError(400, 'Session Id does not refer to a valid session within this quiz');
  }

  const session = data.quizSessions.find(session => session.sessionId === sessionId);

  if (session.state !== States.QUESTION_COUNTDOWN && action === Actions.SKIP_COUNTDOWN) {
    throw HTTPError(400, 'Action enum cannot be applied in the current state');
  }

  if ((session.state === States.ANSWER_SHOW || session.state === States.END) && action === Actions.END) {
    throw HTTPError(400, 'Action enum cannot be applied in the current state');
  }

  if ((session.state === States.ANSWER_SHOW ||
      session.state === States.FINAL_RESULTS ||
      session.state === States.LOBBY ||
      session.state === States.END ||
      session.state === States.QUESTION_COUNTDOWN) && action === Actions.GO_TO_ANSWER) {
    throw HTTPError(400, 'Action enum cannot be applied in the current state');
  }

  if ((session.state === States.QUESTION_OPEN ||
      session.state === States.END ||
      session.state === States.LOBBY ||
      session.state === States.QUESTION_COUNTDOWN) && action === Actions.GO_TO_FINAL_RESULTS) {
    throw HTTPError(400, 'Action enum cannot be applied in the current state');
  }

  if ((session.state === States.QUESTION_OPEN ||
    session.state === States.END ||
    session.state === States.QUESTION_COUNTDOWN ||
    session.state === States.FINAL_RESULTS) && action === Actions.NEXT_QUESTION) {
    throw HTTPError(400, 'Action enum cannot be applied in the current state');
  }

  const timerData = getTimerData();
  if ((session.state !== States.ANSWER_SHOW && session.state !== States.END) && action === Actions.END) {
    session.state = States.END;
    for (const timer of timerData.timers) {
      if (timer.sessionId === sessionId) {
        clearTimeout(timer.timerId);
      }
    }
    setData(data);
    return {};
  }

  if (session.state === States.QUESTION_COUNTDOWN && action === Actions.SKIP_COUNTDOWN) {
    const session = data.quizSessions.find(session => session.sessionId === sessionId);
    session.state = States.QUESTION_OPEN;
    session.questionStartTimes[session.atQuestion - 1] = Math.floor(Date.now() / 1000);
    for (const [timerIndex, timer] of timerData.timers.entries()) {
      if (timer.sessionId === sessionId) {
        clearTimeout(timer.timerId);
        timerData.timers.splice(timerIndex, 1);
      }
    }
    const timerId = setTimeout(() => {
      session.state = States.QUESTION_CLOSE;
      const timerIndex = timerData.timers.findIndex(timer => timer.timerId === timerId);
      timerData.timers.splice(timerIndex, 1);
      setData(data);
    }, session.quiz.questions[session.atQuestion - 1].duration * 1000);
    timerData.timers.push({ timerId: timerId, sessionId: sessionId });
    setData(data);
    return {};
  }

  if ((session.state !== States.ANSWER_SHOW &&
    session.state !== States.FINAL_RESULTS &&
    session.state !== States.LOBBY &&
    session.state !== States.END &&
    session.state !== States.QUESTION_COUNTDOWN) && action === Actions.GO_TO_ANSWER) {
    session.state = States.ANSWER_SHOW;
    const timer = timerData.timers.find(timer => timer.sessionId === sessionId);
    clearTimeout(timer.timerId);
    setData(data);
    return {};
  }

  if ((session.state !== States.QUESTION_OPEN &&
    session.state !== States.END &&
    session.state !== States.LOBBY &&
    session.state !== States.QUESTION_COUNTDOWN) && action === Actions.GO_TO_FINAL_RESULTS) {
    session.state = States.FINAL_RESULTS;
    const timer = timerData.timers.find(timer => timer.sessionId === sessionId);
    clearTimeout(timer.timerId);
    setData(data);
    return {};
  }
  if (action === Actions.NEXT_QUESTION && session.atQuestion === session.quiz.questions.length) {
    throw HTTPError(400, 'Action enum cannot be applied in the current state');
  }

  session.state = States.QUESTION_COUNTDOWN;
  session.atQuestion++;
  const timerId = setTimeout(() => {
    const session = data.quizSessions.find(session => session.sessionId === sessionId);
    session.state = States.QUESTION_OPEN;
    session.questionStartTimes[session.atQuestion - 1] = Math.floor(Date.now() / 1000);
    const timerIndex = timerData.timers.findIndex(timer => timer.timerId === timerId);
    timerData.timers.splice(timerIndex, 1);

    const questionTimerId = setTimeout(() => {
      session.state = States.QUESTION_CLOSE;
      const questionTimerIndex = timerData.timers.findIndex(timer => timer.timerId === questionTimerId);
      timerData.timers.splice(questionTimerIndex, 1);
      setData(data);
    }, session.quiz.questions[session.atQuestion - 1].duration * 1000);
    timerData.timers.push({ timerId: questionTimerId, sessionId: sessionId });
    setData(data);
  }, 3 * 1000);
  timerData.timers.push({ timerId: timerId, sessionId: sessionId });

  setData(data);

  return {};
}

export function sessionResults(authUserId: number, quizId: number, sessionId: number): SessionResults | ErrorObject {
  const data = getData();
  const quizFind = data.quizzes.find(quizFind => quizFind.quizId === quizId);
  if (quizFind.ownerId !== authUserId) {
    throw HTTPError(400, 'Quiz does not belong to the user');
  }
  const sessionFind = data.quizSessions.find(sessionFind => sessionFind.sessionId === sessionId);
  if (!sessionFind) {
    throw HTTPError(400, 'sessionId does not refer to a valid session');
  }
  if (sessionFind.state !== States.FINAL_RESULTS) {
    throw HTTPError(400, 'Invalid state for showing final results');
  }

  const finalResults: SessionResults = {
    usersRankedByScore: [],
    questionResults: [],
  };

  sessionFind.players.forEach(player => {
    const playerResult = playerFinalResults(player.playerId);
    finalResults.usersRankedByScore.push(playerResult.usersRankedByScore.find(p => p.name === player.name));
  });

  // Since we only want the unique question results, we'll take the first player's as representative for all
  if (sessionFind.players.length > 0) {
    const firstPlayerResult = playerFinalResults(sessionFind.players[0].playerId);
    finalResults.questionResults = firstPlayerResult.questionResults;
  } else {
    finalResults.usersRankedByScore = [];
    finalResults.questionResults = [];
  }

  // Sorting the users by score in descending order
  finalResults.usersRankedByScore.sort((a, b) => b.score - a.score);

  return finalResults;
}

export function sessionResultsCsv(authUserId: number, quizId: number, sessionId: number): object | ErrorObject {
  const data = getData();
  const quizFind = data.quizzes.find(quizFind => quizFind.quizId === quizId);
  if (quizFind.ownerId !== authUserId) {
    throw HTTPError(400, 'Quiz does not belong to the user');
  }
  const sessionFind = data.quizSessions.find(sessionFind => sessionFind.sessionId === sessionId);
  if (!sessionFind) {
    throw HTTPError(400, 'sessionId does not refer to a valid session');
  }

  if (sessionFind.state !== States.FINAL_RESULTS) {
    throw HTTPError(400, 'Session is not in FINAL_RESULTS state');
  }

  const csvContent = generateCsvString(sessionFind);

  const fileName = sessionFind.sessionId.toString() + '.csv';
  const localPath = path.join(__dirname, '..', 'results', fileName);
  const folderPath = path.dirname(localPath);

  if (!fs.existsSync(folderPath)) {
    fs.mkdirSync(folderPath, { recursive: true });
  }
  fs.writeFileSync(localPath, csvContent);
  return { url: localPath };
}

function generateCsvString(session: QuizSession): string {
  // Sort players by name
  const sortedPlayers = [...session.players].sort((a, b) => a.name.localeCompare(b.name));

  // Create header row for CSV
  const headerRow = ['Player'];
  for (let i = 1; i <= session.quiz.questions.length; i++) {
    headerRow.push(`question${i}score`, `question${i}rank`);
  }

  // Initialize rows for player data
  const playerRows = sortedPlayers.map(player => {
    const playerRow = [player.name];
    session.quiz.questions.forEach((question, qIndex) => {
      const questionResult = session.questionResults.find(result => result.questionId === question.questionId);

      const isPlayerCorrect = questionResult.playersCorrectList.some(p => p.playerId === player.playerId);
      const playerScore = isPlayerCorrect ? question.points : 0;

      // Insert player score for the question
      playerRow.push(playerScore.toString());

      // Calculate scores for ranking
      const scoresForThisQuestion = session.players.map(p => {
        return questionResult.playersCorrectList.some(pr => pr.playerId === p.playerId) ? question.points : 0;
      }).sort((a, b) => b - a);

      for (let i = 0, rank = 1; i < scoresForThisQuestion.length; i++) {
        if (i > 0 && scoresForThisQuestion[i] !== scoresForThisQuestion[i - 1]) {
          rank = i + 1;
        }
        if (scoresForThisQuestion[i] === playerScore) {
          playerRow.push(rank.toString());
          break;
        }
      }
    });
    return playerRow;
  });

  // Assemble CSV content
  const csvContent = [headerRow, ...playerRows].map(row => row.join(',')).join('\r\n');

  return csvContent;
}

export function playerQuestionResults(playerId: number, questionPosition: number): QuestionResultReturn {
  const data = getData();
  let currSession: QuizSession;
  let player: Player;

  for (const session of data.quizSessions) {
    player = session.players.find(player => player.playerId === playerId);
    if (player) {
      currSession = session;
      break;
    }
  }

  if (!player) {
    throw HTTPError(400, 'Player with playerId does not exist');
  }

  if (questionPosition < 1 || questionPosition > currSession.quiz.questions.length) {
    throw HTTPError(400, 'Invalid questionPosition');
  }

  if (currSession.state !== States.ANSWER_SHOW) {
    throw HTTPError(400, 'Session is not in ANSWER_SHOW state');
  }

  if (currSession.atQuestion < questionPosition) {
    throw HTTPError(400, 'Session is not yet up to this question');
  }

  const questionId = currSession.quiz.questions[questionPosition - 1].questionId;

  const questionResult = currSession.questionResults.find(questionResult => questionResult.questionId === questionId);
  const returnedPlayersCorrectList = questionResult.playersCorrectList.map(player => player.name);
  const questionResultReturn: QuestionResultReturn = {
    questionId: questionResult.questionId,
    playersCorrectList: returnedPlayersCorrectList,
    averageAnswerTime: questionResult.averageAnswerTime,
    percentCorrect: questionResult.percentCorrect,
  };
  return questionResultReturn;
}

function playerFinalQuestionResults(playerId: number, questionPosition: number): QuestionResultReturn {
  const data = getData();
  let currSession: QuizSession;

  for (const session of data.quizSessions) {
    const playerExists = session.players.some(player => player.playerId === playerId);
    if (playerExists) {
      currSession = session;
      break;
    }
  }

  const questionId = currSession.quiz.questions[questionPosition - 1].questionId;

  const questionResult = currSession.questionResults.find(questionResult => questionResult.questionId === questionId);
  const returnedPlayersCorrectList = questionResult.playersCorrectList.map(player => player.name);
  const questionResultReturn: QuestionResultReturn = {
    questionId: questionResult.questionId,
    playersCorrectList: returnedPlayersCorrectList,
    averageAnswerTime: questionResult.averageAnswerTime,
    percentCorrect: questionResult.percentCorrect,
  };
  return questionResultReturn;
}

export function playerFinalResults(playerId: number) {
  const data = getData();
  // Locate the session with the given playerId
  const sessionFind = data.quizSessions.find(session =>
    session.players.some(player => player.playerId === playerId)
  );

  if (!sessionFind) {
    throw HTTPError(400, 'Player ID is invalid');
  }

  if (sessionFind.state !== States.FINAL_RESULTS) {
    throw HTTPError(400, 'Must be in FINAL_RESULTS state');
  }

  // Initial result object structure
  const results: SessionResults = {
    usersRankedByScore: [],
    questionResults: []
  };

  // Get the question results for the player
  for (let i = 1; i <= sessionFind.quiz.questions.length; i++) {
    const questionResult = playerFinalQuestionResults(playerId, i);
    results.questionResults.push(questionResult);
  }
  // Iterate each player of the session
  sessionFind.players.forEach(player => {
    let score = 0; // Initialize score for the player

    // Iterate through each questionResult to calculate score
    sessionFind.questionResults.forEach(questionResult => {
      // Check if player's ID is in the playersCorrectList for the question
      if (questionResult.playersCorrectList.some(p => p.playerId === player.playerId)) {
        // Find the matching question in the quiz questions array
        const question = sessionFind.quiz.questions.find(q => q.questionId === questionResult.questionId);

        score += question.points; // Add points for the question to the player's score
      }
    });
    // Add player and their score to the results array
    results.usersRankedByScore.push({
      name: player.name,
      score: score
    });
  });

  // Sort users by score in descending order
  results.usersRankedByScore.sort((a, b) => b.score - a.score);

  return results;
}
