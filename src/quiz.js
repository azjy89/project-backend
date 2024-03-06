/**
 * Provide a list of all quizzes that are owned by the currently logged in user.
 * 
 * @param {int} authUserId 
 * 
 * @returns {object}
 */

function adminQuizList( authUserId ) {
    return { 
        quizzes: [
            {
                quizId: 1,
                name: 'My Quiz',
            }
        ]
    }
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
    return {
        quizId: 2
    }
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
    const data = getData();

    const quiz = data.quizzes.find(q => q.id === quizId);

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
