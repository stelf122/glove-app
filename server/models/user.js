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
    }
});

var User = mongoose.model('User', UserSchema);

module.exports = {User};