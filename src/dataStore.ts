import {
  Data
} from './types';

import fs from 'fs';

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

export function getTrash() {
  
  return;
}

export function setTrash() {

}

