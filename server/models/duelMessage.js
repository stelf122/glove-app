const mongoose = require('mongoose');

var DuelMessageSchema = new mongoose.Schema({
    from: {
        required: true,
        type: String
    },
    to: {
        required: true,
        type: String
    },
    createdAt: {
        required: true,
        type: Number
    },
    status: {
        required: false,
        type: String
    }
});

var DuelMessage = mongoose.model('DuelMessage', DuelMessageSchema);

module.exports = {DuelMessage};