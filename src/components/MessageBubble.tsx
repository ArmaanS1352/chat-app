import type { Message } from "../types";

type MessageBubbleProps = {
    message: Message
    currentUserId: number
}

function MessageBubble({message, currentUserId}: MessageBubbleProps) {
    const isMe = currentUserId === message.senderId

    return (
        <div 
            className={`max-w-md rounded-lg p-3 ${
                isMe
                    ? "ml-auto bg-blue-600 text-white"
                    : "bg-white shadow-lg"  
            }`}
        >
            <p>{message.text}</p>

            <p className="mt-1 text-xs opacity-70">
                {new Date(message.timestamp).toLocaleTimeString([], {
                    hour: "numeric",
                    minute: "2-digit",
                })}
            </p>
        </div>
    )
}

export default MessageBubble