import {
  requestAuthRegister,
  requestQuizList,
  requestQuizCreate,
  requestQuizRemove,
  requestQuizInfo,
  requestQuizNameUpdate,
  requestQuizDescriptionUpdate,
  requestQuizQuestionCreate,
  requestQuizQuestionUpdate,
  requestClear,
  requestQuizTransfer,
  requestQuizQuestionRemove,
  requestQuizQuestionMove,
  requestQuizQuestionDuplicate,
  requestTrashQuizList
} from './httpRequests';
import {
  TokenReturn,
  QuizId,
  Quiz,
  QuestionBody,
  QuestionId,
  Question,
  AdminQuizInfoReturn
} from './interfaces';

beforeEach(() => {
  requestClear();
});

describe('requestQuizList', () => {
  test('correct output of list of quizzes', () => {
    const resToken: TokenReturn = requestAuthRegister('quiz@unsw.edu.au',
      'abcd1234', 'Bobby', 'Dickens');
    const quiz1 = requestQuizCreate(resToken.token, 'COMP1531', 'Welcome!');
    const quiz2 = requestQuizCreate(resToken.token, 'asdfasdf', 'Welcome!');
    expect(requestQuizList(resToken.token)).toStrictEqual({
      quizzes: [
        {
          quizId: quiz1.quizId,
          name: 'COMP1531',
        },
        {
          quizId: quiz2.quizId,
          name: 'asdfasdf',
        },
      ]
    });
    const resToken2 = requestAuthRegister('quiz1@unsw.edu.au',
      'abcd1234', 'Stephen', 'Robertson');
    const quiz3 = requestQuizCreate(resToken2.token, 'BOBBY', 'HELLO');
    const quiz4 = requestQuizCreate(resToken2.token, 'LOLLY', 'alksdjf');
    expect(requestQuizList(resToken2.token)).toStrictEqual({
      quizzes: [
        {
          quizId: quiz3.quizId,
          name: 'BOBBY',
        },
        {
          quizId: quiz4.quizId,
          name: 'LOLLY',
        },
      ]
    });
  });

  test('token doesnt exist', () => {
    expect(requestQuizList('bob')).toStrictEqual({ error: expect.any(String) });
  });
});

describe('requestQuizCreate', () => {
  test('successful quiz creation', () => {
    const resToken = requestAuthRegister('quiz@unsw.edu.au',
      'abcd1234', 'Bobby', 'Dickens');
    const quiz = requestQuizCreate(resToken.token, 'COMP1531', 'Welcome!');
    expect(quiz).toStrictEqual({ quizId: expect.any(Number) });
  });

  test('token doesnt exist', () => {
    const quiz = requestQuizCreate('1', 'COMP1531', 'Welcome!');
    expect(quiz).toStrictEqual({ error: expect.any(String) });
  });

  test.each([
    { name: '' },
    { name: '1' },
    { name: 'Abaklwjef++++__....!!' },
    { name: '-()*()$@&%)@(^*!' },
    { name: 'ghijklmnopqrstuvwxyz1234125176123512351235' },
  ])("checking name restrictions: '$name'", ({ name }) => {
    const resToken = requestAuthRegister('quiz@unsw.edu.au',
      'abcd1234', 'Bobby', 'Dickens');
    const quiz = requestQuizCreate(resToken.token, name, 'Welcome!');
    expect(quiz).toStrictEqual({ error: expect.any(String) });
  });

  test('name is already being used', () => {
    const resToken = requestAuthRegister('quiz@unsw.edu.au',
      'abcd1234', 'Bobby', 'Dickens');
    // eslint-disable-next-line
    const quiz1 = requestQuizCreate(resToken.token, 'COMP1531', 'Welcome!');
    const quiz2 = requestQuizCreate(resToken.token, 'COMP1531', 'Blahblah!');
    expect(quiz2).toStrictEqual({ error: expect.any(String) });
  });

  test('two different users can have same quizname', () => {
    const resToken = requestAuthRegister('quiz1@unsw.edu.au',
      'abcd1234', 'Bobby', 'Dickens');
    const resToken2 = requestAuthRegister('quiz2@unsw.edu.au',
      'abcd1234', 'Sobby', 'Mickens');
    // eslint-disable-next-line
    const quiz1 = requestQuizCreate(resToken.token, 'COMP1531', 'Welcome!');
    const quiz2 = requestQuizCreate(resToken2.token, 'COMP1531', 'BLAHBLAH');
    expect(quiz2).toStrictEqual({ quizId: expect.any(Number) });
  });

  test('description is over 100 characters long', () => {
    const description = `Twinkle twinkle little star, how I wonder what you are. 
        Up above the world so high. Like a diamond in the sky. Twinkle twinkle 
        little star, how I wonder what you are.`;
    const resToken = requestAuthRegister('quiz@unsw.edu.au',
      'abcd1234', 'Bobby', 'Dickens');
    const quiz = requestQuizCreate(resToken.token, 'COMP1531', description);
    expect(quiz).toStrictEqual({ error: expect.any(String) });
  });
});

