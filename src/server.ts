import express, { json, Request, Response } from 'express';
import { echo } from './newecho';
import morgan from 'morgan';
import config from './config.json';
import cors from 'cors';
import errorHandler from 'middleware-http-errors';
import YAML from 'yaml';
import sui from 'swagger-ui-express';
import fs from 'fs';

import {
  createToken,
  removeToken,
  idFromToken,
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
  adminQuizTransfer,
  adminQuizQuestionDuplicate,
  adminQuizThumbnailUpdate,
  adminQuizSessionCreate,
  sessionsList,
  sessionStatus,
  sessionStateUpdate,
  sessionResults
} from './quiz';

import {
  clear
} from './other';

import {
  AuthUserId
} from './interfaces';

import {
  trashQuizList,
  trashQuizRestore,
  trashEmpty
} from './trash';
import {
  playerJoin
} from './playerJoin';
import {
  playerStatus
} from './playerStatus'

// Set up web app
const app = express();
// Use middleware that allows us to access the JSON body of requests
app.use(json());
// Use middleware that allows for access from other domains
app.use(cors());
// for logging errors (print to terminal)
app.use(morgan('dev'));
// for producing the docs that define the API
const file = fs.readFileSync('./swagger.yaml', 'utf8');
app.get('/', (req: Request, res: Response) => res.redirect('/docs'));
app.use('/docs', sui.serve, sui.setup(YAML.parse(file), { swaggerOptions: { docExpansion: config.expandDocs ? 'full' : 'list' } }));

const PORT: number = parseInt(process.env.PORT || config.port);
const HOST: string = process.env.IP || '127.0.0.1';

// ====================================================================
//  ================= WORK IS DONE BELOW THIS LINE ===================
// ====================================================================

// Example get request
app.get('/echo', (req: Request, res: Response) => {
  const data = req.query.echo as string;
  return res.json(echo(data));
});

/** DELETE
 * Route for /v1/other/clear - DELETE
 *
 * Wipe all details (user, quizzes) back to the beginning as if the
 * data structure is fresh.
 */
app.delete('/v1/clear', (req:Request, res: Response) => {
  return res.status(200).json(clear());
});

/** POST
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
  const response = adminAuthRegister(email, password, nameFirst, nameLast) as AuthUserId;
  // Generate a token for authUserId
  const token = createToken(response.authUserId);
  return res.status(200).json({ token });
});

/** POST
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
  const authUserId = adminAuthLogin(email, password) as AuthUserId;
  // Generate a token for the user
  const token = createToken(authUserId.authUserId);
  // Return the token
  return res.status(200).json({ token });
});

// ====================================================================
//  ================= ITERATION 3 ROUTES BELOW ===================
// ====================================================================

/** GET
 * Route for /v2/admin/quiz/trash - GET
 *
 * View the quizzes that are currently in the trash for the
 * logged in user
 */
app.get('/v2/admin/quiz/trash', (req: Request, res: Response) => {
  // Request token as a header
  const token = req.headers.token as string;
  // Retrieves userid for the token
  const userId = idFromToken(token);
  const authUserId = userId as AuthUserId;
  // Calls and returns trashQuizList
  const response = trashQuizList(authUserId.authUserId);
  return res.status(200).json(response);
});

/** POST
 * Route for /v2/admin/auth/logout - POST
 *
 * Should be called with a token that is returned after either a
 * login or register has been made.
 */
app.post('/v2/admin/auth/logout', (req: Request, res: Response) => {
  // Request token as a header
  const token = req.headers.token as string;
  idFromToken(token);
  // Token deleted (logged out)
  removeToken(token);
  return res.status(200).json({});
});

/** GET
 * Route for /v2/admin/user/details - GET
 *
 * For the given admin user that is logged in, return all of the
 * relevant details.
 */
app.get('/v2/admin/user/details', (req: Request, res: Response) => {
  // Request token as a header
  const token = req.headers.token as string;
  // Retrieves userid for the token
  const userId = idFromToken(token);
  const authUserId = userId as AuthUserId;
  // Call adminUserDetails
  const userDetails = adminUserDetails(authUserId.authUserId);
  return res.status(200).json(userDetails);
});

