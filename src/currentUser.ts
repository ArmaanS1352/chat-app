import type { User } from "./types"

const storedUserId = localStorage.getItem("userId")

export const storedUserIdNumber = storedUserId
    ? Number(storedUserId)
    : null