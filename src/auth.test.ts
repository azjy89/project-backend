import { before } from 'node:test';
import { requestAuthRegister, requestAuthLogin, requestAuthLogout, requestUserDetails, requestUserDetailsUpdate, requestUserPasswordUpdate, requestClear } from './httpRequests';
import { response } from 'express';

beforeEach(() => {
  requestClear();
});

describe('requestAuthRegister', () => {
  test('successful registration', () => {
    const responseToken = requestAuthRegister('users@unsw.edu.au', '1234abcd'
      , 'FirstName', 'LastName');
    expect(responseToken).toStrictEqual({ token: expect.any(String) });
    const responseDetails = requestUserDetails(responseToken.token);
    expect(responseDetails).toStrictEqual({
      user: {
        userId: 1,
        name: 'FirstName LastName',
        email: 'users@unsw.edu.au',
        numSuccessfulLogins: 1,
        numFailedPasswordsSinceLastLogin: 0
      }
    })
  });

  test('duplicate email', () => {
    const responseToken = requestAuthRegister('users@unsw.edu.au', '1234abcd'
    , 'FirstName', 'LastName')
    const responseToken2 = requestAuthRegister('users@unsw.edu.au', '1234abcd'
    , 'FirstName', 'LastName');
    expect(responseToken2).toEqual({ error: expect.any(String) });
  });

  test('email is not valid', () => {
    const responseToken = requestAuthRegister('123', '1234abcd!@#$'
      , 'FirstName', 'LastName');
    expect(responseToken).toEqual({ error: expect.any(String) });
  });

  test('invalid characters in nameFirst', () => {
    const responseToken = requestAuthRegister('users@unsw.edu.au', '1234abcd'
      , '1234567890', 'LastName');
    expect(responseToken).toEqual({ error: expect.any(String) });
    const responseToken2 = requestAuthRegister('users@unsw.edu.au', '1234abcd'
      , '!@#$%^&*()_+=|?><', 'LastName');
    expect(responseToken2).toEqual({ error: expect.any(String) });
  });

  test('nameFirst length', () => {
    const responseToken = requestAuthRegister('users@unsw.edu.au', '1234abcd'
      , 'A', 'LastName');
    expect(responseToken).toEqual({ error: expect.any(String) });
    const responseToken2 = requestAuthRegister('users@unsw.edu.au', '1234abcd'
      , '', 'LastName');
    expect(responseToken2).toEqual({ error: expect.any(String) });
    const responseToken3 = requestAuthRegister('users@unsw.edu.au', '1234abcd'
      , 'ABCDEFGHIJKLMNOPQRSTU', 'LastName');
    expect(responseToken3).toEqual({ error: expect.any(String) });
    const responseToken4 = requestAuthRegister('users@unsw.edu.au', '1234abcd'
      , 'AB', 'LastName');
    expect(responseToken4).toEqual({ token: expect.any(String) });
  });

  test('invalid characters in nameLast', () => {
    const responseToken = requestAuthRegister('users@unsw.edu.au', '1234abcd'
      , 'FirstName', '1234567890');
    expect(responseToken).toEqual({ error: expect.any(String) });
    const responseToken2 = requestAuthRegister('users@unsw.edu.au', '1234abcd'
      , 'FirstName', '!@#$%^&*()_+=|?><');
    expect(responseToken2).toEqual({ error: expect.any(String) });
  });

  test('nameLast length', () => {
    const responseToken = requestAuthRegister('users@unsw.edu.au', '1234abcd'
      , 'FirstName', 'A');
    expect(responseToken).toEqual({ error: expect.any(String) });
    const responseToken2 = requestAuthRegister('users@unsw.edu.au', '1234abcd'
      , 'FirstName', 'ABCDEFGHIJKLMNOPQRSTU');
    expect(responseToken2).toEqual({ error: expect.any(String) });
    const responseToken3 = requestAuthRegister('users@unsw.edu.au', '1234abcd'
      , 'FirstName', '');
    expect(responseToken3).toEqual({ error: expect.any(String) });
    const responseToken4 = requestAuthRegister('users@unsw.edu.au', '1234abcd'
      , 'FirstName', 'AB');
    expect(responseToken4).toEqual({ token: expect.any(String) });
  });

  test('invalid password length', () => {
    const responseToken = requestAuthRegister('users@unsw.edu.au', ''
      , 'FirstName', 'LastName');
    expect(responseToken).toEqual({ error: expect.any(String) });
    const responseToken2 = requestAuthRegister('users@unsw.edu.au', '1'
      , 'FirstName', 'LastName');
    expect(responseToken2).toEqual({ error: expect.any(String) });
    const responseToken3 = requestAuthRegister('users@unsw.edu.au', '12'
      , 'FirstName', 'LastName');
    expect(responseToken3).toEqual({ error: expect.any(String) });
    const responseToken4 = requestAuthRegister('users@unsw.edu.au', '123'
      , 'FirstName', 'LastName');
    expect(responseToken4).toEqual({ error: expect.any(String) });
    const authUserId5 = requestAuthRegister('users@unsw.edu.au', '1234'
      , 'FirstName', 'LastName');
    expect(authUserId5).toEqual({ error: expect.any(String) });
    const authUserId6 = requestAuthRegister('users@unsw.edu.au', '12345'
      , 'FirstName', 'LastName');
    expect(authUserId6).toEqual({ error: expect.any(String) });
    const authUserId7 = requestAuthRegister('users@unsw.edu.au', '123456'
      , 'FirstName', 'LastName');
    expect(authUserId7).toEqual({ error: expect.any(String) });
    const authUserId8 = requestAuthRegister('users@unsw.edu.au', '1234567'
      , 'FirstName', 'LastName');
    expect(authUserId8).toEqual({ error: expect.any(String) });
  });

  test('unsatisfactory password', () => {
    const responseToken = requestAuthRegister('users@unsw.edu.au', '12345678'
      , 'FirstName', 'LastName');
    expect(responseToken).toEqual({ error: expect.any(String) });
    const responseToken2 = requestAuthRegister('users@unsw.edu.au', 'abcdefgh'
      , 'FirstName', 'LastName');
    expect(responseToken2).toEqual({ error: expect.any(String) });
  });
});