/** PUT
 * Route for /v2/admin/user/details - PUT
 *
 * Given a set of properties, update those properties of this logged
 * in admin user.
 */
app.put('/v2/admin/user/details', (req: Request, res: Response) => {
  // Request parameters from body
  const { email, nameFirst, nameLast } = req.body;
  // Request token as a header
  const token = req.headers.token as string;
  // Retrieve userId for the token
  const userId = idFromToken(token);
  const authUserId = userId as AuthUserId;
  // Call and return adminUserDetailsUpdate
  const response = adminUserDetailsUpdate(authUserId.authUserId, email, nameFirst, nameLast);
  return res.status(200).json(response);
});

/** PUT
 * Route for /v2/admin/user/password - PUT
 *
 * Given details relating to a password change, update the
 * password of a logged in user.
 */
app.put('/v2/admin/user/password', (req: Request, res: Response) => {
  // Request parameters from body
  const { oldPassword, newPassword } = req.body;
  // Request token as a header
  const token = req.headers.token as string;
  // Retrieve userId for the token
  const userId = idFromToken(token);
  const authUserId = userId as AuthUserId;
  // Call and return adminPasswordUpdate
  const response = adminUserPasswordUpdate(authUserId.authUserId, oldPassword, newPassword);
  return res.status(200).json(response);
});

/** POST
 * Route for /v2/admin/quiz - POST
 *
 * Given basic details about a new quiz, create one for the logged in user
 */
app.post('/v2/admin/quiz', (req: Request, res: Response) => {
  // Request token as a header
  const token = req.headers.token as string;
  // Retrieve userId for the token
  const userId = idFromToken(token);
  const authUserId = userId as AuthUserId;
  // Request name and description as parameters
  const { name, description } = req.body;
  // Call and return quizId from adminQuizCreate
  const response = adminQuizCreate(authUserId.authUserId, name, description);
  return res.status(200).json(response);
});

/** GET
 * Route for /v2/admin/quiz/list - GET
 *
 * Provide a list of all quizzes that are owned by the currently logged in user
 */
app.get('/v2/admin/quiz/list', (req: Request, res: Response) => {
  // Request token as a header
  const token = req.headers.token as string;
  // Retrieve userId for the token
  const userId = idFromToken(token);
  const authUserId = userId as AuthUserId;
  // Call and return list of quizzes from adminQuizList
  const quizList = adminQuizList(authUserId.authUserId);
  return res.status(200).json(quizList);
});

/** DELETE
 * Route for /v2/admin/quiz/:quizid - DELETE
 *
 * Given a particular quiz, send it to the trash
 */

app.delete('/v2/admin/quiz/:quizid', (req: Request, res: Response) => {
  // Parses quizId to int
  const quizId = parseInt(req.params.quizid);
  // Requests token as a header
  const token = req.headers.token as string;
  // Retrieves user for the token
  const userId = idFromToken(token);
  const authUserId = userId as AuthUserId;
  // Call and return adminQuizRemove
  const response = adminQuizRemove(authUserId.authUserId, quizId);
  return res.status(200).json(response);
});

/** GET
 * Route for /v2/admin/quiz/:quizid - GET
 *
 * Get all of the relevant information about the current quiz including questions.
 */
app.get('/v2/admin/quiz/:quizid', (req: Request, res: Response) => {
  // Parses quizId to int
  const quizId = parseInt(req.params.quizid);
  // Requests token as a header
  const token = req.headers.token as string;
  // Retrieves user for the token
  const userId = idFromToken(token);
  const authUserId = userId as AuthUserId;
  // Call and return info for the quiz
  const response = adminQuizInfo(authUserId.authUserId, quizId);
  return res.status(200).json(response);
});

/** PUT
 * Route for /v2/admin/quiz/:quizid/description - PUT
 *
 * Update the description of the relevant quiz
 */
app.put('/v2/admin/quiz/:quizid/description', (req: Request, res: Response) => {
  // Parses quizId to int
  const quizId = parseInt(req.params.quizid);
  // Requests params from body
  const { description } = req.body;
  // Requests token as a header
  const token = req.headers.token as string;
  const userId = idFromToken(token);
  const authUserId = userId as AuthUserId;
  // Calls and returns an empty object from adminQuizDescriptionUpdate
  const response = adminQuizDescriptionUpdate(authUserId.authUserId, quizId, description);
  return res.status(200).json(response);
});

