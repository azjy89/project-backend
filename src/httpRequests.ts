import request from 'sync-request-curl';
import { port, url } from './config.json';
const SERVER_URL = `${url}:${port}`;

// Iteration 1 functions

export const adminAuthRegister = (email: string, password: string, nameFirst: string, nameLast: string) => {
  const res = request(
    'POST',
    SERVER_URL + '/v1/admin/auth/register',
    {
      json: {
        email: email,
        password: password,
        nameFirst: nameFirst,
        nameLast: nameLast
      },
    }
  );
  return JSON.parse(res.body.toString());
}


export const adminAuthLogin = (email: string, password: string) => {
  const res = request(
    'POST',
    SERVER_URL + '/v1/admin/auth/login',
    {
      body: JSON.stringify({
        email: email,
        password: password,
      }),
      headers: {
        'Content-type': 'application/json',
      }
    }
  );
  return JSON.parse(res.body.toString());
};


export const adminUserDetails = (token: string) => {
  const res = request(
    'GET',
    SERVER_URL + '/v1/admin/user/details',
    {
      qs: {
        token: token,
      }
    }
  );
  return JSON.parse(res.body.toString());
};

export const adminUserDetailsUpdate = (token: string, email: string, nameFirst: string, nameLast: string) => {
  const res = request(
    'POST',
    SERVER_URL + `/v1/admin/quiz/{quizid}/restore`,
    {
      body: JSON.stringify({
        token: token,
        email: email,
        nameFirst: nameFirst,
        nameLast: nameLast,
      }),
      headers: {
        'Content-type' : 'application/json',
      }
    }
  );
  return JSON.parse(res.body.toString());
}

// Iteration 2 functions

export const adminUserDetailsUpdate = (token: string, email: string, nameFirst: string, nameLast: string) => {
  const res = request(
    'PUT',
    SERVER_URL + `/v1/admin/user/details`,
    {
      body: JSON.stringify({
        token: token,
        email: email,
        nameFirst: nameFirst,
        nameLast: nameLast,
      }),
      headers: {
        'Content-type' : 'application/json',
      }
    }
  );
  return JSON.parse(res.body.toString());
}