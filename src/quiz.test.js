import { clear } from './other.js';
import { adminQuizList, adminQuizCreate, adminQuizRemove } from './quiz.js';
import { adminAuthRegister } from './auth.js';
import { adminQuizInfo } from './quiz.js';
import { adminQuizNameUpdate } from './quiz.js';


beforeEach(() => {
    clear();
});


describe('adminQuizList', () => {
    let user, quiz1, quiz2;
    beforeEach(() => {
        user = adminAuthRegister('quiz@unsw.edu.au', 
        'abcd1234', 'Bobby', 'Dickens');
        quiz1 = adminQuizCreate(user.authUserId, 'COMP1531', 'Welcome!');
        quiz2 = adminQuizCreate(user.authUserId, 'asdfasdf', 'Welcome!');
    });

    test('correct output of list of quizzes', () => {
        expect(adminQuizList(user.authUserId)).toStrictEqual({
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
        let quiz3 = adminQuizCreate(user1.authUserId, 'BOBBY', 'HELLO');
        let quiz4 = adminQuizCreate(user1.authUserId, 'LOLLY', 'alksdjf');
        expect(adminQuizList(user1.authUserId)).toStrictEqual({
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
        expect(adminQuizList(user.authUserId + 1)).toStrictEqual( {error: expect.any(String)} );
    });

});



describe('adminQuizCreate', () => {
    test('successful quiz creation', () => {
        let user = adminAuthRegister('quiz@unsw.edu.au', 
        'abcd1234', 'Bobby', 'Dickens');
        let quiz = adminQuizCreate(user.authUserId, 'COMP1531', 'Welcome!');
        expect(quiz).toStrictEqual( {quizId: expect.any(Number)} );
    });

    test('authUserId doesnt exist', () => {
        let user = adminAuthRegister('quiz@unsw.edu.au', 
        'abcd1234', 'Bobby', 'Dickens');
        let quiz = adminQuizCreate(user.authUserId + 1, 'COMP1531', 'Welcome!');
        expect(quiz).toStrictEqual( {error: expect.any(String)} );
    });

    test.each([
        { name: ''},
        { name: '1'},
        { name: 'Abaklwjef++++__....!!'},
        { name: '-()*()$@&%)@(^*!'},
        { name: 'ghijklmnopqrstuvwxyz1234125176123512351235'},
    ])("checking name restrictions: '$name'", ({ name }) => {
        let user = adminAuthRegister('quiz@unsw.edu.au', 
        'abcd1234', 'Bobby', 'Dickens');
        let quiz = adminQuizCreate(user.authUserId, name, 'Welcome!');
        expect(quiz).toStrictEqual( {error: expect.any(String)} );
    });

    test('name is already being used', () => {
        let user = adminAuthRegister('quiz@unsw.edu.au', 
        'abcd1234', 'Bobby', 'Dickens');
        let quiz1 = adminQuizCreate(user.authUserId, 'COMP1531', 'Welcome!');
        let quiz2 = adminQuizCreate(user.authUserId, 'COMP1531', 'Blahblah!');
        expect(quiz2).toStrictEqual( {error: expect.any(String)} );
    });

    test('two different users can have same quizname', () => {
        let user1 = adminAuthRegister('quiz1@unsw.edu.au', 
        'abcd1234', 'Bobby', 'Dickens');
        let user2 = adminAuthRegister('quiz2@unsw.edu.au', 
        'abcd1234', 'Sobby', 'Mickens');
        let quiz1 = adminQuizCreate(user1.authUserId, 'COMP1531', 'Welcome!');
        let quiz2 = adminQuizCreate(user2.authUserId, 'COMP1531', 'BLAHBLAH');
        expect(quiz2).toStrictEqual( {quizId: expect.any(Number)} );
    });

    test('description is over 100 characters long', () => {
        let description = `Twinkle twinkle little star, how I wonder what you are. 
        Up above the world so high. Like a diamond in the sky. Twinkle twinkle 
        little star, how I wonder what you are.`;
        let user = adminAuthRegister('quiz@unsw.edu.au', 
        'abcd1234', 'Bobby', 'Dickens');
        let quiz = adminQuizCreate(user.authUserId, 'COMP1531', description);
        expect(quiz).toStrictEqual( {error: expect.any(String)} );
    });
});

describe('adminQuizRemove', () => {
    let user, quiz;
    beforeEach(() => {
        user = adminAuthRegister('quiz@unsw.edu.au', 
        'abcd1234', 'Bobby', 'Dickens');
        quiz = adminQuizCreate(user.authUserId, 'COMP1531', 'Welcome!');
    });

    test('successful removal of quiz', () => {
        expect(adminQuizRemove(user.authUserId, quiz.quizId)).toEqual( {} );
        expect(adminQuizList(user.authUserId)).toStrictEqual({
            quizzes: [
            ]
        });
    });

    test('authUserId doesnt exist', () => {
        expect(adminQuizRemove(user.authUserId + 1, quiz.quizId)).toStrictEqual( {error: expect.any(String)} );
    });

    test('quizId doesnt refer to a valid quiz', () => {
        expect(adminQuizRemove(user.authUserId, quiz.quizId + 1)).toStrictEqual( {error: expect.any(String)} );
    });

    test('quiz doesnt belong to this user', () => {
        let user1 = adminAuthRegister('quiz1@unsw.edu.au', 
        'abcd1234', 'Robby', 'Smith');
        let quiz1 = adminQuizCreate(user1.authUserId, 'HAHA1531', 'Welcome!');
        expect(adminQuizRemove(user.authUserId, quiz1.quizId)).toStrictEqual( {error: expect.any(String)});
    });
});

describe('adminQuizInfo', () => {

    beforeEach(() => {
        clear();
    })

    // Successful check

    test('Quiz info retrieved successfully', () => {
            let authUserId = adminAuthRegister('quiz@unsw.edu.au', 'abcd1234', 'Bobby', 'Dickens');
            let quizId = adminQuizCreate(authUserId.authUserId, 'COMP1531', 'Welcome!');
            let quizInfo = adminQuizInfo(authUserId.authUserId, quizId.quizId);

            expect(quizInfo.quizId).toStrictEqual( quizId.quizId );

            // to fix
            expect(quizInfo.name).toStrictEqual( 'COMP1531' );

            // fix
            expect(quizInfo.timeCreated).toStrictEqual(expect.any(Number) );

            // fix
            expect(quizInfo.timeLastEdited).toStrictEqual(expect.any(Number));

            // fix
            expect(quizInfo.description).toStrictEqual('Welcome!' );
    });



    // Error checks
    test('AuthUserId is not a valid user', () =>{
        let authUserId = adminAuthRegister('quiz@unsw.edu.au', 'abcd1234', 'Bobby', 'Dickens');
        let quizId = adminQuizCreate(authUserId.authUserId, 'COMP1531', 'Welcome!');
        expect(adminQuizInfo(authUserId.authUserId + 1, quizId.quizId)).toStrictEqual({error: expect.any(String)});
    });

    test('Quiz ID does not refer to a valid quiz', () =>{
        let authUserId = adminAuthRegister('quiz@unsw.edu.au', 'abcd1234', 'Bobby', 'Dickens');
        let quizId = adminQuizCreate(authUserId.authUserId, 'COMP1531', 'Welcome!');
        expect(adminQuizInfo(authUserId.authUserId, quizId.quizId + 1)).toStrictEqual({error: expect.any(String)});
    });

    test('quiz doesnt belong to this user', () => {
        let authUserId = adminAuthRegister('quiz@unsw.edu.au', 'abcd1234', 'Bobby', 'Smith');
        let authUserId1 = adminAuthRegister('quiz1@unsw.edu.au', 'abcd1234', 'Robby', 'Smith');
        let quizId1 = adminQuizCreate(authUserId1.authUserId, 'COMP1531', 'Welcome!');
        expect(adminQuizInfo(authUserId.authUserId, quizId1.quizId)).toStrictEqual( {error: expect.any(String)});
    });
})


describe('adminQuizNameUpdate', () => {

    beforeEach(() => {
        clear();
    })
        
    // Successful Check
    test('Successful Quiz Name Update', () => {
        let authUserId = adminAuthRegister('quiz@unsw.edu.au', 'abcd1234', 'Bobby', 'Dickens');
        let quizId = adminQuizCreate(authUserId.authUserId, 'COMP1531', 'Welcome!');
        expect(adminQuizNameUpdate(authUserId.authUserId, quizId.quizId, 'newName')).toEqual( {} );
        let quizInfo = adminQuizInfo(authUserId.authUserId, quizId.quizId);
        expect(quizInfo.name).toStrictEqual( 'newName' );
    });

    // Error Checks

    test('AuthUserId is not a valid user', () =>{
        let authUserId = adminAuthRegister('quiz@unsw.edu.au', 'abcd1234', 'Bobby', 'Dickens');
        let quizId = adminQuizCreate(authUserId.authUserId, 'COMP1531', 'Welcome!');
        expect(adminQuizNameUpdate(authUserId.authUserId + 1, quizId.quizId)).toStrictEqual({error: expect.any(String)});
    });

    test('Quiz ID does not refer to a valid quiz', () =>{
        let authUserId = adminAuthRegister('quiz@unsw.edu.au', 'abcd1234', 'Bobby', 'Dickens');
        let quizId = adminQuizCreate(authUserId.authUserId, 'COMP1531', 'Welcome!');
        expect(adminQuizNameUpdate(authUserId.authUserId, quizId.quizId + 1)).toStrictEqual({error: expect.any(String)});
    });

    test('quiz doesnt belong to this user', () => {
        let authUserId = adminAuthRegister('quiz@unsw.edu.au', 'abcd1234', 'Bobby', 'Smith');
        let authUserId1 = adminAuthRegister('quiz1@unsw.edu.au', 'abcd1234', 'Robby', 'Smith');
        let quizId1 = adminQuizNameUpdate(authUserId1.authUserId, 'COMP1531', 'Welcome!');
        expect(adminQuizNameUpdate(authUserId.authUserId, quizId1.quizId)).toStrictEqual( {error: expect.any(String)});
    });

    test.each([
        { name: ''},
        { name: '1'},
        { name: 'Abaklwjef++++__....!!'},
        { name: '-()*()$@&%)@(^*!'},
        { name: 'ghijklmnopqrstuvwxyz1234125176'},
        { name: 'ghijklmnopqrstuvwxyz1234125176123512351235'},
    ])("checking name restrictions: '$name'", ({ name }) => {
        let authUserId = adminAuthRegister('quiz@unsw.edu.au', 
        'abcd1234', 'Bobby', 'Dickens');
        let quizId = adminQuizCreate(authUserId.authUserId, name, 'Welcome!');
        expect(quizId).toStrictEqual( {error: expect.any(String)} );
    });

    test('name is already being used', () => {
        let authUserId = adminAuthRegister('quiz@unsw.edu.au', 
        'abcd1234', 'Bobby', 'Dickens');
        let quizId1 = adminQuizCreate(authUserId.authUserId, 'COMP1531', 'Welcome!');
        let quizId2 = adminQuizCreate(authUserId.authUserId, 'COMP1531', 'Blahblah!');
        expect(quizId2).toStrictEqual( {error: expect.any(String)} );
    });


});
