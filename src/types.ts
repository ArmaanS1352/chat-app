export type Message = {
    id: number
    text: string
    senderId: number
    conversationId: number
    timestamp: string
}

export type ConversationMember = {
    id: number
    conversationId: number
    userId: number
    user: User
}

export type Conversation = {
    id: number
    name: string
    lastMessage: string
    messages: Message[]
    memberships: ConversationMember[]
}

export type User = {
    id: number
    name: string
}