// This file is a hub for all interfaces (typescript).


// USER:
export interface User {
  userId: number;
  nameFirst: string;
  nameLast: string;
  email: string;
  password: string
  numSuccessfulLogins: number;
  numFailedPasswordsSinceLastLogin: number;
  oldPasswords: OldPasswords[];
}

export interface OldPasswords {
  oldPasswords: string;
}

// QUIZ:
export interface Quiz {
  quizId: number;
  name: string;
  quizCreatorId: number;
  timeCreated: number;
  timeLastEdited: number;
  description: string;
  questions: Questions[];
  answers: Answers[];
}

export interface Questions {
  questions: string;
}

export interface Answers {
  answers: string;
}
  
export type EmptyObject = Record<string, never>;