let express = require('express');
let bodyParser = require('body-parser');

let User = require('./models/user');
let Message = require('./models/message');
User.idCounter = 0;

let Users = [];
let Messages = [];
let Sessions = [];

let app = express();
app.use(bodyParser.raw({
    type: '*/*'
}))


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
    let sessionhh = Sessions.indexOf(username);
    if (sessionhh) {
        res.send(JSON.stringify({
            success: true,
            message: 'user ' + username + ' already logged in',
            sessionId: sessionhh
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
    let message = new Message(user.id, user.username,parsedBody.message);
    Messages = Messages.concat(message);
    res.send(JSON.stringify({
        success: true,
        messages: Messages.map(message => {
            return {
                username: message.username,
                messageBody: message.messageBody,
                subtime: message.getFormatedSubmiteTime()
            }
        })
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
        messages: Messages.map(message => {
            return {
                username: message.username,
                messageBody: message.messageBody,
                subtime: message.getFormatedSubmiteTime()
            }
        })
    }));
});

app.listen(4000, function () {
    console.log("Server started on port 4000")
});