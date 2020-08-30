const express = require("express");
const socket = require("socket.io");

const app = express();
const server = app.listen(process.env.PORT);


app.get("/game/style.css", (req, res) => {
    res.sendFile("game/style.css", { root: __dirname });
});
app.get("/game/tile.js", (req, res) => {
    res.sendFile("game/tile.js", { root: __dirname });
});
app.get("/game/game.js", (req, res) => {
    res.sendFile("game/game.js", { root: __dirname });
});
app.get("/game/app.js", (req, res) => {
    res.sendFile("game/app.js", { root: __dirname });
});

app.get("/error/style.css", (req, res) => {
    res.sendFile("error/style.css", { root: __dirname });
});

app.get("/gameid=:id", (req, res) => {
    let id = req.params.id;

    if (Object.keys(io.sockets.adapter.rooms).includes(id) && io.sockets.adapter.rooms[id].length < 2) {
        res.sendFile("game/index.html", { root: __dirname });  
        futureGameIds.splice(futureGameIds.indexOf(id), 1);
    } else if (futureGameIds.includes(id)) {
        res.sendFile("game/index.html", { root: __dirname });  
        futureGameIds.splice(futureGameIds.indexOf(id), 1);
    } else {
        res.sendFile("error/index.html", { root: __dirname });
    }

});

app.use(express.static("public"));

const io = socket(server);

io.sockets.on("connection", newConnection);

let x = "black";
let futureGameIds = [];

function newConnection(socket) {
    console.log("new connection at:" + socket.id);

    if (socket.handshake.headers.referer.indexOf("gameid") != -1) {
        let room = socket.handshake.headers.referer.split("gameid=");
        room = room[room.length - 1];

        socket.join(room);

        if (io.sockets.adapter.rooms[room].length == 1) {
            socket.emit("showUrl");
        } else if (io.sockets.adapter.rooms[room].length == 2) {
            let socketsInRoom = Object.keys(io.sockets.adapter.rooms[room].sockets);
            io.to(socketsInRoom[0]).emit("setup", { color: "black" });
            io.to(socketsInRoom[1]).emit("setup", { color: "white" });
        }

        socket.on("move", newMessage);
        socket.on("gameover", gameover);
        socket.on("rematchRequested", rematchRequested);
        socket.on("rematchAccepted", rematchAccepted);

        socket.on("disconnect", disconnection);

        function newMessage(data) {
            console.log(socket.rooms);
            socket.to(room).emit("move", data);

        }

        function gameover(data) {
            socket.to(room).emit("gameover", data);
        }

        function rematchRequested() {
            socket.to(room).emit("rematchRequested");
        }

        function rematchAccepted() {
            socket.to(room).emit("rematchAccepted");
        }

        function disconnection() {
            let currentRoom = io.sockets.adapter.rooms[room];
            if (currentRoom != undefined) {
                let socketId = Object.keys(io.sockets.adapter.rooms[room].sockets)[0];
                let lastSocket = io.sockets.sockets[socketId];

                lastSocket.leave(room);
                lastSocket.emit("opponentDisconnected");
            }
        }

    } else {
        socket.on("creategame", creategame);

        function creategame() {
            let gameId = Math.random().toString(36).substr(2, 9);
            futureGameIds.push(gameId);
            socket.emit("createdgame", { id: gameId });
        }
    }

}

console.log("running");