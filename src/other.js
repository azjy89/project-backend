import { getData, setData } from './dataStore.js';

/**
 * Reset the state of the application back to the start.
 * 
 * @returns {} 
 */

function clear() {
    const data = {
        users: [

        ],
        quizzes: [

        ],
    };
    setData(data);
    return {};
}