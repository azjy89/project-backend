import { adminAuthRegister, adminAuthLogin, adminUserDetails, adminUserDetailsUpdate, adminUserPasswordUpdate } from './auth';
import { clear } from './other';

describe('adminAuthRegister', () => {
  test('successful registration', () => {
    clear();
    const authUserId = adminAuthRegister('users@unsw.edu.au', '1234abcd'
      , 'FirstName', 'LastName');
    expect(authUserId).toEqual({ authUserId: expect.any(Number) });
  });

  test('successful registration type and value checks', () => {
    clear();
    const authUserId = adminAuthRegister('users@unsw.edu.au', '1234abcd'
      , 'FirstName', 'LastName');
    let userDetails;
    if ('authUserId' in authUserId) {
        userDetails = adminUserDetails(authUserId.authUserId);
    }
    if ('user' in userDetails) {
        expect(userDetails.user.userId).toEqual(expect.any(Number));
        expect(userDetails.user.name).toStrictEqual('FirstName LastName');
        expect(userDetails.user.email).toStrictEqual('users@unsw.edu.au');
        expect(userDetails.user.numSuccessfulLogins).toStrictEqual(1);
        expect(userDetails.user.numFailedPasswordsSinceLastLogin).toStrictEqual(0);
    }
  });

  test('duplicate email', () => {
    clear();
    const authUserId1 = adminAuthRegister('users@unsw.edu.au', '1234abcd'
      , 'FirstName', 'LastName');
    const authUserId2 = adminAuthRegister('users@unsw.edu.au', '1234abcd'
      , 'FirstName', 'LastName');
    expect(authUserId2).toEqual({ error: expect.any(String) });
  });

  test('email is not valid', () => {
    clear();
    const authUserId = adminAuthRegister('123', '1234abcd!@#$'
      , 'FirstName', 'LastName');
    expect(authUserId).toEqual({ error: expect.any(String) });
  });

  test('invalid characters in nameFirst', () => {
    clear();
    const authUserId1 = adminAuthRegister('users@unsw.edu.au', '1234abcd'
      , '1234567890', 'LastName');
    expect(authUserId1).toEqual({ error: expect.any(String) });
    const authUserId2 = adminAuthRegister('users@unsw.edu.au', '1234abcd'
      , '!@#$%^&*()_+=|?><', 'LastName');
    expect(authUserId2).toEqual({ error: expect.any(String) });
  });

  test('nameFirst length', () => {
    clear();
    const authUserId1 = adminAuthRegister('users@unsw.edu.au', '1234abcd'
      , 'A', 'LastName');
    expect(authUserId1).toEqual({ error: expect.any(String) });
    clear();
    const authUserId2 = adminAuthRegister('users@unsw.edu.au', '1234abcd'
      , '', 'LastName');
    expect(authUserId2).toEqual({ error: expect.any(String) });
    clear();
    const authUserId3 = adminAuthRegister('users@unsw.edu.au', '1234abcd'
      , 'ABCDEFGHIJKLMNOPQRSTU', 'LastName');
    expect(authUserId3).toEqual({ error: expect.any(String) });
    clear();
    const authUserId4 = adminAuthRegister('users@unsw.edu.au', '1234abcd'
      , 'AB', 'LastName');
    expect(authUserId4).toEqual({ authUserId: expect.any(Number) });
  });

  test('invalid characters in nameLast', () => {
    clear();
    const authUserId1 = adminAuthRegister('users@unsw.edu.au', '1234abcd'
      , 'FirstName', '1234567890');
    expect(authUserId1).toEqual({ error: expect.any(String) });
    clear();
    const authUserId2 = adminAuthRegister('users@unsw.edu.au', '1234abcd'
      , 'FirstName', '!@#$%^&*()_+=|?><');
    expect(authUserId2).toEqual({ error: expect.any(String) });
  });

  test('nameLast length', () => {
    clear();
    const authUserId1 = adminAuthRegister('users@unsw.edu.au', '1234abcd'
      , 'FirstName', 'A');
    expect(authUserId1).toEqual({ error: expect.any(String) });
    clear();
    const authUserId2 = adminAuthRegister('users@unsw.edu.au', '1234abcd'
      , 'FirstName', 'ABCDEFGHIJKLMNOPQRSTU');
    expect(authUserId2).toEqual({ error: expect.any(String) });
    clear();
    const authUserId3 = adminAuthRegister('users@unsw.edu.au', '1234abcd'
      , 'FirstName', '');
    expect(authUserId3).toEqual({ error: expect.any(String) });
    clear();
    const authUserId4 = adminAuthRegister('users@unsw.edu.au', '1234abcd'
      , 'FirstName', 'AB');
    expect(authUserId4).toEqual({ authUserId: expect.any(Number) });
  });

  test('invalid password length', () => {
    clear();
    const authUserId1 = adminAuthRegister('users@unsw.edu.au', ''
      , 'FirstName', 'LastName');
    expect(authUserId1).toEqual({ error: expect.any(String) });
    const authUserId2 = adminAuthRegister('users@unsw.edu.au', '1'
      , 'FirstName', 'LastName');
    expect(authUserId2).toEqual({ error: expect.any(String) });
    const authUserId3 = adminAuthRegister('users@unsw.edu.au', '12'
      , 'FirstName', 'LastName');
    expect(authUserId3).toEqual({ error: expect.any(String) });
    const authUserId4 = adminAuthRegister('users@unsw.edu.au', '123'
      , 'FirstName', 'LastName');
    expect(authUserId4).toEqual({ error: expect.any(String) });
    const authUserId5 = adminAuthRegister('users@unsw.edu.au', '1234'
      , 'FirstName', 'LastName');
    expect(authUserId5).toEqual({ error: expect.any(String) });
    const authUserId6 = adminAuthRegister('users@unsw.edu.au', '12345'
      , 'FirstName', 'LastName');
    expect(authUserId6).toEqual({ error: expect.any(String) });
    const authUserId7 = adminAuthRegister('users@unsw.edu.au', '123456'
      , 'FirstName', 'LastName');
    expect(authUserId7).toEqual({ error: expect.any(String) });
    const authUserId8 = adminAuthRegister('users@unsw.edu.au', '1234567'
      , 'FirstName', 'LastName');
    expect(authUserId8).toEqual({ error: expect.any(String) });
  });

  test('unsatisfactory password', () => {
    clear();
    const user1 = adminAuthRegister('users@unsw.edu.au', '12345678'
      , 'FirstName', 'LastName');
    expect(user1).toEqual({ error: expect.any(String) });
    const user2 = adminAuthRegister('users@unsw.edu.au', 'abcdefgh'
      , 'FirstName', 'LastName');
    expect(user2).toEqual({ error: expect.any(String) });
  });
});

