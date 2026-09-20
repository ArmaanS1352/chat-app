import { useState, useRef, useEffect } from "react"
import type { Conversation } from "../types"
import MessageBubble from "./MessageBubble"
import { socket } from "../socket"
import { currentUser } from "../currentUser"





type ChatWindowProps = {
    conversation: Conversation
    onSendMessage: (text: string) => void
}

function ChatWindow({conversation, onSendMessage}: ChatWindowProps) {
    const [message, setMessage] = useState("")
    const messagesEndRef = useRef<HTMLDivElement>(null)
    const [isTyping, setIsTyping] = useState(false)
    const typingTimeoutref = useRef<ReturnType<typeof setTimeout> | null>(null)

    useEffect( () => {
        messagesEndRef.current?.scrollIntoView()
    }, [conversation.messages])

    useEffect( () => {
        const handleTyping = () => {
            setIsTyping(true)
        }

        const handleStopTyping = () => {
            setIsTyping(false)
        }

        socket.on("stopTyping", handleStopTyping)

        socket.on("typing", handleTyping)

        return () => {
            socket.off("stopTyping", handleStopTyping)
            socket.off("typing", handleTyping)
        }
    }, [])

    const handleSend = () => {
        if (message.trim() === "")
            return

        onSendMessage(message)
        setMessage("")
    }




    return (
        <main className="flex flex-1 flex-col bg-gray-50">


            <header className="border-b border-gray-200 bg-white p-4">
                <h2 className="font-semibold text-gray-900">
                    {conversation.name}
                </h2>

                <p className="text-sm text-green-600">
                    Online
                </p>
            </header>



            <div className="flex-1 space-y-4 overflow-y-auto p-6">
                {conversation.messages.map((message) => (
                    <MessageBubble
                        key={message.id}
                        message={message}
                        currentUserId={currentUser.id}
                    />
                ))}

                {isTyping && (
                    <p className="text-sm text-gray-500">
                        {conversation.name} is typing...
                    </p>
                )}

                <div ref={messagesEndRef}/>
            </div>
            


            <div className="border-t border-gray-200 bg-white p-4">
                <div className="flex gap-2">
                    <input 
                        type="text" 
                        placeholder="Type a message..."
                        value={message}

                        onChange={(event) => {
                            setMessage(event.target.value)
                            socket.emit("typing")

                            if (typingTimeoutref.current) {
                                clearTimeout(typingTimeoutref.current)
                            }

                            typingTimeoutref.current = setTimeout(() => {
                                socket.emit("stopTyping")
                            }, 1000);
                        }}

                        onKeyDown={(event) => {
                            if (event.key === "Enter")
                                handleSend()
                        }}
                        className="flex-1 rounded-lg border border-gray-500 px-4 py-2 outline-none focus:border-blue-500"
                    />

                    <button 
                        className="border border-black bg-blue-600 rounded-lg px-3"
                        onClick={handleSend}>
                        Send
                    </button>
                </div>
            </div>





        </main>
    )
}

export default ChatWindow