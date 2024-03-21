import express, { json, Request, Response } from 'express';
import { echo } from './newecho';
import morgan from 'morgan';
import config from './config.json';
import cors from 'cors';
import YAML from 'yaml';
import sui from 'swagger-ui-express';
import fs from 'fs';
import path from 'path';
import process from 'process';

import {
  adminAuthRegister,
  adminAuthLogin,
  adminUserDetails,
  adminUserDetailsUpdate,
  adminUserPasswordUpdate
} from './auth';

import {
  adminQuizList,
  adminQuizCreate,
  adminQuizRemove,
  adminQuizInfo,
  adminQuizNameUpdate,
  adminQuizDescriptionUpdate,
  adminQuizQuestionCreate,
  adminQuizQuestionUpdate,
  adminQuizQuestionRemove,
  adminQuizQuestionMove,
  adminQuizTransfer
} from './quiz';

import {
  clear
} from './other';

import {
  AuthUserId
} from './types';

import {
  trashQuizList,
  trashQuizRestore,
  trashEmpty
} from './trash';

// Set up web app
const app = express();
// Use middleware that allows us to access the JSON body of requests
app.use(json());
// Use middleware that allows for access from other domains
app.use(cors());
// for logging errors (print to terminal)
app.use(morgan('dev'));
// for producing the docs that define the API
const file = fs.readFileSync(path.join(process.cwd(), 'swagger.yaml'), 'utf8');
app.get('/', (req: Request, res: Response) => res.redirect('/docs'));
app.use('/docs', sui.serve, sui.setup(YAML.parse(file), { swaggerOptions: { docExpansion: config.expandDocs ? 'full' : 'list' } }));

const PORT: number = parseInt(process.env.PORT || config.port);
const HOST: string = process.env.IP || 'localhost';

// ====================================================================
//  ================= WORK IS DONE BELOW THIS LINE ===================
// ====================================================================

// Example get request
app.get('/echo', (req: Request, res: Response) => {
  const data = req.query.echo as string;
  return res.json(echo(data));
});

/**POST
 * Route for /v1/admin/auth/register - POST
 * 
 * Takes in information about a new admin user and registers them in the 
 * system. This route is not relevant to guests who want to play a particular
 * quiz, but is used for the creation of accounts of people who manage quizzes.
 */
app.post('/v1/admin/auth/register', (req: Request, res: Response) => {
  // Request parameters from body
  const { email, password, nameFirst, nameLast } = req.body;
  // Call adminAuthRegister with parameters
  const response = adminAuthRegister(email, password, nameFirst, nameLast);

  if ('error' in response) {
    // Invalid parameters
    return res.status(400).json(response);
  }

  // Generate a token for authUserId
  const token = createToken(response.authUserId);
  return res.status(200).json({ token });
});

/**POST
 * Route for /v1/admin/auth/login - POST
 * 
 * Takes in information about an admin user to determine if they can log in
 * to manage quizzes. This route is not relevant to guests who want to play
 * a particular quiz, but is used for the creation of accounts of people 
 * who manage quizzes.
 */
app.post('/v1/admin/auth/login', (req: Request, res: Response) => {
  // Request parameters from body
  const { email, password } = req.body;
  // Call adminAuthLogin with parameters
  const authUserId = adminAuthLogin(email, password);
  const userId = authUserId as AuthUserId;
  // Generate a token for the user
  const token = createToken(userId.authUserId);
  // Return the token
  res.status(200).json({ token });
});

/**GET
 * Route for /v1/admin/user/details - GET
 * 
 * For the given admin user that is logged in, return all of the 
 * relevant details.
 */
app.get('/v1/admin/user/details', (req: Request, res: Response) => {
  // Request token as a query
  const token = req.query.token as string;
  // Validate token?????? MAYBE ADD LATER
  const userId = idFromToken(token);
  const authUserId = userId as AuthUserId;
  // Call adminUserDetails 
  const userDetails = adminUserDetails(authUserId.authUserId);
  return res.status(200).json(userDetails);
});


/**PUT
 * Route for /v1/admin/user/details - PUT
 * 
 * Given a set of properties, update those properties of this logged in 
 * admin user.
 */
app.put('/v1/admin/user/details', (req: Request, res: Response) => {
  // Request parameters from body
  const { token, email, nameFirst, nameLast } = req.body;
  // Validate token MAYBE???
  // Retrieve userId for the token
  const userId = idFromToken(token);
  const authUserId = userId as AuthUserId;
  // Call and return adminUserDetailsUpdate
  const userDetails = adminUserDetails(authUserId.authUserId);
  return res.status(200).json(userDetails);
});

