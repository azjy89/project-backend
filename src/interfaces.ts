// Error interface
export interface ErrorObject {
  error: string
}

// User interface
export interface User {
  userId: number,
  nameFirst: string,
  nameLast: string,
  email: string,
  password: string,
  numSuccessfulLogins: number,
  numFailedPasswordsSinceLastLogin: number,
  oldPasswords: string[]
}

// Quiz interface
export interface Quiz {
  quizId: number,
  name: string,
  ownerId: number,
  timeCreated: number,
  timeLastEdited: number,
  description: string,
  questions: Question[],
  duration: number,
  thumbnailUrl: string,
}

// Token interface
export interface Token {
  token: string,
  userId: number
}
// AuthUserId interface
export interface AuthUserId {
  authUserId: number
}

// QuizId interface
export interface QuizId {
  quizId: number
}
// UserDetails interface (return type)
export interface UserDetails {
  user: {
    userId: number,
    name: string,
    email: string,
    numSuccessfulLogins: number,
    numFailedPasswordsSinceLastLogin: number
  }
}

// Token return type
export interface TokenReturn {
  token: string
}

// Quiz summarised in this form
export interface QuizListNameId {
  quizId: number,
  name: string
}

// adminQuizList return type
export interface AdminQuizListReturn {
  quizzes: QuizListNameId[]
}

// questionBody input type
export interface QuestionBody {
  question: string,
  duration: number,
  thumbnailUrl: string,
  points: number,
  answers: AnswerInput[],
}

// AnswerInput type
export interface AnswerInput {
  answer: string,
  correct: boolean
}

// questionid return type
export interface QuestionId {
  questionId: number
}

export interface DupedQuestionId {
  newQuestionId: number
}

export interface TrashQuizListReturn {
  quizzes: QuizListNameId[]
}

export interface Player {
  playerId: number,
  name: string,
  score: number,
  state: States,
  numQuestions: number,
  atQuestion: number,
}

export interface Message {
  messageBody: string,
  playerId: number,
  playerName: string,
  timeSent: number,
}

export interface QuestionResult {
  questionId: number,
  playersCorrectList: Player[],
  averageAnswerTime: number,
  percentCorrect: number,
}

export interface QuizSession {
  sessionId: number,
  quizId: number,
  atQuestion: number,
  autoStartNum: number,
  state: States,
  players: Player[],
  messages: Message[],
  quiz: Quiz,
  questionResults: QuestionResult[],
  questionStartTimes: number[],
}

export interface Timer {
  timerId: ReturnType<typeof setTimeout>,
  sessionId: number,
}

export interface Timers {
  timers: Timer[];
}

// DataStore interface
export interface Data {
  users: User[],
  quizzes: Quiz[],
  tokens: Token[],
  trash: Quiz[],
  quizSessions: QuizSession[],
}

export enum States {
  LOBBY = 'LOBBY',
  QUESTION_COUNTDOWN = 'QUESTION_COUNTDOWN',
  QUESTION_OPEN = 'QUESTION_OPEN',
  QUESTION_CLOSE = 'QUESTION_CLOSE',
  ANSWER_SHOW = 'ANSWER_SHOW',
  FINAL_RESULTS = 'FINAL_RESULTS',
  END = 'END',
}

export enum Actions {
  NEXT_QUESTION = 'NEXT_QUESTION',
  SKIP_COUNTDOWN = 'SKIP_COUNTDOWN',
  GO_TO_ANSWER = 'GO_TO_ANSWER',
  GO_TO_FINAL_RESULTS = 'GO_TO_FINAL_RESULTS',
  END = 'END',
}

export interface SessionId {
  sessionId: number,
}

export interface SessionList {
  activeSessions: number[],
  inactiveSessions: number[],
}

export interface SessionStatus {
  state: States,
  atQuestion: number,
  players: Player[],
  metadata: AdminQuizInfoReturn,
}

export interface Answer {
  answerId: number,
  answer: string,
  colour: string,
  correct: boolean
}

export interface Question {
  questionId: number,
  question: string,
  duration: number,
  thumbnailUrl: string,
  points: number,
  answers: Answer[],
}

export interface QuizInfo {
  quizId: number,
  name: string,
  timeCreated: number,
  timeLastEdited: number,
  description: string,
  question: Question[],
  duration: number,
  thumbnailUrl: string,
}

export interface AdminQuizInfoReturn {
  quizId: number,
  name: string,
  timeCreated: number,
  timeLastEdited: number,
  description: string,
  numQuestions: number,
  questions: Question[]
  duration: number,
  thumbnailUrl: string,
}

export interface PlayerId {
  playerId: number,
}

export interface ReturnPlayerStatus {
  state: string,
  numQuestions: number,
  atQuestion: number,
}

export interface MessagesListReturn {
  messages: Message[],
}