describe('adminAuthLogin', () => {
  test('successful login', () => {
    requestAuthRegister('users@unsw.edu.au', '1234abcd'
      , 'FirstName', 'LastName');
    const loginToken = requestAuthLogin('users@unsw.edu.au', '1234abcd');
    expect(loginToken).toEqual({ token: expect.any(String) });
  });

  test('successful login value checks', () => {
    requestAuthRegister('users@unsw.edu.au', '1234abcd'
      , 'FirstName', 'LastName');
    const loginToken = requestAuthLogin('users@unsw.edu.au', '1234abcd');
    const userDetails = requestUserDetails(loginToken.token);
    expect(userDetails.user.numSuccessfulLogins).toStrictEqual(2);
    expect(userDetails.user.numFailedPasswordsSinceLastLogin).toStrictEqual(0);
  });

  test('Email does not exist', () => {
    const loginToken = requestAuthLogin('users@unsw.edu.au', '1234abcd');
    expect(loginToken).toEqual({ error: expect.any(String) });
  });

  test('Email does not exist value checks', () => {
    const responseToken = requestAuthRegister('users@unsw.edu.au', '1234abcd'
      , 'FirstName', 'LastName');
    const loginToken = requestAuthLogin('users@unsw.edu.au', '1234abcd');
    const userDetails = requestUserDetails(loginToken.token);
    expect(userDetails.user.numFailedPasswordsSinceLastLogin).toStrictEqual(0);
  });

  test('Incorrect password', () => {
    requestAuthRegister('users@unsw.edu.au', '1234abcd'
      , 'FirstName', 'LastName');
    const loginToken = requestAuthLogin('users@unsw.edu.au', '1234abce');
    expect(loginToken).toEqual({ error: expect.any(String) });
  });

  test('Incorrect password value checks', () => {
    const responseToken = requestAuthRegister('users@unsw.edu.au', '1234abcd'
      , 'FirstName', 'LastName');
    const loginToken = requestAuthLogin('users@unsw.edu.au', '1234abce');
    const userDetails = requestUserDetails(loginToken.token);
    expect(userDetails.user.numFailedPasswordsSinceLastLogin).toStrictEqual(1);
  });
});

describe('requestAuthLogout', () => {
  test('successful logout', () => {
    const responseToken = requestAuthRegister('users@unsw.edu.au', '1234abcd'
    , 'FirstName', 'LastName');
    const logoutReturn = requestAuthLogout(responseToken.token);
    expect(logoutReturn).toEqual({});
    const loginToken = requestAuthLogin('users@unsw.edu.au', '1234abcd');
    const logoutReturn2 = requestAuthLogout(loginToken.token);
    expect(logoutReturn2).toEqual({}); 
  });

  test('invalid token', () => {
    const responseToken = requestAuthRegister('users@unsw.edu.au', '1234abcd'
    , 'FirstName', 'LastName');
    const logoutReturn = requestAuthLogout(responseToken.token + 1);
    expect(logoutReturn).toEqual({ error: 'error' });
    const loginToken = requestAuthLogin('users@unsw.edu.au', '1234abcd');
    const logoutReturn2 = requestAuthLogout(loginToken.token + 1);
    expect(logoutReturn2).toEqual({ error: 'error' }); 
  });
});