/**PUT 
 * Route for /v1/admin/user/details - PUT
 *
 * Given a set of properties, update those properties of this logged 
 * in admin user.
 */
app.put('/v1/admin/user/details', (req: Request, res: Response) => {
  // Request parameters from body
  const { token, email, nameFirst, nameLast } = req.body;
  // Retrieve userId for the token
  const userId = idFromToken(token);
  const authUserId = userId as AuthUserId;
  // Call and return adminUserDetailsUpdate
  const response = adminUserDetailsUpdate(authUserId.authUserId, email, nameFirst, nameLast);
  res.status(200).json(response);
});

/**PUT
 * Route for /v1/admin/user/password - PUT
 * 
 * Given details relating to a password change, update the 
 * password of a logged in user.
 */
app.put('/v1/admin/user/password', (req: Request, res: Response) => {
  // Request parameters from body
  const { token, oldPassword, newPassword } = req.body;
  // Retrieve userId for the token
  const userId = idFromToken(token);
  const authUserId = userId as AuthUserId;
  // Call and return adminPasswordUpdate
  const response = adminPasswordUpdate(authUserId.authUserId, oldPassword, newPassword);
  res.status(200).json(response);
});

/**GET
 * Route for /v1/admin/quiz/list - GET
 * 
 * Provide a list of all quizzes that are owned by the currently logged in user
 */
app.get('/v1/admin/quiz/list', (req: Request, res: Response) => {
  // Request token as a query
  const token = req.query.token as string;
  // Retrieve userId for the token
  const userId = idFromToken(token);
  const authUserId = userId as AuthUserId;
  // Call and return list of quizzes from adminQuizList
  const quizList = adminQuizList(authUserId.authUserId);
  return res.status(200).json(quizList);
});

/**POST 
 * Route for /v1/admin/quiz - POST
 *
 * Given basic details about a new quiz, create one for the logged in user
 */
app.post('/v1/admin/quiz', (req: Request, res: Response) => {
  // Request parameter from body
  const { token } = req.body;
  // Retrieve userId for the token
  const userId = idFromToken(token);
  const authUserId = userId as AuthUserId;
  // Request name and description as parameters
  const { name, description } = req.body;
  // Call and return quizId from adminQuizCreate
  const response = adminQuizCreate(authUserId.authUserId, name, description);
  return res.status(200).json(response);
});

/**DELETE 
 * Route for /v1/admin/quiz/:quizid - DELETE
 *
 * Given a particular quiz, send it to the trash
 */
app.delete('/v1/admin/quiz/:quizid', (req: Request, res: Response) => {
  // Parses quizId to int
  const quizId = parseInt(req.params.quizid);
  // Requests token as a query
  const token = req.query.token as string;
  // Retrieves user for the token
  const userId = idFromToken(token);
  const authUserId = userId as AuthUserId;
  // Call and return adminQuizRemove
  const response = adminQuizRemove(authUserId.authUserId, quizId);
  return res.status(200).json(response);
});

/**GET 
 * Route for /v1/admin/quiz/:quizid - GET
 *
 * Get all of the relevant information about the current quiz including questions.
 */
app.get('/v1/admin/quiz/:quizid', (req: Request, res: Response) => {
  // Parses quizId to int
  const quizId = parseInt(req.params.quizid);
  // Requests token as a query
  const token = req.query.token as string;
  // Retrieves user for the token
  const userId = idFromToken(token);
  const authUserId = userId as AuthUserId;
  // Call and return info for the quiz
  const response = adminQuizInfo(authUserId.authUserId, quizId);
  return res.status(200).json(response);
});

/**PUT 
 * Route for /v1/admin/quiz/:quizid/name - PUT
 *
 * Update the name of the relevant quiz
 */
app.put('/v1/admin/quiz/:quizid/name', (req: Request, res: Response) => {
  // Parses quizId to int
  const quizId = parseInt(req.params.quizid);
  // Requests parameters from body
  const { token, name } = req.body;
  // Retrieves userId for the token
  const userId = idFromToken(token);
  const authUserId = userId as AuthUserId;
  // Calls and returns an empty object from adminQuizNameUpdate
  const response = adminQuizNameUpdate(authUserId.authUserId, quizId, name);
  return res.status(200).json(response);
});