describe('requestQuizRemove', () => {
  test('successful removal of quiz', () => {
    const resToken = requestAuthRegister('quiz@unsw.edu.au',
      'abcd1234', 'Bobby', 'Dickens');
    const quiz = requestQuizCreate(resToken.token, 'COMP1531', 'Welcome!');
    expect(requestQuizRemove(resToken.token, quiz.quizId)).toEqual({});
    expect(requestQuizList(resToken.token)).toStrictEqual({
      quizzes: []
    });
    expect(requestTrashQuizList(resToken.token)).toStrictEqual({
      quizzes: [
        {
          quizId: quiz.quizId,
          name: 'COMP1531',
        }
      ]
    });
  });

  test('token doesnt exist', () => {
    const resToken = requestAuthRegister('quiz@unsw.edu.au',
      'abcd1234', 'Bobby', 'Dickens');
    const quiz = requestQuizCreate(resToken.token, 'COMP1531', 'Welcome!');
    expect(requestQuizRemove('1', quiz.quizId)).toStrictEqual({ error: expect.any(String) });
  });

  test('quizId doesnt refer to a valid quiz', () => {
    const resToken = requestAuthRegister('quiz@unsw.edu.au',
      'abcd1234', 'Bobby', 'Dickens');
    const quiz = requestQuizCreate(resToken.token, 'COMP1531', 'Welcome!');
    expect(requestQuizRemove(resToken.token, quiz.quizId + 1)).toStrictEqual({ error: expect.any(String) });
  });

  test('quiz doesnt belong to this user', () => {
    const resToken = requestAuthRegister('quiz@unsw.edu.au',
      'abcd1234', 'Bobby', 'Dickens');
    const resToken2 = requestAuthRegister('quiz1@unsw.edu.au',
      'abcd1234', 'Robby', 'Smith');
    const quiz1 = requestQuizCreate(resToken2.token, 'HAHA1531', 'Welcome!');
    expect(requestQuizRemove(resToken.token, quiz1.quizId)).toStrictEqual({ error: expect.any(String) });
  });
});

describe('requestQuizInfo', () => {
  test('Quiz info retrieved successfully', () => {
    const resToken = requestAuthRegister('quiz@unsw.edu.au', 'abcd1234', 'Bobby', 'Dickens');
    const quizId = requestQuizCreate(resToken.token, 'COMP1531', 'Welcome!');
    const quizInfo = requestQuizInfo(resToken.token, quizId.quizId);
    // Define the expected quiz information structure
    const expectedQuizInfo: AdminQuizInfoReturn = {
      quizId: expect.any(Number),
      name: 'COMP1531',
      timeCreated: expect.any(Number),
      timeLastEdited: expect.any(Number),
      description: 'Welcome!',
      numQuestions: 0,
      questions: [],
    };

    // Compare quizInfo object with the expected quiz information structure
    expect(quizInfo).toStrictEqual(expectedQuizInfo);
  });

  // Error checks
  test('Token is not a token', () => {
    const resToken = requestAuthRegister('quiz@unsw.edu.au', 'abcd1234', 'Bobby', 'Dickens');
    const quizId = requestQuizCreate(resToken.token, 'COMP1531', 'Welcome!');
    expect(requestQuizInfo('1', quizId.quizId)).toStrictEqual({ error: expect.any(String) });
  });

  test('Quiz ID does not refer to a valid quiz', () => {
    const resToken = requestAuthRegister('quiz@unsw.edu.au', 'abcd1234', 'Bobby', 'Dickens');
    const quizId = requestQuizCreate(resToken.token, 'COMP1531', 'Welcome!');
    expect(requestQuizInfo(resToken.token, quizId.quizId + 1)).toStrictEqual({ error: expect.any(String) });
  });

  test('quiz doesnt belong to this user', () => {
    const resToken = requestAuthRegister('quiz@unsw.edu.au', 'abcd1234', 'Bobby', 'Smith');
    const resToken2 = requestAuthRegister('quiz1@unsw.edu.au', 'abcd1234', 'Robby', 'Smith');
    const quizId1 = requestQuizCreate(resToken2.token, 'COMP1531', 'Welcome!');
    expect(requestQuizInfo(resToken.token, quizId1.quizId)).toStrictEqual({ error: expect.any(String) });
  });
});

describe('requestQuizNameUpdate', () => {
  // Successful Check
  test('Successful Quiz Name Update', () => {
    const resToken = requestAuthRegister('quiz@unsw.edu.au', 'abcd1234', 'Bobby', 'Dickens');
    const quizId = requestQuizCreate(resToken.token, 'COMP1531', 'Welcome!');
    expect(requestQuizNameUpdate(resToken.token, quizId.quizId, 'newName')).toEqual({});
    const quizInfo = requestQuizInfo(resToken.token, quizId.quizId);
    expect(quizInfo.name).toStrictEqual('newName');
  });

  // Error Checks

  test('Token is not a token', () => {
    const resToken = requestAuthRegister('quiz@unsw.edu.au', 'abcd1234', 'Bobby', 'Dickens');
    const quizId = requestQuizCreate(resToken.token, 'COMP1531', 'Welcome!');
    expect(requestQuizNameUpdate('1', quizId.quizId, 'newName')).toEqual({ error: expect.any(String) });
  });

  test('Quiz ID does not refer to a valid quiz', () => {
    const resToken = requestAuthRegister('quiz@unsw.edu.au', 'abcd1234', 'Bobby', 'Dickens');
    const quizId = requestQuizCreate(resToken.token, 'COMP1531', 'Welcome!');
    expect(requestQuizNameUpdate(resToken.token, quizId.quizId + 1, 'newName')).toEqual({ error: expect.any(String) });
  });

  test('quiz doesnt belong to this user', () => {
    const resToken = requestAuthRegister('quiz@unsw.edu.au', 'abcd1234', 'Bobby', 'Smith');
    const resToken2 = requestAuthRegister('quiz1@unsw.edu.au', 'abcd1234', 'Robby', 'Smith');
    const quizId1 = requestQuizCreate(resToken2.token, 'COMP1531', 'Welcome!');
    expect(requestQuizNameUpdate(resToken.token, quizId1.quizId, 'name')).toStrictEqual({ error: expect.any(String) });
  });

  test.each([
    { name: '' },
    { name: '1' },
    { name: 'Abaklwjef++++__....!!' },
    { name: '-()*()$@&%)@(^*!' },
    { name: 'ghijklmnopqrstuvwxyz1234125176123512351235' },
  ])("checking name restrictions: '$name'", ({ name }) => {
    const resToken = requestAuthRegister('quiz@unsw.edu.au',
      'abcd1234', 'Bobby', 'Dickens');
    const quizId = requestQuizCreate(resToken.token, name, 'Welcome!');
    expect(quizId).toStrictEqual({ error: expect.any(String) });
    const updateQuizName = requestQuizNameUpdate(resToken.token, quizId.quizId, name);
    expect(updateQuizName).toStrictEqual({ error: expect.any(String) });
  });

  test('name is already being used', () => {
    const resToken = requestAuthRegister('quiz@unsw.edu.au',
      'abcd1234', 'Bobby', 'Dickens');
    // eslint-disable-next-line
    const quizId1 = requestQuizCreate(resToken.token, 'COMP1531', 'Welcome!');
    const quizId2 = requestQuizCreate(resToken.token, 'bahahaha', 'Blahblah!');
    expect(requestQuizNameUpdate(resToken.token, quizId2.quizId, 'COMP1531!')).toStrictEqual({ error: expect.any(String) });
  });
});

