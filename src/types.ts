//Error interface
export interface ErrorObject {
  error: string
};

//User interface
export interface User {
  userId: number,
  nameFirst: string,
  nameLast: string,
  email: string,
  password: string,
  numSuccessfulLogins: number,
  numFailedPasswordsSinceLastLogin: number,
  oldPasswords: string[]
}

//Quiz interface
export interface Quiz {
  quizId: number,
  name: string,
  quizCreatorId: number,
  timeCreated: number,
  timeLastEdited: number,
  description: string,
  questions: string[],
  answers: string[]
}

//Token interface
export interface Token {
  token: string,
  userId: number
}
//AuthUserId interface
export interface AuthUserId {
  authUserId: number
}

//UserDetails interface (return type)
export interface UserDetails {
	user: {
		userId: number,
		name: string,
		email: string,
		numSuccessfulLogins: number,
		numFailedPasswordsSinceLastLogin: number
	}
}

//Token return type
export interface TokenReturn {
  token: string
}


//DataStore interface
export interface Data {
  users: User[],
  quizzes: Quiz[],
  tokens: Token[]
}