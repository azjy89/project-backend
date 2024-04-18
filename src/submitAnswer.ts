import { getData, setData } from './dataStore';
import {
  Data,
  Player,
  States,
  ErrorObject,
  Quiz,
  QuestionResult,
  QuizSession,
} from './interfaces';

import HTTPError from 'http-errors';

export const playerSubmitAnswer = (playerId: number, questionPosition: number, answerIds: number[]): object | ErrorObject => {
  const data: Data = getData();
  let currSession: QuizSession;
  let currPlayerIndex: number;
  let isValidPlayerId = false;
  let currPlayer: Player;
  for (const [, session] of data.quizSessions.entries()) {
    for (const [playerIndex, player] of session.players.entries()) {
      if (player.playerId === playerId) {
        currSession = session;
        currPlayerIndex = playerIndex;
        currPlayer = player;
        isValidPlayerId = true;
      }
    }
  }

  if (!isValidPlayerId) {
    throw HTTPError(400, 'Player ID does not exist');
  }
  const quiz: Quiz = currSession.quiz;

  if (questionPosition < 1 || questionPosition > quiz.questions.length) {
    throw HTTPError(400, 'Question position is not valid for the session this player is in');
  }
  const currentQuestion = quiz.questions[questionPosition - 1];

  if (currSession.state !== States.QUESTION_OPEN) {
    throw HTTPError(400, 'Session is not in QUESTION_OPEN state');
  }

  if (currSession.atQuestion !== questionPosition) {
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

  const question = currSession.quiz.questions[currSession.atQuestion - 1];
  let playersCorrectList: Player[] = [];
  if (currSession.questionResults[currSession.atQuestion - 1]) {
    playersCorrectList = currSession.questionResults[currSession.atQuestion - 1].playersCorrectList;
  }

  for (const answerId of answerIds) {
    const answer = question.answers.find(answer => answer.answerId === answerId);
    if (answer.correct) {
      playersCorrectList.push(currPlayer);
      break;
    }
  }

  const percentCorrect: number = (playersCorrectList.length / currSession.players.length) * 100;

  let numAnswered = 0;
  for (const player of currSession.players) {
    if (player.answeredQuestionIds.find(answeredQuestionId => answeredQuestionId === question.questionId)) {
      numAnswered++;
    }
  }

  const currQuestionResult = currSession.questionResults.find(questionResult => questionResult.questionId === question.questionId);
  let averageAnswerTime: number;
  const answerTime = Math.floor(Date.now() / 1000) - currSession.questionStartTimes[questionPosition - 1];
  if (numAnswered === 0) {
    averageAnswerTime = answerTime;
  } else {
    averageAnswerTime = (answerTime + (numAnswered * currQuestionResult.averageAnswerTime)) / (numAnswered + 1);
  }

  currSession.players[currPlayerIndex].answeredQuestionIds.push(question.questionId);
  const questionResult: QuestionResult = {
    questionId: currentQuestion.questionId,
    playersCorrectList: playersCorrectList,
    averageAnswerTime: averageAnswerTime,
    percentCorrect: percentCorrect
  };

  currSession.questionResults[questionPosition - 1] = questionResult;
  setData(data);
  return {};
};
