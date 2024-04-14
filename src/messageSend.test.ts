import {
    requestAuthRegister,
    requestClear,
    requestPlayerJoin,
    requestQuizCreate,
    requestQuizQuestionCreate,
    requestQuizSessionCreate,
    requestSessionStateUpdate,
  } from './httpRequests';
  import {
    TokenReturn,
    QuizId,
    SessionId,
    QuestionBody,
    Actions,
    Message,
  } from './interfaces';

  beforeEach(() => {
    requestClear();
  });


  Date.now()


// playerChatSession
// Goal: Display all chat messages in session

describe('Return all messages in chat', () => {
    const playerid = playerid('5546');
    const playerMessages = message.filter(message => message.playerId === playerId);
    playerMessages.forEach(message => {
      console.log(`Message: ${message.messageBody}`);
      console.log(`Time Sent: ${formatUnixTime(message.timeSent)}`);
    });
})

  test('Player ID does not exist', () => {
    const playerid = playerid('5546');
    expect(playerChatSession(playerid + 1)).toStrictEqual({ error: expect.any(String) });
    //return nothing?
  });


const resToken = requestPlayerJoin('1234');

// playerChatSend
// Goal: Send a message into chat
describe('Sent a message into chat', () => {
    test('Message sent successfully', () => {
      const message: Message = {
        messageBody: "Hello, world!",
        playerId: expect.any(Number),
        playerName: "Bobby",
        timeSent: Date.now(), // Assuming timeSent is a Unix timestamp
      };
  
      // Call the function and expect it to return true if the message is sent successfully
      const result = playerChatSend(message);

    });
  });

test('Player ID does not exist', () => {
  const playerid = requestPlayerJoin(restoken.token, );
  expect(playerChatSession(playerid + 1)).toStrictEqual({ error: expect.any(String) });
});


test('Message body is greater than 100 characters', () => {
  const playerid = playerid('5546');
  expect(todo(

    `How much wood can a wood chucker chuck wood? I don't actually know 
    but that was a great character count filler.`
  )).toStrictEqual({ error: expect.any(String) });
});

test('Message body is lesser than 1 character', () => {
  const playerid = playerid('5546');
  expect(todo(``)).toStrictEqual({ error: expect.any(String) });
});