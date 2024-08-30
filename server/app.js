import express from "express"
import dotenv from "dotenv"
import colors from "colors"
import cors from "cors"
import userRouter from "./features/users/routes/index.js"
import taskRouter from "./features/tasks/routes/index.js"
import projectRouter from "./features/projects/routes/index.js"
import { createServer } from "http"
import { Client, Teams, Databases, ID, Query, Users } from "node-appwrite"
import { Server } from "socket.io"
dotenv.config()

colors.enable()
const app = express()
const http = createServer(app)

// APPWRITE __INIT__
const globalClient = new Client()
globalClient
  .setEndpoint("https://cloud.appwrite.io/v1")
  .setProject("66d1d5a5001f5266e9ed")
  .setKey("34c22d6268c53b4b0e921aaad10ab07a984c6fae4735a0781a78e61a815167bc5ad164cb9696a54a5e0c80a167df34318359fe1e5b67ce672db0e60fe4a74804e0874a3fa0856e5bddea7fc7bf5b38a70185ac42a69b45beedac1769c56d5ac8e79a1ef37fa4f4339bc7a874b410efb4dd0140d8be95b2c7bd6327321e63b825")
const teams = new Teams(globalClient)
const db = new Databases(globalClient)
const users = new Users(globalClient)

// MIDDLEWARES
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(cors())

// SOCKET.IO
const socketIO = new Server(http, {
  cors: {
    origin: "https://v-qqhf.vercel.app", // Replace with your actual Vercel domain
    methods: ["GET", "POST"], // Optionally specify allowed HTTP methods
  },
})

socketIO.on("connection", (socket) => {
  let roomId = ""
  let chateRoomUsers = []

  console.log(`⚡: ${socket.id} user just connected!`)
  socket.on("disconnect", () => {
    console.log("🔥: A user disconnected")
  })

  socket.on("join_room", async (data) => {
    const CHAT_BOT = "chat_bot"
    const { room_id, user_id, user_name } = data
    roomId = room_id

    try {
      const messages = await db.listDocuments(
        "66d20f4d00038c14ca61",
        "66d20f98003e64152c8a",
        [Query.equal("room_id", room_id), Query.limit(100)]
      )
      // Join Room
      socket.join(room_id)
      // console.log(room_id, user_id)
      roomId = room_id

      // Get All room messages
      socket.emit("get_messages", messages.documents)
    } catch (error) {
      console.log(error.message)
    }

    // When a user is typing
    socket.on("typing", (data) => {
      socket.broadcast.emit("is_typing", data)
    })
  })

  // Send Message
  socket.on("send_message", async (data) => {
    // const {sender_id, message, sender_image, room_id, sender_name, timestamp} = data
    const { room_id, ...rest } = data
    const last_message = {
      user_id: data.sender_id,
      message: data.message,
      timestamp: data.timestamp,
    }
    try {
      // Recieve Message
      socketIO.to(room_id).emit("recieve_message", rest)
      socketIO.to(room_id).emit("last_message", { room_id, ...last_message })
      const msg = await db.createDocument(
        "66d20f4d00038c14ca61",
        "66d20f98003e64152c8a",
        ID.unique(),
        { room_id, ...rest }
      )
      await db.updateDocument(
        "66d20f4d00038c14ca61",
       "66d20f98003e64152c8a",
        room_id,
        { last_message: JSON.stringify(last_message) }
      )
    } catch (error) {
      console.log(error.message)
    }
  })
})

// REST - APIS
app.use("/api/v1/user", userRouter)
app.use("/api/v1/task", taskRouter)
app.use("/api/v1/project", projectRouter)

http.listen("http://66d212360117d3d906db.appwrite.global/", async () => {
  console.log(`Server is running on port http://66d212360117d3d906db.appwrite.global/`.green)
  try {
  } catch (error) {
    console.log(`${error}`.bgRed.white)
  }
})
