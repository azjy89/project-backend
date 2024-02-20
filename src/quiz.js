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