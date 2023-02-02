const express = require('express');
const app = express();
const port = 3000;

const http = require('http');
const server = http.createServer(app)

const {Server} = require('socket.io');
const io = new Server(server);

let messages = [];

let socketsAndRooms = [];

io.on('connection', (socket)=>{

    console.log('A user has connected: ' + socket.id);

    socket.on('join', (room) => {

        let socketId = socket.id;

        //Sacar de todas las salas
        let updatedSocketsAndRooms = socketsAndRooms.filter(element => {

            if (element.socketId === socketId ) {
                socket.leave(element.room);
                console.log("Socket " + element.socketId + " Leaving room " + element.room);
            } 

            return element.socketId !== socketId
        }
        )

        socketsAndRooms = updatedSocketsAndRooms;

        socketsAndRooms.push({socketId,room});
        console.log(`Socket ${socket.id} joining ${room}`);
        socket.join(room);

    });

    socket.on('new_message', (data) => {

        const roomToEmit = data.roomNumber;

        messages.push(data);
        
        let messagesToEmit = []
        
        messages.forEach( (element)=>{

            if (element.roomNumber === roomToEmit){
                messagesToEmit.push(element.message);
            }

        }
        )

        io.to(roomToEmit).emit('updatedMessages', messagesToEmit);3

    })

    socket.on('updateMessages', (roomNumber) => {

        const roomToEmit = roomNumber;

        let messagesToEmit = []
        
        messages.forEach( (element)=>{

            if (element.roomNumber === roomToEmit){
                messagesToEmit.push(element.message);
            }

        }
        )

        io.to(roomToEmit).emit('updatedMessages', messagesToEmit);
    }
    )

    socket.on('disconnect',()=>{
        console.log("User disconected: " + socket.id);
    })

})

app.get('/', (req,res) => {

    res.sendFile(__dirname + '/client/index.html');

})

server.listen(port, ()=>{
    console.log("listening on port " + port);
})
