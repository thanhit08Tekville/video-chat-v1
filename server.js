const express = require("express");
const app = express();
const path = require("path");
// const { PeerServer } = require("peer");
const { ExpressPeerServer } = require("peer");
const { v4: uuidV4 } = require("uuid");

const server = require("http").Server(app);
const io = require("socket.io")(server);

const PORT = process.env.PORT || 3000;
const expServer = server.listen(PORT, () =>
    console.log(`Server started on port ${PORT}`)
);

const peerServer = ExpressPeerServer(expServer, {
    path: "/peer",
});

app.set("view engine", "ejs");
app.use(express.static(path.join(__dirname, "/public")));

app.use(peerServer);

app.get("/", (req, res) => {
    res.redirect(`/${uuidV4()}`);
});

app.get("/:room", (req, res) => {
    res.render("room", {
        roomId: req.params.room,
        PORT,
        host: process.env.host | "/",
    });
});

io.on("connection", (socket) => {
    socket.on("join-room", (roomId, userId) => {
        socket.join(roomId);
        socket.to(roomId).broadcast.emit("user-connected", userId);

        socket.on("disconnect", () => {
            socket.to(roomId).broadcast.emit("user-disconnected", userId);
        });
    });
});