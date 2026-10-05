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

const onlineUsers = new Set<number>()



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
    const {currentUserId, userIds} = req.body

    const users = await prisma.user.findMany({
        where: {
            id: {
                in: userIds,
            },
        },
    })

    const name = users
        .filter((user) => user.id !== currentUserId)
        .map((user) => user.name)
        .join(", ")

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
            messages: {
                orderBy: {
                    timestamp: "asc",
                },
            },
        },
    })

    const lastMessage =
        conversation.messages.length > 0
            ? conversation.messages[conversation.messages.length - 1].text
            : ""
    
    const formatted = {
        id: conversation.id,
        name: conversation.name,
        lastMessage,
        messages: conversation.messages,
        memberships: conversation.memberships,
    }

    conversation.memberships.forEach((membership) => {
        io.to(`user-${membership.userId}`).emit(
            "conversationCreated",
            formatted
        )
    })

    res.json(formatted)
})

app.delete("/api/conversations/:id", async (req, res) => {
    const conversationId = Number(req.params.id)

    const conversation = await prisma.conversation.findUnique({
        where: {
            id: conversationId,
        },
        include: {
            memberships: true,
        },
    })

    const memberIds = conversation?.memberships.map(
        (membership) => membership.userId
    )

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

    memberIds?.forEach((userId) => {
        io.to(`user-${userId}`).emit(
            "conversationDeleted",
            conversationId
        )
    })

    res.json({success: true})
})

app.get("/api/users", async (_req, res) => {
    const users = await prisma.user.findMany({
        orderBy: {
            name: "asc",
        },
    })

    res.json(users)
})

app.post("/api/users", async (req, res) => {
    const {name} = req.body

    const user = await prisma.user.create({
        data: {
            name,
        },
    })

    res.json(user)
})

app.delete("/api/users/:id", async (req, res) => {
    const userId = Number(req.params.id)
    const result = await prisma.user.delete({
        where: {
            id: userId
        }
    })

    console.log("DELETE RESULT:", result)

    res.json({success: true})
})



io.on("connection", (socket) => {

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
        if (currentUserId !== null) {
            onlineUsers.delete(currentUserId)
            socket.broadcast.emit("userOffline", currentUserId)
        }
        
        console.log("User disconnected:", socket.id)
    })





    let currentUserId: number | null = null 

    socket.on("joinUser", (userId) => {
        currentUserId = userId
        socket.join(`user-${userId}`)
        onlineUsers.add(userId)
        socket.emit("onlineUsers", Array.from(onlineUsers))
        socket.broadcast.emit("userOnline", userId)
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