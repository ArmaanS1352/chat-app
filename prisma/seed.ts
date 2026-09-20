import { PrismaClient } from "../src/generated/client";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";

const adapter = new PrismaBetterSqlite3({
    url: "file:./prisma/dev.db",
})

const prisma = new PrismaClient({
    adapter,
})

async function main() {
    const jane = await prisma.user.create({
        data: {
            name: "Jane",
        },
    })

    const mike = await prisma.user.create({
        data: {
            name: "Mike",
        },
    })

    const conversation = await prisma.conversation.create({
        data: {
            name: "Jane",
        },
    })

    await prisma.conversationMember.create({
    data: {
        conversationId: conversation.id,
        userId: jane.id,
    },
    })

    await prisma.conversationMember.create({
        data: {
            conversationId: conversation.id,
            userId: mike.id,
        },
    })

    const message1 = await prisma.message.create({
    data: {
        text: "Hey! How are you?",
        conversationId: conversation.id,
        senderId: jane.id,
    },
    })

    const message2 = await prisma.message.create({
        data: {
            text: "I'm doing good! Working on the chat app.",
            conversationId: conversation.id,
            senderId: mike.id,
        },
    })

    const message3 = await prisma.message.create({
        data: {
            text: "Nice! How is it coming along?",
            conversationId: conversation.id,
            senderId: jane.id,
        },
    })

    console.log("Created users:", jane, mike)
    console.log("Created conversations:", conversation)
}

main()