/** PUT
 * Route for /v2/admin/quiz/:quizid/name - PUT
 *
 * Update the name of the relevant quiz
 */
app.put('/v2/admin/quiz/:quizid/name', (req: Request, res: Response) => {
  // Parses quizId to int
  const quizId = parseInt(req.params.quizid);
  // Requests parameters from body
  const { name } = req.body;
  // Request token as a header
  const token = req.headers.token as string;
  // Retrieves userId for the token
  const userId = idFromToken(token);
  const authUserId = userId as AuthUserId;
  // Calls and returns an empty object from adminQuizNameUpdate
  const response = adminQuizNameUpdate(authUserId.authUserId, quizId, name);
  return res.status(200).json(response);
});

/** POST
 * Route for /v2/admin/quiz/:quizid/restore - POST
 *
 * Restore a particular quiz from the trash back to an active quiz.
 */
app.post('/v2/admin/quiz/:quizid/restore', (req: Request, res: Response) => {
  // Parses quizId to int
  const quizId = parseInt(req.params.quizid);
  // Request token as a header
  const token = req.headers.token as string;
  // Retrieves userid for the token
  const userId = idFromToken(token);
  const authUserId = userId as AuthUserId;
  // Calls and returns trashQuizRestore
  const response = trashQuizRestore(authUserId.authUserId, quizId);
  return res.status(200).json(response);
});

/** DELETE
 * Route for /v2/admin/quiz/trash/empty - DELETE
 *
 * Permanently delete specific quizzes currently sitting in the trash
 */
app.delete('/v2/admin/quiz/trash/empty', (req: Request, res: Response) => {
  // Requests quizIdString as a query
  const quizIdString = req.query.quizIds as string;
  // Parse it as a JSON object
  const quizIds = JSON.parse(quizIdString);
  // Requests token as a header
  const token = req.headers.token as string;
  // Retrieve userId for the token
  const userId = idFromToken(token);
  const authUserId = userId as AuthUserId;
  // Call and returns trashEmpty
  const response = trashEmpty(authUserId.authUserId, quizIds);
  return res.status(200).json(response);
});

/** POST
 * Route for /v2/admin/quiz/:quizid/transfer - POST
 *
 * Transfer ownership of a quiz to a different user based on their email
 */
app.post('/v2/admin/quiz/:quizid/transfer', (req: Request, res: Response) => {
  // Parse quizId to int
  const quizId = parseInt(req.params.quizid);
  // Request params from body
  const { userEmail } = req.body;
  // Request token as a header
  const token = req.headers.token as string;
  // Retrieves userId for the token
  const userId = idFromToken(token);
  const authUserId = userId as AuthUserId;
  // Calls and returns adminQuizTransfer
  const response = adminQuizTransfer(authUserId.authUserId, quizId, userEmail);
  return res.status(200).json(response);
});

/** POST
 * Route for /v2/admin/quiz/:quizid/question - POST
 *
 * Create a new stub question for a particular quiz.
 */
app.post('/v2/admin/quiz/:quizid/question', (req: Request, res: Response) => {
  // Parse quizid to int
  const quizId = parseInt(req.params.quizid);
  // Request params from body
  const { questionBody } = req.body;
  // Request token as a header
  const token = req.headers.token as string;
  // Retrieve userid for the token
  const userId = idFromToken(token);
  const authUserId = userId as AuthUserId;
  // Call and return adminQuizQuestionCreate
  const response = adminQuizQuestionCreate(quizId, authUserId.authUserId, questionBody);
  return res.status(200).json(response);
});

/** PUT
 * Route for /v2/admin/quiz/:quizid/question/:questionid - PUT
 *
 * Update the relevant details of a particular question within a quiz.
 */
