import {
  getData,
  setData
} from './dataStore';

import {
  ErrorObject,
  User,
  Data,
  AuthUserId,
  UserDetails
} from './interfaces';

import HTTPError from 'http-errors';

// Global Variables
const minNameLength = 2;
const maxNameLength = 20;
const minPasswordLength = 8;
const isEmail = require('validator/lib/isEmail');
const uuid = require('uuid');

// Exported to server to allow token creation for sessions
export const createToken = (authUserId: number): string => {
  const data: Data = getData();
  // unique identifier
  const token: string = uuid.v4();
  // pushed onto data
  data.tokens.push({
    token: token,
    userId: authUserId,
  });
  setData(data);
  return token;
};

// This function is exported to server and allows the userId of a user to be
// retrieved from a token
export const idFromToken = (token: string): ErrorObject | AuthUserId => {
  const dataToken = getData().tokens.find(dataToken => dataToken.token === token);
  // if token found
  if (dataToken) {
    return { authUserId: dataToken.userId };
  } else {
    // if token not found
    throw HTTPError(403, 'Token does not refer to a valid logged in session');
  }
};

/** Goes through data array and removes the token that needs to be deleted
 *
 * @param {string} token
 */
export const removeToken = (token: string): void => {
  const data: Data = getData();
  data.tokens = data.tokens.filter(a => a.token !== token);
  setData(data);
};

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
export const adminAuthRegister = (email: string, password: string, nameFirst: string, nameLast:string): AuthUserId | ErrorObject => {
  const data: Data = getData();
  const result = adminAuthRegisterErrors(email, password, nameFirst,
    nameLast, data);
  if (result.error === 'No Error') {
    const newUserId = data.users.length + 1;
    const newUser: User = {
      userId: newUserId,
      nameFirst: nameFirst,
      nameLast: nameLast,
      email: email,
      password: password,
      numSuccessfulLogins: 1,
      numFailedPasswordsSinceLastLogin: 0,
      oldPasswords: [],
    };
    data.users.push(newUser);

    const successfulResult = {
      authUserId: newUserId,
    };
    setData(data);
    return successfulResult;
  }

  setData(data);
  return result;
};

const adminAuthRegisterErrors = (email: string, password: string, nameFirst: string, nameLast: string, data: Data): ErrorObject => {
  if (data.users.some(user => user.email === email)) {
    return {
      error: 'User with this email already exists'
    };
  }
  if (!isEmail(email)) {
    return {
      error: 'Email is not valid'
    };
  }
  if (!adminAuthRegisterValidNameCharacters(nameFirst)) {
    return {
      error: 'First name contains invalid characters'
    };
  }
  if (!adminAuthRegisterValidNameCharacters(nameLast)) {
    return {
      error: 'Last name contains invalid characters'
    };
  }
  if (!adminAuthRegisterValidNameLength(nameFirst)) {
    return {
      error: 'First name is too long or too short'
    };
  }
  if (!adminAuthRegisterValidNameLength(nameLast)) {
    return {
      error: 'Last name is too long or too short'
    };
  }
  if (password.length < minPasswordLength) {
    return {
      error: 'Password is too short'
    };
  }
  if (!adminAuthRegisterValidPassword(password)) {
    return {
      error: 'Unsatisfactory password strength'
    };
  }
  return { error: 'No Error' };
};

const adminAuthRegisterValidNameCharacters = (name: string): boolean => {
  const validCharacters = /^[A-Za-z \-'']+$/.test(name);
  return validCharacters;
};

const adminAuthRegisterValidNameLength = (name: string): boolean => {
  if (name.length <= maxNameLength && name.length >= minNameLength) {
    return true;
  }
  return false;
};

const adminAuthRegisterValidPassword = (password: string): boolean => {
  const containsLetterAndNumber = /[a-zA-Z]/.test(password) && /[0-9]/.test(password);
  return containsLetterAndNumber;
};

/**
 * Given a registered user's email and password returns their authUserId value.
 *
 * @param {string} email
 * @param {string} password
 *
 * @returns {int}
 */

export const adminAuthLogin = (email: string, password: string): AuthUserId | ErrorObject => {
  const data: Data = getData();
  const user = data.users.some(user => user.email === email);
  // User not found!
  if (!user) {
    throw HTTPError(400, 'User with this email does not exist');
  }
  // Checks password
  const index = data.users.findIndex(user => user.email === email);
  if (data.users[index].password !== password) {
    data.users[index].numFailedPasswordsSinceLastLogin++;
    setData(data);
    throw HTTPError(400, 'Incorrect password');
  }
  // Updates fields
  data.users[index].numFailedPasswordsSinceLastLogin = 0;
  data.users[index].numSuccessfulLogins++;

  setData(data);
  return {
    authUserId: data.users[index].userId
  };
};

