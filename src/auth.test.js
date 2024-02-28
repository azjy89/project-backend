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

test('Invalid email format', () => {
  clear();
  let user = adminAuthRegister('invalidemail', '1234abcd!@#$'
  , 'FirstName', 'LastName');
  expect(user).toStrictEqual({ error: "Invalid email format"});
});


