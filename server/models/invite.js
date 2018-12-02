const mongoose = require('mongoose');
const validator = require('validator');

var InviteSchema = new mongoose.Schema({
    from: {
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
    to: {
        required: true,
        trim: true,
        type: String,
        minlength: 1,
        unique: true,
        validate: {
            validator: validator.isMobilePhone,
            message: '{VALUE} is not a valid value'
        }
    }
});

var Invite = mongoose.model('Invite', InviteSchema);

module.exports = {Invite};