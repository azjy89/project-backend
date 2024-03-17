// This file is a hub for all interfaces (typescript).
// Add other interfaces below.

// ERROR:
export interface ErrorObject {
  error: string;
}

// USER:
export interface OldPasswords {
  oldPasswords: string;
}

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

// QUIZ:
export interface Questions {
  questions: string;
}

export interface Answers {
  answers: string;
}

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


// AdminUserDetailsReturn
export interface AdminUserDetails {
  userId: number;
  name: string;
  email: string;
  numSuccessfulLogins: number;
  numFailedPasswordsSinceLastLogin: number;
}

export interface AdminUserDetailsReturn {
  user: AdminUserDetails;
}

// EMPTY OBJECT:
export type EmptyObject = Record<string, never>;