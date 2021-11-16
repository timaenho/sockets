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
const users = {}


io.on('connection', socket=> {
    console.log('a user connected');
    console.log(socket.id)
    users[socket.id] = {userId: currentUserId++}

    /socket.on("join", (username,avatar) => {
        users[socket.id].username = username;
        users[socket.id].avatar = avatar;
        console.log(username)
    }); 

   
    socket.on("action",action =>{
        switch (action.type){
            case "server/hello":
                console.log("Hello", action.data)
                socket.emit("action", {type:"message",data: "Good Day!"})
            break
            case "server/join":
                console.log("Got join event",action.data)
                users[socket.id].username = action.data.username;
                users[socket.id].avatar = action.data.avatar;
                messageHandler.handleMessage(socket, users);
            break
            }
    })
 
    socket.on('disconnect', () => {
        console.log('user disconnected');
    });
});

server.listen(3000, () => {
    console.log('listening on *:3000');
});