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