describe('requestQuizDescriptionUpdate', () => {
  test('Check successful update quiz description', () => {
    const resToken = requestAuthRegister('quiz@unsw.edu.au',
      'abcd1234', 'John', 'Dickens');
    const quiz = requestQuizCreate(resToken.token, 'COMP1531',
      'Write a descrition for this quiz.');
    const quizDescription = requestQuizDescriptionUpdate(resToken.token,
      quiz.quizId, 'New Description.');
    expect(quizDescription).toStrictEqual({});
    const quizInfo = requestQuizInfo(resToken.token, quiz.quizId);
    expect(quizInfo.description).toStrictEqual('New Description.');
  });

  test('Token is not a token', () => {
    const resToken = requestAuthRegister('quiz@unsw.edu.au',
      'abcd1234', 'John', 'Dickens');
    const quiz = requestQuizCreate(resToken.token, 'COMP1531',
      'Write a descrition for this quiz.');
    expect(requestQuizDescriptionUpdate('1', quiz.quizId,
      'Description.')).toStrictEqual({ error: expect.any(String) });
  });

  test('Quiz ID does not refer to a valid quiz', () => {
    const resToken = requestAuthRegister('quiz@unsw.edu.au',
      'abcd1234', 'John', 'Dickens');
    const quiz = requestQuizCreate(resToken.token, 'COMP1531',
      'Write a descrition for this quiz.');
    expect(requestQuizDescriptionUpdate(resToken.token, quiz.quizId + 1,
      'Description.')).toStrictEqual({ error: expect.any(String) });
  });

  test('Quiz ID does not refer to a quiz that this user owns', () => {
    const resToken = requestAuthRegister('quiz@unsw.edu.au',
      'abcd1234', 'John', 'Dickens');
    const resToken2 = requestAuthRegister('xyz@unsw.edu.au',
      'abcd1234', 'Henry', 'Duckens');
    const quiz2 = requestQuizCreate(resToken2.token, 'COMP1531',
      'Write a descrition for the quiz.');
    expect(requestQuizDescriptionUpdate(resToken.token, quiz2.quizId,
      'Description.')).toStrictEqual({ error: expect.any(String) });
  });

  test('Description is more than 100 characters in length.', () => {
    const resToken = requestAuthRegister('quiz@unsw.edu.au',
      'abcd1234', 'John', 'Dickens');
    const quiz = requestQuizCreate(resToken.token, 'COMP1531',
      'Write a descrition for this quiz.');
    expect(requestQuizDescriptionUpdate(resToken.token, quiz.quizId,
      `How much wood can a wood chucker chuck wood? I don't actually know 
      but that was a great character count filler.`
    )).toStrictEqual({ error: expect.any(String) });
  });
});

