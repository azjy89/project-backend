import { clear } from './other.js';
import { adminQuizList, adminQuizCreate, adminQuizRemove } from './quiz.js';
import { adminAuthRegister } from './auth.js';


beforeEach(() => {
    clear();
});


describe('adminQuizList', () => {
    beforeEach(() => {
        let user = adminAuthRegister('quiz@unsw.edu.au', 
        'abcd1234', 'Bobby', 'Dickens');
        let quiz1 = adminQuizCreate(user.userId, 'COMP1531', 'Welcome!');
        let quiz2 = adminQuizCreate(user.userId, 'asdfasdf', 'Welcome!');
    });

    test('correct output of list of quizzes', () => {
        expect(adminQuizList(user.userId)).toStrictEqual({
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
        let user1 = adminAuthRegister('quiz1@unsw.edu.au', 
        'abcd1234', 'Stephen', 'Robertson');
        let quiz3 = adminQuizCreate(user1.userId, 'BOBBY', 'HELLO');
        let quiz4 = adminQuizCreate(user1.userId, 'LOLLY', 'alksdjf');
        expect(adminQuizList(user1.userId)).toStrictEqual({
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
    
    test('authUserId doesnt exist', () => {
        expect(adminQuizList(user.userId + 1)).toStrictEqual( {error: expect.any(String)} );
    });

});



describe('adminQuizCreate', () => {
    test('successful quiz creation', () => {
        let user = adminAuthRegister('quiz@unsw.edu.au', 
        'abcd1234', 'Bobby', 'Dickens');
        let quiz = adminQuizCreate(user.userId, 'COMP1531', 'Welcome!');
        expect(quiz).toStrictEqual( {quizId: expect.any(Number)} );
    });

    test('authUserId doesnt exist', () => {
        let user = adminAuthRegister('quiz@unsw.edu.au', 
        'abcd1234', 'Bobby', 'Dickens');
        let quiz = adminQuizCreate(user.userId + 1, 'COMP1531', 'Welcome!');
        expect(quiz).toStrictEqual( {error: expect.any(String)} );
    });

    test.each([
        { name: ''},
        { name: '1'},
        { name: 'a12'},
        { name: 'Abcdef123'},
        { name: 'Bob the Builder'},
        { name: 'Abaklwjef++++__....!!'},
        { name: '-()*()$@&%)@(^*!'},
        { name: 'ghijklmnopqrstuvwxyz1234125176'},
        { name: 'ghijklmnopqrstuvwxyz1234125176123512351235'},
    ])("checking name restrictions: '$name'", ({ name }) => {
        let user = adminAuthRegister('quiz@unsw.edu.au', 
        'abcd1234', 'Bobby', 'Dickens');
        let quiz = adminQuizCreate(user.userId, name, 'Welcome!');
        expect(quiz).toStrictEqual( {error: expect.any(String)} );
    });

    test('name is already being used', () => {
        let user = adminAuthRegister('quiz@unsw.edu.au', 
        'abcd1234', 'Bobby', 'Dickens');
        let quiz1 = adminQuizCreate(user.userId, 'COMP1531', 'Welcome!');
        let quiz2 = adminQuizCreate(user.userId, 'COMP1531', 'Blahblah!');
        expect(quiz2).toStrictEqual( {error: expect.any(String)} );
    });

    test('two different users can have same quizname', () => {
        let user1 = adminAuthRegister('quiz1@unsw.edu.au', 
        'abcd1234', 'Bobby', 'Dickens');
        let user2 = adminAuthRegister('quiz2@unsw.edu.au', 
        'abcd1234', 'Sobby', 'Mickens');
        let quiz1 = adminQuizCreate(user1.userId, 'COMP1531', 'Welcome!');
        let quiz2 = adminQuizCreate(user2.userId, 'COMP1531', 'BLAHBLAH');
        expect(quiz2).toStrictEqual( {quizId: expect.any(Number)} );
    });
});

describe('adminQuizRemove', () => {
    beforeEach(() => {
        let user = adminAuthRegister('quiz@unsw.edu.au', 
        'abcd1234', 'Bobby', 'Dickens');
        let quiz = adminQuizCreate(user.userId, 'COMP1531', 'Welcome!');
    });

    test('successful removal of quiz', () => {
        expect(adminQuizRemove(user.userId, quiz.quizId)).toEqual( {} );
        expect(adminQuizList(user.userId)).toStrictEqual({
            quizzes: [
            ]
        });
    });

    test('authUserId doesnt exist', () => {
        expect(adminQuizRemove(user.userId + 1, quiz.quizId)).toStrictEqual( {error: expect.any(String)} );
    });

    test('quizId doesnt refer to a valid quiz', () => {
        expect(adminQuizRemove(user.userId, quiz.quizId + 1)).toStrictEqual( {error: expect.any(String)} );
    });

    test('quiz doesnt belong to this user', () => {
        let user1 = adminAuthRegister('quiz1@unsw.edu.au', 
        'abcd1234', 'Robby', 'Smith');
        let quiz1 = adminQuizCreate(user.userId, 'HAHA1531', 'Welcome!');
        expect(adminQuizRemove(user.userId, quiz.quizId)).toStrictEqual( {error: expect.any(String)});
    });
});



