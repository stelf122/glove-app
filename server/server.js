require('./config/config');

const path = require('path');
const express = require('express');

var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);

var mongoose = require('./db/mongoose');
var {User} = require('./models/user');
var {Invite} = require('./models/invite');
var {Message} = require('./models/message');

const {UsersList} = require('./utils/users');

const port = process.env.PORT || 3000;

const publicPath = path.join(__dirname, '../public');

var usersList = new UsersList();

app.use(express.static(publicPath));

io.on('connection', function(socket) {
    console.log('User connected');

    socket.on('disconnect', () => {
        console.log('User disconnected');
        usersList.removeUser(socket.id);
        io.emit('updateUserList', usersList.getUserList());
    });

    socket.on('join', (params, callback) => {
        params.mobilePhone = params.mobilePhone.replace(' ', '');
        params.mobilePhone = params.mobilePhone.replace('-', '');

        if (params.mobilePhone.length < 10) {
            return callback('invalid');
        }

        params.mobilePhone = params.mobilePhone.substr(params.mobilePhone.length - 10, 10);

        User.findOne(params).then((user) => {
            if (!user) {
                var user = new User(params);

                user.save().then(() => {                
                    callback('ok');
                    HandleJoin(params, socket);
                }, (e) => {
                    console.log(e);
                    callback('invalid');
                });
            } else {
                callback('ok');
                HandleJoin(params, socket);

                socket.emit('updateStat', user);
            }
        }, (e) => {
            console.log(e);
            callback('invalid');
        });        
    });

    function HandleJoin(params, socket) {
        socket.mobilePhone = params.mobilePhone;

        usersList.removeUser(socket.id);
        usersList.addUser(socket.id, params.mobilePhone);

        io.emit('updateUserList', usersList.getUserList());

        Invite.find({from: socket.mobilePhone}).then((invites) => {
            socket.emit('updateInvitesList', invites);
        });

        Message.find({from: socket.mobilePhone}).then((messages) => {
            messages.forEach((message) => {
                socket.emit('newMessage', message);
            });
        });
    }

    socket.on('invite', (params, callback) => {
        var to = params.friendPhone;
        var from = socket.mobilePhone;

        console.log('From: ' + from);

        var invite = new Invite({from, to});

        invite.save().then(() => {
            callback('ok');
        }, (e) => {
            callback(e);
        });
    });

    socket.on('newMessage', (params, callback) => {
        var from = socket.mobilePhone;
        var to = params.phone;
        var message = params.message;
        var createdAt = new Date().getTime();

        socket.emit('newMessage', {from, to, text:message, createdAt});

        var user = usersList.getUserByPhone(to);

        if (user && user.id != socket.id) {
            io.to(user.id).emit('newMessage', {from, to, text:message, createdAt});
        }

        var messageData = new Message({from, to, text:message, createdAt});

        messageData.save().then().catch((e) => {
            console.log('Message is not saved', e);
        });
    });

    socket.on('checkContacts', (params, callback) => {
        var phones = params.phones;

        User.find({mobilePhone:{$in:phones}}).then((users) => {
            var gamers = [];

            users.forEach((user) => {
                gamers.push(user.mobilePhone);
                gamers.push(user.mobilePhone);
                gamers.push(user.mobilePhone);
            });

            callback(gamers);
        }).catch((e) => {
            console.log(e);
        });
    });

    socket.on('newArrow', () => {
        User.findOneAndUpdate({
            mobilePhone: socket.mobilePhone
        }, {$inc: {arrows: 1}}).then((user) => {}).catch((e) => {
            console.log(e);
        });
    });

    socket.on('newPlaytime', () => {
        User.findOneAndUpdate({
            mobilePhone: socket.mobilePhone
        }, {$inc: {playTime: 1}}).then((user) => {}).catch((e) => {
            console.log(e);
        });
    });

    socket.on('newWin', () => {
        User.findOneAndUpdate({
            mobilePhone: socket.mobilePhone
        }, {$inc: {wins: 1}}).then((user) => {}).catch((e) => {
            console.log(e);
        });
    });

    socket.on('newDefeat', () => {
        User.findOneAndUpdate({
            mobilePhone: socket.mobilePhone
        }, {$inc: {defeats: 1}}).then((user) => {}).catch((e) => {
            console.log(e);
        });
    });

    socket.on('newDuel', () => {
        User.findOneAndUpdate({
            mobilePhone: socket.mobilePhone
        }, {$inc: {sendDuel: 1}}).then((user) => {}).catch((e) => {
            console.log(e);
        });
    });

    socket.on('newDropDuel', () => {
        User.findOneAndUpdate({
            mobilePhone: socket.mobilePhone
        }, {$inc: {dropDuel: 1}}).then((user) => {}).catch((e) => {
            console.log(e);
        });
    });
});

http.listen(port, () => {
    console.log(`Server is up on port ${port}`);
});