describe('requestQuizQuestionCreate', () => {
  let resToken: TokenReturn;
  let quiz1: QuizId;
  beforeEach(() => {
    resToken = requestAuthRegister('quiz@unsw.edu.au', 'abcd1234', 'Bobby', 'Dickens');
    quiz1 = requestQuizCreate(resToken.token, 'COMP1531', 'Welcome!');
  });
  // Invalid Question Body
  test.each([
    // question string less than 5 characters
    {
      questionBody: {
        question: 'ABC',
        duration: 4,
        points: 4,
        answers: [
          {
            answer: 'Bobby the builder',
            correct: true
          },
          {
            answer: 'Bobby the breaker',
            correct: false
          }
        ]
      }
    },
    // question string greater than 50 characters
    {
      questionBody: {
        question: 'You fill me up until you are empty, I took too much and you let me. Maybe youll be happier with someone else, maybe loving me is the reason you can love yourself',
        duration: 4,
        points: 4,
        answers: [
          {
            answer: 'Bobby the builder',
            correct: true
          },
          {
            answer: 'Bobby the breaker',
            correct: false
          }
        ]
      }
    },
    // question has more than 6 answers
    {
      questionBody: {
        question: 'When are you going to sleep?',
        duration: 4,
        points: 4,
        answers: [
          {
            answer: 'Bobby the builder',
            correct: true
          },
          {
            answer: 'Bobby the breaker',
            correct: false
          },
          {
            answer: 'Bobby the maker',
            correct: false
          },
          {
            answer: 'Bobby the baker',
            correct: false
          },
          {
            answer: 'Bobby the creator',
            correct: false
          },
          {
            answer: 'Bobby the owner',
            correct: false
          },
          {
            answer: 'Bobby the barker',
            correct: false
          },
        ]
      }
    },
    // question has less than 2 answers
    {
      questionBody: {
        question: 'When are you going to sleep?',
        duration: 4,
        points: 4,
        answers: [
          {
            answer: 'Bobby the builder',
            correct: true
          },
        ]
      }
    },
    // question duration is not a postive number
    {
      questionBody: {
        question: 'When are you going to sleep?',
        duration: -1,
        points: 4,
        answers: [
          {
            answer: 'Bobby the builder',
            correct: true
          },
          {
            answer: 'Bobby the breaker',
            correct: false
          }
        ]
      }
    },
    // question duration for one question is too long
    {
      questionBody: {
        question: 'When are you going to sleep?',
        duration: 9999,
        points: 4,
        answers: [
          {
            answer: 'Bobby the builder',
            correct: true
          },
          {
            answer: 'Bobby the breaker',
            correct: false
          }
        ]
      }
    },
    // question points is less than 1
    {
      questionBody: {
        question: 'When are you going to sleep?',
        duration: 4,
        points: 0,
        answers: [
          {
            answer: 'Bobby the builder',
            correct: true
          },
          {
            answer: 'Bobby the breaker',
            correct: false
          }
        ]
      }
    },
    // question points is greater than 10
    {
      questionBody: {
        question: 'When are you going to sleep?',
        duration: 4,
        points: 11,
        answers: [
          {
            answer: 'Bobby the builder',
            correct: true
          },
          {
            answer: 'Bobby the breaker',
            correct: false
          }
        ]
      }
    },
    // question answer less than 1 character long
    {
      questionBody: {
        question: 'When are you going to sleep?',
        duration: 4,
        points: 4,
        answers: [
          {
            answer: '',
            correct: true
          },
          {
            answer: 'Bobby the breaker',
            correct: false
          }
        ]
      }
    },
    // question answer is longer than 30 characters
    {
      questionBody: {
        question: 'When are you going to sleep?',
        duration: 4,
        points: 4,
        answers: [
          {
            answer: 'Bobby the builder',
            correct: true
          },
          {
            answer: 'But when i get back to my room and i shut the door, everything hits me at once. i know your not coming back to me, its not enough just knowing this is how it has to be',
            correct: false
          }
        ]
      }
    },
    // question has duplicate answers
    {
      questionBody: {
        question: 'When are you going to sleep?',
        duration: 4,
        points: 4,
        answers: [
          {
            answer: 'Bobby the builder',
            correct: true
          },
          {
            answer: 'Bobby the builder',
            correct: false
          }
        ]
      }
    },
    // question has no correct answers
    {
      questionBody: {
        question: 'When are you going to sleep?',
        duration: 4,
        points: 4,
        answers: [
          {
            answer: 'Bobby the builder',
            correct: false
          },
          {
            answer: 'Bobby the breaker',
            correct: false
          }
        ]
      }
    },
  ])("Invalid question body: '$questionBody'", ({ questionBody }) => {
    expect(requestQuizQuestionCreate(resToken.token, quiz1.quizId, questionBody)).toStrictEqual({ error: expect.any(String) });
  });
  test('token is not a token', () => {
    const questionBody: QuestionBody = {
      question: 'When are you sleeping?',
      duration: 5,
      points: 5,
      answers: [
        {
          answer: 'Bobby the builder',
          correct: true
        },
        {
          answer: 'Bobby the breaker',
          correct: false
        }
      ]
    };
    expect(requestQuizQuestionCreate('1', quiz1.quizId, questionBody)).toStrictEqual({ error: expect.any(String) });
  });
  test('quiz is not owned by user', () => {
    const questionBody: QuestionBody = {
      question: 'When are you sleeping?',
      duration: 5,
      points: 5,
      answers: [
        {
          answer: 'Bobby the builder',
          correct: true
        },
        {
          answer: 'Bobby the breaker',
          correct: false
        }
      ]
    };
    const resToken2 = requestAuthRegister('quiz1@unsw.edu.au', 'abcd1234', 'Bob', 'Builder');
    expect(requestQuizQuestionCreate(resToken2.token, quiz1.quizId, questionBody)).toStrictEqual({ error: expect.any(String) });
  });
  test('successful requestQuizQuestionCreate', () => {
    const questionBody: QuestionBody = {
      question: 'When are you sleeping?',
      duration: 5,
      points: 5,
      answers: [
        {
          answer: 'Bobby the builder',
          correct: true
        },
        {
          answer: 'Bobby the breaker',
          correct: false
        }
      ]
    };
    const question = requestQuizQuestionCreate(resToken.token, quiz1.quizId, questionBody);
    expect(question.questionId).toStrictEqual(expect.any(Number));
  });
  test('successful multiple creations', () => {
    const questionBody1: QuestionBody = {
      question: 'When are you sleeping?',
      duration: 5,
      points: 5,
      answers: [
        {
          answer: 'Bobby the builder',
          correct: true
        },
        {
          answer: 'Bobby the breaker',
          correct: false
        }
      ]
    };
    const questionBody2: QuestionBody = {
      question: 'When are you not sleeping?',
      duration: 5,
      points: 5,
      answers: [
        {
          answer: 'Bobby the buulder',
          correct: true
        },
        {
          answer: 'Bobby the breeker',
          correct: false
        }
      ]
    };
    // resToken = requestAuthRegister('quiz@unsw.edu.au', 'abcd1234', 'Bobby', 'Dickens');
    // quiz1 = requestQuizCreate(resToken.token, 'COMP1531', 'Welcome!');

    requestQuizQuestionCreate(resToken.token, quiz1.quizId, questionBody1);
    requestQuizQuestionCreate(resToken.token, quiz1.quizId, questionBody2);
    const info = requestQuizInfo(resToken.token, quiz1.quizId);
    expect(info.quizId).toStrictEqual(expect.any(Number));
    expect(info.name).toStrictEqual('COMP1531');
    expect(info.timeCreated).toStrictEqual(expect.any(Number));
    expect(info.timeLastEdited).toStrictEqual(expect.any(Number));
    expect(info.description).toStrictEqual('Welcome!');
    expect(info.numQuestions).toStrictEqual(2);

    expect(info.questions[0].questionId).toStrictEqual(expect.any(Number));
    expect(info.questions[0].question).toStrictEqual('When are you sleeping?');
    expect(info.questions[0].duration).toStrictEqual(5);
    expect(info.questions[0].points).toStrictEqual(5);
    expect(info.questions[0].answers[0].answerId).toStrictEqual(0);
    expect(info.questions[0].answers[0].answer).toStrictEqual('Bobby the builder');
    expect(info.questions[0].answers[0].colour).toStrictEqual(expect.any(String));
    expect(info.questions[0].answers[0].correct).toStrictEqual(true);
    expect(info.questions[0].answers[1].answerId).toStrictEqual(1);
    expect(info.questions[0].answers[1].answer).toStrictEqual('Bobby the breaker');
    expect(info.questions[0].answers[1].colour).toStrictEqual(expect.any(String));
    expect(info.questions[0].answers[1].correct).toStrictEqual(false);

    expect(info.questions[1].questionId).toStrictEqual(expect.any(Number));
    expect(info.questions[1].question).toStrictEqual('When are you not sleeping?');
    expect(info.questions[1].duration).toStrictEqual(5);
    expect(info.questions[1].points).toStrictEqual(5);
    expect(info.questions[1].answers[0].answerId).toStrictEqual(0);
    expect(info.questions[1].answers[0].answer).toStrictEqual('Bobby the buulder');
    expect(info.questions[1].answers[0].colour).toStrictEqual(expect.any(String));
    expect(info.questions[1].answers[0].correct).toStrictEqual(true);
    expect(info.questions[1].answers[1].answerId).toStrictEqual(1);
    expect(info.questions[1].answers[1].answer).toStrictEqual('Bobby the breeker');
    expect(info.questions[1].answers[1].colour).toStrictEqual(expect.any(String));
    expect(info.questions[1].answers[1].correct).toStrictEqual(false);
  });
});