describe('adminAuthLogin', () => {
  test('successful login', () => {
    clear();
    adminAuthRegister('users@unsw.edu.au', '1234abcd'
      , 'FirstName', 'LastName');
    const authUserId = adminAuthLogin('users@unsw.edu.au', '1234abcd');
    expect(authUserId).toEqual({ authUserId: expect.any(Number) });
  });

  test('successful login value checks', () => {
    clear();
    adminAuthRegister('users@unsw.edu.au', '1234abcd'
      , 'FirstName', 'LastName');
    const authUserId = adminAuthLogin('users@unsw.edu.au', '1234abcd');
    let userDetails;
    if ('authUserId' in authUserId) {
        userDetails = adminUserDetails(authUserId.authUserId);
    }
    if ('user' in userDetails) {
        expect(userDetails.user.numSuccessfulLogins).toStrictEqual(2);
        expect(userDetails.user.numFailedPasswordsSinceLastLogin).toStrictEqual(0);
    }
  });

  test('Email does not exist', () => {
    clear();
    const authUserId = adminAuthLogin('users@unsw.edu.au', '1234abcd');
    expect(authUserId).toEqual({ error: expect.any(String) });
  });

  test('Email does not exist value checks', () => {
    clear();
    const user = adminAuthRegister('users@unsw.edu.au', '1234abcd'
      , 'FirstName', 'LastName');
    const authUserId = adminAuthLogin('users@unsw.edu.au', '1234abcd');
    let userDetails;
    if ('authUserId' in authUserId) {
        userDetails = adminUserDetails(authUserId.authUserId);
    }
    if ('user' in userDetails) {
        expect(userDetails.user.numFailedPasswordsSinceLastLogin).toStrictEqual(0);
    }
  });

  test('Incorrect password', () => {
    clear();
    adminAuthRegister('users@unsw.edu.au', '1234abcd'
      , 'FirstName', 'LastName');
    const authUserId = adminAuthLogin('users@unsw.edu.au', '1234abce');
    expect(authUserId).toEqual({ error: expect.any(String) });
  });

  test('Incorrect password value checks', () => {
    clear();
    const user = adminAuthRegister('users@unsw.edu.au', '1234abcd'
      , 'FirstName', 'LastName');
    const authUserId = adminAuthLogin('users@unsw.edu.au', '1234abce');
    let userDetails;
    if ('authUserId' in user) {
        userDetails = adminUserDetails(user.authUserId);
    }
    if ('user' in userDetails) {
        expect(userDetails.user.numFailedPasswordsSinceLastLogin).toStrictEqual(1);
    }
  });
});

