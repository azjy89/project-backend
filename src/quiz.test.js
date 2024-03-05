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
        let quizId1 = adminQuizCreate(user.authUserId, 'COMP1531', 'Welcome!');
        let quizId2 = adminQuizCreate(user.authUserId, 'asdfasdf', 'Welcome!');
    });

    test('correct output of list of quizzes', () => {
        expect(adminQuizList(user.authUserId)).toStrictEqual({
            quizzes: [
                {
                    quizId: quizId1,
                    name: 'COMP1531',
                },
                {
                    quizId: quizId2,
                    name: 'asdfasdf',
                },
            ]
        });
        let user1 = adminAuthRegister('quiz1@unsw.edu.au', 
        'abcd1234', 'Stephen', 'Robertson');
        let quizId3 = adminQuizCreate(user1.authUserId, 'BOBBY', 'HELLO');
        let quizId4 = adminQuizCreate(user1.authUserId, 'LOLLY', 'alksdjf');
        expect(adminQuizList(user1.authUserId)).toStrictEqual({
            quizzes: [
                {
                    quizId: quizId3,
                    name: 'BOBBY',
                },
                {
                    quizId: quizId4,
                    name: 'LOLLY',
                },
            ]
        });
    });
    
    test('authUserId doesnt exist', () => {
        expect(adminQuizList(user.authUserId + 1)).toStrictEqual( {error: expect.any(String)} );
    });

});



describe('adminQuizCreate', () => {
    test('successful quiz creation', () => {
        let user = adminAuthRegister('quiz@unsw.edu.au', 
        'abcd1234', 'Bobby', 'Dickens');
        let quizId = adminQuizCreate(user.authUserId, 'COMP1531', 'Welcome!');
        expect(quizId).toStrictEqual( {quizId: expect.any(Number)} );
    });

    test('authUserId doesnt exist', () => {
        let user = adminAuthRegister('quiz@unsw.edu.au', 
        'abcd1234', 'Bobby', 'Dickens');
        let quizId = adminQuizCreate(user.authUserId + 1, 'COMP1531', 'Welcome!');
        expect(quizId).toStrictEqual( {error: expect.any(String)} );
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
        let quizId = adminQuizCreate(user.authUserId, name, 'Welcome!');
        expect(quizId).toStrictEqual( {error: expect.any(String)} );
    });

    test('name is already being used', () => {
        let user = adminAuthRegister('quiz@unsw.edu.au', 
        'abcd1234', 'Bobby', 'Dickens');
        let quizId1 = adminQuizCreate(user.authUserId, 'COMP1531', 'Welcome!');
        let quizId2 = adminQuizCreate(user.authUserId, 'COMP1531', 'Blahblah!');
        expect(quizId2).toStrictEqual( {error: expect.any(String)} );
    });

    test('two different users can have same quizname', () => {
        let user1 = adminAuthRegister('quiz1@unsw.edu.au', 
        'abcd1234', 'Bobby', 'Dickens');
        let user2 = adminAuthRegister('quiz2@unsw.edu.au', 
        'abcd1234', 'Sobby', 'Mickens');
        let quizId1 = adminQuizCreate(user1.authUserId, 'COMP1531', 'Welcome!');
        let quizId2 = adminQuizCreate(user2.authUserId, 'COMP1531', 'BLAHBLAH');
        expect(quizId2).toStrictEqual( {quizId2: expect.any(Number)} );
    });
});

describe('adminQuizRemove', () => {
    beforeEach(() => {
        let user = adminAuthRegister('quiz@unsw.edu.au', 
        'abcd1234', 'Bobby', 'Dickens');
        let quizId = adminQuizCreate(user.authUserId, 'COMP1531', 'Welcome!');
    });

    test('successful removal of quiz', () => {
        expect(adminQuizRemove(user.authUserId, quizId)).toEqual( {} );
        expect(adminQuizList(user.authUserId)).toStrictEqual({
            quizzes: [
            ]
        });
    });

    test('authUserId doesnt exist', () => {
        expect(adminQuizRemove(user.authUserId + 1, quizId)).toStrictEqual( {error: expect.any(String)} );
    });

    test('quizId doesnt refer to a valid quiz', () => {
        expect(adminQuizRemove(user.authUserId, quizId + 1)).toStrictEqual( {error: expect.any(String)} );
    });

    test('quiz doesnt belong to this user', () => {
        let user1 = adminAuthRegister('quiz1@unsw.edu.au', 
        'abcd1234', 'Robby', 'Smith');
        let quizId1 = adminQuizCreate(user.authUserId, 'HAHA1531', 'Welcome!');
        expect(adminQuizRemove(user.authUserId, quizId1)).toStrictEqual( {error: expect.any(String)});
    });
});



