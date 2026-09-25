import { createServer } from "node:http";
import { Server } from "socket.io";
import express from "express"
import { prisma } from "./src/lib/prisma"
import cors from "cors"



const app = express()
app.use(express.json())

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
            memberships: conversation.memberships,
        }
    })

    res.json(formatted)
})

app.post("/api/conversations", async (req, res) => {
    const {name, userIds} = req.body

    const conversation = await prisma.conversation.create({
        data: {
            name,
            memberships: {
                create: userIds.map((userId: number) => ({
                    userId,
                })),
            },
        },
        include: {
            memberships: {
                include: {
                    user: true,
                },
            },
            messages: true,
        },
    })

    res.json(conversation)
})

app.delete("/api/conversations/:id", async (req, res) => {
    const conversationId = Number(req.params.id)

    await prisma.message.deleteMany({
        where: {
            conversationId,
        },
    })

    await prisma.conversationMember.deleteMany({
        where: {
            conversationId,
        },
    })

    await prisma.conversation.delete({
        where: {
            id: conversationId,
        },
    })

    res.json({success: true})
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

        const conversation = await prisma.conversation.findUnique({
            where: {
                id: message.conversationId,
            },
            include: {
                memberships: true,
            },
        })

        conversation?.memberships.forEach((membership) => {
            io.to(`user-${membership.userId}`).emit(
                "message",
                message
            )
        })
    })

    socket.on("disconnect", () => {
        console.log("User disconnected:", socket.id)
    })





    let currentUserId: number | null = null 

    socket.on("joinUser", (userId) => {
        currentUserId = userId
        socket.join(`user-${userId}`)
        console.log("Joined user room: ", userId)
    })

    socket.on("typing", async (conversationId) => {
        const conversation = await prisma.conversation.findUnique({
            where: {
                id: conversationId,
            },
            include: {
                memberships: true,
            },
        })

        conversation?.memberships.forEach((membership) => {
            if (membership.userId !== currentUserId) {
                io.to(`user-${membership.userId}`).emit("typing", conversationId)
            }
        })
    })

    socket.on("stopTyping", async (conversationId) => {
        const conversation = await prisma.conversation.findUnique({
            where: {
                id: conversationId,
            },
            include: {
                memberships: true,
            },
        })

        conversation?.memberships.forEach((membership) => {
            if (membership.userId !== currentUserId) {
                io.to(`user-${membership.userId}`).emit("stopTyping", conversationId)
            }
        })
    })



})



httpServer.listen(3001, () => {
    console.log("Server running on http://localhost:3001")
})