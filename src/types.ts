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

//DataStore interface
export interface Data {
  users: User[],
  quizzes: Quiz[],
  tokens: Token[]
}