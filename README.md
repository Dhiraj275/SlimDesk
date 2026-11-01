# SlimDesk

<p align="center">
  <strong>A lightweight, open-source CRM built for freelancers, agencies, and small businesses.</strong>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Next.js_16-black?style=for-the-badge&logo=next.js&logoColor=white" alt="Next.js" />
  <img src="https://img.shields.io/badge/NestJS_11-E0234E?style=for-the-badge&logo=nestjs&logoColor=white" alt="NestJS" />
  <img src="https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript" />
  <img src="https://img.shields.io/badge/Tailwind_CSS_v4-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white" alt="Tailwind CSS" />
  <img src="https://img.shields.io/badge/MySQL_8.0-4479A1?style=for-the-badge&logo=mysql&logoColor=white" alt="MySQL" />
  <img src="https://img.shields.io/badge/Docker-2496ED?style=for-the-badge&logo=docker&logoColor=white" alt="Docker" />
  <img src="https://img.shields.io/badge/License-MIT-yellow.svg?style=for-the-badge" alt="License" />
</p>

---

## 📖 Overview

**SlimDesk** is a fast, intuitive CRM designed to replace bloated enterprise tools like Salesforce and HubSpot with a clean, focused workspace. Never lose a potential client because you forgot who they were, what they wanted, or when to follow up.

SlimDesk is built as a full-stack monorepo featuring a **Next.js 16** frontend and a modular **NestJS** REST API backend powered by **MySQL**.

---

## ✨ Features

- **🎯 Lead Management Lifecycle**:
  - Capture, track, qualify, and convert freelance opportunities into paying clients.
  - Track estimated budgets, currencies, services, and lead acquisition sources.
  - Lifecycle stages: `New` → `Contacted` → `Qualified` → `Proposal Sent` → `Negotiation` → `Converted` / `Lost`.
- **📊 Dual Pipeline Workspaces**:
  - **Table List View**: High-density table with instant Pipeline Stage Quick Tabs (`All`, `New`, `Contacted`, etc.) and search filters.
  - **Visual Kanban Board**: Stage-by-stage columns with stage value totals and pure CSS zero-latency horizontal scrolling.
- **👥 Contact & Client Conversion**:
  - Convert qualified leads into verified clients in one click, automatically linking contacts.
- **⏰ Follow-ups & Activity Timeline**:
  - Schedule upcoming follow-ups with overdue indicators.
  - Chronological activity timeline tracking calls, meetings, emails, proposals, and stage transitions.
- **📈 Dashboard & Analytics**:
  - Real-time pipeline metrics (Total Leads, In Progress, Follow-ups Due, Converted Clients).
  - Financial charts (area, bar, and pie graphs) with parallel route loading.
- **🎨 Multi-Theme Support**:
  - 6 curated themes (Claude, Vercel, Supabase, Neobrutualism, Mono, Notebook) with full light and dark mode support.
- **⌘ Command Palette (Cmd + K)**:
  - Instant keyboard-first navigation via `kbar`.
- **🔒 JWT Authentication**:
  - Access token and refresh token rotation with password hashing and role-based guards.

---

## 🛠️ Tech Stack

