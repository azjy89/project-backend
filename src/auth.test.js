import { adminAuthRegister, adminAuthLogin } from './auth.js';
import { clear } from './other.js';

describe('adminAuthRegister', () => { 
    test('successful registration', () => {
        clear();
        let authUserId = adminAuthRegister('users@unsw.edu.au', '1234abcd'
        , 'FirstName', 'LastName');
        expect(authUserId).toEqual( { authUserId: expect.any(Number) });
    });

    test('duplicate email', () => {
        clear();
        let authUserId1 = adminAuthRegister('users@unsw.edu.au', '1234abcd'
        , 'FirstName', 'LastName');
        let authUserId2 = adminAuthRegister('users@unsw.edu.au', '1234abcd'
        , 'FirstName', 'LastName');
        expect(authUserId2).toEqual({ error: expect.any(String)});
    });

    test('email is not valid', () => {
        clear();
        let authUserId = adminAuthRegister('123', '1234abcd!@#$'
        , 'FirstName', 'LastName');
        expect(authUserId).toEqual({ error: expect.any(String)})
    });

    test('invalid characters in nameFirst', () => {
        clear();
        let authUserId1 = adminAuthRegister('users@unsw.edu.au', '1234abcd'
        , '1234567890', 'LastName');
        expect(authUserId1).toEqual({ error: expect.any(String)});
        let authUserId2 = adminAuthRegister('users@unsw.edu.au', '1234abcd'
        , '!@#$%^&*()_+=|?><', 'LastName');
        expect(authUserId2).toEqual({ error: expect.any(String)});
    });

    test('invalid nameFirst length', () => {
        clear();
        let authUserId1 = adminAuthRegister('users@unsw.edu.au', '1234abcd'
        , 'A', 'LastName');
        expect(authUserId1).toEqual({ error: expect.any(String)});
        clear();
        let authUserId2 = adminAuthRegister('users@unsw.edu.au', '1234abcd'
        , 'ABCDEFGHIJKLMNOPQRSTU', 'LastName');
        expect(authUserId2).toEqual({ error: expect.any(String)});
    });

    test('invalid characters in nameLast', () => {
        clear();
        let authUserId1 = adminAuthRegister('users@unsw.edu.au', '1234abcd'
        , 'FirstName', '1234567890');
        expect(authUserId1).toEqual({ error: expect.any(String)});
        let authUserId2 = adminAuthRegister('users@unsw.edu.au', '1234abcd'
        , 'FirstName', '!@#$%^&*()_+=|?><');
        expect(authUserId2).toEqual({ error: expect.any(String)});
    });

    test('invalid nameLast length', () => {
        clear();
        let authUserId1 = adminAuthRegister('users@unsw.edu.au', '1234abcd'
        , 'FirstName', 'A');
        expect(authUserId1).toEqual({ error: expect.any(String)});
        clear();
        let authUserId2 = adminAuthRegister('users@unsw.edu.au', '1234abcd'
        , 'FirstName', 'ABCDEFGHIJKLMNOPQRSTU');
        expect(authUserId2).toEqual({ error: expect.any(String)});
    });

    test('invalid password length', () => {
        clear();
        let authUserId1 = adminAuthRegister('users@unsw.edu.au', ''
        , 'FirstName', 'LastName');
        expect(authUserId1).toEqual({ error: expect.any(String)});
        let authUserId2 = adminAuthRegister('users@unsw.edu.au', '1'
        , 'FirstName', 'LastName');
        expect(authUserId2).toEqual({ error: expect.any(String)});
        let authUserId3 = adminAuthRegister('users@unsw.edu.au', '12'
        , 'FirstName', 'LastName');
        expect(authUserId3).toEqual({ error: expect.any(String)});
        let authUserId4 = adminAuthRegister('users@unsw.edu.au', '123'
        , 'FirstName', 'LastName');
        expect(authUserId4).toEqual({ error: expect.any(String)});
        let authUserId5 = adminAuthRegister('users@unsw.edu.au', '1234'
        , 'FirstName', 'LastName');
        expect(authUserId5).toEqual({ error: expect.any(String)});
        let authUserId6 = adminAuthRegister('users@unsw.edu.au', '12345'
        , 'FirstName', 'LastName');
        expect(authUserId6).toEqual({ error: expect.any(String)});
        let authUserId7 = adminAuthRegister('users@unsw.edu.au', '123456'
        , 'FirstName', 'LastName');
        expect(authUserId7).toEqual({ error: expect.any(String)});
        let authUserId8 = adminAuthRegister('users@unsw.edu.au', '1234567'
        , 'FirstName', 'LastName');
        expect(authUserId8).toEqual({ error: expect.any(String)});
    });

    test('unsatisfactory password', () => {
        clear();
        let user1 = adminAuthRegister('users@unsw.edu.au', '12345678'
        , 'FirstName', 'LastName');
        expect(user1).toEqual({ error: expect.any(String)});
        let user2 = adminAuthRegister('users@unsw.edu.au', 'abcdefgh'
        , 'FirstName', 'LastName');
        expect(user2).toEqual({ error: expect.any(String)});
    });
});