describe('adminUserDetails', () => {
  beforeEach(() => {
    clear();
  });
  test('successful return details', () => {
    const user = adminAuthRegister('users@unsw.edu.au', '1234abcd',
      'FirstName', 'LastName');
    if ('authUserId' in user) {
      expect(adminUserDetails(user.authUserId)).toStrictEqual({
        user: {
          userId: user.authUserId,
          name: 'FirstName LastName',
          email: 'users@unsw.edu.au',
          numSuccessfulLogins: expect.any(Number),
          numFailedPasswordsSinceLastLogin: expect.any(Number),
        }
      });
    }
  });

  test('AuthUserId is not a valid user', () => {
    clear();
    const user = adminAuthRegister('users@unsw.edu.au', '1234abcd',
      'FirstName', 'LastName');
    if ('authUserId' in user) {
      expect(adminUserDetails(user.authUserId + 1)).toEqual(
        { error: expect.any(String) }
      );
    }
  });
});

describe('adminUserDetailsUpdate', () => {
  test('AuthUserId is not a valid user', () => {
    clear();
    const user = adminAuthRegister('users@unsw.edu.au', '1234abcd'
      , 'FirstName', 'LastName');
    if ('authUserId' in user) {
      expect(adminUserDetailsUpdate(user.authUserId + 1, 'users@unsw.edu.au', 'FirstName', 'LastName')).toEqual({ error: expect.any(String) });
    }
  });

  test('Email is currently used by another user', () => {
    clear();
    const user = adminAuthRegister('users@unsw.edu.au', '1234abcd'
      , 'FirstName', 'LastName');
    adminAuthRegister('ZoeChens@unsw.edu.au', '1234abcd', 'Zoe', 'Chen');
    if ('authUserId' in user) {
      expect(adminUserDetailsUpdate(user.authUserId, 'ZoeChens@unsw.edu.au', 'FirstName', 'LastName')).toStrictEqual({ error: expect.any(String) });
    }
  });

  test('Email is invalid', () => {
    clear();
    const user = adminAuthRegister('users@unsw.edu.au', '1234abcd'
      , 'FirstName', 'LastName');
    if ('authUserId' in user) {
      expect(adminUserDetailsUpdate(user.authUserId, '123', 'FirstName', 'LastName')).toStrictEqual({ error: expect.any(String) });
    }
  });

  test('invalid characters in nameFirst', () => {
    clear();
    const user = adminAuthRegister('users@unsw.edu.au', '1234abcd'
      , 'FirstName', 'LastName');
    if ('authUserId' in user) {
      expect(adminUserDetailsUpdate(user.authUserId, 'users@unsw.edu.au', '!@#$%^&1234', 'LastName')).toStrictEqual({ error: expect.any(String) });
    }
  });

  test('invalid nameFirst length', () => {
    clear();
    const user1 = adminAuthRegister('users@unsw.edu.au', '1234abcd'
      , 'FirstName', 'LastName');
    if ('authUserId' in user1) {
      expect(adminUserDetailsUpdate(user1.authUserId, 'users@unsw.edu.au', 'A', 'LastName')).toStrictEqual({ error: expect.any(String) });
    }
    clear();
    const user2 = adminAuthRegister('users@unsw.edu.au', '1234abcd'
      , 'FirstName', 'LastName');
    if ('authUserId' in user2) {
      expect(adminUserDetailsUpdate(user2.authUserId, 'users@unsw.edu.au', 'ABcdefghijklmnopqrstu', 'LastName')).toStrictEqual({ error: expect.any(String) });
    }
  });

  test('invalid characters in nameLast', () => {
    clear();
    const user = adminAuthRegister('users@unsw.edu.au', '1234abcd'
      , 'FirstName', 'LastName');
    if ('authUserId' in user) {
      expect(adminUserDetailsUpdate(user.authUserId, 'users@unsw.edu.au', 'FirstName', '!@#$%^&1234')).toStrictEqual({ error: expect.any(String) });
    }
  });

  test('invalid nameLast length', () => {
    clear();
    const user1 = adminAuthRegister('users@unsw.edu.au', '1234abcd'
      , 'FirstName', 'LastName');
    if ('authUserId' in user1) {
      expect(adminUserDetailsUpdate(user1.authUserId, 'users@unsw.edu.au', 'FirstName', 'A')).toStrictEqual({ error: expect.any(String) });
    }
    clear();
    const user2 = adminAuthRegister('users@unsw.edu.au', '1234abcd'
      , 'FirstName', 'LastName');
    if ('authUserId' in user2) {
      expect(adminUserDetailsUpdate(user2.authUserId, 'users@unsw.edu.au', 'FirstName', 'ABcdefghijklmnopqrstu')).toStrictEqual({ error: expect.any(String) });
    }
  });

  test('Successefully update', () => {
    clear();
    const user = adminAuthRegister('users@unsw.edu.au', '1234abcd'
      , 'FirstName', 'LastName');
    let details;
    if ('authUserId' in user) {
      expect(adminUserDetailsUpdate(user.authUserId, 'users@unsw.edu.au', 'FirstName', 'Chen')).toEqual({});
      details = adminUserDetails(user.authUserId);
    }
    if ('user' in details) {
      expect(details.user.name).toEqual('FirstName Chen');
      expect(details.user.email).toEqual('users@unsw.edu.au');
    }
  });
});

