const express = require('express');
const messageHandler = require("./handlers/message.handler")
var cors = require('cors')
const app = express();

app.use(cors())

const http = require('http');
const server = http.createServer(app);
const { Server } = require("socket.io");
const io = new Server(server, {
    cors: {
        origin: "*",
        methods: ["*"]
    }
});

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/index.html');
});

let currentUserId = 2;
const userIds = {}

io.on('connection', socket=> {
    console.log('a user connected');
    console.log(socket.id)
    userIds[socket.id] = currentUserId++
    messageHandler.handleMessage(socket, userIds);
    
    socket.on('disconnect', () => {
        console.log('user disconnected');
    });
});

server.listen(3000, () => {
    console.log('listening on *:3000');
});