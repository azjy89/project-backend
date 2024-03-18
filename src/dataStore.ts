import fs from 'fs';

// Sesssion Activity Definitions
export const active = true;
export const inactive = false;

// Data Interfaces
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

export interface Data {
  users: User[],
  quizzes: Quiz[]
  tokens: TokenInfo[]
}

export interface TokenInfo {
  token: string,
  userId: number,
  activity: boolean
}

export interface Token {
  token: string
}

export interface AuthUserId {
	authUserId: number
}

let data: Data = {
  users: [],
  quizzes: [],
  tokens: [],
};

// Data Functions 

// Use get() to sync the data with database.json and access the data
export const getData = (): Data => {
  if (fs.existsSync('database.json')) {
    const json = fs.readFileSync('./dataBase.json', 'utf-8');
    const jsonData = JSON.parse(json);
    setData(jsonData);
  } else {
    fs.writeFileSync('database.json', '');
  }
  return data;
};

// Use set(newData) to pass in the entire data object, with modifications made 
// and then save the made changes to database.json
export const setData = (newData: Data): void => {
  fs.writeFileSync('./database.json', JSON.stringify(newData));
  data = newData;
};