/**
 * Given an admin user's authUserId, return details about the user. "name" is
 * the first and last name concatenated with a single space between them.
 *
 * @param {int} authUserId
 *
 * @returns {object}
 */

export const adminUserDetails = (authUserId: number): UserDetails | ErrorObject => {
  const data: Data = getData();
  // Finds user
  const userIndex = data.users.findIndex(user => user.userId === authUserId);
  // User not found
  if (userIndex === -1) {
    return {
      error: 'AuthUserId is not a valid user'
    };
  }
  // Sets up return object
  const user = data.users.find(user => user.userId === authUserId);
  return {
    user: {
      userId: user.userId,
      name: user.nameFirst + ' ' + user.nameLast,
      email: user.email,
      numSuccessfulLogins: user.numSuccessfulLogins,
      numFailedPasswordsSinceLastLogin: user.numFailedPasswordsSinceLastLogin
    }
  };
};

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

export const adminUserDetailsUpdate = (authUserId: number, email: string, nameFirst: string, nameLast:string): object | ErrorObject => {
  const data: Data = getData();
  // Finds user
  const userIndex = data.users.findIndex(user => user.userId === authUserId);
  // User not found
  if (userIndex === -1) {
    throw HTTPError(400, 'AuthUserId is not a valid user');
  }
  // Email is already occupied
  if (data.users.some(user => user.email === email && user.userId !== authUserId)) {
    throw HTTPError(400, 'Email is currently used by another user');
  }
  // Email not found
  if (!isEmail(email)) {
    throw HTTPError(400, 'Email is not valid');
  }
  // Invalid nameFirst characters
  if (!adminAuthRegisterValidNameCharacters(nameFirst)) {
    throw HTTPError(400, 'First name contains invalid characters');
  }
  // Invalid nameLast characters
  if (!adminAuthRegisterValidNameCharacters(nameLast)) {
    throw HTTPError(400, 'Last name contains invalid characters');
  }
  // Invalid nameFirst length
  if (!adminAuthRegisterValidNameLength(nameFirst)) {
    throw HTTPError(400, 'First name is too long or too short');
  }
  // Invalid nameLast length
  if (!adminAuthRegisterValidNameLength(nameLast)) {
    throw HTTPError(400, 'Last name is too long or too short');
  }

  // Updates details
  data.users[userIndex].nameFirst = nameFirst;
  data.users[userIndex].nameLast = nameLast;
  data.users[userIndex].email = email;

  setData(data);

  return {};
};

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

export const adminUserPasswordUpdate = (authUserId: number, oldPassword: string, newPassword: string): object | ErrorObject => {
  const data: Data = getData();
  // Finds user
  const userIndex = data.users.findIndex(user => user.userId === authUserId);
  // User not found
  if (userIndex === -1) {
    throw HTTPError(400, 'AuthUserId is not a valid user');
  }
  // Old password is incorrect
  if (oldPassword !== data.users[userIndex].password) {
    throw HTTPError(400, 'Old password is not the correct old password');
  }
  // New password is the same as old password
  if (newPassword === data.users[userIndex].password) {
    throw HTTPError(400, 'Old Password and New Password match exactly');
  }
  // Password used before
  const GetPassword = findPassword(newPassword, userIndex);
  if (!GetPassword) {
    throw HTTPError(400, 'New Password has already been used before by this user');
  }
  // Password is less than 8 characters
  if (newPassword.length < minPasswordLength) {
    throw HTTPError(400, 'Password is too short');
  }
  // Password is not strong enough
  if (!adminAuthRegisterValidPassword(newPassword)) {
    throw HTTPError(400, 'Unsatisfactory password strength');
  }
  // Updates password
  data.users[userIndex].password = newPassword;

  data.users[userIndex].oldPasswords.push(oldPassword);
  data.users[userIndex].oldPasswords.push(newPassword);

  setData(data);

  return {};
};

// Searches oldPasswords to see if password has been used before
const findPassword = (password: string, userIndex: number): boolean => {
  const data = getData();
  const user = data.users[userIndex];

  for (const oldpassword of user.oldPasswords) {
    if (password === oldpassword) {
      return false;
    }
  }
  return true;
};
