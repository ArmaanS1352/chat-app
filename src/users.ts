import type { User } from "./types"
import { API_URL } from "./api"


export const fetchUsers = async (): Promise<User[]> => {
    const response = await fetch(
        `${API_URL}/api/users`
    )

    return response.json()
}

export const createUser = async (name: string): Promise<User> => {
    const response = await fetch(
        `${API_URL}/api/users`,
        {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({name})
        }
    )

    return response.json()
}