/**PUT
 * Route for /v1/admin/quiz/:quizid/description - PUT
 * 
 * Update the description of the relevant quiz
 */
app.put('/v1/admin/quiz/:quizid/description', (req: Request, res: Response) => {
  // Parses quizId to int
  const quizId = parseInt(req.params.quizid);
  // Requests params from body
  const { token, description } = req.body;
  const userId = idFromToken(token);
  const authUserId = userId as AuthUserId;
  // Calls and returns an empty object from adminQuizDescriptionUpdate
  const result = adminQuizDescriptionUpdate(authUserId.authUserId, quizId, description);
  return res.status(200).json(response);
});


/**DELETE
 * Route for /v1/other/clear - DELETE
 * 
 * Wipe all details (user, quizzes) back to the beginning as if the
 * data structure is fresh.
 */
app.delete('/v1/clear', (req:Request, res: Response) => {
  return res.status(200).json(clear());
});


/**POST 
 * Route for /v1/admin/auth/logout - POST
 *
 * Should be called with a token that is returned after either a 
 * login or register has been made.
 */
app.post('/v1/admin/auth/logout', (req: Request, res: Response) => {
  // Request parameter from body
  const { token } = req.body;
  // Some sort of error checking???? 
  idFromToken(token);
  // Token deleted (logged out)
  deleteToken(token);
  res.status(200).json({});
});

/**GET
 * Route for /v1/admin/quiz/trash - GET
 * 
 * View the quizzes that are currently in the trash for the 
 * logged in user
 */
app.get('/v1/admin/quiz/trash', (req: Request, res: Response) => {
  // Request token as a query
  const token = req.query.token as string;
  // Retrieves userid for the token
  const userId = idFromToken(token);
  const authUserId = userId as AuthUserId;
  // Calls and returns trashQuizList
  const response = trashQuizList(authUserId.authUserId);
  return res.status(200).json(response);
});

/**POST
 * Route for /v1/admin/quiz/:quizid/restore - POST
 * 
 * Restore a particular quiz from the trash back to an active quiz.
 */
app.post('/v1/admin/quiz/:quizid/restore', (req: Request, res: Response) => {
  // Parses quizId to int
  const quizId = parseInt(req.params.quizid);
  // Request parameter from body
  const { token } = req.body;
  // Retrieves userid for the token
  const userId = idFromToken(token);
  const authUserId = userId as AuthUserId;
  // Calls and returns trashQuizRestore 
  const response = trashQuizRestore(authUserId.authUserId, quizId);
  return res.status(200).json(response);
});

/**DELETE 
 * Route for /v1/admin/quiz/trash/empty - DELETE
 *
 * Permanently delete specific quizzes currently sitting in the trash
 */
app.delete('/v1/admin/quiz/trash/empty', (req: Request, res: Response) => {
  // Requests quizIdString as a query
  const quizIdString = req.query.quizIds as string;
  // Parse it as a JSON object
  const quizIds = JSON.parse(quizIdString);
  // Requests token as a query
  const token = req.query.token as string;
  // Retrieve userId for the token
  const userId = idFromToken(token);
  const authUserId = userId as AuthUserId;
  // Call and returns trashEmpty
  const response = trashEmpty(authUserId.authUserId, quizIds);
  return res.status(200).json(response);
});

/**POST 
 * Route for /v1/admin/quiz/:quizid/transfer - POST
 *
 * Transfer ownership of a quiz to a different user based on their email
 */
app.post('/v1/admin/quiz/:quizid/transfer', (req: Request, res: Response) => {
  // Parse quizId to int
  const quizId = parseInt(req.params.quizid);
  // Request params from body
  const { token, userEmail } = req.body;
  // Retrieves userId for the token
  const userId = idFromToken(token);
  const authUserId = userId as AuthUserId;
  // Calls and returns adminQuizTransfer
  const response = adminQuizTransfer(authUserId.authUserId, quizId, userEmail);
  return res.status(200).json(response);
});

/**POST
 * Route for /v1/admin/quiz/:quizid/question - POST
 * 
 * Create a new stub question for a particular quiz.
 */
app.post('/v1/admin/quiz/:quizid/question', (req: Request, res: Response) => {
  // Parse quizid to int
  const quizId = parseInt(req.params.quizid);
  // Request params from body
  const { token, questionBody } = req.body;
  // Retrieve userid for the token
  const userId = idFromToken(token);
  const authUserId = userId as AuthUserId;
  // Call and return adminQuizQuestionCreate
  const response = adminQuizQuestionCreate(quizId, authUserId.authUserId, questionBody);
  return res.status(200).json(response);
});

