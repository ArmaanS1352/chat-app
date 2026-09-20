import ConversationList from "./ConversationList";
import ChatWindow from "./ChatWindow";
import { useEffect, useState } from "react";
import { socket} from "../socket";
import type { Conversation } from "../types";
import type { Message } from "../types";




function ChatLayout() {
    const [selectedConversationId, setSelectedConversationId] = useState(1)
    const [conversationData, setConversationData] = useState<Conversation[]>([])
    const selectedConversation = conversationData.find(
        (conversation) => conversation.id === selectedConversationId
    )



    useEffect(() => {
        const fetchConversations = async () => {
            const response = await fetch(
                "http://localhost:3001/api/conversations"
            )
            const data = await response.json()
            setConversationData(data)
        }

        fetchConversations()

    }, [selectedConversationId])




    useEffect(() => {
        const handleMessage = (message: Message) => {
            setConversationData((currentConversations) =>
                currentConversations.map((conversation) => {
                    if (conversation.id !== message.conversationId) {
                        return conversation
                    }

                    return {
                        ...conversation,
                        lastMessage: message.text,
                        messages: [...conversation.messages, message],
                    }
                })
            )
        }

        socket.on("message", handleMessage)

        return () => {
            socket.off("message", handleMessage)
        }

    }, [])



    useEffect(() => {
        socket.emit("joinConversation", selectedConversationId)
    }, [selectedConversationId])
    

    const handleSendMessage = (text: string) => {
        socket.emit("sendMessage", {
            text,
            conversationId: selectedConversationId,
            senderId: 7,
        })
    }




    return (
        <div className="flex h-screen">
            <ConversationList 
                conversations={conversationData}
                selectedConversationId={selectedConversationId}
                onSelectConversation={setSelectedConversationId}
            />
            {selectedConversation && (
                <ChatWindow 
                    conversation={selectedConversation}
                    onSendMessage={handleSendMessage}
                />
            )}
        </div>
    )



}



export default ChatLayout