import request from 'sync-request-curl';
import { port, url } from './config.json';
const SERVER_URL = `${url}:${port}`;

import { QuestionBody, Actions } from './interfaces';

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
    SERVER_URL + '/v2/admin/user/details',
    {
      headers: {
        'Content-type': 'application/json',
        token: `${token}`,
      }
    }
  );
  return JSON.parse(res.body.toString());
};

export const requestUserDetailsUpdate = (token: string, email: string, nameFirst: string, nameLast: string) => {
  const res = request(
    'PUT',
    SERVER_URL + '/v2/admin/user/details',
    {
      body: JSON.stringify({
        email: email,
        nameFirst: nameFirst,
        nameLast: nameLast,
      }),
      headers: {
        'Content-type': 'application/json',
        token: `${token}`,
      }
    }
  );
  return JSON.parse(res.body.toString());
};

export const requestUserPasswordUpdate = (token: string, oldPassword: string, newPassword: string) => {
  const res = request(
    'PUT',
    SERVER_URL + '/v2/admin/user/password',
    {
      body: JSON.stringify({
        oldPassword: oldPassword,
        newPassword: newPassword,
      }),
      headers: {
        'Content-type': 'application/json',
        token: `${token}`,
      }
    }
  );
  return JSON.parse(res.body.toString());
};

export const requestQuizList = (token: string) => {
  const res = request(
    'GET',
    SERVER_URL + '/v2/admin/quiz/list',
    {
      headers: {
        'Content-type': 'application/json',
        token: `${token}`,
      }
    }
  );
  return JSON.parse(res.body.toString());
};

export const requestQuizCreate = (token: string, name: string, description: string) => {
  const res = request(
    'POST',
    SERVER_URL + '/v2/admin/quiz',
    {
      body: JSON.stringify({
        name: name,
        description: description,
      }),
      headers: {
        'Content-type': 'application/json',
        token: `${token}`,
      }
    }
  );
  return JSON.parse(String(res.body));
};

export const requestQuizRemove = (token: string, quizId: number) => {
  const res = request(
    'DELETE',
    SERVER_URL + `/v2/admin/quiz/${quizId}`,
    {
      headers: {
        'Content-type': 'application/json',
        token: `${token}`,
      }
    }
  );
  return JSON.parse(res.body.toString());
};

export const requestQuizInfo = (token: string, quizId: number) => {
  const res = request(
    'GET',
    SERVER_URL + `/v2/admin/quiz/${quizId}`,
    {
      headers: {
        'Content-type': 'application/json',
        token: `${token}`,
      }
    }
  );
  return JSON.parse(res.body.toString());
};

export const requestQuizNameUpdate = (token: string, quizId: number, name: string) => {
  const res = request(
    'PUT',
    SERVER_URL + `/v2/admin/quiz/${quizId}/name`,
    {
      body: JSON.stringify({
        name: name,
      }),
      headers: {
        'Content-type': 'application/json',
        token: `${token}`,
      }
    }
  );
  return JSON.parse(res.body.toString());
};

