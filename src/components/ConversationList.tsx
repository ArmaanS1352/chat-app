import type { Conversation } from "../types"
import { currentUser } from "../currentUser"



type ConversationListProps = {
    conversations: Conversation[]
    selectedConversationId: number
    onSelectConversation: (id: number) => void
    onConversationsChanged: () => void
}

function ConversationList({
    selectedConversationId,
    onSelectConversation,
    conversations,
    onConversationsChanged,
}: ConversationListProps) {
    let count = 1

    const handleCreateConversation = async () => {
        const response = await fetch(
            "http://localhost:3001/api/conversations",
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    name: "New Conversation",
                    userIds: [7, 8],
                })
            },
        )

        const conversation = await response.json()

        console.log(conversation)
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
        
        <aside className="flex h-full w-50 flex-col border-r border-gray-200 bg-white">


            <div className="border-b border-gray-200 p-3">
                <h2 className="text-lg font-bold text-gray-900">
                    Conversations
                </h2>
            </div>



            <div>
                {conversations.map((conversation) => {
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
                <button
                    className="w-full rounded border border-gray-600 p-2 text-left font-medium bg-blue-500 hover:bg-blue-700"
                    onClick={handleCreateConversation}
                >
                    + New Conversation
                </button>
            </div>


            
        </aside>
    )
}

export default ConversationList