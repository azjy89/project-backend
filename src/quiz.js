//Stub for adminQuizList

function adminQuizList(authUserId) {
    return { 
        quizzes: [
            {
                quizId: 1,
                name: 'My Quiz',
            }
        ]
    }
}


//Stub for adminQuizCreate
function adminQuizCreate(authUserId, name, description) {
    return {
        quizId: 2
    }
}

//Stub for adminQuizRemove
function adminQuizRemove(authUserId, quizId) {
    return {
        
    }
}

<<<<<<< 86525daffaed87b5d66f43925c13615b6a1a8909
// Stub for adminQuizDescriptionUpdate
// Please put last
function adminQuizDescriptionUpdate( authUserId, quizId, description){
    return {

=======
function adminQuizInfo( authUserId, quizId ) {
    return {
        quizId: 1,
        name: 'My Quiz',
        timeCreated: 1683125870,
        timeLastEdited: 1683125871,
        description: 'This is my quiz',
    }
}

function adminQuizNameUpdate( authUserId, quizId, description ) {
    return { 
        
>>>>>>> aae1b5ac02b3e1392c04733958dc17684625a2c5
    }
}