describe('requestQuizQuestionUpdate', () => {
  let resToken: TokenReturn;
  let quiz1: QuizId;
  let quizQuestion: QuestionId;
  beforeEach(() => {
    resToken = requestAuthRegister('quiz@unsw.edu.au',
      'abcd1234', 'Bobby', 'Dickens');
    quiz1 = requestQuizCreate(resToken.token, 'COMP1531', 'Welcome!');
    const question: QuestionBody = {
      question: 'Who is the Monarch of England?',
      duration: 4,
      points: 5,
      answers: [
        {
          answer: 'Prince Charles',
          correct: true
        },
        {
          answer: 'Queen Elizabeth',
          correct: false
        }
      ]
    };
    quizQuestion = requestQuizQuestionCreate(resToken.token, quiz1.quizId, question);
  });

  test('successful quiz question update', () => {
    const newQuestion: QuestionBody = {
      question: 'Who is the Monarch of England?',
      duration: 4,
      points: 5,
      answers: [
        {
          answer: 'King Charles',
          correct: true
        },
        {
          answer: 'Queen Elizabeth',
          correct: false
        }
      ]
    };
    const updateReturn = requestQuizQuestionUpdate(resToken.token, quiz1.quizId, quizQuestion.questionId, newQuestion);
    expect(updateReturn).toEqual({});
  });

  test('Question Id not valid', () => {
    const newQuestion: QuestionBody = {
      question: 'Who is the Monarch of England?',
      duration: 4,
      points: 5,
      answers: [
        {
          answer: 'King Charles',
          correct: true
        },
        {
          answer: 'Queen Elizabeth',
          correct: false
        }
      ]
    };
    const updateReturn = requestQuizQuestionUpdate(resToken.token, quiz1.quizId,
      quizQuestion.questionId + 1, newQuestion);
    expect(updateReturn).toEqual({ error: expect.any(String) });
  });

  test('Question String Length', () => {
    const newQuestion1: QuestionBody = {
      question: '1234',
      duration: 4,
      points: 5,
      answers: [
        {
          answer: 'King Charles',
          correct: true
        },
        {
          answer: 'Queen Elizabeth',
          correct: false
        }
      ]
    };
    const updateReturn1 = requestQuizQuestionUpdate(resToken.token, quiz1.quizId,
      quizQuestion.questionId, newQuestion1);
    expect(updateReturn1).toEqual({ error: expect.any(String) });
    const updateReturn2 = requestQuizQuestionUpdate(resToken.token, quiz1.quizId,
      quizQuestion.questionId, newQuestion1);
    expect(updateReturn2).toEqual({ error: expect.any(String) });
  });

  test('Question Number Answers', () => {
    const newQuestion1: QuestionBody = {
      question: 'Who is the Monarch of England?',
      duration: 4,
      points: 5,
      answers: [
        {
          answer: 'King Charles',
          correct: true
        }
      ]
    };
    const updateReturn1 = requestQuizQuestionUpdate(resToken.token, quiz1.quizId,
      quizQuestion.questionId, newQuestion1);
    expect(updateReturn1).toEqual({ error: expect.any(String) });
    const newQuestion2: QuestionBody = {
      question: 'Who is the Monarch of England?',
      duration: 4,
      points: 5,
      answers: [
        {
          answer: '1',
          correct: true
        },
        {
          answer: '2',
          correct: false
        },
        {
          answer: '3',
          correct: false
        },
        {
          answer: '4',
          correct: false
        },
        {
          answer: '5',
          correct: false
        },
        {
          answer: '6',
          correct: false
        },
        {
          answer: '7',
          correct: false
        }
      ]
    };
    const updateReturn2 = requestQuizQuestionUpdate(resToken.token, quiz1.quizId,
      quizQuestion.questionId, newQuestion2);
    expect(updateReturn2).toEqual({ error: expect.any(String) });
  });

  test('Non-positive Question Duration', () => {
    const newQuestion1: QuestionBody = {
      question: 'Who is the Monarch of England?',
      duration: 0,
      points: 5,
      answers: [
        {
          answer: 'King Charles',
          correct: true
        },
        {
          answer: 'Queen Elizabeth',
          correct: false
        }
      ]
    };
    const updateReturn = requestQuizQuestionUpdate(resToken.token, quiz1.quizId,
      quizQuestion.questionId, newQuestion1);
    expect(updateReturn).toEqual({ error: expect.any(String) });
    const newQuestion2: QuestionBody = {
      question: 'Who is the Monarch of England?',
      duration: -1,
      points: 5,
      answers: [
        {
          answer: 'King Charles',
          correct: true
        },
        {
          answer: 'Queen Elizabeth',
          correct: false
        }
      ]
    };
    const updateReturn2 = requestQuizQuestionUpdate(resToken.token, quiz1.quizId,
      quizQuestion.questionId, newQuestion2);
    expect(updateReturn2).toEqual({ error: expect.any(String) });
  });

  test('Quiz Time Limit Exceeded', () => {
    const newQuestion1: QuestionBody = {
      question: 'Who is the Monarch of England?',
      duration: 9999,
      points: 5,
      answers: [
        {
          answer: 'King Charles',
          correct: true
        },
        {
          answer: 'Queen Elizabeth',
          correct: false
        }
      ]
    };
    const updateReturn1 = requestQuizQuestionUpdate(resToken.token, quiz1.quizId,
      quizQuestion.questionId, newQuestion1);
    expect(updateReturn1).toEqual({ error: expect.any(String) });
    const newQuestion2: QuestionBody = {
      question: 'Who is the Monarch of England?',
      duration: 181,
      points: 5,
      answers: [
        {
          answer: 'King Charles',
          correct: true
        },
        {
          answer: 'Queen Elizabeth',
          correct: false
        }
      ]
    };
    const updateReturn2 = requestQuizQuestionUpdate(resToken.token, quiz1.quizId,
      quizQuestion.questionId, newQuestion2);
    expect(updateReturn2).toEqual({ error: expect.any(String) });
  });

  test('Invalid Points Awarded', () => {
    const newQuestion1: QuestionBody = {
      question: 'Who is the Monarch of England?',
      duration: 177,
      points: 0,
      answers: [
        {
          answer: 'King Charles',
          correct: true
        },
        {
          answer: 'Queen Elizabeth',
          correct: false
        }
      ]
    };
    const updateReturn1 = requestQuizQuestionUpdate(resToken.token, quiz1.quizId,
      quizQuestion.questionId, newQuestion1);
    expect(updateReturn1).toEqual({ error: expect.any(String) });
    const newQuestion2: QuestionBody = {
      question: 'Who is the Monarch of England?',
      duration: 177,
      points: 11,
      answers: [
        {
          answer: 'King Charles',
          correct: true
        },
        {
          answer: 'Queen Elizabeth',
          correct: false
        }
      ]
    };
    const updateReturn2 = requestQuizQuestionUpdate(resToken.token, quiz1.quizId,
      quizQuestion.questionId, newQuestion2);
    expect(updateReturn2).toEqual({ error: expect.any(String) });
  });

  test('Invalid Answer Length', () => {
    const newQuestion1: QuestionBody = {
      question: 'Who is the Monarch of England?',
      duration: 4,
      points: 5,
      answers: [
        {
          answer: '',
          correct: true
        },
        {
          answer: 'Queen Elizabeth',
          correct: false
        }
      ]
    };
    const updateReturn1 = requestQuizQuestionUpdate(resToken.token, quiz1.quizId,
      quizQuestion.questionId, newQuestion1);
    expect(updateReturn1).toEqual({ error: expect.any(String) });
    const newQuestion2: QuestionBody = {
      question: 'Who is the Monarch of England?',
      duration: 4,
      points: 5,
      answers: [
        {
          answer: 'King Charles',
          correct: true
        },
        {
          answer: '1234512345123451234512345123451',
          correct: false
        }
      ]
    };
    const updateReturn2 = requestQuizQuestionUpdate(resToken.token, quiz1.quizId,
      quizQuestion.questionId, newQuestion2);
    expect(updateReturn2).toEqual({ error: expect.any(String) });
  });

  test('Duplicate Answers', () => {
    const newQuestion1: QuestionBody = {
      question: 'Who is the Monarch of England?',
      duration: 4,
      points: 5,
      answers: [
        {
          answer: 'King Charles',
          correct: true
        },
        {
          answer: 'King Charles',
          correct: false
        }
      ]
    };
    const updateReturn1 = requestQuizQuestionUpdate(resToken.token, quiz1.quizId,
      quizQuestion.questionId, newQuestion1);
    expect(updateReturn1).toEqual({ error: expect.any(String) });
  });

  test('No Correct Answers', () => {
    const newQuestion1: QuestionBody = {
      question: 'Who is the Monarch of England?',
      duration: 4,
      points: 5,
      answers: [
        {
          answer: 'King Charles',
          correct: false
        },
        {
          answer: 'Queen Elizabeth',
          correct: false
        }
      ]
    };
    const updateReturn1 = requestQuizQuestionUpdate(resToken.token, quiz1.quizId,
      quizQuestion.questionId, newQuestion1);
    expect(updateReturn1).toEqual({ error: expect.any(String) });
  });

  test('Invalid Token', () => {
    const newQuestion1: QuestionBody = {
      question: 'Who is the Monarch of England?',
      duration: 4,
      points: 5,
      answers: [
        {
          answer: 'King Charles',
          correct: true
        },
        {
          answer: 'Queen Elizabeth',
          correct: false
        }
      ]
    };
    const updateReturn1 = requestQuizQuestionUpdate('1', quiz1.quizId,
      quizQuestion.questionId, newQuestion1);
    expect(updateReturn1).toEqual({ error: expect.any(String) });
  });

  test('User Does Not Own Quiz', () => {
    const resToken2 = requestAuthRegister('quize@unsw.edu.au',
      'abcd12344', 'Pobby', 'Pickens');
    const newQuestion1: QuestionBody = {
      question: 'Who is the Monarch of England?',
      duration: 4,
      points: 5,
      answers: [
        {
          answer: 'King Charles',
          correct: true
        },
        {
          answer: 'Queen Elizabeth',
          correct: false
        }
      ]
    };
    const updateReturn1 = requestQuizQuestionUpdate(resToken2.token, quiz1.quizId,
      quizQuestion.questionId, newQuestion1);
    expect(updateReturn1).toEqual({ error: expect.any(String) });
  });
});

