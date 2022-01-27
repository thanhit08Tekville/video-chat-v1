const express = require('express');
const app = express();
const http = require('http');
const server = http.createServer(app);

const { v4: uuidv4 } = require("uuid");
app.set("view engine", "ejs");
const { Server } = require("socket.io");
// const io = require("socket.io")(server, {
//     allowEIO3: true,
//     cors: {
//         origin: '*'
//     }
// });

const io = require("socket.io")(server, {
    allowEIO3: true,
    cors: {
        origin: '*'
    }
});
io.configure(function() {
    io.set("transports", ["xhr-polling"]);
    io.set("polling duration", 10);
});

const { ExpressPeerServer } = require("peer");
const { isObject } = require('util');
const peerServer = ExpressPeerServer(server, {
    debug: true
});

app.use("/peerjs", peerServer);
app.use(express.static("public"));

app.get("/", (req, res) => {
    res.redirect(`/${uuidv4()}`);
});

app.get("/:room", (req, res) => {
    res.render("room", { roomId: req.params.room });
});

io.on("connection", (socket) => {
    socket.on("join-room", (roomId, userId, userName) => {
        socket.join(roomId);
        socket.to(roomId).broadcast.emit("user-connected", userId);
        socket.on("message", (message) => {
            io.to(roomId).emit("createMessage", message, userName);
        });
    });
});

server.listen(process.env.PORT || 3030);