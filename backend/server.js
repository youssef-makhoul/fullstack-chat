let express = require('express');
let bodyParser = require('body-parser');

let User = require('./models/user');
let Message = require('./models/message');
User.idCounter = 0;

const MAX_MESSAGES_PER_RESPONSE = 10;
let Users = [];
let Messages = [];
let Sessions = [];

let app = express();
app.use(bodyParser.raw({
    type: '*/*'
}))

Users.push(new User("Admin","Admin","-1"));

function getMessages() {
    if (Messages.length < 10) return Messages.map(message => {
        return {
            username: message.username,
            messageBody: message.messageBody,
            subtime: message.getFormatedSubmiteTime()
        }
    })
    else
        return Messages.map(message => {
            return {
                username: message.username,
                messageBody: message.messageBody,
                subtime: message.getFormatedSubmiteTime()
            }
        }).slice(Math.max(Messages.length - MAX_MESSAGES_PER_RESPONSE, 1))
}

app.post('/signup', function (req, res) {
    let parsedBody = JSON.parse(req.body);
    let username = parsedBody.username;
    let password = parsedBody.password;
    if (Users[username]) {
        res.send(JSON.stringify({
            success: false,
            message: 'User ' + username + ' already exists !!!'
        }));
        return;
    }
    let user = new User(username, password);
    let sessionId = user.generateNewSessionID();
    Users[username] = user;
    Sessions[sessionId] = user.username;
    Messages.push(new Message(-1, "Admin", "User " + username + " has joined the chat room"));
    res.send(JSON.stringify({
        success: true,
        message: 'User ' + username + ' has registered successfully !!!',
        sessionId: sessionId
    }));
});

app.post('/login', function (req, res) {
    let parsedBody = JSON.parse(req.body);
    let username = parsedBody.username;
    let password = parsedBody.password;
    //username does not exist
    if (!Users[username]) {
        res.send(JSON.stringify({
            success: false,
            message: 'wrong username / password combination'
        }));
        return;
    }
    //password did not match
    if (Users[username].password !== password) {
        res.send(JSON.stringify({
            success: false,
            message: 'wrong username / password combination'
        }));
        return;
    }
    //user already logged in with active session
    let user = Users[username];
    Messages.push(new Message(-1, "Server Chat", "User " + username + " has joined the chat room"));
    if (Sessions.indexOf(username)) {
        res.send(JSON.stringify({
            success: true,
            message: 'user ' + username + ' already logged in',
            sessionId: Sessions.indexOf(username)
        }));
        return;
    }
    //login and assign new session id
    let sessionId = user.generateNewsessionID();
    Sessions[sessionId] = username;
    res.send(JSON.stringify({
        success: true,
        message: 'user ' + username + ' has logged in successfully !!!',
        sessionId: sessionId
    }));
});

//add new message to message pool using sessionId
app.post('/newmessage', function (req, res) {
    let parsedBody = JSON.parse(req.body);
    let sessionId = parsedBody.sessionId;
    if (!Sessions[sessionId]) {
        res.send(JSON.stringify({
            success: false,
            message: 'unrecognized session Id'
        }));
        return;
    }
    let user = Users[Sessions[sessionId]];
    let message = new Message(user.id, user.username, parsedBody.message);
    Messages = Messages.concat(message);
    res.send(JSON.stringify({
        success: true,
        messages: getMessages()
    }));
})

//user should provide valid session id to get the messages
app.post('/getmessages', function (req, res) {
    let parsedBody = JSON.parse(req.body);
    let sessionId = parsedBody.sessionId;
    if (!Sessions[sessionId]) {
        res.send(JSON.stringify({
            success: false,
            message: 'unrecognized sessionId'
        }));
        return;
    }
    res.send(JSON.stringify({
        success: true,
        messages: getMessages()
    }));
});

app.listen(4000, function () {
    console.log("Server started on port 4000")
});