app.put('/v2/admin/quiz/:quizid/question/:questionid', (req: Request, res: Response) => {
  // Parse quizid to int
  const quizId = parseInt(req.params.quizid);
  // Parse questionid to int
  const questionId = parseInt(req.params.questionid);
  // Request params from body
  const { questionBody } = req.body;
  // Request token as a header
  const token = req.headers.token as string;
  // Retrieve userid for the token
  const userId = idFromToken(token);
  const authUserId = userId as AuthUserId;
  // Call and return adminQuizQuestionUpdate
  const response = adminQuizQuestionUpdate(quizId, questionId, authUserId.authUserId, questionBody);
  return res.status(200).json(response);
});

/** DELETE
 * Route for /v2/admin/quiz/:quizid/question/:questionid - DELETE
 *
 * Delete a particular question from a quiz
 */
app.delete('/v2/admin/quiz/:quizid/question/:questionid', (req: Request, res: Response) => {
  // Parse quizid to int
  const quizId = parseInt(req.params.quizid);
  // Parse questionid to int
  const questionId = parseInt(req.params.questionid);
  // Request token as header
  const token = req.headers.token as string;
  // Retrieve userid for the token
  const userId = idFromToken(token);
  const authUserId = userId as AuthUserId;
  // Call and return adminQuizQuestionRemove
  const response = adminQuizQuestionRemove(quizId, questionId, authUserId.authUserId);
  return res.status(200).json(response);
});

/** PUT
 * Route for /v2/admin/quiz/:quizid/question/:questionid/move - PUT
 *
 * Move a question from one particular position in the quiz to another
 */
app.put('/v2/admin/quiz/:quizid/question/:questionid/move', (req: Request, res: Response) => {
  // Parse quizid to int
  const quizId = parseInt(req.params.quizid);
  // Parse questionid to int
  const questionId = parseInt(req.params.questionid);
  // Request params from body
  const { newPosition } = req.body;
  // Request token as a header
  const token = req.headers.token as string;
  // Retrieve userid for the token
  const userId = idFromToken(token);
  const authUserId = userId as AuthUserId;
  // Call and return adminQuizQuestionMove
  const response = adminQuizQuestionMove(quizId, questionId, authUserId.authUserId, newPosition);
  return res.status(200).json(response);
});

/** POST
 * Route for /v2/admin/quiz/:quizid/question/:questionid/duplicate - POST
 *
 * A particular question gets duplicated to immediately after
 * where the source question is
 */
app.post('/v2/admin/quiz/:quizid/question/:questionid/duplicate', (req: Request, res: Response) => {
  // Parse quizid to int
  const quizId = parseInt(req.params.quizid);
  // Parse questionid to int
  const questionId = parseInt(req.params.questionid);
  // Request token as a header
  const token = req.headers.token as string;
  // Retrieve userid for the token
  const userId = idFromToken(token);
  const authUserId = userId as AuthUserId;
  // Call and return adminQuizQuestionDuplicate
  const response = adminQuizQuestionDuplicate(quizId, questionId, authUserId.authUserId);
  return res.status(200).json(response);
});

/** PUT
 * Request for /v1/admin/quiz/:quizid/thumbnail - PUT
 *
 * Update the thumbnail for the quiz. When this route is called,
 * the timeLastEdited is updated.
 */
app.put('/v1/admin/quiz/:quizid/thumbnail', (req: Request, res: Response) => {
  // Parse quizId as int
  const quizId = parseInt(req.params.quizid);
  // Request thumbnail from body
  const thumbnail = req.body.imgUrl as string;
  // Request token as a header
  const token = req.headers.token as string;
  // Retrieve userid for the token
  const userId = idFromToken(token);
  const authUserId = userId as AuthUserId;
  // Call and return adminQuizThumbnailUpdate
  const response = adminQuizThumbnailUpdate(authUserId.authUserId, quizId, thumbnail);
  return res.status(200).json(response);
});

/**
 * Request for /v1/admin/quiz/:quizid/session/start
 *
 * Start a session
 */
app.post('/v1/admin/quiz/:quizid/session/start', (req: Request, res: Response) => {
  // Parse quizId as int
  const quizId = parseInt(req.params.quizid);
  // Get autoStartNum from body
  const startNumString = req.body.autoStartNum as string;
  const autoStartNum = parseInt(startNumString);
  // Get token as a header
  const token = req.headers.token as string;
  // Retrieve userid for the token
  const userId = idFromToken(token);
  const authUserId = userId as AuthUserId;

  const response = adminQuizSessionCreate(authUserId.authUserId, quizId, autoStartNum);
  return res.status(200).json(response);
});

