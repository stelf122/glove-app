require('./config/config');

const path = require('path');
const express = require('express');

var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);

var mongoose = require('./db/mongoose');
var {ObjectID} = require('mongodb');
var {User} = require('./models/user');
var {Invite} = require('./models/invite');
var {Message} = require('./models/message');
var {DuelMessage} = require('./models/duelMessage');

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

    async function HandleJoin(params, socket) {
        socket.mobilePhone = params.mobilePhone;

        usersList.removeUser(socket.id);
        usersList.addUser(socket.id, params.mobilePhone);

        io.emit('updateUserList', usersList.getUserList());

        Invite.find({from: socket.mobilePhone}).then((invites) => {
            socket.emit('updateInvitesList', invites);
        });

        var messages = await Message.find({$or: [{from: socket.mobilePhone}, {to: socket.mobilePhone}]});
        var duelMessages = await DuelMessage.find({$or: [{from: socket.mobilePhone}, {to: socket.mobilePhone}]});

        var allMessages = messages.concat(duelMessages);
        var sortedMessages = allMessages.sort((a,b) => (a.createdAt > b.createdAt) ? 1 : ((b.createdAt > a.createdAt) ? -1 : 0));

        socket.emit('updateMessages', sortedMessages);
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

        var messageData = new Message({from, to, text:message, createdAt});

        messageData.save().then((message) => {
            socket.emit('newMessage', message);

            var user = usersList.getUserByPhone(to);

            if (user && user.id != socket.id) {
                io.to(user.id).emit('newMessage', message);
            }
        }).catch((e) => {
            console.log('Message is not saved', e);
        });
    });

    socket.on('newDuelMessage', (params, callback) => {
        var from = socket.mobilePhone;
        var to = params.phone;
        var createdAt = new Date().getTime();

        var messageData = new DuelMessage({from, to, createdAt});

        messageData.save().then((duelMessage) => {
            socket.emit('newDuelMessage', {
                message: duelMessage,
                notify: false
            });

            var user = usersList.getUserByPhone(to);

            if (user && user.id != socket.id) {
                io.to(user.id).emit('newDuelMessage', {
                    message: duelMessage,
                    notify: true
                });
            }
        }).catch((e) => {
            console.log('Message is not saved', e);
        });
    });

    socket.on('acceptDuel', (params, callback) => {
        var id = params.id;

        if (!ObjectID.isValid(id)) {
            return callback('invalid_id');
        }

        DuelMessage.findById(id).then((duel) => {
            var userOne = usersList.getUserByPhone(duel.from);
            var userTwo = usersList.getUserByPhone(duel.to);

            if (!userOne || !userTwo) {
                return callback('user_offline')
            }

            DuelMessage.findByIdAndUpdate(id, {$set: {status: 'accepted'}}, {new: true}).then((duelMessage) => {
                if (!duelMessage) {
                    return callback('update_error');
                }

                io.to(userOne.id).emit('updateMessage', duelMessage);
                io.to(userTwo.id).emit('updateMessage', duelMessage);

                User.findOne({mobilePhone: userOne.phone}).then((user) => {
                    io.to(userTwo.id).emit('startDuel', {
                        _id: id,
                        opponentStats: {wins: user.wins, defeats: user.defeats}
                    });
                });

                User.findOne({mobilePhone: userTwo.phone}).then((user) => {
                    io.to(userOne.id).emit('startDuel', {
                        _id: id,
                        opponentStats: {wins: user.wins, defeats: user.defeats}
                    });
                });

                return callback('ok');
            }).catch((e) => {
                return console.log(e);
            });
        }).catch((e) => {
            return console.log(e);
        });
    });

    socket.on('rejectDuel', (params, callback) => {
        var id = params.id;

        if (!ObjectID.isValid(id)) {
            return callback('invalid_id');
        }

        DuelMessage.findByIdAndUpdate(id, {$set: {status: 'rejected'}}, {new: true}).then((duelMessage) => {
            if (!duelMessage) {
                return callback('update_error');
            }

            var userOne = usersList.getUserByPhone(duelMessage.from);
            var userTwo = usersList.getUserByPhone(duelMessage.to);

            if (userOne) {
                io.to(userOne.id).emit('updateMessage', duelMessage);
            }

            if (userTwo) {
                io.to(userTwo.id).emit('updateMessage', duelMessage);
            }

            return callback('ok');
        }).catch((e) => {
            return console.log(e);
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

    socket.on('newRound', () => {
        User.findOneAndUpdate({
            mobilePhone: socket.mobilePhone
        }, {$inc: {rounds: 1}}).then((user) => {}).catch((e) => {
            console.log(e);
        });
    });

    socket.on('newGame', () => {
        User.findOneAndUpdate({
            mobilePhone: socket.mobilePhone
        }, {$inc: {games: 1}}).then((user) => {}).catch((e) => {
            console.log(e);
        });
    });
});

http.listen(port, () => {
    console.log(`Server is up on port ${port}`);
});