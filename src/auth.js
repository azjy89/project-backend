<<<<<<< HEAD

function adminAuthRegister(email, password, nameFirst, nameLast) {
  return {
    authUserId: 1
  };
}

function adminAuthLogin(email, password) {
  return {
    authUserId: 1
  };
}




=======
>>>>>>> aae1b5ac02b3e1392c04733958dc17684625a2c5
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
<<<<<<< HEAD
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

<<<<<<< HEAD
=======
function adminQuizNameUpdate( authUserId, quizId, description ) {
    return { 
        
    }
}
>>>>>>> 807c9466ecd8765bea5a582ce20016b45590c7e0
=======
}
>>>>>>> aae1b5ac02b3e1392c04733958dc17684625a2c5