### Frontend (`client/`)
- **Framework**: [Next.js 16](https://nextjs.org) (App Router, Turbopack)
- **Library**: [React 19](https://react.dev)
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com) + Vanilla CSS
- **Components**: [shadcn/ui](https://ui.shadcn.com) + [Radix UI](https://www.radix-ui.com)
- **Icons**: [Tabler Icons](https://tabler.io/icons) + [Lucide](https://lucide.dev)
- **State & Tables**: [Zustand](https://github.com/pmndrs/zustand) + [TanStack Table](https://tanstack.com/table)
- **Forms**: [React Hook Form](https://react-hook-form.com) + [Zod](https://zod.dev)
- **URL State**: [Nuqs](https://nuqs.47ng.com)

### Backend (`server/`)
- **Framework**: [NestJS](https://nestjs.com)
- **ORM & Database**: [TypeORM](https://typeorm.io) + [MySQL 8.0](https://www.mysql.com)
- **Authentication**: Passport.js + JWT Strategy (`@nestjs/jwt`, `@nestjs/passport`, `bcrypt`)
- **API Documentation**: [Swagger / OpenAPI](https://swagger.io) (`@nestjs/swagger`)
- **Validation**: `class-validator` + `class-transformer`

### Infrastructure
- **Containerization**: Docker & Docker Compose (`docker-compose.yml`)

---

## 📁 Repository Structure

```
slimdesk/
├── client/                     # Next.js 16 frontend application
│   ├── public/                 # Static assets and icons
│   ├── src/
│   │   ├── app/                # App Router (pages, layouts, route groups)
│   │   │   ├── (auth)/         # Auth pages (login, register)
│   │   │   ├── dashboard/      # Dashboard pages (overview, leads, kanban)
│   │   │   │   ├── leads/      # Lead management routes
│   │   │   │   │   └── [leadId]# Lead details & activity timeline
│   │   │   │   └── overview/   # Analytics overview
│   │   ├── features/           # Domain-driven feature modules
│   │   │   ├── auth/           # Auth provider, hooks, API client
│   │   │   ├── leads/          # Leads API, types, components, dialogs
│   │   │   ├── kanban/         # Task board components & store
│   │   │   └── overview/       # Analytics charts & widgets
│   │   ├── shared/             # Shared UI components, hooks, layout
│   │   └── styles/             # Global CSS, themes, scrollbar styles
│   └── package.json
│
├── server/                     # NestJS backend API application
│   ├── src/
│   │   ├── auth/               # JWT authentication, guards, strategies
│   │   ├── contacts/           # Contacts controller, service, entities
│   │   ├── leads/              # Leads, activities, follow-ups modules
│   │   ├── users/              # Users service and entity
│   │   └── main.ts             # Application entrypoint & Swagger setup
│   └── package.json
│
├── docker-compose.yml          # MySQL 8.0 container service
└── README.md                   # Monorepo documentation
```

---

## 🚀 Getting Started

### Prerequisites

- **Node.js**: v18.0.0 or higher
- **npm**, **pnpm**, or **bun**
- **Docker**: For running the MySQL container

---

### Step 1: Clone the Repository

```bash
git clone https://github.com/Dhiraj275/SlimDesk.git
cd SlimDesk
```

---

### Step 2: Start the MySQL Database

Run the MySQL container using Docker Compose:

```bash
docker compose up -d
```

This starts a MySQL 8.0 instance running on `localhost:3306` with the database `slimdesk`.

---

### Step 3: Configure Environment Variables

#### Backend (`server/.env`)
Copy the example environment file:

```bash
cp server/.env.example server/.env
```

Default settings in `server/.env`:
```env
PORT=3001

# Database Configuration (MySQL)
DB_HOST=localhost
DB_PORT=3306
DB_USER=slimdesk
DB_PASSWORD=slimdesk_password
DB_NAME=slimdesk
DATABASE_URL="mysql://slimdesk:slimdesk_password@localhost:3306/slimdesk"

# JWT Configuration
JWT_SECRET=supersecret_jwt_key_replace_in_production
JWT_EXPIRES_IN=15m
JWT_REFRESH_SECRET=supersecret_refresh_jwt_key_replace_in_production
JWT_REFRESH_EXPIRES_IN=7d
```

#### Frontend (`client/.env`)
Create or verify `client/.env`:
```env
NEXT_PUBLIC_API_URL=http://localhost:3001/api
```

---

### Step 4: Run the Backend Server

```bash
cd server
npm install
npm run start:dev
```

The NestJS server will start on **http://localhost:3001**.
- **API Base**: `http://localhost:3001/api`
- **Swagger Documentation**: `http://localhost:3001/api/docs`

---

### Step 5: Run the Frontend Client

In a separate terminal:

```bash
cd client
npm install
npm run dev
```

The Next.js client will start on **http://localhost:3000**.

---

## 📡 Key API Endpoints

Interactive Swagger documentation is available at `http://localhost:3001/api/docs`.

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/auth/signup` | Register a new user |
| `POST` | `/api/auth/signin` | Login and receive JWT access & refresh tokens |
| `GET` | `/api/auth/profile` | Get current authenticated user profile |
| `GET` | `/api/leads` | List leads with search, status, and source filters |
| `POST` | `/api/leads` | Create a new lead |
| `GET` | `/api/leads/metrics` | Retrieve pipeline summary counts and stats |
| `GET` | `/api/leads/:id` | Get lead details with activities and follow-ups |
| `PATCH` | `/api/leads/:id` | Update lead information |
| `PATCH` | `/api/leads/:id/status` | Move lead to a different pipeline stage |
| `POST` | `/api/leads/:id/convert` | Convert a qualified lead into a paying client |
| `POST` | `/api/leads/:id/activities` | Log an activity (call, email, meeting, note) |
| `POST` | `/api/leads/:id/followups` | Schedule a follow-up reminder |
| `DELETE` | `/api/leads/:id` | Delete a lead |
| `GET` | `/api/contacts` | List contacts and clients |

---

## 🧪 Testing & Validation

```bash
# Typecheck client
cd client && npx tsc --noEmit

# Build client for production
cd client && npm run build

# Typecheck & build backend
cd server && npm run build

# Run backend unit tests
cd server && npm run test
```

---

## 📜 License

This project is licensed under the [MIT License](LICENSE).
