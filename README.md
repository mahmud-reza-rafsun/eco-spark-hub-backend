# 🌿 Eco Spark Hub — Backend API

> RESTful API powering the Eco Spark Hub platform — handling authentication, idea management, and purchase transactions for a community-driven green innovation marketplace.

---

## 🌍 Problem Statement

A secure, scalable backend is needed to manage **user roles, idea submissions, and idea purchases** for an eco-innovation community. The system must enforce role-based permissions and support a seamless marketplace experience.

---

## 💡 Solution Overview

This Express.js API provides:
- Secure **JWT-based authentication** with BetterAuth
- **Role-based authorization** (Admin / Member)
- Full **CRUD operations** for eco ideas
- **Purchase management** for idea licenses
- PostgreSQL data persistence via **Prisma ORM**

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| Runtime | Node.js with Bun |
| Framework | Express.js |
| Database | PostgreSQL |
| ORM | Prisma |
| Authentication | BetterAuth + JWT |
| Language | TypeScript |

---

## ✨ Key Features

- 🔐 **BetterAuth + JWT** — Secure login, registration, and token refresh
- 👥 **Role-Based Access Control** — Admin and Member permission layers
- 💡 **Idea Management** — Create, read, update, delete eco ideas
- 🛒 **Purchase System** — Handle idea license purchases and ownership records
- 🛡️ **Middleware Protection** — Auth guards on all protected routes
- 📦 **Prisma ORM** — Type-safe database queries with migrations

---

## 🚀 Live API

🔗 **Base URL:** `https://your-backend-api.com/api`

---

## ⚙️ Setup Instructions

### Prerequisites

- [Bun](https://bun.sh/) installed
- PostgreSQL database (local or hosted, e.g., Supabase / Neon)

### Installation

```bash
# Clone the repository
git clone https://github.com/your-username/eco-spark-hub-backend.git
cd eco-spark-hub-backend

# Install dependencies
bun install

# Set up environment variables
cp .env.example .env
```

### Database Setup

```bash
# Generate Prisma client
bun generate

# Run database migrations
bun migrate dev
```

### Development

```bash
# Start development server
bun dev
```

### Production Build

```bash
# Build for production
bun run build
```

API will run at `http://localhost:5000`

---

## 🔑 Environment Variables

Create a `.env` file in the root directory:

```env
# Server
PORT=5000
NODE_ENV=development

# Database
DATABASE_URL=postgresql://username:password@localhost:5432/eco_spark_hub

# JWT
JWT_SECRET=your_super_secret_jwt_key
JWT_EXPIRES_IN=7d

# BetterAuth
BETTER_AUTH_SECRET=your_better_auth_secret
BETTER_AUTH_URL=http://localhost:5000

# CORS
CLIENT_URL=http://localhost:3000
```

> ⚠️ Never commit `.env` to version control.

---

## 📡 API Endpoints

### Authentication

| Method | Endpoint | Description | Access |
|---|---|---|---|
| POST | `/api/auth/register` | Register new user | Public |
| POST | `/api/auth/login` | Login and get JWT | Public |
| POST | `/api/auth/logout` | Logout user | Auth |
| GET | `/api/auth/me` | Get current user | Auth |

### Ideas

| Method | Endpoint | Description | Access |
|---|---|---|---|
| GET | `/api/ideas` | Get all ideas | Public |
| GET | `/api/ideas/:id` | Get single idea | Public |
| POST | `/api/ideas` | Submit new idea | Member |
| PUT | `/api/ideas/:id` | Update idea | Owner / Admin |
| DELETE | `/api/ideas/:id` | Delete idea | Owner / Admin |

### Purchases

| Method | Endpoint | Description | Access |
|---|---|---|---|
| POST | `/api/purchases` | Purchase idea license | Member |
| GET | `/api/purchases/my` | Get user's purchases | Member |
| GET | `/api/purchases` | Get all purchases | Admin |

### Admin

| Method | Endpoint | Description | Access |
|---|---|---|---|
| GET | `/api/admin/users` | Get all users | Admin |
| PATCH | `/api/admin/users/:id` | Update user role | Admin |
| DELETE | `/api/admin/users/:id` | Delete user | Admin |

---

## 🗂️ Project Structure

```
eco-spark-hub-backend/
├── prisma/
│   ├── schema.prisma     # Database schema
│   ├── migrations/       # Migration history
│   └── seed.ts           # Seed data
├── src/
│   ├── config/           # App & DB configuration
│   ├── middlewares/
│   │   ├── auth.middleware.ts
│   │   └── role.middleware.ts
│   ├── modules/
│   │   ├── auth/
│   │   │   ├── auth.routes.ts
│   │   │   ├── auth.controller.ts
│   │   │   └── auth.service.ts
│   │   ├── ideas/
│   │   │   ├── idea.routes.ts
│   │   │   ├── idea.controller.ts
│   │   │   └── idea.service.ts
│   │   └── purchases/
│   │       ├── purchase.routes.ts
│   │       ├── purchase.controller.ts
│   │       └── purchase.service.ts
│   ├── utils/            # Helper utilities
│   └── index.ts          # App entry point
└── package.json
```

---

## 🗄️ Database Schema Overview

```prisma
model User {
  id        String    @id @default(cuid())
  email     String    @unique
  password  String
  role      Role      @default(MEMBER)
  ideas     Idea[]
  purchases Purchase[]
  createdAt DateTime  @default(now())
}

model Idea {
  id          String    @id @default(cuid())
  title       String
  description String
  price       Float
  author      User      @relation(fields: [authorId], references: [id])
  authorId    String
  purchases   Purchase[]
  createdAt   DateTime  @default(now())
}

model Purchase {
  id        String   @id @default(cuid())
  buyer     User     @relation(fields: [buyerId], references: [id])
  buyerId   String
  idea      Idea     @relation(fields: [ideaId], references: [id])
  ideaId    String
  createdAt DateTime @default(now())
}

enum Role {
  ADMIN
  MEMBER
}
```

---

## 🔗 Related Repository

- **Frontend:** [eco-spark-hub-frontend](https://github.com/your-username/eco-spark-hub-frontend)

---

## 📄 License

This project is licensed under the MIT License.
