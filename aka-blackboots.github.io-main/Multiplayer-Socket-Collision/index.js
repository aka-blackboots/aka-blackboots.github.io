const express = require('express');
const app = express();
const http = require('http');
const server = http.createServer(app);
const { Server } = require("socket.io");
const io = new Server(server);


app.get('/', (req, res) => {
    res.sendFile(__dirname + '/index.html');
});

app.use("/static", express.static('./static/'));

io.on('connection', (socket) => {
    console.log('Connected User');
    socket.on('username', (initials) => {
        console.log('Connected User'+initials);
    });

    socket.on('player_move', (data) => {
        data.id = socket.id;
        io.emit('player_move', data);
    });

    socket.on('disconnect', () => {
        console.log('User Disconnected');
    });
})

server.listen(4000, () => {
    console.log('Listening on : 4000');
})