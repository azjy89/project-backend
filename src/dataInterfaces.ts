import { User, Quiz } from './returnInterfaces';

// This file holds the typescript interface for dataStore SPECIFICALLY.

// DATASTORE:
export interface DataStore {
    users: User[],
    quizzes: Quiz[]
}