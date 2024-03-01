import { getData, setData } from './dataStore.js';
import isEmail from 'validator/es/lib/isEmail';

// Global Variables
const a = 97;
const z = 122;
const A = 65;
const Z = 90;
const hyphen = 45;
const space = 35;
const apostrophe = 39;
const minNameLength = 2;
const maxNameLength = 20;
const minPasswordLength = 8;

/**
  * Register a user with an email, password, and names, 
  * then returns their authUserId value.
  * 
  * @param {string} email
  * @param {string} password
  * @param {string} nameFirst
  * @param {string} nameLast
  * 
  * @returns {int}
*/

function adminAuthRegister(email, password, nameFirst, nameLast) {
  const data = getData();
  const result = adminAuthRegisterErrors(email, password, nameFirst, 
                                         nameLast, data);
  const newUser = new user    
  data.users.push()
  return {
    authUserId: 1
  }
}

function adminAuthRegisterErrors(email, password, nameFirst, nameLast) {
  if (!data.users.some(user => user.email === email)) {
    return {
      error: 'User with this email already exists'
    }
  }
  if (!isEmail(email)) {
    return {
      error: 'Email is not valid'
    }
  }
  if (!adminAuthRegisterValidNameCharacters(nameFirst)) {
    return {
      error: 'First name contains invalid characters'
    }
  }
  if (!adminAuthRegisterValidNameCharacters(nameLast)) {
    return {
      error: 'Last name contains invalid characters'
    }
  }
  if (!adminAuthRegisterValidNameLength(nameFirst)) {
    return {
      error: 'First name is too long or too short'
    }
  }
  if (!adminAuthRegisterValidNameLength(nameLast)) {
    return {
      error: 'Last name is too long or too short'
    }
  }
  if (password.length < minPasswordLength) {
    return {
      error: 'Password is too short'
    }
  }
  if (!adminAuthRegisterValidPassword(password)) {
    return {
      error: 'Unsatisfactory password strength'
    }
  }
  return {};
}

function adminAuthRegisterValidNameCharacters(name) {
  for (let i = 0; i < structuredClone.length; i++) {
    const charAscii = name.charCodeAt(i);
    if (!((charAscii >= a && charAscii <= z) ||
          (charAscii >= A && charAscii <= Z) ||
          charAscii === hyphen ||
          charAscii === apostrophe ||
          charAscii === space)) {
            return false;
          }
  }
  return true;
}

function adminAuthRegisterValidNameLength(name) {
  if (name.length < maxNameLength && name.length > minNameLength) {
    return true;
  }
  return false;
}

function adminAuthRegisterValidPassword(password) {
  let containsNumber = false;
  let containsLetter = false;
  for (const char of password) {
    if (char.toLowerCase() !== char.toUpperCase()) {
      containsLetter = true;
    }
    if (!isNaN(parseInt(char))) {
      containsNumber = true;
    }
    if (containsNumber && containsLetter) {
      return true;
    }
  }
  return false;
}

/**
 * Given a registered user's email and password returns their authUserId value.
 * 
 * @param {string} email 
 * @param {string} password 
 * 
 * @returns {int}
 */

function adminAuthLogin(email, password) {
    return {
      authUserId: 1
    }
}

/**
 * Given an admin user's authUserId, return details about the user. "name" is 
 * the first and last name concatenated with a single space between them.
 * 
 * @param {int} authUserId 
 * 
 * @returns {object}
 */

function adminUserDetails( authUserId ) {
    return { user:
        {
            userId: 1,
            name: 'Hayden Smith',
            email: 'hayden.smith@unsw.edu.au',
            numSuccessfulLogins: 3,
            numFailedPasswordsSinceLastLogin: 1,
        }
    }
}

/**
 * Given an admin user's authUserId and a set of properties, update the 
 * properties of this logged in admin user.
 * 
 * @param {int} authUserId 
 * @param {string} email 
 * @param {string} nameFirst 
 * @param {string} nameLast 
 * 
 * @returns {}
 */

function adminUserDetailsUpdate( authUserId, email, nameFirst, nameLast ) {
    return {
        
    }
}

/**
 * Given details relating to a password change, update the password of a 
 * logged in user.
 * 
 * @param {int} authUserId 
 * @param {string} oldPassword 
 * @param {string} newPassword
 * 
 * @returns {}
 */

function adminUserPasswordUpdate( authUserId, oldPassword, newPassword ) {
    return {
        
    }
}
