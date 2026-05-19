# 🌐 ConnectiFy — The Hub for Professional Growth

> 🎓 **Final Year Major Project** | Developed as a production-grade professional networking ecosystem highlighting advanced software engineering patterns, real-time systems, and AI-driven workflows.

[![React](https://img.shields.io/badge/Frontend-React%2019-blue?logo=react&logoColor=white)](https://react.dev/)
[![Node.js](https://img.shields.io/badge/Backend-Node.js-green?logo=node.js&logoColor=white)](https://nodejs.org/)
[![TypeScript](https://img.shields.io/badge/Server-TypeScript-blue?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![PostgreSQL](https://img.shields.io/badge/Database-PostgreSQL-blue?logo=postgresql&logoColor=white)](https://www.postgresql.org/)
[![Prisma](https://img.shields.io/badge/ORM-Prisma-black?logo=prisma&logoColor=white)](https://www.prisma.io/)
[![Redis](https://img.shields.io/badge/Cache%20%26%20Queues-Redis-red?logo=redis&logoColor=white)](https://redis.io/)
[![Socket.io](https://img.shields.io/badge/Realtime-Socket.io-black?logo=socket.io&logoColor=white)](https://socket.io/)
[![Google Gemini](https://img.shields.io/badge/AI-Gemini%20Pro-purple?logo=googlegemini&logoColor=white)](https://deepmind.google/technologies/gemini/)

## 📝 Project Description

**ConnectiFy** is a comprehensive, production-ready professional networking and career platform developed as a **Final Year Major Project**. Formulated to mirror and expand upon industry-leading professional ecosystems like LinkedIn, ConnectiFy serves as an all-in-one portal facilitating three distinct interfaces: **Job Seekers (Users)**, **Recruiters (Companies)**, and **Supervisors (Platform Administrators)**.

### 🎯 Key Engineering Challenges Addressed:
1. **Real-time Event-Driven Communication**: Utilizing **Socket.io** to drive instant messaging, platform notifications, and WebRTC signaling for face-to-face mock and recruiter interviews.
2. **Asynchronous Background Processing**: Implementing a robust message queue leveraging **Redis** and **BullMQ** to offload long-running tasks such as automated transactional emails (verification, applications, scheduling alerts), maintaining low API response latencies.
3. **Data Integrity & Type-Safe Operations**: Designing a highly structured, relational **PostgreSQL** schema using **Prisma ORM** alongside a pure **TypeScript** backend compiler to enforce strict schemas, relationships, and data reliability.
4. **AI-Empowered Utilities**: Integrating the **Google Gemini Pro API** to power an automated AI Doubt Solver (technical/professional advice) and a dynamic Daily Quiz generator to facilitate constant skill enhancement for job seekers.

This project is a culmination of full-stack engineering disciplines including reactive UI state management, real-time socket orchestration, background processing, advanced database design, and machine learning/AI application layers.

---

## 🌟 Key Highlights & Features

### 👤 1. User Panel (Job Seekers & Professionals)
*   **Dynamic Feed & Interactions**: Read, like, comment, and save posts from your network.
*   **Professional Connections**: Expand your network by sending, accepting, or rejecting connection requests.
*   **Job Discovery & Tracking**: Search, save, and apply for open positions. Monitor your application status in real time.
*   **AI Doubt Solver**: Solve professional or technical questions using a **Gemini Pro-powered AI Assistant**.
*   **Daily Quizzes**: Participate in interactive quizzes to sharpen your technical and professional skills.
*   **Real-time Messenger**: Instantly chat with other users and recruiters.
*   **Profile Management**: Showcase work experience, education, skills, and resume.

### 🏢 2. Company Panel (Recruiters & Employers)
*   **Recruitment Dashboard**: View comprehensive analytics about job performance, applicant distributions, and hiring pipelines.
*   **Job Post Management (ATS)**: Create, update, toggle status, and delete job postings with full ease.
*   **Applicant Screening**: View applicant profiles, download resumes, shortlist or reject candidates.
*   **Interview Scheduling**: Schedule video interviews directly through the platform.
*   **WebRTC Interview Room**: Jump into live, high-quality peer-to-peer video interviews with candidates utilizing built-in WebRTC signaling.
*   **Company Messenger**: Initiate chats and send details directly to prospective candidates.

### 🛡️ 3. Admin Panel (Control Center)
*   **Advanced Dashboard**: Track platform metrics including real-time registrations, live activity graphs, and post volume.
*   **Content Moderation**: Review user posts and enforce community guidelines (warn creators, block posts, or delete content).
*   **User & Company Verification**: Manage user status and approve or reject new company registrations.
*   **Platform Settings**: Modify core global parameters and feature flags dynamically.

---

## ⚙️ Core Architecture & Tech Stack

```mermaid
graph TD
    Client[React Frontend / Socket.io Client] <-->|HTTP / WebSockets| Server[Express API Server]
    Server <-->|SQL Queries| Postgres[(PostgreSQL Database)]
    Server <-->|Prisma Client| Postgres
    Server -->|Background Tasks| Redis[(Redis Broker)]
    Redis <-->|Job Queue| BullMQ[BullMQ Worker]
    BullMQ -->|Email Alerts| Nodemailer[SMTP Email Server]
    Server <-->|AI Prompt & Chat| Gemini[Google Gemini AI API]
    Client <-->|P2P Video Signaling| Client
```

### 💻 Frontend
*   **React 19**: Standardized around functional hooks and state selectors.
*   **Vite**: Ultra-fast hot-reloading (HMR) and optimized distribution builds.
*   **Framer Motion**: Smooth, premium glassmorphism layouts and micro-interactions.
*   **Bootstrap 5 & Vanilla CSS**: Dynamic grid systems coupled with customized aesthetic tokens.
*   **Recharts & Chart.js**: Visually stunning analytics and reports.

### 🔌 Backend & Services
*   **Node.js & Express.js (v5)**: Clean controllers, schema validators, and routing layers.
*   **TypeScript**: Complete static type-safety across endpoints.
*   **Prisma ORM**: Relational schema migrations and type-safe database actions.
*   **PostgreSQL**: Highly-performant primary relational database.
*   **Redis + BullMQ**: Asynchronous background jobs, processing high-volume automated emails.
*   **Socket.IO**: Real-time bi-directional messaging, notifications, and WebRTC handshakes.
*   **Google Gemini Pro**: Empowers advanced features like the AI Doubt Solver and automated quiz questions.

---

## 🔑 Ready-to-Test Admin Credentials

To save time when checking out the dashboard features, use these pre-seeded administrator credentials:

*   **Route**: `http://localhost:5173/admin/login` (Standard Admin Login Screen)
*   **Email**: `admin@connectify.com`
*   **Password**: `Admin@123`

---

## 📂 System Setup & Installation

### Prerequisites
Make sure you have the following installed on your machine:
*   [Node.js](https://nodejs.org/) (v21+)
*   [npm](https://www.npmjs.com/) (v10+)
*   [PostgreSQL](https://www.postgresql.org/) (v15+)
*   [Redis](https://redis.io/) (v7+)

---

### 1. Database Setup
1. Open PostgreSQL and create a new database named `connectify`.
2. Keep your connection URI ready. It should look like:
   `postgresql://USERNAME:PASSWORD@localhost:5432/connectify?schema=public`

---

### 2. Backend Installation (Server)

1. Open a terminal in the `/Server` directory:
   ```bash
   cd Server
   ```
2. Install the server-side dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file inside the `/Server` folder and populate it with your local keys:
   ```env
   # Database connection
   DATABASE_URL="postgresql://USERNAME:PASSWORD@localhost:5432/connectify?schema=public"

   # Server Configs
   PORT=8000
   JWT_SECRET="YOUR_SUPER_SECRET_JWT_KEY"

   # AI Integration
   GEMINI_API_KEY="YOUR_GEMINI_PRO_API_KEY"

   # Email Service (Nodemailer config)
   EMAIL_HOST="smtp.mailtrap.io"
   EMAIL_PORT=2525
   EMAIL_USER="your-smtp-username"
   EMAIL_PASS="your-smtp-password"

   # Cache Broker
   REDIS_URL="redis://127.0.0.1:6379"
   ```
4. Push the schema to your database:
   ```bash
   npx prisma db push
   ```
5. Seed the database with high-quality mockup data (40+ users, companies, posts, and chats):
   ```bash
   npx tsx seed_master.ts
   ```
6. Start the development server:
   ```bash
   npm run dev
   ```

---

### 3. Frontend Installation (Client)

1. Open a terminal in the `/Client` directory:
   ```bash
   cd Client
   ```
2. Install the client-side dependencies:
   ```bash
   npm install
   ```
3. Start the Vite React development server:
   ```bash
   npm run dev
   ```
4. Open [http://localhost:5173](http://localhost:5173) in your browser to experience the platform!

---

## ⚡ System Real-Time Socket Events Reference

| Event Name | Type | Emitted By | Purpose |
|------------|------|------------|---------|
| `new_user_registration` | Real-time Counter | Server → Admin | Live admin notification |
| `new_notification` | Feed / Interaction | Server → User/Company | Notification bell updates |
| `new_message` | Chat | Server ↔ Client | Real-time chat |
| `join_personal_room` | Setup | Client → Server | Handles notifications for a specific user |
| `join_company_room` | Setup | Client → Server | Handles notifications for a specific company |
| `join_admin_room` | Setup | Client → Server | Handles real-time events for administrative dashboards |

---

## 🛡️ License

This project is licensed under the MIT License - see the LICENSE file for details.