describe('adminAuthLogin', () => {
    test('successful login', () => {
        clear();
        adminAuthRegister('users@unsw.edu.au', '1234abcd'
        , 'FirstName', 'LastName');
        let authUserId = adminAuthLogin('users@unsw.edu.au', '1234abcd');
        expect(authUserId).toEqual({ authUserId: expect.any(Number) });
    });

    test('Email does not exist', () => {
        clear();
        let authUserId = adminAuthLogin('users@unsw.edu.au', '1234abcd');
        expect(authUserId).toEqual({ error: expect.any(String) });
    });

    test('Incorrect password', () => {
        clear();
        adminAuthRegister('users@unsw.edu.au', '1234abcd'
        , 'FirstName', 'LastName');
        let authUserId = adminAuthLogin('users@unsw.edu.au', '1234abce');
        expect(authUserId).toEqual({ error: expect.any(String) });
    });
});

describe('adminUserDetailsUpdate', () => {
    let user;
    beforeEach(() => {
        user = adminAuthRegister('users@unsw.edu.au', '1234abcd'
        , 'FirstName', 'LastName')
    });

    test('AuthUserId is not a valid user', () => {
        clear();
        expect(adminUserDetailsUpdate(user.userId + 1, user.email, user.nameFirst, user.nameLast)).toEqual({ error: expect.any(String) });
    });

    test('Email is currently used by another user', () => {
        clear();
        adminAuthRegister('ZoeChens@unsw.edu.au', '1234abcd', 'Zoe', 'Chen');
        expect(adminUserDetailsUpdate(user.userId, 'ZoeChens@unsw.edu.au', user.nameFirst, user.nameLast)).toStrictEqual({ error: expect.any(String) });
    });

    test('Email is invalid', () => {
        clear();
        expect(adminUserDetailsUpdate(user.userId, '123', user.nameFirst, user.nameLast)).toStrictEqual({ error: expect.any(String)})
    });

    test('invalid characters in nameFirst', () => {
        clear();
        expect(adminUserDetailsUpdate(user.userId, user.email, '!@#$%^&1234', user.nameLast)).toStrictEqual({ error: expect.any(String) });
    });

    test('invalid nameFirst length', () => {
        clear();
        expect(adminUserDetailsUpdate(user.userId, user.email, 'A', user.nameLast)).toStrictEqual({ error: expect.any(String) });
        clear();
        expect(adminUserDetailsUpdate(user.userId, user.email, 'ABcdefghijklmnopqrstu', user.nameLast)).toStrictEqual({ error: expect.any(String) });
    });

    test('invalid characters in nameLast', () => {
        clear();
        expect(adminUserDetailsUpdate(user.userId, user.email, user.nameFirst, '!@#$%^&1234')).toStrictEqual({ error: expect.any(String) });
    });

    test('invalid nameLast length', () => {
        clear();
        expect(adminUserDetailsUpdate(user.userId, user.email, user.nameFirst, 'A')).toStrictEqual({ error: expect.any(String) });
        clear();
        expect(adminUserDetailsUpdate(user.userId, user.email, user.nameLast, 'ABcdefghijklmnopqrstu')).toStrictEqual({ error: expect.any(String) });
    });
});