export const requestQuizDescriptionUpdate = (token: string, quizId: number, description: string) => {
  const res = request(
    'PUT',
    SERVER_URL + `/v2/admin/quiz/${quizId}/description`,
    {
      body: JSON.stringify({
        description: description,
      }),
      headers: {
        'Content-type': 'application/json',
        token: `${token}`,
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
  return JSON.parse(res.body.toString());
};

// Iteration 2 functions

export const requestAuthLogout = (token: string) => {
  const res = request(
    'POST',
    SERVER_URL + '/v2/admin/auth/logout',
    {
      headers: {
        'Content-type': 'application/json',
        token: `${token}`,
      }
    }
  );
  return JSON.parse(res.body.toString());
};

export const requestTrashQuizList = (token: string) => {
  const res = request(
    'GET',
    SERVER_URL + '/v2/admin/quiz/trash',
    {
      headers: {
        'Content-type': 'application/json',
        token: `${token}`,
      }
    }
  );
  return JSON.parse(res.body.toString());
};

export const requestTrashQuizRestore = (token: string, quizId: number) => {
  const res = request(
    'POST',
    SERVER_URL + `/v2/admin/quiz/${quizId}/restore`,
    {
      headers: {
        'Content-type': 'application/json',
        token: `${token}`,
      }
    }
  );
  return JSON.parse(res.body.toString());
};

export const requestTrashEmpty = (token: string, quizIds: number[]) => {
  const res = request(
    'DELETE',
    SERVER_URL + '/v2/admin/quiz/trash/empty',
    {
      qs: {
        quizIds: JSON.stringify(quizIds),
      },
      headers: {
        'Content-type': 'application/json',
        token: `${token}`,
      }
    }
  );
  return JSON.parse(res.body.toString());
};

export const requestQuizTransfer = (token: string, quizId: number, userEmail: string) => {
  const res = request(
    'POST',
    SERVER_URL + `/v2/admin/quiz/${quizId}/transfer`,
    {
      body: JSON.stringify({
        userEmail: userEmail,
      }),
      headers: {
        'Content-type': 'application/json',
        token: `${token}`,
      }
    }
  );
  return JSON.parse(res.body.toString());
};

export const requestQuizQuestionCreate = (token: string, quizId: number, questionBody: QuestionBody) => {
  const res = request(
    'POST',
    SERVER_URL + `/v2/admin/quiz/${quizId}/question`,
    {
      body: JSON.stringify({
        questionBody: questionBody,
      }),
      headers: {
        'Content-type': 'application/json',
        token: `${token}`,
      }
    }
  );
  return JSON.parse(res.body.toString());
};

export const requestQuizQuestionUpdate = (token: string, quizId: number, questionId: number, questionBody: QuestionBody) => {
  const res = request(
    'PUT',
    SERVER_URL + `/v2/admin/quiz/${quizId}/question/${questionId}`,
    {
      body: JSON.stringify({
        questionBody: questionBody,
      }),
      headers: {
        'Content-type': 'application/json',
        token: `${token}`,
      }
    }
  );
  return JSON.parse(res.body.toString());
};

export const requestQuizQuestionRemove = (token: string, quizId: number, questionId: number) => {
  const res = request(
    'DELETE',
    SERVER_URL + `/v2/admin/quiz/${quizId}/question/${questionId}`,
    {
      headers: {
        'Content-type': 'application/json',
        token: `${token}`,
      }
    }
  );
  return JSON.parse(res.body.toString());
};

export const requestQuizQuestionMove = (token: string, quizId: number, questionId: number, newPosition: number) => {
  const res = request(
    'PUT',
    SERVER_URL + `/v2/admin/quiz/${quizId}/question/${questionId}/move`,
    {
      body: JSON.stringify({
        newPosition: newPosition,
      }),
      headers: {
        'Content-type': 'application/json',
        token: `${token}`,
      }
    }
  );
  return JSON.parse(res.body.toString());
};

export const requestQuizQuestionDuplicate = (token: string, quizId: number, questionId: number) => {
  const res = request(
    'POST',
    SERVER_URL + `/v2/admin/quiz/${quizId}/question/${questionId}/duplicate`,
    {
      headers: {
        'Content-type': 'application/json',
        token: `${token}`,
      }
    }
  );
  return JSON.parse(res.body.toString());
};

export const requestSessionsList = (token: string, quizId: number) => {
  const res = request(
    'GET',
    SERVER_URL + `/v1/admin/quiz/${quizId}/sessions`,
    {
      headers: {
        'Content-type': 'application/json',
        token: `${token}`,
      },
    }
  );
  return JSON.parse(res.body.toString());
};

export const requestQuizSessionCreate = (token: string, quizId: number, autoStartNum: number) => {
  const res = request(
    'POST',
    SERVER_URL + `/v1/admin/quiz/${quizId}/session/start`,
    {
      body: JSON.stringify({
        autoStartNum: autoStartNum,
      }),
      headers: {
        'Content-type': 'application/json',
        token: `${token}`,
      },
    }
  );
  return JSON.parse(res.body.toString());
};

export const requestSessionStatus = (token: string, quizId: number, sessionId: number) => {
  const res = request(
    'GET',
    SERVER_URL + `/v1/admin/quiz/${quizId}/session/${sessionId}`,
    {
      headers: {
        'Content-type': 'application/json',
        token: `${token}`,
      },
    }
  );
  return JSON.parse(res.body.toString());
};

export const requestSessionStateUpdate = (token: string, quizId: number, sessionId: number, action: Actions) => {
  const res = request(
    'PUT',
    SERVER_URL + `/v1/admin/quiz/${quizId}/session/${sessionId}`,
    {
      body: JSON.stringify({
        action: action,
      }),
      headers: {
        'Content-type': 'application/json',
        token: `${token}`,
      },
    }
  );
  return JSON.parse(res.body.toString());
};
