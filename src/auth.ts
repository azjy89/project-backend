import { User, Quiz, Data, getData, setData } from './dataStore';
const isEmail = require('validator/lib/isEmail');

// Global Variables
const minNameLength = 2;
const maxNameLength = 20;
const minPasswordLength = 8;

// Return Interfaces
interface ErrorObject {
	error: string;
}

interface AdminAuthReturn {
	authUserId: number;
}

interface AdminUserDetailsReturn {
	user: {
		userId: number,
		name: string,
		email: string,
		numSuccessfulLogins: number,
		numFailedPasswordsSinceLastLogin: number
	}
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

export const adminAuthRegister = ( email: string, password: string, nameFirst: string, nameLast:string ): AdminAuthReturn | ErrorObject => {
	const data = getData();
	const result = adminAuthRegisterErrors(email, password, nameFirst, 
	nameLast, data);
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
	}
	data.users.push(newUser);
	if (result.error === 'No Error') {
		const successfulResult = {
			authUserId: newUserId,
		}
		return successfulResult;
	}
	setData(data);
	return result;
}

const adminAuthRegisterErrors = ( email: string, password: string, nameFirst: string, nameLast: string, data: Data): ErrorObject => {
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
	return { error: 'No Error' };
}

const adminAuthRegisterValidNameCharacters = (name: string): boolean => {
	const validCharacters = /^[A-Za-z \-'']+$/.test(name);
	return validCharacters;
}

const adminAuthRegisterValidNameLength = (name: string): boolean => {
	if (name.length <= maxNameLength && name.length >= minNameLength) {
		return true;
	}
	return false;
}

const adminAuthRegisterValidPassword = (password: string): boolean => {
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

export const adminAuthLogin = ( email: string, password: string ): AdminAuthReturn | ErrorObject => {
	const data = getData();
	if (!data.users.some(user => user.email === email)) {
		return {
			error: 'Email does not exist'
		};
	};

	const index = data.users.findIndex(user => user.email === email);
	if (data.users[index].password !== password) {
		data.users[index].numFailedPasswordsSinceLastLogin++;
		setData(data);
		const newData = getData();
		return {
			error: 'Incorrect password'
		};
	};

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

export const adminUserDetails = ( authUserId: number ): AdminUserDetailsReturn | ErrorObject => {
	let data = getData();

	const userIndex = data.users.findIndex(user => user.userId === authUserId);
	if ( userIndex === -1 ) {
		return {
			error: 'AuthUserId is not a valid user'
		}
	}

	let user = data.users.find(user => user.userId === authUserId);
	return { user:
		{
			userId: user.userId,
			name: user.nameFirst + ' ' + user.nameLast,
			email: user.email,
			numSuccessfulLogins: user.numSuccessfulLogins,
			numFailedPasswordsSinceLastLogin: user.numFailedPasswordsSinceLastLogin
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

export const adminUserDetailsUpdate = ( authUserId: number, email: string, nameFirst: string, nameLast:string ): object | ErrorObject => {
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

export const adminUserPasswordUpdate = ( authUserId: number, oldPassword: string, newPassword: string ): object | ErrorObject => {
	const data = getData();
	const userIndex = data.users.findIndex(user => user.userId === authUserId);
	if (userIndex === -1) {
		return {
			error: 'AuthUserId is not a valid user'
		}
	}
	if (oldPassword !== data.users[userIndex].password) {
		return {
			error: 'Old Password is not the correct old password'
		}
	}
	if (newPassword === data.users[userIndex].password) {
		return {
			error: 'Old Password and New Password match exactly'
		}
	}
	const GetPassword = findPassword(newPassword, userIndex);
	if (!GetPassword) {
		return {
			error: 'New Password has already been used before by this user'
		}
	}
	if (newPassword.length < minPasswordLength) {
		return {
			error: 'Password is too short'
		}
	}
	if (!adminAuthRegisterValidPassword(newPassword)) {
		return {
			error: 'Unsatisfactory password strength'
		}
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

