import type { Conversation } from "../types"

type ConversationListProps = {
    conversations: Conversation[]
    selectedConversationId: number
    onSelectConversation: (id: number) => void
}

function ConversationList({
    selectedConversationId,
    onSelectConversation,
    conversations,
}: ConversationListProps) {
    return (
        <aside className="w-50 border-r border-gray-200 bg-white">


            <div className="border-b border-gray-200 p-3">
                <h2 className="text-lg font-bold text-gray-900">
                    Conversations
                </h2>
            </div>



            <div>
                {conversations.map((conversation) => (
                    <div
                        key={conversation.id}
                        className={`cursor-pointer border-b border-gray-100 p-2 ${
                            conversation.id === selectedConversationId
                                ? "bg-gray-100"
                                : "hover:bg-gray-50"
                        }`}
                        onClick={() => onSelectConversation(conversation.id)}
                    >
                        <h3 className="font-medium text-gray-900">
                            {conversation.name}
                        </h3>

                        <p className="mt-1 text-sm text-gray-500">
                            {conversation.lastMessage}
                        </p>
                    </div>
                ))}
            </div>


            
        </aside>
    )
}

export default ConversationList