describe('adminUserPasswordUpdate', () => {
  test('AuthUserId is not a valid user', () => {
    clear();
    const user = adminAuthRegister('users@unsw.edu.au', '1234abcd'
      , 'FirstName', 'LastName');
    if ('authUserId' in user) {
      expect(adminUserPasswordUpdate(user.authUserId + 1, '1234abcd', 'abcd1234')).toEqual({ error: expect.any(String) });
    }
  });

  test('Old Password is not the correct old password', () => {
    clear();
    const user = adminAuthRegister('users@unsw.edu.au', '1234abcd'
      , 'FirstName', 'LastName');
    if ('authUserId' in user) {
      expect(adminUserPasswordUpdate(user.authUserId, 'wrong1234', 'abcd1234')).toEqual({ error: expect.any(String) });
    }
  });

  test('New Password has already been used before by this user', () => {
    clear();
    const user1 = adminAuthRegister('users@unsw.edu.au', '1234abcd'
      , 'FirstName', 'LastName');
    if ('authUserId' in user1) {
      adminUserPasswordUpdate(user1.authUserId, '1234abcd', 'new12345');
      adminUserPasswordUpdate(user1.authUserId, 'new12345', 'new123456');
      expect(adminUserPasswordUpdate(user1.authUserId, 'new123456', '1234abcd')).toEqual({ error: expect.any(String) });
    }
  });

  test('invalid password length', () => {
    clear();
    const user1 = adminAuthRegister('users@unsw.edu.au', '1234abcd'
      , 'FirstName', 'LastName');
    if ('authUserId' in user1) {
      expect(adminUserPasswordUpdate(user1.authUserId, 'abcd1234', '')).toEqual({ error: expect.any(String) });
    }
    const user2 = adminAuthRegister('users@unsw.edu.au', '1234abcd'
      , 'FirstName', 'LastName');
    if ('authUserId' in user2) {
      expect(adminUserPasswordUpdate(user2.authUserId, 'abcd1234', '1')).toEqual({ error: expect.any(String) });
    }
    const user3 = adminAuthRegister('users@unsw.edu.au', '1234abcd'
      , 'FirstName', 'LastName');
    if ('authUserId' in user3) {
      expect(adminUserPasswordUpdate(user3.authUserId, 'abcd1234', '12')).toEqual({ error: expect.any(String) });
    }
    const user4 = adminAuthRegister('users@unsw.edu.au', '1234abcd'
      , 'FirstName', 'LastName');
    if ('authUserId' in user4) {
      expect(adminUserPasswordUpdate(user4.authUserId, 'abcd1234', '123')).toEqual({ error: expect.any(String) });
    }
    const user5 = adminAuthRegister('users@unsw.edu.au', '1234abcd'
      , 'FirstName', 'LastName');
    if ('authUserId' in user5) {
      expect(adminUserPasswordUpdate(user5.authUserId, 'abcd1234', '1234')).toEqual({ error: expect.any(String) });
    }
    const user6 = adminAuthRegister('users@unsw.edu.au', '1234abcd'
      , 'FirstName', 'LastName');
    if ('authUserId' in user6) {
      expect(adminUserPasswordUpdate(user6.authUserId, 'abcd1234', '12345')).toEqual({ error: expect.any(String) });
    }
    const user7 = adminAuthRegister('users@unsw.edu.au', '1234abcd'
      , 'FirstName', 'LastName');
    if ('authUserId' in user7) {
      expect(adminUserPasswordUpdate(user7.authUserId, 'abcd1234', '123456')).toEqual({ error: expect.any(String) });
    }
    const user8 = adminAuthRegister('users@unsw.edu.au', '1234abcd'
      , 'FirstName', 'LastName');
    if ('authUserId' in user8) {
      expect(adminUserPasswordUpdate(user8.authUserId, 'abcd1234', '1234567')).toEqual({ error: expect.any(String) });
    }
  });

  test('unsatisfactory password', () => {
    clear();
    const user1 = adminAuthRegister('users@unsw.edu.au', '1234abcd'
      , 'FirstName', 'LastName');
    if ('authUserId' in user1) {
      expect(adminUserPasswordUpdate(user1.authUserId, 'abcd1234', '12345678')).toEqual({ error: expect.any(String) });
    }
    const user2 = adminAuthRegister('users@unsw.edu.au', '1234abcd'
      , 'FirstName', 'LastName');
    if ('authUserId' in user2) {
      expect(adminUserPasswordUpdate(user2.authUserId, 'abcd1234', 'abcdefgh')).toEqual({ error: expect.any(String) });
    }
  });

  test('successful update password', () => {
    clear();
    const user = adminAuthRegister('users@unsw.edu.au', '1234abcd'
      , 'FirstName', 'LastName');
    if ('authUserId' in user) {
      expect(adminUserPasswordUpdate(user.authUserId, '1234abcd', 'abcd1234')).toEqual({});
      const authUserId = adminAuthLogin('users@unsw.edu.au', 'abcd1234');
      if ('authUserId' in authUserId) {
        expect(authUserId.authUserId).toEqual(user.authUserId);
      }
    }
  });
});
