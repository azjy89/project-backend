import { adminAuthRegister } from './auth.js';

test('Check successful registration', () => {
  let authUserId = adminAuthRegister('users@unsw.edu.au', '1234abcd!@#$'
  , 'FirstName', 'LastName');
});

test('Check duplicate email', () => {
  let user1 = adminAuthRegister('users@unsw.edu.au', '1234abcd!@#$'
  , 'FirstName', 'LastName');
  let user2 = adminAuthRegister('users@unsw.edu.au', '1234abcd!@#$'
  , 'FirstName', 'LastName');
  expect(user2).toStrictEqual({ error: "Email have been used"});
});
