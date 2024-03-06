const maxNameLength = 30;
const minNameLength = 3;

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

    const data = getData();

    if (!authUserId){

        return { error: 'AuthUserId is not a valid user.'};

    } if (!quiz) {

        return { error:' Quiz ID does not refer to valid quiz.'};

    } if (authUserId !== quiz.quizCreatorId) {

        return { error:' Quiz ID does not refer to a quiz that this user owns.'};

    } 
    const regex = /^[a-zA-Z0-9\s]*$/;
    if (!regex.test(name)) {

        return {error:'Name contains invalid characters. Valid characters are alphanumeric and spaces.'};
    } if (name.length > maxNameLength || name.length < minNameLength){
        return {error: 'Name is either less than 3 characters long or more than 30 characters long.'};

    } if (data.quizzes.find(q => q.name === name)){
        return {error:'Name is already used by the current logged in user for another quiz.' };
    }

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
