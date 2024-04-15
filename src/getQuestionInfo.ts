import { getData } from './dataStore';
import {
  Data, 
  States, 
  Actions, 
  Player, 
  QuizSession, 
  Quiz
} from './interfaces';

import HTTPError from 'http-errors';

export function questionInfo(playerId: number, questionPosition: number): object | ErrorObject {
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

  if () { //session is not currently on this question
    throw HTTPError(400, 'session is not currently on this question');
  }
  if (player.state == LOBBY || player.state == QUESTION_COUNTDOWN || player.state == END) {
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
}