describe('requestUserDetails', () => {
  test('successful return details', () => {
    const responseToken = requestAuthRegister('users@unsw.edu.au', '1234abcd',
      'FirstName', 'LastName');
    expect(requestUserDetails(responseToken.token)).toStrictEqual({
      user: {
        userId: expect.any(Number),
        name: 'FirstName LastName',
        email: 'users@unsw.edu.au',
        numSuccessfulLogins: expect.any(Number),
        numFailedPasswordsSinceLastLogin: expect.any(Number),
      }
    });
  });

  test('AuthUserId is not a valid user', () => {
    const responseToken = requestAuthRegister('users@unsw.edu.au', '1234abcd',
      'FirstName', 'LastName');
    expect(requestUserDetails(responseToken.token + 1)).toEqual({ error: expect.any(String) });
  });
});

describe('requestUserDetailsUpdate', () => {
  test('AuthUserId is not a valid user', () => {
    const responseToken = requestAuthRegister('users@unsw.edu.au', '1234abcd'
      , 'FirstName', 'LastName');
    expect(requestUserDetailsUpdate(responseToken.token + 1, 'users@unsw.edu.au', 'FirstName', 'LastName')).toEqual({ error: expect.any(String) });
  });

  test('Email is currently used by another user', () => {
    const responseToken = requestAuthRegister('users@unsw.edu.au', '1234abcd'
      , 'FirstName', 'LastName');
    requestAuthRegister('ZoeChens@unsw.edu.au', '1234abcd', 'Zoe', 'Chen');
    expect(requestUserDetailsUpdate(responseToken.token, 'ZoeChens@unsw.edu.au', 'FirstName', 'LastName')).toStrictEqual({ error: expect.any(String) });
  });

  test('Email is invalid', () => {
    const responseToken = requestAuthRegister('users@unsw.edu.au', '1234abcd'
      , 'FirstName', 'LastName');
    expect(requestUserDetailsUpdate(responseToken.token, '123', 'FirstName', 'LastName')).toStrictEqual({ error: expect.any(String) });
  });

  test('invalid characters in nameFirst', () => {
    const responseToken = requestAuthRegister('users@unsw.edu.au', '1234abcd'
      , 'FirstName', 'LastName');
    expect(requestUserDetailsUpdate(responseToken.token, 'users@unsw.edu.au', '!@#$%^&1234', 'LastName')).toStrictEqual({ error: expect.any(String) });
  });

  test('invalid nameFirst length', () => {
    const responseToken = requestAuthRegister('users@unsw.edu.au', '1234abcd'
      , 'FirstName', 'LastName');
    expect(requestUserDetailsUpdate(responseToken.token, 'users@unsw.edu.au', 'A', 'LastName')).toStrictEqual({ error: expect.any(String) });
    requestClear();
    const responseToken2 = requestAuthRegister('users@unsw.edu.au', '1234abcd'
      , 'FirstName', 'LastName');
    expect(requestUserDetailsUpdate(responseToken2.token, 'users@unsw.edu.au', 'ABcdefghijklmnopqrstu', 'LastName')).toStrictEqual({ error: expect.any(String) });
  });

  test('invalid characters in nameLast', () => {
    const responseToken = requestAuthRegister('users@unsw.edu.au', '1234abcd'
      , 'FirstName', 'LastName');
    expect(requestUserDetailsUpdate(responseToken.token, 'users@unsw.edu.au', 'FirstName', '!@#$%^&1234')).toStrictEqual({ error: expect.any(String) });
  });

  test('invalid nameLast length', () => {
    const responseToken = requestAuthRegister('users@unsw.edu.au', '1234abcd'
      , 'FirstName', 'LastName');
    expect(requestUserDetailsUpdate(responseToken.token, 'users@unsw.edu.au', 'FirstName', 'A')).toStrictEqual({ error: expect.any(String) });
    requestClear();
    const responseToken2 = requestAuthRegister('users@unsw.edu.au', '1234abcd'
      , 'FirstName', 'LastName');
    expect(requestUserDetailsUpdate(responseToken2.token, 'users@unsw.edu.au', 'FirstName', 'ABcdefghijklmnopqrstu')).toStrictEqual({ error: expect.any(String) });
  });

  test('Successefully update', () => {
    const responseToken = requestAuthRegister('users@unsw.edu.au', '1234abcd'
      , 'FirstName', 'LastName');
    expect(requestUserDetailsUpdate(responseToken.token, 'users@unsw.edu.au', 'FirstName', 'Chen')).toEqual({});
    const details = requestUserDetails(responseToken.token);
    expect(details.user.name).toEqual('FirstName Chen');
    expect(details.user.email).toEqual('users@unsw.edu.au');
  });
});

