const http = require('http')
const express = require('express')
const socketio = require('socket.io')
const Filter = require('bad-words')
const { generateMessage, generateLocationMessage } = require('./utils/message')
const { addUser, removeUser, getUser, getUsersInRoom } = require('./utils/users')

const app = express()
const server = http.createServer(app)
const io = socketio(server)

const port = process.env.PORT || 3000
const botname = 'Ch4tB0t'

app.use(express.static('./public'))

io.on('connection', (socket) => {
    console.log('new websocket connection')

    socket.on('join', ({username, room}, callback) => {
        const { error, user } = addUser({ id: socket.id, username, room })
        
        if (error) {
            return callback(error)
        }

        socket.join(user.room)

        socket.emit('message', generateMessage(botname, 'Welcome!'))
        socket.broadcast.to(user.room).emit('message', generateMessage(botname, `${user.username} has joined`))   
        io.to(user.room).emit('roomData', {
            room: user.room,
            users: getUsersInRoom(user.room)
        })
        callback()
    })

    socket.on('sendMessage', (msg, callback) => {
        const filter = new Filter()
        if (filter.isProfane(msg))
        {
            return callback('Profanity not allowed')
        }
        const user = getUser(socket.id)
        io.to(user.room).emit('message', generateMessage(user.username, msg))
        callback()  // ack msg handled
    })

    socket.on('sendLocation', (loc, callback) => {
        console.log(loc)
        const user = getUser(socket.id)
        io.to(user.room).emit('locationMessage', generateLocationMessage(user.username, `https://google.com/maps?q=${loc.latitude},${loc.longitude}`))
        callback()
    })

    socket.on('disconnect', () => {
        const user = removeUser(socket.id)
        if (user) {
            console.log('xxmla', user);
            io.to(user.room).emit('message', generateMessage(botname, `${user.username} has left`))
            io.to(user.room).emit('roomData', {
                room: user.room,
                users: getUsersInRoom(user.room)
            })
        }
    })
})


server.listen(port, () => {
    console.log('server is up on port', port)
})
