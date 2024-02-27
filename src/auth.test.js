import { adminAuthRegister } from './auth.js';

test('Check successful registration', () => {
  let authUserId = adminAuthRegister('users@unsw.edu.au', '1234abcd!@#$'
  , 'FirstName', 'LastName');
});
