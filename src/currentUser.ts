import type { User } from "./types"
import { users } from "./users"

const storedUserId = localStorage.getItem("userId")

export const currentUser: User =
    users.find((user) => user.id === Number(storedUserId)) ?? users[0]