const express = require('express');
const messageHandler = require("./handlers/message.handler")
var cors = require('cors')
const app = express();
const { v1: uuidv1 } = require('uuid');

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


const users = {}
function createUsersOnline() {
    const values = Object.values(users)
    const soloConCoordinatos = values.filter(u => 
           u.username != undefined 
        && u.coordinates != null 
        && u.coordinates != ' ' 
        && typeof u.coordinates.latitude === 'number')
    return soloConCoordinatos;
}

io.on('connection', socket=> {
    console.log('a user connected');
    console.log(socket.id)
    users[socket.id] = {userId: uuidv1()}
    messageHandler.handleMessage(socket, users);
    socket.on("disconnect", () => {
        delete users[socket.id]
        io.emit("action", {type: "users_online", data: createUsersOnline()})
    })
    socket.on("action",action =>{
        switch (action.type){
            case "server/join":
                console.log("Got join event",action.data)
                users[socket.id].username = action.data.username;
                users[socket.id].avatar = action.data.avatar;
                users[socket.id].coordinates = action.data.coordinates;
               /*  users[socket.id].locationLongitude = action.data.locationLongitude;
                users[socket.id].locationLatitude = action.data.locationLatitude; */
                users[socket.id].descripcion = "Idioma a aprender: " + action.data.idiomaAaprender;

                console.log(createUsersOnline())
                io.emit("action",{
                    type:"users_online", 
                    data: createUsersOnline()
                }) 
                socket.emit("action", {type: "self_user", data: users[socket.id]})     
            break
            case"server/private_message":
                const conversationId = action.data.conversationId
                const from = users[socket.id].userId
                console.log("from " + from)
                const userValues = Object.values(users)
                console.log("userValues " + userValues)
                const socketIds = Object.keys(users)
                console.log("socketIds " +  socketIds)

                for(let i = 0; i < userValues.length;i++){
                    console.log("index " + i)
                    if(userValues[i].userId === conversationId){
                        const socketId = socketIds[i]
                        console.log("en for" + socketId)
                        console.log("socket" + io.to(socketId))
                        io.to(socketId).emit("action", {
                            type:"private_message",
                            data: {
                                ...action.data,
                                conversationId: from
                            }
                        })
                        break
                    }
                }
                break
            }
    })
});

server.listen(3000, () => {
    console.log('listening on *:3000');
});