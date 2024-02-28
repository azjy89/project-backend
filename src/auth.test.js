import { adminAuthRegister } from './auth.js';
import {clear} from './other.js';
import isEmail from 'validator/lib/isEmail';


test('Check successful registration', () => {
  clear();
  let user = adminAuthRegister('users@unsw.edu.au', '1234abcd!@#$'
  , 'FirstName', 'LastName');
});

test('Check duplicate email', () => {
  clear();
  let user1 = adminAuthRegister('users@unsw.edu.au', '1234abcd!@#$'
  , 'FirstName', 'LastName');
  let user2 = adminAuthRegister('users@unsw.edu.au', '1234abcd!@#$'
  , 'FirstName', 'LastName');
  expect(user2).toStrictEqual({ error: "Email has been used"});
});

test('Check email format', () => {
  clear();
  let user = adminAuthRegister('invalidemail', '1234abcd!@#$'
  , 'FirstName', 'LastName');
  expect(user).toStrictEqual({ error: "Invalid email format"});
});

test('Check unexpected characters in NameFirst', () => {
  clear();
  let user1 = adminAuthRegister('users@unsw.edu.au', '1234abcd!@#$'
  , '1234567890', 'LastName');
  expect(user1).toStrictEqual({ error: "NameFirst contains unexpected characters"});
  let user2 = adminAuthRegister('users@unsw.edu.au', '1234abcd!@#$'
  , '!@#$%^&*()_+=|?><', 'LastName');
  expect(user2).toStrictEqual({ error: "NameFirst contains unexpected characters"});
});

test('Check NameFirst is between 2 and 20 characters long', () => {
  clear();
  let user1 = adminAuthRegister('users@unsw.edu.au', '1234abcd!@#$'
  , 'A', 'LastName');
  expect(user1).toStrictEqual({ error: "NameFirst must be between 2 and 20 characters long"});
  let user2 = adminAuthRegister('users@unsw.edu.au', '1234abcd!@#$'
  , 'ABCDEFGHIJKLMNOPQRSTU', 'LastName');
  expect(user2).toStrictEqual({ error: "NameFirst must be between 2 and 20 characters long"});
});

test('Check unexpected characters in NameLast', () => {
  clear();
  let user1 = adminAuthRegister('users@unsw.edu.au', '1234abcd!@#$'
  , 'FirstName', '1234567890');
  expect(user1).toStrictEqual({ error: "NameLast contains unexpected characters"});
  let user2 = adminAuthRegister('users@unsw.edu.au', '1234abcd!@#$'
  , 'FirstName', '!@#$%^&*()_+=|?><');
  expect(user2).toStrictEqual({ error: "NameLast contains unexpected characters"});
});

test('Check NameLast is between 2 and 20 characters long', () => {
  clear();
  let user1 = adminAuthRegister('users@unsw.edu.au', '1234abcd!@#$'
  , 'FirstName', 'A');
  expect(user1).toStrictEqual({ error: "NameLast must be between 2 and 20 characters long"});
  let user2 = adminAuthRegister('users@unsw.edu.au', '1234abcd!@#$'
  , 'FirstName', 'ABCDEFGHIJKLMNOPQRSTU');
  expect(user2).toStrictEqual({ error: "NameLast must be between 2 and 20 characters long"});
});

test('Check fail on short passwords', () => {
  clear();
  let user1 = adminAuthRegister('users@unsw.edu.au', ''
  , 'FirstName', 'LastName');
  expect(user1).toStrictEqual({ error: "Password is too short"});
  let user2 = adminAuthRegister('users@unsw.edu.au', '1'
  , 'FirstName', 'LastName');
  expect(user2).toStrictEqual({ error: "Password is too short"});
  let user3 = adminAuthRegister('users@unsw.edu.au', '12'
  , 'FirstName', 'LastName');
  expect(user3).toStrictEqual({ error: "Password is too short"});
  let user4 = adminAuthRegister('users@unsw.edu.au', '123'
  , 'FirstName', 'LastName');
  expect(user4).toStrictEqual({ error: "Password is too short"});
  let user5 = adminAuthRegister('users@unsw.edu.au', '1234'
  , 'FirstName', 'LastName');
  expect(user5).toStrictEqual({ error: "Password is too short"});
  let user6 = adminAuthRegister('users@unsw.edu.au', '12345'
  , 'FirstName', 'LastName');
  expect(user6).toStrictEqual({ error: "Password is too short"});
  let user7 = adminAuthRegister('users@unsw.edu.au', '123456'
  , 'FirstName', 'LastName');
  expect(user7).toStrictEqual({ error: "Password is too short"});
  let user8 = adminAuthRegister('users@unsw.edu.au', '1234567'
  , 'FirstName', 'LastName');
  expect(user8).toStrictEqual({ error: "Password is too short"});
});

test('Check fail on passwords does not contains at least one number and at least one letter', () => {
  clear();
  let user1 = adminAuthRegister('users@unsw.edu.au', '12345678'
  , 'FirstName', 'LastName');
  expect(user1).toStrictEqual({ error: "Password should contain at least one number and at least one letter"});
  let user2 = adminAuthRegister('users@unsw.edu.au', 'abcdefgh'
  , 'FirstName', 'LastName');
  expect(user2).toStrictEqual({ error: "Password should contain at least one number and at least one letter"});
});
