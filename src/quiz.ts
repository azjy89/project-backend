import { arrayBuffer } from 'stream/consumers';
import { getData, setData } from './dataStore';
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
  const userQuizzes = data.quizzes.filter(quiz => quiz.ownerId === authUserId);
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
    return {
      error: 'Quiz name must contain only alphanumeric characters and spaces'
    }
  }

  // Check if the name is within the character limits
  if (name.length < minNameLength || name.length > maxNameLength) {
    return {
      error: 'Quiz name must be between 3 and 30 characters long'
    }
  }

  // Check if the name is already being used
  const nameExists = data.quizzes.some(quiz => quiz.name === name && quiz.ownerId === authUserId);
  if (nameExists) {
    return {
      error: 'Quiz name is already being used'
    }
  }

  // Check if the description is within the character limit
  if (description.length > maxDescriptionLength) {
    return {
      error: 'Description must be 100 characters or less'
    }
  }

<<<<<<< HEAD
  const newQuizId = data.quizzes.length + trash.quizzes.length + 1;



=======
  const newQuizId = data.quizzes.length > 0 
  ? Math.max(...data.quizzes.map(quiz => quiz.quizId)) + 1 : 1;
  
>>>>>>> 99db59467d8c3604b65c4b533e1f5b9576b2ff3d
  const newQuiz: Quiz = {
    quizId: newQuizId,
    name: name,
    ownerId: authUserId,
    timeCreated: Date.now(),
    timeLastEdited: Date.now(),
    description: description,
    questions: [],
    duration: 0
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
  const quizFind = data.quizzes.find(quizFind => quizFind.quizId === quizId);
  if (!quizFind)  {
    return {
      error: 'Invalid quizId'
    }
  }

  if (quizFind.ownerId !== authUserId) {
    return {
      error: 'authUserId does not own this quiz'
    }
  }
  const quizIndex = data.quizzes.findIndex(quiz => quiz.quizId === quizId);
  const [removedQuiz] = data.quizzes.splice(quizIndex, 1);
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
  const userIndex = data.users.findIndex(user => user.userId === authUserId);
  const quizIndex = data.quizzes.findIndex(quiz => quiz.quizId === quizId);
  
  // Checks dataStore.quizzes to find if a quizId matches; else is invalid quiz.
  if (quizIndex === -1) {
    return {
      error: 'Quiz ID does not refer to valid quiz.'
    }
  }

  // Checks dataStore.quizzes for a quiz.ownerId that doesn't match authUserId.
  const quiz = data.quizzes[quizIndex];
  if (authUserId !== quiz.ownerId) {
    return {
      error: 'Quiz ID does not refer to a quiz that this user owns.'
    }
  }
  
  return {
    quizId: quizId,
    name: quiz.name,
    ownerId: quiz.ownerId,
    timeCreated: quiz.timeCreated,
    timeLastEdited: quiz.timeLastEdited,
    description: quiz.description,
    questions: quiz.questions,
    duration: quiz.duration
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
    return {
      error: 'Quiz ID does not refer to valid quiz.'
    }
  }

  if (authUserId !== data.quizzes[quizIndex].ownerId) {
    return {
      error: 'Quiz ID does not refer to a quiz that this user owns.'
    }
  }

  const regex = /^[a-zA-Z0-9\s]*$/;
  if (!regex.test(name)) {
    return {
      error: 'Name contains invalid characters. Valid characters are alphanumeric and spaces.'
    }
  }

  if (name.length > maxNameLength || name.length < minNameLength) {
    return {
      error: 'Name is either less than 3 characters long or more than 30 characters long.'
    }
  }

  if (data.quizzes.find(q => q.name === name && q.ownerId === authUserId)) {
    return {
      error: 'Name is already used by the current logged in user for another quiz.'
    }
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
    return {
      error: 'Quiz ID does not refer to a valid quiz'
    }
  }

  const quiz = data.quizzes.find(quiz => quiz.quizId === quizId);
  if (quiz.ownerId != authUserId) {
    return {
      error: 'Quiz ID does not refer to a quiz that this user own'
    }
  }
  if (description.length >= maxDescriptionLength) {
    return {
      error: 'Description is more than 100 characters in length'
    }
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
export const adminQuizTransfer = (authUserId: number, quizId: number, userEmail: string): ErrorObject | object => {
  const data = getData();

  const targetUser = data.users.find(user => user.email === userEmail);
  if (!targetUser) {
    return {
      error: 'userEmail is not a real user'
    };
  }

  if (targetUser.userId === authUserId) {
    return {
      error: 'userEmail is the current logged in user'
    };
  }

  const quiz = data.quizzes.find(quiz => quiz.quizId === quizId);
  if (!quiz) {
    return {
      error: 'QuizId does not refer to a valid quiz'
    }
  }

  const similarNameFound = data.quizzes.some(q => q.ownerId === targetUser.userId && q.name === quiz.name);
  if (similarNameFound) {
    return {
      error: 'Quiz ID refers to a quiz that has a name that is already used by the target user'
    };
  }

  const currentUserIndex = data.users.findIndex(user => user.userId === authUserId);
  if (currentUserIndex === -1) {
    return {
      error: 'AuthUserId is not a valid user'
    };
  }

  if (quiz.ownerId !== authUserId) {
    return {
      error: 'Quiz ID does not refer to a quiz that this user own'
    };
  }

  // Succesful Transfer, i.e. change ownerId of current quiz to the targetUser's userId.
  quiz.ownerId = targetUser.userId;
  quiz.timeLastEdited = Date.now();
  setData(data);
  return {};
};

/**Given a particular quiz, add a question to that quiz
 * 
 * @param {int} quizId 
 * @param {int} authUserId 
 * @param {QuestionBody} questionBody 
 * @returns {}
 */
export function adminQuizQuestionCreate(quizId: number, authUserId: number, questionBody: QuestionBody): QuestionId | ErrorObject {
  const data: Data = getData();
  const quizFind = data.quizzes.find(quizFind => quizFind.quizId === quizId);
  if (!quizFind)  {
    return {
      error: 'Invalid quizId'
    }
  }

  if (quizFind.ownerId !== authUserId) {
    return {
      error: 'authUserId does not own this quiz'
    }
  }

  if (questionBody.question.length < 5 || questionBody.question.length > 50) {
    return {
      error: 'Invalid question string length'
    }
  }

  if (questionBody.answers.length < 2 || questionBody.answers.length > 6) {
    return {
      error: 'Question must have between 2 and 6 answer choices inclusive'
    }
  }
  
  if (questionBody.duration + quizFind.duration > 180) {
    return {
      error: 'Quiz duration exceeds 3 minutes'
    }
  }

  if (questionBody.duration <= 0) {
    return {
      error: 'Question duration must be at least 1 second'
    }
  }

  if (questionBody.points < 1 || questionBody.points > 10) {
    return {
      error: 'Invalid question points rewarded'
    }
  }

  for (const i of questionBody.answers) {
    if (i.answer.length < 1 || i.answer.length > 30) {
      return {
        error: 'Answer length must be between 1 and 30 characters long inclusive'
      }
    }
  }
  
  for (let i = 0; i < questionBody.answers.length - 1; i++) {
    for (let j = i + 1; j < questionBody.answers.length; j++) {
      if (questionBody.answers[i].answer === questionBody.answers[j].answer) {
        return {
          error: 'Cannot be duplicate answers for a question'
        }
      }
    }
  }

  const findOneTrue = questionBody.answers.some(answer => answer.correct === true);
  if (!findOneTrue) {
    return { error: 'At least one answer must be correct' };
  }
  let newQuestionId: number;
  do {
    newQuestionId = Math.floor(100000 + Math.random() * 900000);
  } while (data.quizzes.some(quiz => quiz.questions && quiz.questions.some(question => question.questionId === newQuestionId)));

  const newQuestion: Question = {
    questionBody: questionBody,
    questionId: newQuestionId
  };
  quizFind.questions.push(newQuestion);

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

  const quizFind = data.quizzes.find(quizFind => quizFind.quizId === quizId);

  if (!quizFind) {
    return {
      error: 'Invalid quizId'
    }
  }

  if (quizFind.ownerId !== authUserId) {
    return {
      error: 'Quiz does not belong to user'
    }
  }

  const questionFind = quizFind.questions.find(questionFind => questionFind.questionId === questionId);
  if (!questionFind) {
    return {
      error: 'QuestionId does not exist under the quiz'
    }
  }

  if (questionBody.question.length < 5 || questionBody.question.length > 50) {
    return {
      error: 'Invalid Question String Length'
    }
  }

  if (questionBody.duration < 1) {
    return {
      error: 'Invalid Duration'
    }
  }

  if (questionBody.answers.length < 2 || questionBody.answers.length > 6) {
    return {
      error: 'Invalid Number of Answers'
    }
  }

  for (const i of questionBody.answers) {
    if (i.answer.length < 1 || i.answer.length > 30) {
      return {
        error: 'Answer length must be between 1 and 30 characters long inclusive'
      }
    }
  }
  
  for (let i = 0; i < questionBody.answers.length - 1; i++) {
    for (let j = i + 1; j < questionBody.answers.length; j++) {
      if (questionBody.answers[i].answer === questionBody.answers[j].answer) {
        return {
          error: 'Cannot be duplicate answers for a question'
        }
      }
    }
  }

  if (questionBody.points < 1 || questionBody.points > 10) {
    return {
      error: 'Invalid Question Points'
    }
  }

  const findOneTrue = questionBody.answers.some(answer => answer.correct === true);
  if (!findOneTrue) {
    return { error: 'At least one answer must be correct' };
  }

  if (questionBody.duration + quizFind.duration - questionFind.questionBody.duration > 180) {
    return {
      error: 'Quiz duration exceeds 3 minutes'
    }
  }

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

export function adminQuizQuestionRemove(quizId: number, questionId: number, authUserId: number): {} {
  const data: Data = getData();
  const quiz = data.quizzes.find(quiz => quiz.quizId === quizId);
  if (!quiz.questions.find(question => question.questionId === questionId)) {
    return { error: 'Question Not Found' };
  }
  // need to do something to put quiz in trash (do with trash)
  // pseudocode example data.trash.quizzes.push({quiz.something, quiz.otherThing})
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

export function adminQuizQuestionMove(quizId: number, questionId: number, authUserId: number, newPosition: number): {} {
  const data: Data = getData();

  const quizFind = data.quizzes.find(quizFind => quizFind.quizId === quizId);

  if (!quizFind) {
    return {
      error: 'Invalid quizId'
    }
  }

  if (quizFind.ownerId !== authUserId) {
    return {
      error: 'Quiz does not belong to user'
    }
  }

  const questionFind = quizFind.questions.find(questionFind => questionFind.questionId === questionId);
  if (!questionFind) {
    return {
      error: 'QuestionId does not exist under the quiz'
    }
  }
  const questionIndex = quizFind.questions.findIndex(question => question.questionId === questionId);
  if (newPosition < 0 ||
      newPosition > quizFind.questions.length - 1 || 
      newPosition === questionIndex) {
    return { error: 'Invalid Position' };
  }

  let removedQuestion = quizFind.questions.splice(questionIndex, 1)[0];
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
  let data: Data = getData();
  // Error: Invalid questionId
  const quiz: Quiz = data.quizzes.find(quiz => quiz.quizId === quizId);
  const question: Question = quiz.questions.find(question => question.questionId === questionId)
  const questionIndex = quiz.questions.findIndex(question => question.questionId === questionId)
  if (!question) {
    return {
      error: 'Question Id does not refer to a valid question within this quiz'
    }
  }
  // Error: Invalid authUserId
  const userIndex = data.users.findIndex(user => user.userId === authUserId);
  if (userIndex === -1) {
    return {
      error: 'AuthUserId is not a valid user'
    }
  }
  // Error: Valid authUserId, but not quiz owner.
  if (quiz.ownerId != authUserId) {
    return {
      error: 'Quiz ID does not refer to a quiz that this user own'
    }
  }

  // Successful
  let newQuestionId: number;
  do {
    newQuestionId = Math.floor(100000 + Math.random() * 900000);
  } while (data.quizzes.some(quiz => quiz.questions && quiz.questions.some(question => question.questionId === newQuestionId)));

  const newQuestion: Question = {
    questionBody: question.questionBody,
    questionId: newQuestionId
  }
  
  // splice to right after quiz location
  quiz.questions.splice(questionIndex + 1, 0, newQuestion);
  // update timeLastEdited of quiz.
  quiz.timeLastEdited = Date.now();
  setData(data);
  return { newQuestionId: newQuestion.questionId };
}