import type { User } from "./types"


export const fetchUsers = async (): Promise<User[]> => {
    const response = await fetch(
        "http://localhost:3001/api/users"
    )

    return response.json()
}

export const createUser = async (name: string): Promise<User> => {
    const response = await fetch(
        "http://localhost:3001/api/users",
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