describe('requestQuizQuestionRemove', () => {
  let resToken: TokenReturn;
  let quiz1: QuizId;
  let quizQuestion: QuestionId;
  beforeEach(() => {
    resToken = requestAuthRegister('quiz@unsw.edu.au',
      'abcd1234', 'Bobby', 'Dickens');
    quiz1 = requestQuizCreate(resToken.token, 'COMP1531', 'Welcome!');
    const question: QuestionBody = {
      question: 'Who is the Monarch of England?',
      duration: 4,
      points: 5,
      answers: [
        {
          answer: 'King Charles',
          correct: true
        },
        {
          answer: 'Queen Elizabeth',
          correct: false
        }
      ]
    };
    quizQuestion = requestQuizQuestionCreate(resToken.token, quiz1.quizId, question);
  });
  test('invalid token', () => {
    expect(requestQuizQuestionRemove('1', quiz1.quizId, quizQuestion.questionId)).toStrictEqual({ error: expect.any(String) });
  });
  test('Successful return and status code', () => {
    const response = requestQuizQuestionDuplicate(resToken.token, quiz1.quizId, quizQuestion.questionId);
    expect(response).toStrictEqual({ newQuestionId: expect.any(Number) });
  });
});

describe('requestQuizQuestionMove', () => {
  let resToken: TokenReturn;
  let quiz1: QuizId;
  let quizQuestion: QuestionId;
  let quizQuestion2: QuestionId;
  beforeEach(() => {
    resToken = requestAuthRegister('quiz@unsw.edu.au',
      'abcd1234', 'Bobby', 'Dickens');
    quiz1 = requestQuizCreate(resToken.token, 'COMP1531', 'Welcome!');
    const question: QuestionBody = {
      question: 'Who is the Monarch of England?',
      duration: 4,
      points: 5,
      answers: [
        {
          answer: 'King Charles',
          correct: true
        },
        {
          answer: 'Queen Elizabeth',
          correct: false
        }
      ]
    };
    const question2: QuestionBody = {
      question: 'Who is the PM of England?',
      duration: 4,
      points: 5,
      answers: [
        {
          answer: 'Theresa May',
          correct: false
        },
        {
          answer: 'Rishi Sunak',
          correct: true
        }
      ]
    };
    quizQuestion = requestQuizQuestionCreate(resToken.token, quiz1.quizId, question);
    quizQuestion2 = requestQuizQuestionCreate(resToken.token, quiz1.quizId, question2);
  });

  test('successful quiz question move', () => {
    expect(requestQuizQuestionMove(resToken.token, quiz1.quizId, quizQuestion.questionId, 1)).toEqual({});
    const quizInfo = requestQuizInfo(resToken.token, quiz1.quizId);
    expect(quizInfo.timeLastEdited).toEqual(expect.any(Number));
  });

  test('Question Id Invalid', () => {
    expect(requestQuizQuestionMove(resToken.token, quiz1.quizId + 1, quizQuestion2.questionId, 1)).toEqual({ error: expect.any(String) });
    const quizInfo = requestQuizInfo(resToken.token, quiz1.quizId);
    expect(quizInfo.timeLastEdited).toEqual(expect.any(Number));
  });

  test('Invalid Position', () => {
    // too great
    expect(requestQuizQuestionMove(resToken.token, quiz1.quizId, quizQuestion2.questionId, 2)).toEqual({ error: expect.any(String) });
    const quizInfo1 = requestQuizInfo(resToken.token, quiz1.quizId);
    expect(quizInfo1.timeLastEdited).toEqual(expect.any(Number));
    // too small
    expect(requestQuizQuestionMove(resToken.token, quiz1.quizId, quizQuestion.questionId, -1)).toEqual({ error: expect.any(String) });
    const quizInfo2 = requestQuizInfo(resToken.token, quiz1.quizId);
    expect(quizInfo2.timeLastEdited).toEqual(expect.any(Number));
    // cant be same
    expect(requestQuizQuestionMove(resToken.token, quiz1.quizId, quizQuestion.questionId, 0)).toEqual({ error: expect.any(String) });
    const quizInfo3 = requestQuizInfo(resToken.token, quiz1.quizId);
    expect(quizInfo3.timeLastEdited).toEqual(expect.any(Number));
  });

  test('Invalid Token', () => {
    expect(requestQuizQuestionMove('1', quiz1.quizId, quizQuestion.questionId, 1)).toEqual({ error: expect.any(String) });
    const quizInfo = requestQuizInfo(resToken.token, quiz1.quizId);
    expect(quizInfo.timeLastEdited).toEqual(expect.any(Number));
  });

  test('User Does Not Own Quiz', () => {
    const resToken2 = requestAuthRegister('quiz1@unsw.edu.au',
      'abcd12344', 'Pobby', 'Pickens');
    expect(requestQuizQuestionMove(resToken2.token, quiz1.quizId, quizQuestion.questionId, 1)).toEqual({ error: expect.any(String) });
    const quizInfo = requestQuizInfo(resToken.token, quiz1.quizId);
    expect(quizInfo.timeLastEdited).toEqual(expect.any(Number));
  });
});

