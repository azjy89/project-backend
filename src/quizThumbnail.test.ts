import request from 'sync-request-curl';
import { port, url } from './config.json';
const SERVER_URL = `${url}:${port}`;

import {
  requestAuthRegister,
  requestQuizCreate,
  requestClear,
  requestQuizInfo,
  requestAuthLogout,
} from './httpRequests';

export const requestQuizThumbnail = (token: string, quizId: number, url: string) => {
  const res = request(
    'PUT',
    SERVER_URL + `/v1/admin/quiz/${quizId}/thumbnail`,
    {
      body: JSON.stringify({
        imgUrl: url,
      }),
      headers: {
        'Content-type': 'application/json',
        token: `${token}`,
      },
    }
  );
  return JSON.parse(res.body.toString());
};

beforeEach(() => {
  requestClear();
});

afterAll(() => {
  requestClear();
});

it('returns error on wrong file type', () => {
  const registerRes = requestAuthRegister(
    'users@unsw.edu.au',
    '1234abcd',
    'FirstName',
    'LastName'
  );
  const quizCreateRes = requestQuizCreate(registerRes.token, 'quiz', 'quiz', 'http://something.jpeg/');
  const thumbnailRes = requestQuizThumbnail(
    registerRes.token,
    quizCreateRes.quizId,
    'http://file.doxc'
  );
  expect(thumbnailRes).toStrictEqual({ error: expect.any(String) });
});

it('returns error if invalid http', () => {
  const registerRes = requestAuthRegister(
    'users@unsw.edu.au',
    '1234abcd',
    'FirstName',
    'LastName'
  );
  const quizCreateRes = requestQuizCreate(registerRes.token, 'quiz', 'quiz', 'http://something.jpeg/');
  const thumbnailRes = requestQuizThumbnail(
    registerRes.token,
    quizCreateRes.quizId,
    'file.jpeg'
  );
  expect(thumbnailRes).toStrictEqual({ error: expect.any(String) });
});

it('returns error if token is invalid', () => {
  const registerRes = requestAuthRegister(
    'users@unsw.edu.au',
    '1234abcd',
    'FirstName',
    'LastName'
  );
  requestAuthLogout(registerRes.token);
  const quizCreateRes = requestQuizCreate(registerRes.token, 'quiz', 'quiz', 'http://something.jpeg/');
  const thumbnailRes = requestQuizThumbnail(
    registerRes.token,
    quizCreateRes.quizId,
    'https://file.jpeg'
  );
  expect(thumbnailRes).toStrictEqual({ error: expect.any(String) });
});

it('returns error if token is valid but user does not own quiz', () => {
  const registerRes = requestAuthRegister(
    'users@unsw.edu.au',
    '1234abcd',
    'FirstName',
    'LastName'
  );
  const registerRes2 = requestAuthRegister(
    'userse@unsw.edu.au',
    '1234abcd',
    'FirstNames',
    'LastNames'
  );
  const quizCreateRes = requestQuizCreate(registerRes.token, 'quiz', 'quiz', 'http://something.jpeg/');
  const thumbnailRes = requestQuizThumbnail(
    registerRes2.token,
    quizCreateRes.quizId,
    'https://file.jpeg'
  );
  expect(thumbnailRes).toStrictEqual({ error: expect.any(String) });
});

it('successfully updates the thumbnail', () => {
  const registerRes = requestAuthRegister(
    'users@unsw.edu.au',
    '1234abcd',
    'FirstName',
    'LastName'
  );
  const quizCreateRes = requestQuizCreate(registerRes.token, 'quiz', 'quiz', 'http://something.jpeg/');
  const thumbnailRes = requestQuizThumbnail(
    registerRes.token,
    quizCreateRes.quizId,
    'https://i.kym-cdn.com/entries/icons/facebook/000/048/010/side_eye_cat.jpg'
  );
  expect(thumbnailRes).toStrictEqual({});
  const infoRes = requestQuizInfo(registerRes.token, quizCreateRes.quizId);
  expect(infoRes.thumbnailUrl).toStrictEqual(
    'https://i.kym-cdn.com/entries/icons/facebook/000/048/010/side_eye_cat.jpg'
  );
});
