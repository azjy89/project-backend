import request from 'sync-request-curl';
import { port, url } from '../src/config.json';
const SERVER_URL = `${url}:${port}`;

import {
  requestAuthRegister,
  requestQuizCreate,
  requestClear,
  requestQuizInfo,
  requestAuthLogout,
} from '../src/httpRequests';