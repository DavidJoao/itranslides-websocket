import express from "express"
import { Server } from "socket.io"
import { createServer } from "node:http"

const port = process.env.PORT ?? 3001

const app = express()
const server = createServer(app)
const io = new Server(server, {
	cors: {
		origin: "http://localhost:3000",
		methods: ["GET", "POST"],
	},
})

app.use(express.json());



io.on("connection", socket => {
	console.log("A client connected:", socket.id)

	socket.on("disconnect", () => {
		console.log("Client disconnected:", socket.id)
	})

    socket.on("new presentation", () => {
        io.emit("New Presentation")
    })

    socket.on("delete presentation", () => {
        io.emit("Delete Presentation")
    })
})

app.get("/", (req, res) => {
	res.send("Hello World")
})

server.listen(port, () => {
	console.log(`Running on port ${port}`)
})