describe('requestQuizQuestionDuplicate', () => {
  let resToken: TokenReturn;
  let quiz1: QuizId;
  let question: Question;
  beforeEach(() => {
    resToken = requestAuthRegister('quiz@unsw.edu.au', 'abcd1234', 'Bobby', 'Dickens');
    quiz1 = requestQuizCreate(resToken.token, 'COMP1531', 'Welcome!');
    const questionBody: QuestionBody = {
      question: 'When are you sleeping?',
      duration: 5,
      points: 5,
      answers: [
        {
          answer: 'Bobby the builder',
          correct: true
        },
        {
          answer: 'Bobby the breaker',
          correct: false
        }
      ]
    };
    question = requestQuizQuestionCreate(resToken.token, quiz1.quizId, questionBody);
  });

  test('Invalid Question ID', () => {
    const response = requestQuizQuestionDuplicate(resToken.token, quiz1.quizId, question.questionId + 2);
    expect(response).toStrictEqual({ error: expect.any(String) });
  });

  test('Invalid Token', () => {
    const response = requestQuizQuestionDuplicate('1', quiz1.quizId, question.questionId);
    expect(response).toStrictEqual({ error: expect.any(String) });
  });

  test('Valid token; quiz not owned by user. (userId not found in quiz)', () => {
    const user2 = requestAuthRegister('quiz1@unsw.edu.au', 'abcd12344', 'Pobby', 'Pickens');
    const response = requestQuizQuestionDuplicate(user2.token, quiz1.quizId, question.questionId);
    expect(response).toStrictEqual({ error: expect.any(String) });
  });

  test('Successful return', () => {
    const response = requestQuizQuestionDuplicate(resToken.token, quiz1.quizId, question.questionId);
    expect(response).toStrictEqual({ newQuestionId: expect.any(Number) });
  });
});

