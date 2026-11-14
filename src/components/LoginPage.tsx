import { useState } from "react";
import type { User } from "../types";
import { loginUser, registerUser } from "../users";

type LoginPageProps = {
    setCurrentUser: (user: User) => void
}

function LoginPage({setCurrentUser}: LoginPageProps) {
    const [newUserName, setNewUserName] = useState("")
    const [newUserEmail, setNewUserEmail] = useState("")
    const [newUserPassword, setNewUserPassword] = useState("")
    const [errorMessage, setErrorMessage] = useState("")

    const [loginEmail, setLoginEmail] = useState("")
    const [loginPassword, setLoginPassword] = useState("")
    const [loginError, setLoginError] = useState("")




    const handleLogin = async () => {
        const email = loginEmail.trim()

        if (!email || !loginPassword)
            return

        setLoginError("")

        try {
            const user = await loginUser(email, loginPassword)
            localStorage.setItem("userId", String(user.id))
            setCurrentUser(user)
        } catch (error) {
            setLoginError(error instanceof Error ? error.message :"Login failed")
        }
    }


    const handleCreateUser = async () => {
        const name = newUserName.trim()
        const email = newUserEmail.trim()

        if (!name || !email || !newUserPassword) {
            return
        }

        setErrorMessage("")

        try {
            const user = await registerUser(name, email, newUserPassword)
            localStorage.setItem("userId", String(user.id))
            setCurrentUser(user)
        } catch (error) {
            setErrorMessage(error instanceof Error ? error.message : "Registration failed.")
        }
    }

    

    return (
        <div className="flex h-screen items-center justify-center bg-gray-100">
            
            <div className="w-80 rounded-lg bg-white p-6 shadow">
                <h1 className="text-2x1 font-bold text-gray-900">
                    Chat App
                </h1>

                <p className="mt-2 text-sm text-black">
                    Existing user?
                </p>

                <input
                    className="mt-2 w-full rounded border border-gray-300 p-2"
                    placeholder="Enter your email"
                    type="email"
                    value={loginEmail}
                    onChange={(event) => {
                        setLoginEmail(event.target.value)
                    }}
                />

                <input
                    className="mt-2 w-full rounded border border-gray-300 p-2"
                    placeholder="Enter your password"
                    type="password"
                    value={loginPassword}
                    onChange={(event) => {
                        setLoginPassword(event.target.value)
                    }}
                />

                <button
                    className="mt-4 w-full rounded bg-blue-600 p-2 text-white hover:bg-blue-700"
                    onClick={handleLogin}
                >
                    Login
                </button>

                {loginError && (
                    <p className="mt-2 text-sm text-red-600">
                        {loginError}
                    </p>
                )}

                <div className="mt-6 border-t border-gray-200 pt-6">
                    
                    <p className="text-sm text-gray-900">
                        New User?
                    </p>

                    <input
                        className="mt-2 w-full rounded border border-gray-300 p-2"
                        placeholder="Enter your name"
                        type="text"
                        value={newUserName}
                        onChange={(event) => {
                            setNewUserName(event.target.value)
                        }}
                    />

                    <input
                        className="mt-2 w-full rounded border border-gray-300 p-2"
                        placeholder="Enter your email"
                        type="email"
                        value={newUserEmail}
                        onChange={(event) => {
                            setNewUserEmail(event.target.value)
                        }}
                    />

                    <input
                        className="mt-2 w-full rounded border border-gray-300 p-2"
                        placeholder="Enter your password"
                        type="password"
                        value={newUserPassword}
                        onChange={(event) => {
                            setNewUserPassword(event.target.value)
                        }}
                    />

                    <button
                        className="mt-2 w-full rounded bg-blue-600 border border-gray-300 p-2 text-white hover:bg-blue-700"
                        onClick={handleCreateUser}
                    >
                        Register
                    </button>

                    {errorMessage && (
                        <p className="mt-2 text-sm text-red-600">
                            {errorMessage}
                        </p>
                    )}

                </div>


            </div>
        </div>

        
    )
}


export default LoginPage