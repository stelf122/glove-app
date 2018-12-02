require('./config/config');

const path = require('path');
const express = require('express');

var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);

var mongoose = require('./db/mongoose');
var {User} = require('./models/user');
var {Invite} = require('./models/invite');
const {Users} = require('./utils/users');

const port = process.env.PORT || 3000;

const publicPath = path.join(__dirname, '../public');

var users = new Users();

app.use(express.static(publicPath));

io.on('connection', function(socket) {
    console.log('User connected');

    socket.on('disconnect', () => {
        console.log('User disconnected');
        users.removeUser(socket.id);
        io.emit('updateUserList', users.getUserList());
    });

    socket.on('join', (params, callback) => {
        User.findOne(params).then((user) => {
            if (!user) {
                var user = new User(params);

                user.save().then(() => {                
                    callback('ok');
                }, (e) => {
                    callback('invalid');
                });
            } else {
                callback('ok');
            }
        }, (e) => {
            callback('invalid');
        });

        socket.mobilePhone = params.mobilePhone;

        users.removeUser(socket.id);
        users.addUser(socket.id, params.mobilePhone);

        io.emit('updateUserList', users.getUserList());

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
    });
});

http.listen(port, () => {
    console.log(`Server is up on port ${port}`);
});