// adminQuizTransfer:
// Goal: Transfer 'user' quiz to 'user2'.
describe('Testing PUT /v1/admin/quiz/{quizId}/transfer', () => {
  let user: TokenReturn;
  let quiz: Quiz;
  let user2: TokenReturn;
  let quiz2: Quiz;
  beforeEach(() => {
    // return a token
    user = requestAuthRegister('first@unsw.edu.au', 'FirstUser123', 'First', 'User');
    // return a quizIdy
    quiz = requestQuizCreate(user.token, 'COMP1531', 'A description of my quiz');
    // create second user
    user2 = requestAuthRegister('second@unsw.edu.au', 'SecondUser123', 'Second', 'User');
    quiz2 = requestQuizCreate(user2.token, 'COMP1511', 'A description of my quiz');
  });

  test('userEmail is not a real user', () => {
    const response = requestQuizTransfer(user2.token, quiz2.quizId, 'notReal@unsw.edu.au');
    expect(response).toStrictEqual({ error: expect.any(String) });
  });
  test('userEmail is the currently logged in user.', () => {
    const response = requestQuizTransfer(user.token, quiz.quizId, 'first@unsw.edu.au');
    expect(response).toStrictEqual({ error: expect.any(String) });
  });
  test('quiz name same as target\'s quiz name', () => {
    // user3 has different same quiz name as user.
    const user3 = requestAuthRegister('third@unsw.edu.au', 'ThirdUser123', 'Third', 'User');
    // eslint-disable-next-line
    const quiz3 = requestQuizCreate(user3.token, 'COMP1531', 'A description of my quiz');
    const response = requestQuizTransfer(user.token, quiz.quizId, 'third@unsw.edu.au');
    expect(response).toStrictEqual({ error: expect.any(String) });
  });

  test('Invalid Token', () => {
    // first user
    const response = requestQuizTransfer('1', quiz.quizId, 'first@unsw.edu.au');
    // expect(response.statusCode).toStrictEqual(401);
    expect(response).toStrictEqual({ error: expect.any(String) });
    // second user
    const response2 = requestQuizTransfer('1', quiz2.quizId, 'second@unsw.edu.au');
    // expect(response2.statusCode).toStrictEqual(401);
    expect(response2).toStrictEqual({ error: expect.any(String) });
  });

  test('Valid token; quiz not owned by user. (userId not found in quiz)', () => {
    // first user (testing the user who is transfering quiz)
    const response = requestQuizTransfer(user.token, quiz.quizId + 1, 'first@unsw.edu.au');
    // expect(response.statusCode).toStrictEqual(403);
    expect(response).toStrictEqual({ error: expect.any(String) });
  });

  test('Successful return and status code', () => {
    // Transfer: first user's token, second user's email, first user's quizId.
    const response = requestQuizTransfer(user.token, quiz.quizId, 'second@unsw.edu.au');
    // expect(response.statusCode).toStrictEqual(200);
    expect(response).toStrictEqual({});
    const quizInfo = requestQuizInfo(user2.token, quiz.quizId);
    expect(quizInfo).toStrictEqual({
      quizId: quiz.quizId,
      name: 'COMP1531',
      timeCreated: expect.any(Number),
      timeLastEdited: expect.any(Number),
      description: 'A description of my quiz',
      numQuestions: 0,
      questions: [],
    });
  });
});