describe('requestUserPasswordUpdate', () => {
  test('AuthUserId is not a valid user', () => {
    const responseToken = requestAuthRegister('users@unsw.edu.au', '1234abcd'
      , 'FirstName', 'LastName');
    expect(requestUserPasswordUpdate(responseToken.token + 1, '1234abcd', 'abcd1234')).toEqual({ error: expect.any(String) });
  });

  test('Old Password is not the correct old password', () => {
    const responseToken = requestAuthRegister('users@unsw.edu.au', '1234abcd'
      , 'FirstName', 'LastName');
    expect(requestUserPasswordUpdate(responseToken.token, 'wrong1234', 'abcd1234')).toEqual({ error: expect.any(String) });
  });

  test('New Password has already been used before by this user', () => {
    const responseToken = requestAuthRegister('users@unsw.edu.au', '1234abcd'
      , 'FirstName', 'LastName');
    requestUserPasswordUpdate(responseToken.token, '1234abcd', 'new12345');
    requestUserPasswordUpdate(responseToken.token, 'new12345', 'new123456');
    expect(requestUserPasswordUpdate(responseToken.token, 'new123456', '1234abcd')).toEqual({ error: expect.any(String) });
  });

  test('invalid password length', () => {
    const responseToken = requestAuthRegister('users@unsw.edu.au', '1234abcd'
      , 'FirstName', 'LastName');
    expect(requestUserPasswordUpdate(responseToken.token, 'abcd1234', '')).toEqual({ error: expect.any(String) });
    const responseToken2 = requestAuthRegister('users@unsw.edu.au', '1234abcd'
      , 'FirstName', 'LastName');
    expect(requestUserPasswordUpdate(responseToken2.token, 'abcd1234', '1')).toEqual({ error: expect.any(String) });
    const responseToken3 = requestAuthRegister('users@unsw.edu.au', '1234abcd'
      , 'FirstName', 'LastName');
    expect(requestUserPasswordUpdate(responseToken3.token, 'abcd1234', '12')).toEqual({ error: expect.any(String) });
    const responseToken4 = requestAuthRegister('users@unsw.edu.au', '1234abcd'
      , 'FirstName', 'LastName');
    expect(requestUserPasswordUpdate(responseToken4.token, 'abcd1234', '123')).toEqual({ error: expect.any(String) });
    const responseToken5 = requestAuthRegister('users@unsw.edu.au', '1234abcd'
      , 'FirstName', 'LastName');
    expect(requestUserPasswordUpdate(responseToken5.token, 'abcd1234', '1234')).toEqual({ error: expect.any(String) });
    const responseToken6 = requestAuthRegister('users@unsw.edu.au', '1234abcd'
      , 'FirstName', 'LastName');
    expect(requestUserPasswordUpdate(responseToken6.token, 'abcd1234', '12345')).toEqual({ error: expect.any(String) });
    const responseToken7 = requestAuthRegister('users@unsw.edu.au', '1234abcd'
      , 'FirstName', 'LastName');
    expect(requestUserPasswordUpdate(responseToken7.token, 'abcd1234', '123456')).toEqual({ error: expect.any(String) });
    const responseToken8 = requestAuthRegister('users@unsw.edu.au', '1234abcd'
      , 'FirstName', 'LastName');
    expect(requestUserPasswordUpdate(responseToken8.token, 'abcd1234', '1234567')).toEqual({ error: expect.any(String) });
  });

  test('unsatisfactory password', () => {
    const responseToken = requestAuthRegister('users@unsw.edu.au', '1234abcd'
      , 'FirstName', 'LastName');
    expect(requestUserPasswordUpdate(responseToken.token, 'abcd1234', '12345678')).toEqual({ error: expect.any(String) });
    const responseToken2 = requestAuthRegister('users@unsw.edu.au', '1234abcd'
      , 'FirstName', 'LastName');
    expect(requestUserPasswordUpdate(responseToken2.token, 'abcd1234', 'abcdefgh')).toEqual({ error: expect.any(String) });
  });

  test('successful update password', () => {
    const responseToken = requestAuthRegister('users@unsw.edu.au', '1234abcd'
      , 'FirstName', 'LastName');
      expect(requestUserPasswordUpdate(responseToken.token, '1234abcd', 'abcd1234')).toEqual({});
      const loginToken = requestAuthLogin('users@unsw.edu.au', 'abcd1234');
      expect(loginToken).toEqual({ token: expect.any(String)} );
  });
});

