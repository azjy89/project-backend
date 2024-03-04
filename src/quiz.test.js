import { clear } from './other.js';
import { adminQuizList, adminQuizCreate, adminQuizRemove } from './quiz.js';
import { adminAuthRegister } from './auth.js';


beforeEach(() => {
    clear();
});


describe('adminQuizList', () => {
    beforeEach(() => {
        let authUserId = adminAuthRegister('quiz@unsw.edu.au', 
        'abcd1234', 'Bobby', 'Dickens');
        let quizId1 = adminQuizCreate(authUserId, 'COMP1531', 'Welcome!');
        let quizId2 = adminQuizCreate(authUserId, 'asdfasdf', 'Welcome!');
    });

    test('correct output of list of quizzes', () => {
        expect(adminQuizList(authUserId)).toStrictEqual({
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
        let authUserId1 = adminAuthRegister('quiz1@unsw.edu.au', 
        'abcd1234', 'Stephen', 'Robertson');
        let quizId3 = adminQuizCreate(authUserId1, 'BOBBY', 'HELLO');
        let quizId4 = adminQuizCreate(authUserId1, 'LOLLY', 'alksdjf');
        expect(adminQuizList(authUserId1)).toStrictEqual({
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
        expect(adminQuizList(authUserId + 1)).toStrictEqual( {error: 'Invalid authUserId.'});
    });

});



describe('adminQuizCreate', () => {
    test('successful quiz creation', () => {
        let authUserId = adminAuthRegister('quiz@unsw.edu.au', 
        'abcd1234', 'Bobby', 'Dickens');
        let quizId = adminQuizCreate(authUserId, 'COMP1531', 'Welcome!');
        expect(quizId).toStrictEqual( {quizId: expect.any(Number)} );
    });

    test('authUserId doesnt exist', () => {
        let authUserId = adminAuthRegister('quiz@unsw.edu.au', 
        'abcd1234', 'Bobby', 'Dickens');
        let quizId = adminQuizCreate(authUserId + 1, 'COMP1531', 'Welcome!');
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
        let authUserId = adminAuthRegister('quiz@unsw.edu.au', 
        'abcd1234', 'Bobby', 'Dickens');
        let quizId = adminQuizCreate(authUserId, name, 'Welcome!');
        expect(quizId).toStrictEqual( {error: expect.any(String)} );
    });

    test('name is already being used', () => {
        let authUserId = adminAuthRegister('quiz@unsw.edu.au', 
        'abcd1234', 'Bobby', 'Dickens');
        let quizId1 = adminQuizCreate(authUserId, 'COMP1531', 'Welcome!');
        let quizId2 = adminQuizCreate(authUserId, 'COMP1531', 'Blahblah!');
        expect(quizId2).toStrictEqual( {error: expect.any(String)} );
    });

    test('two different users can have same quizname', () => {
        let authUserId1 = adminAuthRegister('quiz1@unsw.edu.au', 
        'abcd1234', 'Bobby', 'Dickens');
        let authUserId2 = adminAuthRegister('quiz2@unsw.edu.au', 
        'abcd1234', 'Sobby', 'Mickens');
        let quizId1 = adminQuizCreate(authUserId1, 'COMP1531', 'Welcome!');
        let quizId2 = adminQuizCreate(authUserId2, 'COMP1531', 'BLAHBLAH');
        expect(quizId2).toStrictEqual( {quizId2: expect.any(Number)} );
    });
});

