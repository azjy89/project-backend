import { getData, setData } from './dataStore';
import {
  Data,
  Player,
  PlayerId,
  States,
  Actions,
} from './interfaces';
import {
  sessionStateUpdate,
} from './quiz';
import HTTPError from 'http-errors';

export function playerSubmitAnswer(playerId: number, questionPosition: number, answerIds: number[]): object | ErrorObject {
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
  
  if (player.state !== QUESTION_OPEN) {
    throw HTTPError(400, 'Session is not in QUESTION_OPEN state');
  }

  if (currentQuizSession.atQuestion !== questionPosition) {
    throw new HTTPError(400, 'Session is not yet up to this question');
  }

  const validAnswerIds = currentQuestion.answers.map(answer => answer.answerId);
  const invalidAnswerIds = answerIds.filter(id => !validAnswerIds.includes(id));
  if (invalidAnswerIds.length > 0) {
    return HTTPError(400, 'Answer IDs are not valid for this particular question.');
  }

  if (new Set(answerIds).size !== answerIds.length || answerIds.length < 1) {
    return HTTPError(400, 'Duplicate answer IDs provided or less than 1 answer ID submitted.');
  }

  //setdata
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

  data.questionResults.push(questionResult);
  setData(data);
  return {};
}

function checkPlayerAnswer(playerId: number, question: Question, answerIds: number[]): boolean {
  const submittedIds = answerIds.sort();
  const correctIds = question.answers.filter(answer => answer.correct).map(answer => answer.answerId).sort();
  return JSON.stringify(submittedIds) === JSON.stringify(correctIds);
}

function calculateAverageAnswerTime(quizSession: QuizSession, question: Question): number {
  
  //get duration

  return averageAnswerTime;
}