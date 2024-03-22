import request from 'sync-request-curl';
import { port, url } from './config.json';
const SERVER_URL = `${url}:${port}`;

// Iteration 1 functions

export const requestAuthRegister = (email: string, password: string, nameFirst: string, nameLast: string) => {
  const res = request(
    'POST',
    SERVER_URL + '/v1/admin/auth/register',
    {
      json: {
        email: email,
        password: password,
        nameFirst: nameFirst,
        nameLast: nameLast,
      },
    }
  );
  return JSON.parse(res.body.toString());
};


export const requestAuthLogin = (email: string, password: string) => {
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


export const requestUserDetails = (token: string) => {
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

export const requestUserDetailsUpdate = (token: string, email: string, nameFirst: string, nameLast: string) => {
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
};

export const requestUserPasswordUpdate = (token: string, oldPassword: string, newPassword: string) => {
  const res = request(
    'PUT',
    SERVER_URL + `/v1/admin/user/password`,
    {
      body: JSON.stringify({
        token: token,
        oldPassword: oldPassword,
        newPassword: newPassword,
      }),
      headers: {
        'Content-type': 'application/json',
      }
    }
  );
  return JSON.parse(res.body.toString());
};

export const requestQuizList = (token: string) => {
  const res = request(
    'GET',
    SERVER_URL + '/v1/admin/quiz/list',
    {
      qs: {
        token: token,
      }
    }
  );
  return JSON.parse(res.body.toString());
};

export const requestQuizCreate = (token: string, name: string, description: string) => {
  const res = request(
    'POST',
    SERVER_URL + '/v1/admin/quiz',
    {
      body: JSON.stringify({
        token: token,
        name: name,
        description: description,
      }),
      headers: {
        'Content-type': 'application/json',
      }
    }
  );
  return JSON.parse(String(res.body));
};

export const requestQuizRemove = (token: string, quizId: number) => {
  const res = request(
    'DELETE',
    SERVER_URL + `/v1/admin/quiz/${quizId}`,
    {
      qs: {
        token: token,
      },
    }
  );
  return JSON.parse(res.body.toString());
};

export const requestQuizInfo = (token: string, quizId: number) => {
  const res = request(
    'GET',
    SERVER_URL + `/v1/admin/quiz/${quizId}`,
    {
      qs: {
        token: token,
      }
    }
  );
  return JSON.parse(res.body.toString());
};

export const requestQuizNameUpdate = (token: string, quizId: number, name: string) => {
  const res = request(
    'PUT',
    SERVER_URL + `/v1/admin/quiz/${quizId}/name`,
    {
      body: JSON.stringify({
        token: token,
        name: name,
      }),
      headers: {
        'Content-type': 'application/json',
      }
    }
  );
  return JSON.parse(res.body.toString());
};

export const requestQuizDescriptionUpdate = (token: string, quizId: number, description: string) => {
  const res = request(
    'PUT',
    SERVER_URL + `/v1/admin/quiz/${quizId}/description`,
    {
      body: JSON.stringify({
        token: token,
        description: description,
      }),
      headers: {
        'Content-type': 'application/json',
      }
    }
  );
  return JSON.parse(res.body.toString());
};

export const requestClear = () => {
  const res = request(
    'DELETE',
    SERVER_URL + '/v1/clear',
    {
      json: {

      }
    }
  );
};

