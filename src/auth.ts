import { tokenToString } from 'typescript';

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
export const createToken = ( authUserId: number ): string => {
  const data = getData();
  const token: string = uuid.v4();
  data.tokens.push({
    token: token,
    userId: authUserId,
  });
  setData(data);
  return token;
}

// This function is exported to server and allows the userId of a user to be
// retrieved from a token
export const idFromToken = ( token: string ): ErrorObject | AuthUserId => {
  const tokenInfo = getData().tokens.find(dataToken => token === dataToken.token);

  if (tokenInfo) {
    return { authUserId: tokenInfo.userId };
  }
  throw HTTPError(403, 'Token does not refer to a valid logged in session');
}

// Checks the token has a valid structure and throws an error if not
export const validateToken = ( token: string ): ErrorObject | object => {
  const regex = /^[a-z0-9]{8}-[a-z0-9]{4}-[a-z0-9]{4}-[a-z0-9]{4}-[a-z0-9]{12}$/;
  if (!regex.test(token)) {
    throw HTTPError(401, 'Token is not a valid structure');
  }
  return {};
}

/** Goes through data array and removes the token that needs to be deleted
 * 
 * @param {string} token 
 */
export const removeToken = ( token: string ): void => {
  const data = getData();
  data.tokens = data.tokens.filter(a => a.token !== token);
  setData(data);
}


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
  const data = getData();
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
  const data = getData();
  const user = data.users.some(user => user.email === email);

  if (!user) {
    throw HTTPError(400, 'User with this email does not exist');
  }

  const index = data.users.findIndex(user => user.email === email);
  if (data.users[index].password !== password) {
    data.users[index].numFailedPasswordsSinceLastLogin++;
    setData(data);
    throw HTTPError(400, 'Incorrect password');
  }

  data.users[index].numFailedPasswordsSinceLastLogin = 0;
  data.users[index].numSuccessfulLogins++;

  setData(data);
  return {
    authUserId: data.users[index].userId
  };
};

/**
 * 
 * @param inputToken 
 * @returns 
 */

export const adminAuthLogout = (inputToken: string): Object | ErrorObject => {
  const data = getData();
  if (!data.tokens.find(token => token.token === inputToken)) {
    return {
      error: 'Invalid Token'
    }
  }

  data.tokens = data.tokens.filter(token => token.token !== inputToken);
  setData(data);
  return {};
}

/**
 * Given an admin user's authUserId, return details about the user. "name" is
 * the first and last name concatenated with a single space between them.
 *
 * @param {int} authUserId
 *
 * @returns {object}
 */

export const adminUserDetails = (authUserId: number): UserDetails | ErrorObject => {
  const data = getData();

  const userIndex = data.users.findIndex(user => user.userId === authUserId);
  if (userIndex === -1) {
    return {
      error: 'AuthUserId is not a valid user'
    };
  }

  const user = data.users.find(user => user.userId === authUserId);
  return {
    user:
		{
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
  const data = getData();
  const userIndex = data.users.findIndex(user => user.userId === authUserId);
  if (userIndex === -1) {
    return {
      error: 'AuthUserId is not a valid user'
    };
  }

  if (data.users.some(user => user.email === email && user.userId !== authUserId)) {
    return {
      error: 'Email is currently used by another user'
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

export const adminUserPasswordUpdate = ( authUserId: number, oldPassword: string, newPassword: string ): object | ErrorObject => {
	const data = getData();
	const userIndex = data.users.findIndex(user => user.userId === authUserId);
	if (userIndex === -1) {
		return {
			error: 'AuthUserId is not a valid user'
		}
	}
	if (oldPassword !== data.users[userIndex].password) {
    throw HTTPError(400, 'Old password is not the correct old password');
	}
	if (newPassword === data.users[userIndex].password) {
    throw HTTPError(400, 'Old Password and New Password match exactly');
	}
	const GetPassword = findPassword(newPassword, userIndex);
	if (!GetPassword) {
    throw HTTPError(400, 'New Password has already been used before by this user');
	}
	if (newPassword.length < minPasswordLength) {
    throw HTTPError(400, 'Password is too short');
	}
	if (!adminAuthRegisterValidPassword(newPassword)) {
    throw HTTPError(400, 'Unsatisfactory password strength');
	}
	data.users[userIndex].password = newPassword;
 
 
	data.users[userIndex].oldPasswords.push(oldPassword);
	data.users[userIndex].oldPasswords.push(newPassword);
   
	setData(data);
	return {}
 }
 
 
const findPassword = ( password: string, userIndex: number ): boolean => {
	let data = getData();
	let user = data.users[userIndex];
 
 
	for (let oldpassword of user.oldPasswords) {
		if (password === oldpassword) {
			return false;
		}
	}
	return true;
}

