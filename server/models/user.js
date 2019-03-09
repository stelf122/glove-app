const mongoose = require('mongoose');
const validator = require('validator');

var UserSchema = new mongoose.Schema({
    mobilePhone: {
        required: true,
        trim: true,
        type: String,
        minlength: 1,
        unique: true,
        validate: {
            validator: validator.isMobilePhone,
            message: '{VALUE} is not a valid value'
        }
    },
    registrationToken: {
        required: false,
        type: String
    },
    arrows: {
        required: false,
        default: 0,
        type: Number
    },
    playTime: {
        required: false,
        default: 0,
        type: Number
    },
    wins: {
        required: false,
        default: 0,
        type: Number
    },
    defeats: {
        required: false,
        default: 0,
        type: Number
    },
    sendDuel: {
        required: false,
        default: 0,
        type: Number
    },
    dropDuel: {
        required: false,
        default: 0,
        type: Number
    },
    rounds: {
        required: false,
        default: 0,
        type: Number
    },
    games: {
        required: false,
        default: 0,
        type: Number
    }
});

var User = mongoose.model('User', UserSchema);

module.exports = {User};