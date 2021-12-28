const mongoose = require('mongoose')

const chatsDataSchema = mongoose.Schema({
    user: {
        type: String,
        ref: 'User',
    },
    name: String,
    text: String,
    photoURL: String,
    reactions: [{
        reaction: String,
        user: {
            type: String,
            ref: 'User',
        },
        time: Date,
    }],
    timestamp: {
        type: Date,
        default: Date
    }
})

module.exports = mongoose.model('Chat', chatsDataSchema)