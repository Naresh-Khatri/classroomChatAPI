const mongoose = require('mongoose')

const chatsDataSchema = mongoose.Schema({
    username: String,
    text: String,
    timestamp: {
        type: Date,
        default: Date
    }
})

module.exports = mongoose.model('Chat',chatsDataSchema)