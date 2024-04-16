import { getData, setData } from './dataStore';
import {
  Data,
  Player,
  PlayerId,
  States,
  Actions,
  ErrorObject, 
  Quiz, 
  QuestionResult, 
  QuizSession, 
  Question
} from './interfaces';
import {
  sessionStateUpdate,
} from './quiz';
import HTTPError from 'http-errors';

const checkPlayerAnswer = (playerId: number, question: Question, answerIds: number[]): boolean => {

  const submittedIds = answerIds.slice().sort(); // Make a copy to avoid modifying the original array
  const correctIds = [];
  
  for (const answer of question.answers) {
    if (answer.correct) {
      correctIds.push(answer.answerId);
    }
  }
  
  correctIds.sort();

  return JSON.stringify(submittedIds) === JSON.stringify(correctIds);
}

const calculateAverageAnswerTime = (quizSession: QuizSession, question: Question): number => {
  const questionPosition = quizSession.atQuestion;
  const questionStartTime = quizSession.questionStartTimes[questionPosition - 1];
  const answerTime = Date.now() - questionStartTime;
  return answerTime / 1000;
}

export const playerSubmitAnswer = (playerId: number, questionPosition: number, answerIds: number[]): object | ErrorObject => {
  const data: Data = getData();
  const player: Player | undefined = data.quizSessions
    .flatMap(quizSession => quizSession.players)
    .find(player => player.playerId === playerId);

  if (!player) {
    throw HTTPError(400, 'Player ID does not exist');
  }

  const currentQuizSessionIndex: number = data.quizSessions.findIndex(quizSession =>
    quizSession.players.some(sessionPlayer => sessionPlayer.playerId === playerId)
  );
  const currentQuizSession: QuizSession = data.quizSessions[currentQuizSessionIndex];
  const quiz: Quiz = currentQuizSession.quiz;

  if (questionPosition < 1 || questionPosition > quiz.questions.length) {
    throw HTTPError(400, 'Question position is not valid for the session this player is in');
  }
  const currentQuestion = quiz.questions[questionPosition - 1];
  
  if (currentQuizSession.state !== States.QUESTION_OPEN) {
    throw HTTPError(400, 'Session is not in QUESTION_OPEN state');
  }

  if (currentQuizSession.atQuestion !== questionPosition) {
    throw HTTPError(400, 'Session is not yet up to this question');
  }

  if (answerIds.length < 1) {
    throw HTTPError(400, 'Answer IDs should at least one');
  }

  const validAnswerIds = currentQuestion.answers.map(answer => answer.answerId);
  const invalidAnswerIds = answerIds.filter(id => !validAnswerIds.includes(id));

  if (invalidAnswerIds.length > 0) {
    throw HTTPError(400, 'Answer IDs are not valid for this particular question.');
  }

  if (new Set(answerIds).size !== answerIds.length) {
    throw HTTPError(400, 'Duplicate answer IDs provided or less than 1 answer ID submitted.');
  }

  const playersCorrectList: Player[] = [];
  currentQuizSession.players.forEach(sessionPlayer => {
    const isCorrect = checkPlayerAnswer(sessionPlayer.playerId, currentQuestion, answerIds);
    if (isCorrect) {
      playersCorrectList.push(sessionPlayer);
    }
  })

  const averageAnswerTime = calculateAverageAnswerTime(currentQuizSession, currentQuestion);
  const percentCorrect = (playersCorrectList.length / currentQuizSession.players.length) * 100;

  const questionResult: QuestionResult = {
    questionId: currentQuestion.questionId,
    playersCorrectList: playersCorrectList,
    averageAnswerTime: averageAnswerTime,
    percentCorrect: percentCorrect
  };

  data.quizSessions[currentQuizSessionIndex].questionResults.push(questionResult);
  setData(data);
  return {};
}

