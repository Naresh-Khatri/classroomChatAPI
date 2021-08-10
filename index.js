const server = require('http').createServer()
const mongoose = require('mongoose')
require('dotenv/config')

const ChatModel = require('./Models/ChatModel')

mongoose.connect(process.env.DB_CONNECTION,
    { useNewUrlParser: true, useUnifiedTopology: true }, (err) => {
        if (err == null)
            console.log('Connceted to DB!')
        else
            console.error(err)
    })

io = require('socket.io')(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
})

const PORT = process.env.PORT || 3000

const msgsData = []

io.on('connection', async (socket) => {
    console.log('new user ' + socket.id)
    socket.emit('receivePrevMsgsData', await getPrevChatData())
    socket.on('sendMsg', data => {
        // msgsData.push(data)
        appendMsgData(data)
        
        //save received msg in DB then broadcast
        const newMsg = ChatModel(
            { username: data.username, text: data.text[0] }
        )
        newMsg.save((err, result) => {
            if (err) return
            io.emit('receiveMsg', result)
        })
    })
})
server.listen(PORT, () => {
    console.log(`Listening on http://localhost:${PORT}`)
})


function appendMsgData(msgData) {
    //logic to append text if last and new msg owners are same

    if (msgsData.length == 0)
        msgsData.push(msgData)
    else {
        if (msgsData[msgsData.length - 1].username == msgData.username) {
            console.log('same user')
            msgsData[msgsData.length - 1].text.push(msgData.text[0])
            msgsData[msgsData.length - 1].time = msgData.time
            // msgsData.push(msgs)
        }
        else {
            console.log('different user')
            msgsData.push(msgData)
        }
    }
    console.log(msgsData[msgsData.length - 1])
}

function getPrevChatData() {
    return new Promise((resolve, reject) => {
        ChatModel.find({}, async (err, result) => {
            if (err)
                reject(err)
            else
                resolve(result)
        })
    })
}