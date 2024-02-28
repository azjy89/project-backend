import { getData, setData } from './dataStore.js'
import isEmail from 'validator/lib/isEmail.js';

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
  let data = getData();

  for (const user of data.users) {
    if (user.email === email) {
      return {"error": "Email has been used"};
    }
  }

  if (!isEmail(email)) {
    return { "error": "Invalid email format" };
  }

  if (!/^[a-zA-Z\-']/.test(nameFirst)) {
    return { error: "NameFirst contains unexpected characters" };
  }

  if (nameFirst.length < 2 || nameFirst.length > 20) {
    return { error: "NameFirst must be between 2 and 20 characters long" };
  }

  data.users.push({
    email: email,
    password: password,
    name: '$(nameFirst) $(nameLast)',
  });

  setData(data);
  return {
    authUserId: data.users.length,
  }
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

export {adminAuthRegister};
