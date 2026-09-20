import type { Conversation } from "./types"

export const conversations: Conversation[] = [
  {
    id: 1,
    name: "Jane Doe",
    lastMessage: "Nice! What are you building?",
    messages: [
      {
        id: 1,
        text: "Hey! How's it going?",
        sender: "other",
        timestamp: new Date(),
      },
      {
        id: 2,
        text: "Pretty good! Working on my new project.",
        sender: "me",
        timestamp: new Date(),
      },
      {
        id: 3,
        text: "Nice! What are you building?",
        sender: "other",
        timestamp: new Date(),
      },
    ],
  },
  {
    id: 2,
    name: "Mike Smith",
    lastMessage: "See you tomorrow!",
    messages: [
      {
        id: 4,
        text: "Are we still meeting tomorrow?",
        sender: "me",
        timestamp: new Date(),
      },
      {
        id: 5,
        text: "Yep! See you tomorrow!",
        sender: "other",
        timestamp: new Date(),
      },
    ],
  },
]