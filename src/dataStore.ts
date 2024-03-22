import {
  Data
} from './types';

import fs from 'fs';
import path from 'path';

// Session Activity Definitions
export const active = true;
export const inactive = false;


/*
let data: Data = {
  users: [],
  quizzes: [],
  tokens: [],
};
*/


// Data Functions 

// Use get() to sync the data with database.json and access the data
export const getData = (): Data => {
  if (fs.existsSync('database.json')) {
    const json = fs.readFileSync('./database.json', 'utf-8');
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

export const getTrash = (): Data => {
  const trashFilePath = path.resolve(__dirname, './dataTrash.json');
  const trashFileBuffer = fs.readFileSync(trashFilePath);
  const trashData = JSON.parse(trashFileBuffer.toString());
  return trashData;
}

export const setTrash = (newTrash: Data): void => {
  const trashFilePath = path.resolve(__dirname, './dataTrash.json');
  const trashDataString = JSON.stringify(newTrash);
  fs.writeFileSync(trashFilePath, trashDataString);
}

