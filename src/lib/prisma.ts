import { PrismaClient } from "../generated/client";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3"

const adapter = new PrismaBetterSqlite3({
    url: "file:./prisma/dev.db",
})
export const prisma = new PrismaClient({
    adapter,
})