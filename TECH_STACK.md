# ConnectiFy Tech Stack Documentation

This document outlines the technologies used in the ConnectiFy project, categorized by their role in the system.

## 🚀 Main Tech Stack (Core)

These are the primary pillars of the application.

- **Frontend**: [React.js](https://react.dev/) (v19) - Used for building a dynamic and responsive user interface.
- **Backend**: [Node.js](https://nodejs.org/) with [Express.js](https://expressjs.com/) (v5) - Powers the RESTful API and server-side logic.
- **Database**: [PostgreSQL](https://www.postgresql.org/) - A powerful, open-source relational database for persistent data storage.
- **ORM**: [Prisma](https://www.prisma.io/) - Used for type-safe database access and schema migrations.
- **Language**: [TypeScript](https://www.typescriptlang.org/) (Server) & JavaScript (Client) - Ensuring robust backend development with static typing.
- **Build Tool**: [Vite](https://vitejs.dev/) - Provides a fast development environment and optimized production builds.
- **Real-time**: [Socket.IO](https://socket.io/) - Enables real-time, bi-directional communication (e.g., messaging, notifications).

---

## 💻 Software Requirements (Minimum)

To run ConnectiFy locally, ensure you have the following software installed:

| Software | Version | Purpose |
|----------|---------|---------|
| **Node.js** | v21+ | Runtime environment for Client & Server |
| **npm** | v10+ | Package management |
| **PostgreSQL**| v15+ | Primary relational database |
| **Redis** | v7+ | Message broker for BullMQ tasks |
| **Git** | v2+ | Version control & collaboration |

---

## 📊 Technology Use Summary

| Category | Technology | Usage in Project |
|----------|------------|------------------|
| **Framework** | React.js (v19) | Modern UI with Functional Components & Hooks |
| **Server** | Express.js (v5) | RESTful API with Middleware & JWT Auth |
| **Database** | PostgreSQL | Relational storage for Users, Jobs, & Posts |
| **ORM** | Prisma | Schema management & Type-safe queries |
| **Real-time** | Socket.io | Bi-directional events for Chats & Notifs |
| **Styling** | Bootstrap 5 | Responsive layout & Grid system |
| **Design** | Vanilla CSS | Custom animations & Premium glassmorphism UI |
| **AI** | Gemini Pro | Content generation & AI Doubt Solver |
| **Workers** | BullMQ | Asynchronous background job processing |
| **State** | Context API | Global state for Auth, Toast, & Theme |
| **Build** | Vite | Ultra-fast HMR and optimized bundling |