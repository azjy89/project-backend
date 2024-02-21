


function adminUserDetails( authUserId ) {
    return { user:
        {
            userId: 1,
            name: 'Hayden Smith',
            email: 'hayden.smith@unsw.edu.au',
            numSuccessfulLogins: 3,
            numFailedPasswordsSinceLastLogin: 1,
        }
    }
}

function adminUserDetailsUpdate( authUserId, email, nameFirst, nameLast ) {
    return {
        
    }
}

function adminUserPasswordUpdate( authUserId, oldPassword, newPassword ) {
    return {
        

    }
}

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
        
    }
}

function adminQuizDescriptionUpdate( authUserId, quizId, description){
    return {

    }
}