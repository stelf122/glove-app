require('./config/config');

const app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);

var mongoose = require('./db/mongoose');
var {User} = require('./models/user');

const port = process.env.PORT || 3000;

io.on('connection', function(socket) {
    console.log('User connected');

    socket.on('disconnect', () => {
        console.log('User disconnected');
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
    });
});

http.listen(port, () => {
    console.log(`Server is up on port ${port}`);
});