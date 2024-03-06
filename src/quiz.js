import { getData, setData } from './dataStore.js';
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

function adminQuizList( authUserId ) {
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
}

/**
 * Given basic details about a new quiz, create one for the logged in user.
 * 
 * @param {int} authUserId 
 * @param {string} name 
 * @param {string} description 
 * 
 * @returns {int}
 */

function adminQuizCreate( authUserId, name, description ) {
    const data = getData();

    // Check if the authUserId is valid
    const userExists = data.users.some(user => user.userId === authUserId);
    if (!userExists) {
        return { error: 'authUserId does not refer to a valid user' };
    }

    //Check if name contains valid characters
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
    
    const newQuizId = data.quizzes.length > 0 ? 
    Math.max(...data.quizzes.map(quiz => quiz.quizId)) + 1 : 1;

    const newQuiz = {
        quizId: newQuizId,
        name: name,
        quizCreatorId: authUserId,
        timeCreated: Date.now(),
        timeLastEdited: Date.now(),
        description: description,
        questions: [

        ],
        answers: [

        ],
    };

    data.quizzes.push(newQuiz);
    setData(data);

    return { quizId: newQuizId };
}

/**
 * Given a particular quiz, permanently remove the quiz.
 * 
 * @param {int} authUserId 
 * @param {int} quizId 
 * 
 * @returns {object}
 */

function adminQuizRemove( authUserId, quizId ) {
    const data = getData();

    //Check if authUserId refers to a valid user
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
    return {
    }
}

/**
 * Get all of the relevant information about the current quiz.
 * 
 * @param {int} authUserId 
 * @param {int} quizId 
 * 
 * @returns {object}
 */

function adminQuizInfo( authUserId, quizId ) {
    const data = getData();

    const quiz = data.quizzes.find(q => q.quizId === quizId);

    if (!authUserId){

        return { error: 'AuthUserId is not a valid user.'};

    } if (!quiz) {

        return { error:' Quiz ID does not refer to valid quiz.'};

    } if (authUserId !== quiz.quizCreatorId) {

        return { error:' Quiz ID does not refer to a quiz that this user owns.'};

    }

    const { quizId1, name, timeCreated, timeLastEdited, description } = quiz;

    return {
        quizId,
        name,
        timeCreated,
        timeLastEdited,
        description
    };
}


/**
 * Update the name of the relevant quiz.
 * 
 * @param {int} authUserId 
 * @param {int} quizId 
 * @param {string} name 
 * 
 * @returns {}
 */

function adminQuizNameUpdate(authUserId, quizId, name) {
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

    // Return success response
    return {};
}


/**
 * Update the description of the relevant quiz.
 * 
 * @param {int} authUserId 
 * @param {int} quizId 
 * @param {string} description 
 * 
 * @returns {}
 */

function adminQuizDescriptionUpdate( authUserId, quizId, description){
    return {

    }
}


export { 
    adminQuizList, 
    adminQuizCreate, 
    adminQuizRemove,
    adminQuizInfo,
    adminQuizNameUpdate,
    adminQuizDescriptionUpdate
}; 