/**PUT
 * Route for /v1/admin/quiz/:quizid/question/:questionid - PUT
 * 
 * Update the relevant details of a particular question within a quiz.
 */
app.put('/v1/admin/quiz/:quizid/question/:questionid', (req: Request, res: Response) => {
  // Parse quizid to int
  const quizId = parseInt(req.params.quizid);
  // Parse questionid to int
  const questionId = parseInt(req.params.questionid);
  // Request params from body
  const { token, questionBody } = req.body;
  // Retrieve userid for the token
  const userId = idFromToken(token);
  const authUserId = userId as AuthUserId;
  // Call and return adminQuizQuestionUpdate
  const response = adminQuizQuestionUpdate(quizId, questionId, authUserId.authUserId, questionBody);
  return res.status(200).json(response);
});

/**DELETE
 * Route for /v1/admin/quiz/:quizid/question/:questionid - DELETE
 * 
 * Delete a particular question from a quiz
 */
app.delete('/v1/admin/quiz/:quizid/question/:questionid', (req: Request, res: Response) => {
  // Parse quizid to int
  const quizId = parseInt(req.params.quizid);
  // Parse questionid to int
  const questionId = parseInt(req.params.questionid);
  // Request token as query
  const token = req.query.token as string;
  // Retrieve userid for the token
  const userId = idFromToken(token);
  const authUserId = userId as AuthUserId;
  // Call and return adminQuizQuestionRemove
  const response = adminQuizQuestionRemove(quizId, questionId, authUserId.authUserId);
  return res.status(200).json(response);
});

/**PUT
 * Route for /v1/admin/quiz/:quizid/question/:questionid/move - PUT
 * 
 * Move a question from one particular position in the quiz to another
 */
app.put('/v1/admin/quiz/:quizid/question/:questionid/move', (req: Request, res: Response) => {
  // Parse quizid to int
  const quizId = parseInt(req.params.quizid);
  // Parse questionid to int
  const questionId = parseInt(req.params.questionid);
  // Request params from body
  const { token, newPosition } = req.body;
  // Retrieve userid for the token
  const userId = idFromToken(token);
  const authUserId = userId as AuthUserId;
  // Call and return adminQuizQuestionMove
  const response = adminQuizQuestionMove(quizId, questionId, authUserId.authUserId, newPosition);
  return res.status(200).json(response);
});

/**POST
 * Route for /v1/admin/quiz/:quizid/question/:questionid/duplicate - POST
 * 
 * A particular question gets duplicated to immediately after 
 * where the source question is
 */
app.post('/v1/admin/quiz/:quizid/question/:questionid/duplicate', (req: Request, res: Response) => {
  // Parse quizid to int
  const quizId = parseInt(req.params.quizid);
  // Parse questionid to int
  const questionId = parseInt(req.params.questionid);
  // Request params from body
  const { token } = req.body;
  // Retrieve userid for the token
  const userId = idFromToken(token);
  const authUserId = userId as AuthUserId;
  // Call and return adminQuizQuestionDuplicate
  const response = adminQuizQuestionDuplicate(quizId, questionId, authUserId.authUserId);
  return res.status(200).json(response);  
});

// ====================================================================
//  ================= WORK IS DONE ABOVE THIS LINE ===================
// ====================================================================

app.use((req: Request, res: Response) => {
  const error = `
    Route not found - This could be because:
      0. You have defined routes below (not above) this middleware in server.ts
      1. You have not implemented the route ${req.method} ${req.path}
      2. There is a typo in either your test or server, e.g. /posts/list in one
         and, incorrectly, /post/list in the other
      3. You are using ts-node (instead of ts-node-dev) to start your server and
         have forgotten to manually restart to load the new changes
      4. You've forgotten a leading slash (/), e.g. you have posts/list instead
         of /posts/list in your server.ts or test file
  `;
  res.json({ error });
});

// start server
const server = app.listen(PORT, HOST, () => {
  // DO NOT CHANGE THIS LINE
  console.log(`⚡️ Server started on port ${PORT} at ${HOST}`);
});

// For coverage, handle Ctrl+C gracefully
process.on('SIGINT', () => {
  server.close(() => console.log('Shutting down server gracefully.'));
});
