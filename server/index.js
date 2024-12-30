import express from "express";
import { Server } from "socket.io";
import { createServer } from "node:http";

const port = process.env.PORT || 3001;
const app = express();
const server = createServer(app);
const io = new Server(server, {
    cors: {
        origin: ["https://itranslides.vercel.app", "http://localhost:3000", "https://itransition-coursep.vercel.app"],
        methods: ["GET", "POST"],
    },
});

app.use(express.json());


const presentations = {};
const users = {};

io.on("connection", socket => {
	console.log("A client connected:", socket.id)

    socket.on("new presentation", () => {
        io.emit("New Presentation")
    })

    socket.on("delete presentation", () => {
        io.emit("Delete Presentation")
    })
    
    socket.on("new slide", () => {
        io.emit("New Slide")
    })

    socket.on("delete slide", () => {
        io.emit("Delete Slide")
    })

    socket.on("slide change", () => {
        io.emit("Slide Change")
    })

    socket.on("join presentation", ({ user, presentationId }) => {
        if (!users[presentationId]) {
			users[presentationId] = []
		}
        const userExists = users[presentationId].some((u) => u._id === user._id);
        if (!userExists) {
            users[presentationId].push(user);
        }
        io.emit("update users", users[presentationId]);
    }); 

    socket.on("leave presentation", ({ user, presentationId }) => {
        if (users[presentationId]) {
            users[presentationId] = users[presentationId].filter((u) => u._id !== user._id);
            io.emit("update users", users[presentationId]);
        }
        socket.leave(presentationId);
    });

    socket.on("update comments", async () => {
        io.emit("Update Comments")
    })

    socket.on("liked template", async () => {
        io.emit("Liked Template")
    })

    socket.on("question updated", async () => {
        io.emit("Question Updated")
    })

    socket.on("disconnect", () => {
        console.log("A user disconnected", socket.id);
        for (const [presentationId, userList] of Object.entries(users)) {
            users[presentationId] = userList.filter((u) => u.socketId !== socket.id);
            io.to(presentationId).emit("update users", users[presentationId]);
        }
    });
})

app.get("/", (req, res) => {
    res.send("Hello World");
});

server.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});