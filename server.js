const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static(__dirname)); 
// 👆 это отдаёт index.html автоматически

let users = {};

io.on("connection", (socket) => {
    socket.on("join", (username) => {
        users[socket.id] = username;
        io.emit("users", users);
    });

    socket.on("private_message", (data) => {
        for (let id in users) {
            if (users[id] === data.to) {
                io.to(id).emit("private_message", {
                    from: users[socket.id],
                    message: data.message
                });
            }
        }
    });

    socket.on("signal", (data) => {
        io.to(data.toSocket).emit("signal", data);
    });

    socket.on("disconnect", () => {
        delete users[socket.id];
        io.emit("users", users);
    });
});

server.listen(3000, () => {
    console.log("Server running http://localhost:3000");
});