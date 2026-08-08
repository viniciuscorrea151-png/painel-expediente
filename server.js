const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const path = require("path");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

const PORT = process.env.PORT || 3000;

app.use(express.static(path.join(__dirname, "public")));

const users = {};

io.on("connection", (socket) => {

    console.log("Novo usuário:", socket.id);

    socket.on("join", (username) => {

        username = String(username || "Anônimo")
            .trim()
            .substring(0, 20);

        users[socket.id] = {
            id: socket.id,
            username
        };

        io.emit("users:update", Object.values(users));

        io.emit("system:message", {
            message: `${username} entrou no expediente. 👀`
        });
    });


    socket.on("chat:message", (message) => {

        const user = users[socket.id];

        if (!user) return;

        message = String(message || "")
            .trim()
            .substring(0, 300);

        if (!message) return;

        io.emit("chat:message", {

            username: user.username,

            message,

            time: new Date().toLocaleTimeString("pt-BR", {
                hour: "2-digit",
                minute: "2-digit"
            })

        });

    });


    socket.on("panic", () => {

        const user = users[socket.id];

        if (!user) return;

        io.emit("panic", {

            username: user.username,

            time: new Date().toLocaleTimeString("pt-BR", {
                hour: "2-digit",
                minute: "2-digit"
            })

        });

    });


    socket.on("disconnect", () => {

        const user = users[socket.id];

        if (user) {

            io.emit("system:message", {

                message:
                    `${user.username} saiu do expediente. 👋`

            });

        }

        delete users[socket.id];

        io.emit(
            "users:update",
            Object.values(users)
        );

    });

});


server.listen(PORT, "0.0.0.0", () => {

    console.log(
        `Servidor rodando na porta ${PORT}`
    );

});
