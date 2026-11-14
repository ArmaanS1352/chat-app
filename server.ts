import { createServer } from "node:http";
import { Server } from "socket.io";
import express from "express"
import { prisma } from "./src/lib/prisma.ts"
import cors from "cors"
import {hashPassword, verifyPassword} from "./src/lib/password.ts"
import session from "express-session"
import SQLiteStoreFactory from "connect-sqlite3"
import path from "node:path"




const app = express()
app.use(express.json())
app.use(cors({
    origin: "http://localhost:5173",
    credentials: true
}))

const httpServer = createServer(app)
const io = new Server(httpServer, {
    cors: {
        origin: "http://localhost:5173",
        credentials: true
    },
})

const SQLiteStore = SQLiteStoreFactory(session)
const sessionStore = new SQLiteStore({db: "sessions.db", dir: path.join(process.cwd(), "prisma"), table: "sessions"})
app.use(session({
    store: sessionStore as session.Store,
    secret: process.env.SESSION_SECRET || "chat-app-dev-secret-change-in-production",
    resave: false,
    saveUninitialized: false,
    cookie: {
        httpOnly: true,
        secure: false,
        sameSite: "lax",
        maxAge: 1000 * 60 * 60 * 24
    }
}))

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
        select: {
            id: true,
            name: true,
            email: true
        },
        orderBy: {
            name: "asc",
        },
    })

    res.json(users)
})

/*app.post("/api/users", async (req, res) => {
    const {name} = req.body

    const user = await prisma.user.create({
        data: {
            name,
        },
    })

    io.emit("userCreated", user)

    res.json(user)
})*/

app.delete("/api/users/:id", async (req, res) => {
    const userId = Number(req.params.id)
    const result = await prisma.user.delete({
        where: {
            id: userId
        }
    })


    res.json({success: true})
})

app.post ("/api/register", async (req, res) => {
    let {name, email, password} = req.body

    if (
        typeof name !== "string" ||
        typeof email !== "string" ||
        typeof password !== "string"
    ) {
        return res.status(400).json({
            error: "Name, email, and password are required."
        })
    }

    name = name.trim()
    email = email.trim().toLocaleLowerCase()

    if (!name || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        return res.status(400).json({
            error: "Please provide a valid name and email."
        })
    }

    if (password.length < 8 || password.length > 20) {
        return res.status(400).json({
            error: "Password must be at least 8 characters and no more than 20."
        })
    }

    const existingUser = await prisma.user.findUnique({
        where: {
            email: email
        }
    })

    if (existingUser) {
        return res.status(409).json({
            error: "An account with this email already exists."
        })
    }

    const passwordHash = await hashPassword(password)

    const user = await prisma.user.create({
        data: {
            name: name,
            email: email,
            passwordHash
        },
        select: {
            id: true,
            name: true,
            email: true
        }
    })

    req.session.userId = user.id

    return res.status(201).json({user})
})

app.post("/api/login", async (req, res) => {
    let {email, password} = req.body

    if (typeof email !== "string" || typeof password !== "string" || !email.trim() || !password) {
        return res.status(400).json({error: "Email and password are required"})
    }

    email = email.trim().toLowerCase()

    const user = await prisma.user.findUnique({
        where: {
            email: email
        }
    })

    if (!user) {
        return res.status(401).json({
            error: "Invalid email or password."
        })
    }

    const isValidPassword = await verifyPassword(password, user.passwordHash)

    if (!isValidPassword) {
        return res.status(401).json({
            error: "Invalid email or password."
        })
    }

    req.session.userId = user.id

    return res.status(200).json({
        user: {
            id: user.id,
            name: user.name,
            email: user.email
        }
    })
})

app.get("/api/me", async (req, res) => {
    const userId = req.session.userId

    if (!userId) {
        return res.status(401).json({error: "Not authenticated"})
    }

    const user = await prisma.user.findUnique({
        where: {id: userId},
        select: {
            id: true,
            name: true,
            email: true,
        },
    })

    if (!user) {
        req.session.destroy(() => {})
        return res.status(401).json({error: "User not found"})
    }

    return res.status(200).json({user})
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



httpServer.listen(3001, "0.0.0.0", () => {
    console.log("Server running on http://0.0.0.0:3001")
})