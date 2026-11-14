import type { User } from "./types"
import { API_URL } from "./api"


export const fetchUsers = async (): Promise<User[]> => {
    const response = await fetch(
        `${API_URL}/api/users`
    )

    return response.json()
}

export async function registerUser (name: string, email: string, password: string) {
    const response = await fetch(`${API_URL}/api/register`, {
        method: "POST",
        headers: {"Content-Type": "application/json",},
        body: JSON.stringify({name, email, password}),
        credentials: "include",
    })

    const data = await response.json()

    if (!response.ok) {
        throw new Error(data.error || "Registration failed")
    }

    return data.user
}


export async function loginUser(email:string, password: string) {
    const response = await fetch(`${API_URL}/api/login`, {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({email, password}),
        credentials: "include",
    })

    const data = await response.json()

    if (!response.ok) {
        throw new Error(data.error || "Login failed")
    }
    
    return data.user
}


export async function fetchCurrentUser() {
    const response = await fetch(`${API_URL}/api/me`, {
        credentials: "include"
    })

    if (response.status === 401)
        return null

    if (!response.ok)
        throw new Error("Failed to retrieve current user.")

    const data = await response.json()

    return data.user
}