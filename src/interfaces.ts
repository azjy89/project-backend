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

// adminQuizInfo return type
export interface AdminQuizInfoReturn {
  quizId: number,
  name: string,
  timeCreated: number,
  timeLastEdited: number,
  description: string
}

// Question type
export interface Question {
  questionBody: QuestionBody,
  questionId: number
}

// questionBody input type
export interface QuestionBody {
  question: string,
  duration: number,
  points: number,
  answers: AnswerInput[],
  thumbnailUrl: string,
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
  trash: QuizListNameId[]
}

export interface Player {
  playerId: number,
  name: string,
  score: number,
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
  state: string,
  players: Player[],
  messages: Message[],
  quiz: Quiz,
  questionResults: QuestionResult[],
  questionStartTime: number,
}

// DataStore interface
export interface Data {
  users: User[],
  quizzes: Quiz[],
  tokens: Token[],
  trash: Quiz[],
  quizSessions: QuizSession[],
}
