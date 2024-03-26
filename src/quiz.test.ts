import { requestAuthRegister, requestQuizList, requestQuizCreate, requestQuizRemove, requestQuizInfo, requestQuizNameUpdate, requestQuizDescriptionUpdate, requestQuizQuestionCreate, requestQuizQuestionUpdate, requestClear } from './httpRequests';
import { TokenReturn, QuizId, Quiz, QuestionBody, QuestionId } from './interfaces'
import { string } from 'yaml/dist/schema/common/string';
beforeEach(() => {
  requestClear();
});

describe('requestQuizList', () => {
  test('correct output of list of quizzes', () => {
    const resToken = requestAuthRegister('quiz@unsw.edu.au',
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
    const resToken = requestAuthRegister('quiz@unsw.edu.au',
      'abcd1234', 'Bobby', 'Dickens');
    const quiz1 = requestQuizCreate(resToken.token, 'COMP1531', 'Welcome!');
    const quiz2 = requestQuizCreate(resToken.token, 'asdfasdf', 'Welcome!');
    expect(requestQuizList('1')).toStrictEqual({ error: expect.any(String) });
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
    const resToken = requestAuthRegister('quiz@unsw.edu.au',
      'abcd1234', 'Bobby', 'Dickens');
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
    const quiz1 = requestQuizCreate(resToken.token, 'COMP1531', 'Welcome!');
    const quiz2 = requestQuizCreate(resToken.token, 'COMP1531', 'Blahblah!');
    expect(quiz2).toStrictEqual({ error: expect.any(String) });
  });

  test('two different users can have same quizname', () => {
    const resToken = requestAuthRegister('quiz1@unsw.edu.au',
      'abcd1234', 'Bobby', 'Dickens');
    const resToken2 = requestAuthRegister('quiz2@unsw.edu.au',
      'abcd1234', 'Sobby', 'Mickens');
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
    const expectedQuizInfo = {
      quizId: expect.any(Number),
      name: 'COMP1531', // Assuming 'name' property is available in quizInfo
      timeCreated: expect.any(Number),
      timeLastEdited: expect.any(Number),
      description: 'Welcome!'
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
    const quizId1 = requestQuizCreate(resToken.token, 'COMP1531', 'Welcome!');
    const quizId2 = requestQuizCreate(resToken.token, 'bahahaha', 'Blahblah!');
    expect(requestQuizNameUpdate(resToken.token, quizId2.quizId, 'COMP1531!')).toStrictEqual({ error: expect.any(String) });
  });
});

describe('requestQuizDescriptionUpdate', () => {
  test('Check successful update quiz descrition', () => {
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
    const quiz = requestQuizCreate(resToken.token, 'COMP1531',
      'Write a descrition for this quiz.');
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

describe('requestQuizQuestionUpdate', () => {
  let resToken: TokenReturn;
  let quiz1: QuizId;
  let quizQuestion: QuestionId;
  beforeEach(() => {
    resToken = requestAuthRegister('quiz@unsw.edu.au',
    'abcd1234', 'Bobby', 'Dickens');
    quiz1 = requestQuizCreate(resToken.token, 'COMP1531', 'Welcome!');
    const question: QuestionBody = {
      question: "Who is the Monarch of England?",
      duration: 4,
      points: 5,
      answers: [
        {
          answer: "Prince Charles",
          correct: true
        },
        {
          answer: "Queen Elizabeth",
          correct: false
        }
      ]
    }
    quizQuestion = requestQuizQuestionCreate(resToken.token, quiz1.quizId, question);
  });

  test('successful quiz question udpate', () => {
    const newQuestion: QuestionBody = {
      question: "Who is the Monarch of England?",
      duration: 4,
      points: 5,
      answers: [
        {
          answer: "King Charles",
          correct: true
        },
        {
          answer: "Queen Elizabeth",
          correct: false
        }
      ]
    }
    const updateReturn = requestQuizQuestionUpdate(resToken.token, quiz1.quizId, quizQuestion.questionId, newQuestion);
    expect(updateReturn).toEqual({});
  });

  test('Question Id not valid', () => {
    const newQuestion: QuestionBody = {
      question: "Who is the Monarch of England?",
      duration: 4,
      points: 5,
      answers: [
        {
          answer: "King Charles",
          correct: true
        },
        {
          answer: "Queen Elizabeth",
          correct: false
        }
      ]
    }
    const updateReturn = requestQuizQuestionUpdate(resToken.token, quiz1.quizId, 
      quizQuestion.questionId + 1, newQuestion);
    expect(updateReturn).toEqual({ error: expect.any(string) });
  });

  test('Question String Length', () => {
    const newQuestion1: QuestionBody = {
      question: "1234",
      duration: 4,
      points: 5,
      answers: [
        {
          answer: "King Charles",
          correct: true
        },
        {
          answer: "Queen Elizabeth",
          correct: false
        }
      ]
    }
    const updateReturn1 = requestQuizQuestionUpdate(resToken.token, quiz1.quizId, 
      quizQuestion.questionId, newQuestion1);
    expect(updateReturn1).toEqual({ error: expect.any(string) });
    const newQuestion2: QuestionBody = {
      question: "123451234512345123451234512345123451234512345123451",
      duration: 4,
      points: 5,
      answers: [
        {
          answer: "King Charles",
          correct: true
        },
        {
          answer: "Queen Elizabeth",
          correct: false
        }
      ]
    }
    const updateReturn2 = requestQuizQuestionUpdate(resToken.token, quiz1.quizId, 
      quizQuestion.questionId, newQuestion1);
    expect(updateReturn2).toEqual({ error: expect.any(string) });
  });

  test('Question Number Answers', () => {
    const newQuestion1: QuestionBody = {
      question: "Who is the Monarch of England?",
      duration: 4,
      points: 5,
      answers: [
        {
          answer: "King Charles",
          correct: true
        }
      ]
    }
    const updateReturn1 = requestQuizQuestionUpdate(resToken.token, quiz1.quizId, 
      quizQuestion.questionId, newQuestion1);
    expect(updateReturn1).toEqual({ error: expect.any(string) });
    const newQuestion2: QuestionBody = {
      question: "Who is the Monarch of England?",
      duration: 4,
      points: 5,
      answers: [
        {
          answer: "1",
          correct: true
        },
        {
          answer: "2",
          correct: false
        },
        {
          answer: "3",
          correct: false
        },
        {
          answer: "4",
          correct: false
        },
        {
          answer: "5",
          correct: false
        },
        {
          answer: "6",
          correct: false
        },
        {
          answer: "7",
          correct: false
        }
      ]
    }
    const updateReturn2 = requestQuizQuestionUpdate(resToken.token, quiz1.quizId, 
      quizQuestion.questionId, newQuestion2);
    expect(updateReturn2).toEqual({ error: expect.any(string) });
  });

  test('Non-positive Question Duration', () => {
    const newQuestion1: QuestionBody = {
      question: "Who is the Monarch of England?",
      duration: 0,
      points: 5,
      answers: [
        {
          answer: "King Charles",
          correct: true
        },
        {
          answer: "Queen Elizabeth",
          correct: false
        }
      ]
    }
    const updateReturn = requestQuizQuestionUpdate(resToken.token, quiz1.quizId, 
      quizQuestion.questionId, newQuestion1);
    expect(updateReturn).toEqual({ error: expect.any(string) });
    const newQuestion2: QuestionBody = {
      question: "Who is the Monarch of England?",
      duration: -1,
      points: 5,
      answers: [
        {
          answer: "King Charles",
          correct: true
        },
        {
          answer: "Queen Elizabeth",
          correct: false
        }
      ]
    }
    const updateReturn2 = requestQuizQuestionUpdate(resToken.token, quiz1.quizId, 
      quizQuestion.questionId, newQuestion2);
    expect(updateReturn2).toEqual({ error: expect.any(string) });
  });

  test('Quiz Time Limit Exceeded', () => {
    const newQuestion1: QuestionBody = {
      question: "Who is the Monarch of England?",
      duration: 177,
      points: 5,
      answers: [
        {
          answer: "King Charles",
          correct: true
        },
        {
          answer: "Queen Elizabeth",
          correct: false
        }
      ]
    }
    const updateReturn1 = requestQuizQuestionUpdate(resToken.token, quiz1.quizId, 
      quizQuestion.questionId, newQuestion1);
    expect(updateReturn1).toEqual({ error: expect.any(string) });
    const newQuestion2: QuestionBody = {
      question: "Who is the Monarch of England?",
      duration: 181,
      points: 5,
      answers: [
        {
          answer: "King Charles",
          correct: true
        },
        {
          answer: "Queen Elizabeth",
          correct: false
        }
      ]
    }
    const updateReturn2 = requestQuizQuestionUpdate(resToken.token, quiz1.quizId, 
      quizQuestion.questionId, newQuestion2);
    expect(updateReturn2).toEqual({ error: expect.any(string) });
  });

  test('Invalid Points Awarded', () => {
    const newQuestion1: QuestionBody = {
      question: "Who is the Monarch of England?",
      duration: 177,
      points: 0,
      answers: [
        {
          answer: "King Charles",
          correct: true
        },
        {
          answer: "Queen Elizabeth",
          correct: false
        }
      ]
    }
    const updateReturn1 = requestQuizQuestionUpdate(resToken.token, quiz1.quizId, 
      quizQuestion.questionId, newQuestion1);
    expect(updateReturn1).toEqual({ error: expect.any(string) });
    const newQuestion2: QuestionBody = {
      question: "Who is the Monarch of England?",
      duration: 177,
      points: 11,
      answers: [
        {
          answer: "King Charles",
          correct: true
        },
        {
          answer: "Queen Elizabeth",
          correct: false
        }
      ]
    }
    const updateReturn2 = requestQuizQuestionUpdate(resToken.token, quiz1.quizId, 
      quizQuestion.questionId, newQuestion2);
    expect(updateReturn2).toEqual({ error: expect.any(string) });
  });

  test('Invalid Answer Length', () => {
    const newQuestion1: QuestionBody = {
      question: "Who is the Monarch of England?",
      duration: 4,
      points: 5,
      answers: [
        {
          answer: "",
          correct: true
        },
        {
          answer: "Queen Elizabeth",
          correct: false
        }
      ]
    }
    const updateReturn1 = requestQuizQuestionUpdate(resToken.token, quiz1.quizId, 
      quizQuestion.questionId, newQuestion1);
    expect(updateReturn1).toEqual({ error: expect.any(string) });
    const newQuestion2: QuestionBody = {
      question: "Who is the Monarch of England?",
      duration: 4,
      points: 5,
      answers: [
        {
          answer: "King Charles",
          correct: true
        },
        {
          answer: "1234512345123451234512345123451",
          correct: false
        }
      ]
    }
    const updateReturn2 = requestQuizQuestionUpdate(resToken.token, quiz1.quizId, 
      quizQuestion.questionId, newQuestion2);
    expect(updateReturn2).toEqual({ error: expect.any(string) });
  });

  test('Duplicate Answers', () => {
    const newQuestion1: QuestionBody = {
      question: "Who is the Monarch of England?",
      duration: 4,
      points: 5,
      answers: [
        {
          answer: "King Charles",
          correct: true
        },
        {
          answer: "King Charles",
          correct: false
        }
      ]
    }
    const updateReturn1 = requestQuizQuestionUpdate(resToken.token, quiz1.quizId, 
      quizQuestion.questionId, newQuestion1);
    expect(updateReturn1).toEqual({ error: expect.any(string) });
  });

  test('No Correct Answers', () => {
    const newQuestion1: QuestionBody = {
      question: "Who is the Monarch of England?",
      duration: 4,
      points: 5,
      answers: [
        {
          answer: "King Charles",
          correct: true
        },
        {
          answer: "Queen Elizabeth",
          correct: false
        }
      ]
    }
    const updateReturn1 = requestQuizQuestionUpdate(resToken.token, quiz1.quizId, 
      quizQuestion.questionId, newQuestion1);
    expect(updateReturn1).toEqual({ error: expect.any(string) });
  })

  test('Invalid Token', () => {
    const newQuestion1: QuestionBody = {
      question: "Who is the Monarch of England?",
      duration: 4,
      points: 5,
      answers: [
        {
          answer: "King Charles",
          correct: true
        },
        {
          answer: "Queen Elizabeth",
          correct: false
        }
      ]
    }
    const updateReturn1 = requestQuizQuestionUpdate('1', quiz1.quizId, 
      quizQuestion.questionId, newQuestion1);
    expect(updateReturn1).toEqual({ error: expect.any(string) });
  })

  test('User Does Not Own Quiz', () => {
    const resToken2 = requestAuthRegister('quize@unsw.edu.au',
    'abcd12344', 'Pobby', 'Pickens')
    const newQuestion1: QuestionBody = {
      question: "Who is the Monarch of England?",
      duration: 4,
      points: 5,
      answers: [
        {
          answer: "King Charles",
          correct: true
        },
        {
          answer: "Queen Elizabeth",
          correct: false
        }
      ]
    }
    const updateReturn1 = requestQuizQuestionUpdate(resToken2.token, quiz1.quizId, 
      quizQuestion.questionId, newQuestion1);
    expect(updateReturn1).toEqual({ error: expect.any(string) });
  })
});