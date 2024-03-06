import { getData, setData } from './dataStore.js';
const isEmail = require('validator/lib/isEmail');

// Global Variables
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
	let result = adminAuthRegisterErrors(email, password, nameFirst, 
											nameLast, data);
	const newUserId = data.users.length + 1;
	const newUser = {
		userId: newUserId,
		nameFirst: nameFirst,
		nameLast: nameLast,
		email: email,
		password: password,
		numSuccessfulLogins: 1,
		numFailedPasswordsSinceLastLogin: 0,
	}
	data.users.push(newUser);
	if (Object.keys(result).length === 0) {
		result = {
			authUserId: newUserId,
		}
	}

	return result;
}

function adminAuthRegisterErrors(email, password, nameFirst, nameLast, data) {
	if (data.users.some(user => user.email === email)) {
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
	const validCharacters = /^[A-Za-z \-'']+$/.test(name);
	return validCharacters;
}

function adminAuthRegisterValidNameLength(name) {
	if (name.length <= maxNameLength && name.length >= minNameLength) {
		return true;
	}
	return false;
}

function adminAuthRegisterValidPassword(password) {
	const containsLetterAndNumber = /[a-zA-Z]/.test(password) && /[0-9]/.test(password);

	return containsLetterAndNumber;
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
	const data = getData();
	if (!data.users.some(user => user.email === email)) {
		return {
			error: 'Email does not exist'
		};
	};

	const index = data.users.findIndex(user => user.email === email);
	if (data.users[index].password !== password) {
		data.users[index].numFailedPasswordsSinceLastLogin++;
		return {
			error: 'Incorrect password'
		};
	};

	data.users[index].numFailedPasswordsSinceLastLogin = 0;
	data.users[index].numSuccessfulLogins++;

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
	const data = getData();
    const userIndex = data.users.findIndex(user => user.userId === authUserId);
    if (userIndex === -1) {
        return {
            error: 'AuthUserId is not a valid user'
        };
    };

    if (data.users.some(user => user.email === email && user.userId !== authUserId)) {
        return {
            error: 'Email is currently used by another user'
        };
    };

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

    data.users[userIndex].nameFirst = nameFirst;
	data.users[userIndex].nameLast = nameLast
    data.users[userIndex].email = email;
	
	setData(data);

	return {};
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

export { adminAuthRegister, adminAuthLogin, adminUserDetailsUpdate }; 