export type Message = {
    id: number
    text: string
    senderId: number
    conversationId: number
    timestamp: string
}

export type Conversation = {
    id: number
    name: string
    lastMessage: string
    messages: Message[]
}