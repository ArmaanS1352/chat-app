import { io } from "socket.io-client";

export const socket = io("http://localhost:3001")

socket.on("connect", () => {
    console.log("connected to server", socket.id)
})

socket.on("connect_error", (error) => {
    console.error("Connection failed: ", error.message)
})