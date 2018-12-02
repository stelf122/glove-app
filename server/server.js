require('./config/config');

const path = require('path');
const express = require('express');

var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);

var mongoose = require('./db/mongoose');
var {User} = require('./models/user');
var {Invite} = require('./models/invite');
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
        User.findOne(params).then((user) => {
            if (!user) {
                var user = new User(params);

                user.save().then(() => {                
                    callback('ok');
                }, (e) => {
                    callback('invalid');
                    console.log(e);
                });
            } else {
                callback('ok');

                socket.emit('updateStat', user);
            }
        }, (e) => {
            callback('invalid');
            //console.log(e);
        });

        socket.mobilePhone = params.mobilePhone;

        usersList.removeUser(socket.id);
        usersList.addUser(socket.id, params.mobilePhone);

        io.emit('updateUserList', usersList.getUserList());

        Invite.find({from: socket.mobilePhone}).then((invites) => {
            socket.emit('updateInvitesList', invites);
        });
    });

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

        socket.emit('newMessage', {from, to, message});

        var user = usersList.getUserByPhone(to);

        if (user && user.id != socket.id) {
            io.to(user.id).emit('newMessage', {from, to, message});
        }
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