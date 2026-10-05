# Real-Time Chat App

A full-stack real-time chat application built with React, TypeScript, Express, Socket.io, Prisma, and SQLite.

## Features

* User creation and login
* One-to-one conversations
* Real-time messaging with Socket.io
* Typing indicators
* Online/offline status
* Persistent messages and conversations
* Conversation history after restarting the app
* Real-time user and conversation creation
* SQLite database with Prisma migrations

## Tech Stack

**Frontend**

* React
* TypeScript
* Vite
* Tailwind CSS

**Backend**

* Node.js
* Express
* Socket.io
* Prisma
* SQLite

## Running Locally

### Requirements

* [Node.js](https://nodejs.org/) installed

### Setup

Clone the repository and enter the project directory:

```bash
git clone https://github.com/ArmaanS1352/chat-app.git
cd chat-app
```

Install dependencies:

```bash
npm install
```

Initialize the SQLite database:

```bash
npm run setup
```

Start the application:

```bash
npm run dev
```

Open **http://localhost:5173** in your browser.

## Testing Real-Time Features

To test real-time messaging:

1. Create a user in the first browser window.
2. Open a second browser window or incognito window.
3. Create a different user.
4. Create a conversation between the two users.
5. Send messages between the two windows.
6. Test the typing indicator and online/offline status.

Each local installation starts with an empty database, so users can experience the application from the beginning.

## Project Structure

```text
chat-app/
├── prisma/
│   ├── migrations/
│   └── schema.prisma
├── src/
│   ├── components/
│   ├── generated/
│   ├── lib/
│   ├── api.ts
│   ├── socket.ts
│   ├── types.ts
│   └── ...
├── server.ts
└── package.json
```

## Architecture

The React frontend communicates with the Express backend through HTTP requests for persistent data and Socket.io for real-time events.

```text
React + TypeScript
        │
        ├── HTTP ──────────┐
        │                  ↓
        │              Express
        │                  │
        │               Prisma
        │                  │
        │               SQLite
        │
        └── Socket.io ───→ Node.js
```

The application uses Socket.io user rooms to deliver messages, conversation updates, typing indicators, and online-status information to the appropriate connected users.

## Database

The project uses Prisma migrations to create and update the SQLite database.

To initialize a fresh database:

```bash
npm run setup
```

The local database file is intentionally excluded from version control. The database schema can be recreated from the migration files in `prisma/migrations/`.
