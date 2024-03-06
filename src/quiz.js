import { getData, setData } from './dataStore.js';


/**
 * Provide a list of all quizzes that are owned by the currently logged in user.
 * 
 * @param {int} authUserId 
 * 
 * @returns {object}
 */

function adminQuizList( authUserId ) {
    const data = getData();

    const userQuizzes = data.quizzes.filter(quiz => quiz.ownerId === authUserId);

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
    return newQuizId;
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
    return {
        quizId: 1,
        name: 'My Quiz',
        timeCreated: 1683125870,
        timeLastEdited: 1683125871,
        description: 'This is my quiz',
    }
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

function adminQuizNameUpdate( authUserId, quizId, name ) {
    return { 

    }
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


export { adminQuizList, adminQuizCreate }; 