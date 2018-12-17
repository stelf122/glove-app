const mongoose = require('mongoose');

var MessageSchema = new mongoose.Schema({
    from: {
        required: true,
        type: String
    },
    to: {
        required: true,
        type: String
    },
    text: {
        required: true,
        trim: true,
        type: String,
        minlength: 1
    },
    createdAt: {
        required: true,
        type: Number
    }
});

var Message = mongoose.model('Message', MessageSchema);

module.exports = {Message};