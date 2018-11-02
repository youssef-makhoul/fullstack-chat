let express = require('express');
let bodyParser = require('body-parser');

let User = require('./models/user');
let Message = require('./models/message');
User.idCounter = 0;

const MAX_MESSAGES_PER_RESPONSE = 10;
let Users = {};
let Messages = [];
let Sessions = {};

let app = express();
app.use(bodyParser.raw({
    type: '*/*'
}))

//Users.push(new User("Admin", "Admin", "-1"));

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

function getActiveUsers() {
    let activeUsers = [];
    for (user in Users) {
        if (Users[user].isActive())
            activeUsers.push(Users[user]);
    }
    return activeUsers;
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
    let sessionId = User.generateNewSessionID();
    Users[username] = new User(username, password);
    Sessions[sessionId] = username;
    Users[username].makeActive();
    Messages.push(new Message(-1, "Admin", "User " + username + " has joined the chat room"));
    res.set('Set-Cookie', sessionId);
    res.send(JSON.stringify({
        success: true,
        message: 'User ' + username + ' has registered successfully !!!'
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
    //login and assign new session id
    let sessionId = User.generateNewSessionID();
    Sessions[sessionId] = username;
    Users[username].makeActive();
    Messages.push(new Message(-1, "Admin", "User " + username + " has joined the chat room"));
    res.set('Set-Cookie', sessionId);
    res.send(JSON.stringify({
        success: true,
        message: 'user ' + username + ' has logged in successfully !!!'
    }));
});

//add new message to message pool using sessionId
app.post('/newmessage', function (req, res) {
    let parsedBody = JSON.parse(req.body);
    let sessionId = req.headers.cookie;
    if (!Sessions[sessionId]) {
        res.send(JSON.stringify({
            success: false,
            message: 'unrecognized session Id'
        }));
        return;
    }
    let user = Users[Sessions[sessionId]];
    user.makeActive();
    let message = new Message(user.id, user.username, parsedBody.message);
    Messages = Messages.concat(message);
    res.send(JSON.stringify({
        success: true
    }));
})

//user should provide valid session id to get the messages
app.get('/getchat', function (req, res) {
    let sessionId = req.headers.cookie;
    if (!Sessions[sessionId]) {
        res.send(JSON.stringify({
            success: false,
            message: 'unrecognized sessionId'
        }));
        return;
    }
    res.send(JSON.stringify({
        success: true,
        messages: getMessages(),
        activeUsers: getActiveUsers()
    }));
});

app.post('/signout', function (req, res) {
    let sessionId = req.headers.cookie;
    if (!Sessions[sessionId]) {
        res.send(JSON.stringify({
            success: false,
            message: 'unrecognized sessionId'
        }));
        return;
    }
    Messages.push(new Message(-1, "Admin", "User " + Sessions[sessionId] + " has left the chat room"));
    delete Sessions[sessionId];

    
    res.set('Set-Cookie', "");
    res.send(JSON.stringify({
        success: true,
    }));
});

app.listen(4000, function () {
    console.log("Server started on port 4000")
});