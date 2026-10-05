import { io } from "socket.io-client";

export const socket = io(import.meta.env.VITE_API_URL)

socket.on("connect", () => {
    console.log("connected to server", socket.id)
})

socket.on("connect_error", (error) => {
    console.error("Connection failed: ", error.message)
})