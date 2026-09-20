import { createServer } from "node:http";
import { Server } from "socket.io";
import express from "express"
import { prisma } from "./src/lib/prisma"
import cors from "cors"



const app = express()

app.use(cors({
    origin: "http://localhost:5173",
}))

const httpServer = createServer(app)

const io = new Server(httpServer, {
    cors: {
        origin: "http://localhost:5173"
    },
})



app.get("/api/conversations", async(_req, res) => {
    const conversations = await prisma.conversation.findMany({
        include: {
            memberships: {
                include: {user: true,},
            },
            messages: {
                include: {sender: true,},
                orderBy: {timestamp: "asc"},
            },
        },
    })

    const formatted = conversations.map((conversation) => {
        const lastMessage = conversation.messages.length > 0
                            ? conversation.messages[conversation.messages.length - 1].text
                            : ""
        
        return {
            id: conversation.id,
            name: conversation.name,
            lastMessage,
            messages: conversation.messages,
        }
    })

    res.json(formatted)
})




io.on("connection", (socket) => {
    console.log("User connected:", socket.id)


    socket.on("sendMessage", async (data) => {
        const message = await prisma.message.create({
            data: {
                text: data.text,
                conversationId: data.conversationId,
                senderId: data.senderId,
            },
        })

        io.to(`conversation-${message.conversationId}`).emit("message", message)
    })


    socket.on("disconnect", () => {
        console.log("User disconnected:", socket.id)
    })
    socket.on("typing", () => {
        socket.broadcast.emit("typing")
    })
    socket.on("stopTyping", () => {
        socket.broadcast.emit("stopTyping")
    })



    let currentConversationId: number | null = null

    socket.on("joinConversation", (conversationId) => {
        if (currentConversationId !== null) {
            socket.leave(`conversation-${currentConversationId}`)
            console.log("left conversation: ", currentConversationId)
        }

        socket.join(`conversation-${conversationId}`)
        currentConversationId = conversationId

        console.log("joined conversation: ", conversationId)
    })

})



httpServer.listen(3001, () => {
    console.log("Server running on http://localhost:3001")
})