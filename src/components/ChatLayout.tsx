import ConversationList from "./ConversationList";
import ChatWindow from "./ChatWindow";
import {useEffect, useState } from "react";
import { socket} from "../socket";
import type { Conversation, Message, User } from "../types";
import { fetchCurrentUser, fetchUsers } from "../users";
import { API_URL } from "../api";
import LoginPage from "./LoginPage";



function ChatLayout() {
    const [selectedConversationId, setSelectedConversationId] = useState(1)
    const [conversationData, setConversationData] = useState<Conversation[]>([])
    const [users, setUsers] = useState<User[]>([])
    const [onlineUserIds, setOnlineUserIds] = useState<number[]>([])
    const [currentUser, setCurrentUser] = useState<User | null>(null)
    const [isCheckingSession, setIsCheckingSession] = useState(true)
    const selectedConversation = conversationData.find(
        (conversation) => conversation.id === selectedConversationId
    )

    useEffect(() => {
        const handleOnlineUsers = (userIds: number[]) => {
            setOnlineUserIds(userIds)
        }

        const handleUserOnline = (userId: number) => {
            setOnlineUserIds((currentIds) => {
                if (currentIds.includes(userId))
                    return currentIds

                return [...currentIds, userId]
            })
        }

        const handleUserOffline = (userId: number) => {
            setOnlineUserIds((currentIds) => currentIds.filter((id) => id !== userId))
        }

        socket.on("userOnline", handleUserOnline)
        socket.on("userOffline", handleUserOffline)
        socket.on("onlineUsers", handleOnlineUsers)

        return () => {
            socket.off("userOnline", handleUserOnline)
            socket.off("userOffline", handleUserOffline)
            socket.off("onlineUsers", handleOnlineUsers)
        }
    }, [])

    const fetchConversations = async () => {
        const response = await fetch(
            `${API_URL}/api/conversations`
        )
        const data = await response.json()
        setConversationData(data)
    }

    useEffect(() => {
        const loadUsers = async () => {
            const data = await fetchUsers()
            setUsers(data)
        }

        loadUsers()
    }, [])

    useEffect(() => {
        const loadConversations = async () => {
            const response = await fetch(
                `${API_URL}/api/conversations`
            )
            const data = await response.json()
            setConversationData(data)
        }

        loadConversations()
    }, [])

    useEffect(() => {
        if (!currentUser)
            return

        socket.emit("joinUser", currentUser.id)
    }, [currentUser])


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
        const handleConversationCreated = (conversation: Conversation) => {
            setConversationData((currentConversations) => {
                const alreadyExists = currentConversations.some(
                    (existingConversation) => existingConversation.id === conversation.id
                )

                if (alreadyExists)
                    return currentConversations

                return [...currentConversations, conversation]
            })
        }

        socket.on("conversationCreated", handleConversationCreated)

        return () => {
            socket.off("conversationCreated", handleConversationCreated)
        }
    }, [])

    useEffect(() => {
        const handleConversationDeleted = () => {
            fetchConversations()
        }

        socket.on("conversationDeleted", handleConversationDeleted)

        return () => {
            socket.off("conversationDeleted", handleConversationDeleted)
        }
    })

    const handleSendMessage = (text: string) => {
        if (!currentUser)
            return

        socket.emit("sendMessage", {
            text,
            conversationId: selectedConversationId,
            senderId: currentUser.id,
        })
    }

    useEffect(() => {
        const handleUserCreated = (user: User) => {
            setUsers((currentUsers) => [...currentUsers, user])
        }

        socket.on("userCreated", handleUserCreated)

        return () => {
            socket.off("userCreated", handleUserCreated)
        }
    }, [])

    useEffect(() => {
        const checkSession = async () => {
            try {
                const user = await fetchCurrentUser()
                if (user)
                    setCurrentUser(user)
            } catch (error) {
                console.error("Session check failed:", error)
            } finally {
                setIsCheckingSession(false)
            }
        }

        checkSession()
    }, [])

    if (isCheckingSession) {
        return (
            <div className="flex h-screen items-center justify-center">
                Loading...
            </div>
        )
    }

    if (!currentUser) {
        return <LoginPage setCurrentUser={setCurrentUser}/>
    }



    return (
        <div className="flex h-screen">
            <ConversationList 
                conversations={conversationData}
                selectedConversationId={selectedConversationId}
                onSelectConversation={setSelectedConversationId}
                onConversationsChanged={fetchConversations}
                currentUser={currentUser}
                users={users}
            />
            {selectedConversation && (
                <ChatWindow 
                    conversation={selectedConversation}
                    onSendMessage={handleSendMessage}
                    currentUserId={currentUser.id}
                    onlineUserIds={onlineUserIds}
                />
            )}
        </div>
    )



}



export default ChatLayout