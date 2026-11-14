# Real-Time Chat App

A full-stack real-time chat application built with React, TypeScript, Express, Socket.io, Prisma, SQLite, and Docker.

## Features

- User registration and login with bcrypt password hashing
- Persistent cookie-based sessions
- One-to-one conversations
- Real-time messaging with Socket.io
- Typing indicators
- Online/offline status
- Persistent messages and conversations
- Real-time user and conversation creation
- SQLite database with Prisma migrations
- Docker Compose setup with separate frontend and backend containers

## Tech Stack

**Frontend**
- React
- TypeScript
- Vite
- Tailwind CSS

**Backend**
- Node.js
- Express
- Socket.io
- Express Session
- bcrypt

**Database & Infrastructure**
- Prisma ORM
- SQLite
- Docker
- Docker Compose

## Running with Docker (Recommended)

Docker is the easiest way to run the application. It automatically handles the frontend, backend, and database setup using separate containers.

**Note:** For convenience when testing and evaluating this portfolio project, the application includes a hardcoded fallback session secret. This allows the application to run without requiring environment variable configuration. This is strictly a development/testing convenience and must never be used in a production deployment.

### Requirements

- [Docker Desktop](https://www.docker.com/products/docker-desktop/) installed and running

### Setup

Clone the repository and enter the project directory:

```bash
git clone https://github.com/ArmaanS1352/chat-app.git
cd chat-app
```

Build and start the application:

```bash
docker compose up --build
```

Once the containers have started, open:

**http://localhost:5173**

To stop the application, press `Ctrl + C` and run:

```bash
docker compose down
```

To start it again later:

```bash
docker compose up
```

The SQLite database and session store persist across container restarts.

## Testing Real-Time Features

**Important: Each browser profile shares its login session through cookies.** Opening another tab or window in the same browser profile will not create a separate user session.

To test real-time messaging between two users:

1. Open the application in your regular browser window.
2. Register your first account.
3. Open an incognito/private window or a different browser.
4. Navigate to the application again.
5. Register a second account using a different email address.
6. Create a conversation between the two users.
7. Send messages between the two browser windows.
8. Test typing indicators and online/offline status.

**Example setup:**

| Browser window | Account |
|---|---|
| Regular browser | User 1 |
| Incognito/private window | User 2 |

The application currently does not have logout or user deletion functionality. Separate browser profiles are therefore required to test multiple accounts simultaneously.

Each fresh installation starts with an empty database, allowing users to register their own accounts and experience the application from the beginning.

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
├── Dockerfile.backend
├── Dockerfile.frontend
├── docker-compose.yml
├── server.ts
├── session.d.ts
└── package.json
```

## Architecture

The application uses a two-container architecture managed by Docker Compose.

The React frontend communicates with the Express backend through HTTP requests for persistent data and Socket.io for real-time events.

```text
       Frontend Container
       React + TypeScript
               |
          HTTP / Socket.io
               |
               v
       Backend Container
       Node.js + Express
               |
          +----+----+
          |         |
        Prisma   Socket.io
          |
          v
        SQLite
```

The backend handles authentication, session management, API requests, database operations, and real-time communication.

Socket.io uses user rooms to deliver messages, conversation updates, typing indicators, and online-status information to connected users.

## Database

The project uses Prisma migrations to create and update the SQLite database.

The database is initialized using the migration files in `prisma/migrations/`.

The local database and session store are excluded from version control. Docker Compose mounts the Prisma directory so database and session data persist across container restarts.

---

## Alternative: Running Locally Without Docker

Docker is optional. The application can also be run directly using Node.js and npm.

### Requirements

- [Node.js](https://nodejs.org/) installed

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

### Configure Environment Variables

Create a `.env` file in the project root:

```env
SESSION_SECRET=your_generated_secret
```

Generate a secure session secret using Node.js:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Copy the generated value into your `.env` file.

For local development, the application will use this environment variable instead of the hardcoded fallback secret.

### Initialize the Database

```bash
npm run setup
```

This applies the Prisma migrations and initializes the SQLite database.

### Start the Application

```bash
npm run dev
```

Open **http://localhost:5173** in your browser.

