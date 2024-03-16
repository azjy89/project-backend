// YOU SHOULD MODIFY THIS OBJECT BELOW ONLY

////////////////////////////////////////////////////////////////////////////////
// INTERFACES
////////////////////////////////////////////////////////////////////////////////

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

// DATASTORE:
interface DataStore {
  users: User[],
  quizzes: Quiz[]
}


let dataStore: DataStore = {
  users: [],
  quizzes: [],
};

// OTHER


// YOU SHOULD MODIFY THIS OBJECT ABOVE ONLY

// YOU SHOULDNT NEED TO MODIFY THE FUNCTIONS BELOW IN ITERATION 1

/*
Example usage
    let store = getData()
    console.log(store) # Prints { 'names': ['Hayden', 'Tam', 'Rani', 'Giuliana', 'Rando'] }

    names = store.names

    names.pop()
    names.push('Jake')

    console.log(store) # Prints { 'names': ['Hayden', 'Tam', 'Rani', 'Giuliana', 'Jake'] }
    setData(store)
*/

// Use get() to access the data

export const getData = (): DataStore => {
  return dataStore;
}

// Use set(newData) to pass in the entire data object, with modifications made
export const setData = (newData: any) => {
  dataStore = newData;
}
