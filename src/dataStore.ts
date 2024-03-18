import fs from 'fs';

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
}

let data: Data = {
  users: [],
  quizzes: []
};

// Use get() to access the data
export const getData = (): Data => {
  return data;
};

// Use set(newData) to pass in the entire data object, with modifications made
export const setData = (newData: Data): void => {
  data = newData;
};

export const retrieveData = (): void => {
  if (fs.existsSync('database.json')) {
    const json = fs.readFileSync('./dataBase.json', 'utf-8');
    const jsonData = JSON.parse(json);
    setData(jsonData);
  } else {
    fs.writeFileSync('database.json', '');
  }
}

// Save data to database.json
export const saveData = (): void => {
  fs.writeFileSync('./database.json', JSON.stringify(data));
}

