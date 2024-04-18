import { getData } from './dataStore';
import {
  ErrorObject,
  Data,
  Quiz,
  States,
  Player,
  QuizSession,
} from './interfaces';

import HTTPError from 'http-errors';

export const getQuestionInfo = (playerId: number, questionPosition: number): object | ErrorObject => {
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
  const question = quiz.questions[questionPosition - 1];

  if (currentQuizSession.atQuestion !== questionPosition) { // session is not currently on this question
    throw HTTPError(400, 'session is not currently on this question');
  }

  if (currentQuizSession.state === States.LOBBY || currentQuizSession.state === States.QUESTION_COUNTDOWN || currentQuizSession.state === States.END) {
    throw HTTPError(400, 'session not working');
  }

  const questionInfo = {
    questionId: question.questionId,
    question: question.question,
    duration: question.duration,
    thumbnailUrl: question.thumbnailUrl,
    points: question.points,
    answers: question.answers.map(answer => ({
      answerId: answer.answerId,
      answer: answer.answer,
      colour: answer.colour
    }))
  };
  return questionInfo;
};
