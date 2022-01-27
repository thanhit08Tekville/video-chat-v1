var fs = require("fs");

var options = {
    key: fs.readFileSync("server.key"),
    cert: fs.readFileSync("server.cert")
};

// var app = require("https").createServer(optionis, handler), io = require()

const express = require("express");
const app = express();
var https = require("https");

const server = require("http").Server(app);

const servers = https.Server(app);
const {
    v4: uuidv4
} = require("uuid");
app.set("view engine", "ejs");
const io = require("socket.io")(servers, {
    cors: {
        origin: '*'
    }
});

// const fs = require('fs');
const { PeerServer } = require('peer');

const peerServer = PeerServer({
    port: 443,
    ssl: {
        key: fs.readFileSync('server.key'),
        cert: fs.readFileSync('server.cert')
    }
});

// const {
//     ExpressPeerServer
// } = require("peer");
// const peerServer = ExpressPeerServer(servers, {
//     debug: true,
// });

app.use("/peerjs", peerServer);
app.use(express.static("public"));

app.get("/", (req, res) => {
    res.redirect(`/${uuidv4()}`);
});

app.get("/:room", (req, res) => {
    res.render("room", {
        roomId: req.params.room
    });
});

io.on("connection", (socket) => {
    socket.on("join-room", (roomId, userId, userName) => {
        debug(userId)
        socket.join(roomId);
        socket.to(roomId).broadcast.emit("user-connected", userId);
        socket.on("message", (message) => {
            io.to(roomId).emit("createMessage", message, userName);
        });
    });
});

https
    .createServer({
            key: fs.readFileSync("server.key"),
            cert: fs.readFileSync("server.cert"),
        },
        app
    )
    .listen(3000, function() {
        console.log(
            "Example app listening on port 3000! Go to https://localhost:3000/"
        );
    });

// server.listen(process.env.PORT || 3030);