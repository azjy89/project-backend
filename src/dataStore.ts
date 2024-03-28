import {
  Data
} from './interfaces';

import fs from 'fs';
import path from 'path';

// Session Activity Definitions
export const active = true;
export const inactive = false;


let data: Data = {
  users: [],
  quizzes: [],
  tokens: [],
  trash: [],
};



// Data Functions 

// Use get() to sync the data with database.json and access the data
export function getData (): Data {
  return JSON.parse(String(fs.readFileSync(path.resolve(__dirname, './database.json'))));
};

// Use set(newData) to pass in the entire data object, with modifications made 
// and then save the made changes to database.json
export function setData (newData: Data): void {
  fs.writeFileSync(path.resolve(__dirname, './database.json'), JSON.stringify(newData));
};