/**
 * Request for /v1/admin/quiz/:quizid/sessions
 *
 * List sessions
 */
app.get('/v1/admin/quiz/:quizid/sessions', (req: Request, res: Response) => {
  // Parse quizId as int
  const quizId = parseInt(req.params.quizid);
  // Get token as a header
  const token = req.headers.token as string;
  // Retrieve userid for the token
  const userId = idFromToken(token);
  const authUserId = userId as AuthUserId;

  const response = sessionsList(authUserId.authUserId, quizId);
  return res.status(200).json(response);
});

/**
 * Request for /v1/admin/quiz/:quizId/session/:sessionid
 *
 * Change state of a session
 */
app.put('/v1/admin/quiz/:quizid/session/:sessionid', (req: Request, res: Response) => {
  // Parse quizId as int
  const quizId = parseInt(req.params.quizid);
  const sessionId = parseInt(req.params.sessionid);

  const action = parseInt(req.body.action);
  // Get token as a header
  const token = req.headers.token as string;
  // Retrieve userid for the token
  const userId = idFromToken(token);
  const authUserId = userId as AuthUserId;

  const response = sessionStateUpdate(authUserId.authUserId, quizId, sessionId, action);
  return res.status(200).json(response);
});

/**
 * Request for /v1/admin/quiz/:quizid/session/:sessionid
 *
 * Get status of a session and its info
 */
app.get('/v1/admin/quiz/:quizid/session/:sessionid', (req: Request, res: Response) => {
  // Parse quizId as int
  const quizId = parseInt(req.params.quizid);
  const sessionId = parseInt(req.params.sessionid);
  // Get token as a header
  const token = req.headers.token as string;
  // Retrieve userid for the token
  const userId = idFromToken(token);
  const authUserId = userId as AuthUserId;

  const response = sessionStatus(authUserId.authUserId, quizId, sessionId);
  return res.status(200).json(response);
});

/** GET
 * Request for /v1/admin/quiz/:quizid/session/:sessionid/results
 *
 * Get the final results for all players for a completed quiz session
 */
app.get('/v1/admin/quiz/:quizid/session/:sessionid/results', (req: Request, res: Response) => {
  // Parse quizId to int
  const quizId = parseInt(req.params.quizid);
  // Parse sessionId to int
  const sessionId = parseInt(req.params.sessionid);
  // Request token from header
  const token = req.headers.token as string;
  // Retrieve userid for the token
  const userId = idFromToken(token);
  const authUserId = userId as AuthUserId;
  // Call and return sessionResults
  const response = sessionResults(userId.authUserId, quizId, sessionId);
  return res.status(200).json(response);
});

/** POST
 * Request for /v1/player/join
 *
 * Allow a guest player to join a session.
 */
app.post('/v1/player/join', (req: Request, res: Response) => {
  // Parse sessionId to int
  const sessionId = parseInt(req.body.sessionId);
  // Request name from body
  const name = req.body.name as string;
  // Call and return playerJoin
  const response = playerJoin(sessionId, name);
  return res.status(200).json(response);
});

/** GET
 * Request for /v1/player/{playerid}
 *
 * Get the status of a guest player that has already joined a session.
 */
app.get('/v1/player/:playerid', (req: Request, res: Response) => {
  // Parse playerId to int
  const playerId = parseInt(req.params.playerid);
  // Call and return playerStatus
  const response = playerStatus(playerId);
  return res.status(200).json(response);
});

// ====================================================================
//  ================= WORK IS DONE ABOVE THIS LINE ===================
// ====================================================================
// For handling errors
app.use(errorHandler());

// start server
const server = app.listen(PORT, HOST, () => {
  // DO NOT CHANGE THIS LINE
  console.log(`⚡️ Server started on port ${PORT} at ${HOST}`);
});

// For coverage, handle Ctrl+C gracefully
process.on('SIGINT', () => {
  server.close(() => console.log('Shutting down server gracefully.'));
});
