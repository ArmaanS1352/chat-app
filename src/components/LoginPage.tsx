import { useEffect, useState } from "react";
import type { User } from "../types";
import { fetchUsers } from "../users";
import { createUser } from "../users";

type LoginPageProps = {
    setCurrentUser: (user: User) => void
}

function LoginPage({setCurrentUser}: LoginPageProps) {
    const [users, setUsers] = useState<User[]>([])
    const [selectedUserId, setSelectedUserId] = useState<number | null>(null)
    const [newUserName, setNewUserName] = useState("")

    useEffect(() => {
        const loadUsers = async () => {
            const data = await fetchUsers()
            setUsers(data)
        }

        loadUsers()
    }, [])

    const handleLogin = () => {
        if (selectedUserId === null)
            return

        const user = users.find(
            (user) => user.id === selectedUserId
        )

        if (!user)
            return

        localStorage.setItem("userId", String(user.id))
        setCurrentUser(user)
    }


    const handleCreateUser = async () => {
        const name = newUserName.trim()

        if (name === "")
            return

        const user = await createUser(name)
        localStorage.setItem("userId", String(user.id))
        setCurrentUser(user)
    }

    const handleDeleteUser = async () => {
        if (selectedUserId === null)
            return

        await fetch(
        `http://localhost:3001/api/users/${selectedUserId}`,
        {
            method: "DELETE"
        })

        setUsers(await fetchUsers())
    }


    return (
        <div className="flex h-screen items-center justify-center bg-gray-100">
            
            <div className="w-80 rounded-lg bg-white p-6 shadow">
                <h1 className="text-2x1 font-bold text-gray-900">
                    Chat App
                </h1>

                <p className="mt-2 text-sm text-gray-500">
                    Who are you?
                </p>

                <select 
                    className="mt-4 w-full rounded border border-gray-300 p-2"
                    value={selectedUserId ?? ""}
                    onChange={(event) => {
                        setSelectedUserId(Number(event.target.value))
                    }}
                >
                    <option value="" disabled>
                        Select a user
                    </option>

                    {users.map((user) => (
                        <option key={user.id} value={user.id}>
                            {user.name}
                        </option>
                    ))}
                </select>

                <button
                    className="mt-4 w-full rounded bg-blue-600 p-2 text-white hover:bg-blue-700"
                    onClick={handleLogin}
                >
                    Continue
                </button>

                <button
                    className="mt-4 w-full rounded bg-blue-600 p-2 text-white hover:bg-blue-700"
                    onClick={handleDeleteUser}
                >
                    Delete User
                </button>

                <div className="mt-6 border-t border-gray-200 pt-6">
                    
                    <p className="text-sm font-medium text-gray-900">
                        New User
                    </p>

                    <input
                        className="mt-2 w-full rounded border border-gray-300 p-2"
                        placeholder="Enter your name"
                        value={newUserName}
                        onChange={(event) => {
                            setNewUserName(event.target.value)
                        }}
                    />

                    <button
                        className="mt-2 w-full rounded bg-blue-600 border border-gray-300 p-2 text-white hover:bg-blue-700"
                        onClick={handleCreateUser}
                    >
                        Create User
                    </button>
                </div>


            </div>
        </div>

        
    )
}


export default LoginPage