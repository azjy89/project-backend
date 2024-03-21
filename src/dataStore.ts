import {
  Data
} from './types';

/*
let data: Data = {
  users: [],
  quizzes: []
};
*/


// Use get() to access the data
export const getData = (): Data => {
  return data;
};

// Use set(newData) to pass in the entire data object, with modifications made
export const setData = (newData: Data): void => {
  data = newData;
};
