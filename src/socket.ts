import { io } from "socket.io-client";
import { API_URL } from "./api";

export const socket = io(API_URL)

socket.on("connect", () => {
    console.log("connected to server", socket.id)
})

socket.on("connect_error", (error) => {
    console.error("Connection failed: ", error.message)
})