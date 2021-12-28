const express = require('express')
const app = express()

const server = require('http').createServer(app)
const mongoose = require('mongoose')
require('dotenv/config')


const ChatModel = require('./Models/ChatModel')
const User = require('./Models/User')

const userRoutes = require('./routes/user')

const PORT = process.env.PORT || 3000

mongoose.connect(process.env.DB_CONNECTION,
    { useNewUrlParser: true, useUnifiedTopology: true,useFindAndModify:false }, (err) => {
        if (err == null)
            console.log('Connceted to DB!')
        else
            console.error(err)
    })
//hide the deprecation warning
mongoose.set('useCreateIndex', true);
io = require('socket.io')(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
})


//express middleware
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*')
    res.header("Access-Control-Allow-Methods", "GET, POST, PATCH, PUT, DELETE, OPTIONS")
    res.header('Access-Control-Allow-Headers', 'Origin, Content-Type, X-Auth-Token')
    next()
})
app.use(express.json())
app.use('/user', userRoutes)
//save user to DB
app.post('/register', async (req, res) => {
    // const { uid, username, email, emailVerified, phone, photoUrl, localId, metadata, disabled, providerData } = req.body
    const user = new User(req.body)
    try {
        await user.save()
        console.log('user saved ', user)
        res.send(user)
    } catch (err) {
        if (err.code == 11000)
            res.status(400).send('User already exists')
        else
            res.status(500).send(err)
    }
})

const msgsData = []

io.on('connection', async (socket) => {
    console.log('new user ' + socket.id)
    socket.emit('receivePrevMsgsData', await getPrevChatData())
    socket.on('sendMsg', data => {
        // msgsData.push(data)
        appendMsgData(data)

        //save received msg in DB then broadcast
        const newMsg = ChatModel(
            {
                user: data.user, name: data.name,
                text: data.text[0], photoURL: data.photoURL
            }
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
        ChatModel.find({}).sort('timestamp').exec(async (err, result) => {
            if (err)
                reject(err)
            else
                resolve(result)
        })
    })
}