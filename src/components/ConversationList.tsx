import { useState } from "react"
import type { Conversation, User } from "../types"


type ConversationListProps = {
    conversations: Conversation[]
    selectedConversationId: number
    onSelectConversation: (id: number) => void
    onConversationsChanged: () => void
    currentUser: User
    users: User[]
}

function ConversationList({
    selectedConversationId,
    onSelectConversation,
    conversations,
    onConversationsChanged,
    currentUser,
    users,
}: ConversationListProps) {
    let count = 1
    const [selectedUserId, setSelectedUserId] = useState<number | null>(null)
    const otherUsers = users.filter((
        (user) => user.id !== currentUser.id
    ))

    const handleCreateConversation = async (otherUserId: number) => {
        const existingConversation = conversations.find((conversation) => {
            const memberIds = conversation.memberships.map(
                (membership) => membership.userId
            )

            return (
                memberIds.length === 2 &&
                memberIds.includes(currentUser.id) &&
                memberIds.includes(otherUserId)
            )
        })

        if (existingConversation) {
            onSelectConversation(existingConversation.id)
            return
        }

        await fetch(
            "http://localhost:3001/api/conversations",
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    currentUserId: currentUser.id,
                    userIds: [currentUser.id, otherUserId],
                }),
            },
        )

        setSelectedUserId(null)
        onConversationsChanged()
    }

    const handleDeleteConversation = async (conversationId: number) => {
        await fetch(
            `http://localhost:3001/api/conversations/${conversationId}`,
            {
                method: "DELETE",
            }
        )

        onConversationsChanged()
    }

    return (
        
        <aside className="flex h-full w-60 flex-col border-r border-gray-200 bg-white">


            <div className="border-b border-gray-200 p-3">
                <h2 className="text-lg font-bold text-gray-900">
                    Conversations
                </h2>
            </div>



            <div>
                {conversations.map((conversation) => {
                    if (!conversation.memberships.some(
                        (membership) => membership.userId === currentUser.id
                    )) {
                        return null
                    }
                    
                    const otherUser = conversation.memberships.find(
                        (membership) => membership.user.id !== currentUser.id
                    )    
                    
                    return (
                        <div
                            key={conversation.id}
                            className={`cursor-pointer border-b border-gray-100 p-2 ${
                                conversation.id === selectedConversationId
                                    ? "bg-gray-100"
                                    : "hover:bg-gray-50"
                            }`}
                            onClick={() => onSelectConversation(conversation.id)} 
                        >

                            <div className="flex items-center justify-between">
                                <h3 className="text-xs text-gray-900">
                                    {count++} 
                                </h3>
                                <h3 className="font-medium text-gray-900">
                                    {otherUser?.user.name}
                                </h3>

                                <button
                                    className="text-sm text-red-500 hover:text-red-700"
                                    onClick={(event) => {
                                        event.stopPropagation()
                                        handleDeleteConversation(conversation.id)
                                    }}
                                >
                                    Delete
                                </button>
                            </div>

                            <p className="mt-1 text-sm text-gray-500">
                                {conversation.lastMessage}
                            </p>
                            
                        </div>
                    )
                })}
            </div>


            <div className="mt-auto p-4">
                <select 
                    className="w-full rounded border border-gray-200 p-2"
                    value={selectedUserId ?? ""}
                    onChange={(event) => {
                        setSelectedUserId(Number(event.target.value))
                    }}    
                >
                    <option value="" disabled>
                        Select a user
                    </option>

                    {otherUsers.map((user) => (
                        <option key={user.id} value={user.id}>
                            {user.name}
                        </option>
                    ))}
                </select>
                    
                <button
                    className="w-full mt-2 rounded border border-gray-200 p-3 text-left font-medium bg-blue-500 hover:bg-gray-50"
                    onClick={() => {
                        if (selectedUserId === null) return
                        handleCreateConversation(selectedUserId)}
                    }
                    disabled={selectedUserId === null}
                >
                    + New Conversation
                </button>

                <p className="p-3 font-bold">
                    {`Logged in as: ${currentUser.name}`}
                </p>
            </div>


            
        </aside>
    )
}

export default ConversationList