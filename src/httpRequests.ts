import request from 'sync-request-curl';
import { port, url } from './config.json';
const SERVER_URL = `${url}:${port}`;

import { QuestionBody } from './interfaces';

// Iteration 1 functions

export const requestAuthRegister = (email: string, password: string, nameFirst: string, nameLast: string) => {
  const res = request(
    'POST',
    SERVER_URL + `/v1/admin/auth/register`,
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
    SERVER_URL + `/v1/admin/auth/login`,
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
    SERVER_URL + `/v1/admin/user/details`,
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
    SERVER_URL + `/v1/admin/quiz`,
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
    SERVER_URL + `/v1/clear`,
    {
      json: {

      }
    }
  );
  return JSON.parse(res.body.toString());
};

// Iteration 2 functions

export const requestAuthLogout = (token: string) => {
  const res = request(
    'POST',
    SERVER_URL + `/v1/admin/auth/logout`,
    {
      body: JSON.stringify({
        token: token,
      }),
      headers: {
        'Content-type': 'application/json',
      }
    }
  );
  return JSON.parse(res.body.toString());
};

export const requestTrashQuizList = (token: string) => {
  const res = request(
    'GET',
    SERVER_URL + `/v1/admin/quiz/trash`,
    {
      qs: {
        token: token,
      }
    }
  );
  return JSON.parse(res.body.toString());
};

export const requestTrashQuizRestore = (token: string, quizId: number) => {
  const res = request(
    'POST',
    SERVER_URL + `/v1/admin/quiz/${quizId}/restore`,
    {
      body: JSON.stringify({
        token: token,
      }),
      headers: {
        'Content-type': 'application/json',
      }
    }
  );
  return JSON.parse(res.body.toString());
};

export const requestTrashEmpty = (token: string, quizIds: number[]) => {
  const res = request(
    'DELETE',
    SERVER_URL + `/v1/admin/quiz/trash/empty`,
    {
      qs: {
        token: token,
        quizIds: JSON.stringify(quizIds),
      },
    }
  );
  return JSON.parse(res.body.toString());
};

export const requestQuizTransfer = (token: string, quizId: number, userEmail: string) => {
  const res = request(
    'POST',
    SERVER_URL + `/v1/admin/quiz/${quizId}/transfer`,
    {
      body: JSON.stringify({
        token: token,
        userEmail: userEmail,
      }),
      headers: {
        'Content-type': 'application/json',
      }
    }
  );
  return {
    bodyObj: JSON.parse(res.body.toString()),
    //statusCode: res.statusCode
  }
};

export const requestQuizQuestionCreate = (token: string, quizId: number, questionBody: QuestionBody) => {
  const res = request(
    'POST',
    SERVER_URL + `/v1/admin/quiz/${quizId}/question`,
    {
      body: JSON.stringify({
        token: token,
        questionBody: questionBody,
      }),
      headers: {
        'Content-type': 'application/json',
      }
    }
  );
  return JSON.parse(res.body.toString());
};

export const requestQuizQuestionUpdate = (token: string, quizId: number, questionId: number, questionBody: QuestionBody) => {
  const res = request(
    'PUT',
    SERVER_URL + `/v1/admin/quiz/${quizId}/question/${questionId}`,
    {
      body: JSON.stringify({
        token: token,
        questionBody: questionBody,
      }),
      headers: {
        'Content-type': 'application/json',
      }
    }
  );
  return JSON.parse(res.body.toString());
};

export const requestQuizQuestionRemove = (token: string, quizId: number, questionId: number) => {
  const res = request(
    'DELETE',
    SERVER_URL + `/v1/admin/quiz/${quizId}/question/${questionId}`,
    {
      qs: {
        token: token,
      },
    }
  );
  return JSON.parse(res.body.toString());
};

export const requestQuizQuestionMove = (token: string, quizId: number, questionId: number, newPosition: number) => {
  const res = request(
    'PUT',
    SERVER_URL + `/v1/admin/quiz/${quizId}/question/${questionId}/move`,
    {
      body: JSON.stringify({
        token: token,
        newPosition: newPosition,
      }),
      headers: {
        'Content-type': 'application/json',
      }
    }
  );
  return JSON.parse(res.body.toString());
};

export const requestQuizQuestionDuplicate = (token: string, quizId: number, questionId: number) => {
  const res = request(
    'POST',
    SERVER_URL + `/v1/admin/quiz/${quizId}/question/${questionId}/duplicate`,
    {
      body: JSON.stringify({
        token: token,
      }),
      headers: {
        'Content-type': 'application/json',
      }
    }
  );

  return {
    bodyObj: JSON.parse(res.body.toString()),
    //statusCode: res.statusCode
  }
};  
