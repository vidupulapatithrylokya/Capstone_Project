# ExplainAI - High-Level Design (HLD) Document

## 1. System Architecture Overview

**ExplainAI** utilizes a modern, multi-tiered micro-services-ready architecture built for scalability, real-time AI capabilities, security, and dual-database polyglot persistence. The platform decouples presentation logic (React/Vite) from backend services (Node.js/Express) while leveraging specialized datastores for operational flexibility (MongoDB) and transactional rigor (PostgreSQL via Prisma ORM).

### 1.1 High-Level Block Diagram

```mermaid
graph TD
    Client["Client Layer (React 18 + Vite + Tailwind CSS v4)"]
    
    subgraph "Express API Server Layer"
        Gateway["Express Router & API Gateway"]
        AuthMW["Auth & RBAC Middleware (JWT, Bcrypt, Roles)"]
        SanitizerMW["Sanitizer & Rate Limiter MW"]
        CacheMW["Redis Cache Middleware"]
    end
    
    subgraph "Core Business Services"
        AIService["AI & Agent Subsystem (Planner, Tools, RAG, Evaluator)"]
        CourseService["Course & SSR Catalog Engine"]
        PaymentService["Stripe Payment & Order Manager"]
        MentorshipService["Mentorship & Session Scheduler"]
    end

    subgraph "Data & Cache Layer"
        MongoDB[("MongoDB (Mongoose Schemas)")]
        SQLDB[("Relational DB (Prisma ORM)")]
        RedisCache[("Redis Cache Cluster")]
    end

    subgraph "External Integrations"
        StripeAPI["Stripe Payment API"]
        ExternalLLM["LLM Service Provider"]
        OAuthProvider["Google OAuth API"]
    end

    Client -->|HTTPS / REST / SSE| Gateway
    Gateway --> SanitizerMW --> AuthMW --> CacheMW
    CacheMW -->|Cache Hit| Client
    CacheMW -->|Cache Miss| BusinessServices["Core Business Services"]
    
    BusinessServices --> AIService
    BusinessServices --> CourseService
    BusinessServices --> PaymentService
    BusinessServices --> MentorshipService

    AIService -->|Vector Retrieval & Logs| MongoDB
    AIService -->|LLM Requests| ExternalLLM
    CourseService -->|Document Store| MongoDB
    CourseService -->|Read/Write Cache| RedisCache
    PaymentService -->|ACID Payment Transactions| SQLDB
    PaymentService -->|Checkout Sessions| StripeAPI
    MentorshipService -->|Document Store| MongoDB
    AuthMW -->|OAuth Verification| OAuthProvider
```

---

## 2. Subsystem Descriptions

### 2.1 Presentation / Client Layer
- **Framework**: React 18 single-page application built with Vite and styled using Tailwind CSS v4.
- **State Management**: Local React state (`useState`, `useEffect`) combined with global Zustand store (`useAppStore`) for app-wide state management.
- **Real-Time Streaming**: Native `fetch` with `ReadableStream` reader handling Server-Sent Events (SSE) for token-by-token AI response rendering.
- **Educational UI Components**: `JSConceptsDemo` educational sandbox showcasing closure, event loop, hoisting, promises, and async execution.

### 2.2 API Gateway & Security Layer
- **Express.js Application Pipeline**: Centralized routing (`app.js`, `server.js`) handling incoming HTTP requests.
- **Input Sanitization**: `sanitizeInput.js` intercepting body, query, and path parameters to eliminate NoSQL operator injections (`$gt`, `$where`) and XSS tags.
- **Rate Limiting**: Tiered limiters (`rateLimiter.js`) restricting high-frequency endpoints (20 req/15m on Auth, 50 req/15m on AI).
- **Authentication & RBAC**: JWT verification (`authMiddleware.js`) and role checks (`roleMiddleware.js`) enforcing permission rules for `student`, `mentor`, and `admin` roles.

### 2.3 AI Subsystem Architecture
- **Autonomous Planner Agent** (`agentService.js`, `planner.js`): Executes iterative reasoning loops (up to 5 steps) with max timeout guards and state tracking.
- **Tool Calling Architecture** (`server/services/tools/`): Modular tool execution registry supporting calculator operations, course search, user progress retrieval, flashcard creation, and quiz generation.
- **RAG Retrieval Engine** (`ragService.js`): Chunking engine (~400 chars per chunk), 64D vector embedding generator, and cosine similarity ranking over `KnowledgeChunk` collection.
- **Prompt Sanitizer & Redactor** (`promptSanitizer.js`): System prompt defense shielding system instructions from user override attempts and masking sensitive API tokens.
- **AI Analytics & Cost Tracker**: Logs token usage, execution latency, and financial costs into MongoDB `AIUsage` collection.

### 2.4 Dual-Database Data Layer

```mermaid
graph LR
    subgraph "Polyglot Persistence Strategy"
        direction TB
        MongoDB_Doc["MongoDB (Mongoose)\nFlexible, High-Volume Documents"]
        Prisma_SQL["PostgreSQL / SQLite (Prisma ORM)\nACID Relational Financial Storage"]
    end

    subgraph "MongoDB Domain Models"
        M1["Users & Portfolios"]
        M2["Courses, Lessons & Quizzes"]
        M3["Enrollments & Progress"]
        M4["Sessions & Mentors"]
        M5["AIUsage & KnowledgeChunks"]
    end

    subgraph "SQL Relational Tables"
        S1["UserRecord"]
        S2["Payment"]
        S3["PaymentTransaction"]
        S4["AuditLog"]
    end

    MongoDB_Doc --> M1 & M2 & M3 & M4 & M5
    Prisma_SQL --> S1 & S2 & S3 & S4
```

- **MongoDB (Mongoose Schemas)**: Document-oriented database storing flexible entities such as courses, embedded quizzes, enrollments, mentorship sessions, and RAG knowledge chunks.
- **Relational Database (Prisma ORM)**: Strictly normalized 3NF relational datastore guaranteeing ACID properties for payments, financial transactions, and audit records.

### 2.5 Caching & Integration Layer
- **Redis Caching** (`cacheMiddleware.js`, `redis.js`): Caches expensive catalog queries (`GET /api/courses`) with configurable TTL and automatic fallback to database if Redis is unavailable.
- **Stripe Gateway**: Secure external payment integration managing checkout session creation, webhook validation, and payment verification.
- **Background Cron Scheduler** (`cronService.js`): Automated `node-cron` tasks managing temp file cleanup and automated cost reporting.

---

## 3. Core Data Flow Sequences

### 3.1 AI Streaming & Autonomous Tool Calling Flow

```mermaid
sequenceDiagram
    autonumber
    actor Student as Student Client
    participant API as Express API
    participant Sanitizer as Prompt Sanitizer
    participant Agent as Agent Planner
    participant RAG as RAG Service
    participant Tool as Tool Registry
    participant DB as MongoDB

    Student->>API: POST /api/ai/agent { prompt, userId }
    API->>Sanitizer: sanitizePrompt(prompt)
    Sanitizer-->>API: Safe Prompt (No Injection)
    API->>Agent: executeAgent(safePrompt)
    
    loop Step Execution (Max 5 Iterations)
        Agent->>RAG: searchKnowledge(query)
        RAG->>DB: Query KnowledgeChunk (Cosine Similarity)
        DB-->>RAG: Context Chunks
        RAG-->>Agent: Relevant Context
        
        Agent->>Tool: executeTool(toolName, args)
        Tool-->>Agent: Tool Result
    end

    Agent->>DB: Record AIUsage (Tokens, Latency, Cost)
    Agent-->>API: Final Plan & Output
    API-->>Student: SSE Stream / JSON Response
```

### 3.2 Financial Checkout & ACID Payment Transaction Flow

```mermaid
sequenceDiagram
    autonumber
    actor Student as Student Client
    participant API as Express API
    participant Stripe as Stripe Gateway
    participant Prisma as Prisma SQL ORM
    participant DB as MongoDB

    Student->>API: POST /api/payments/checkout { courseId }
    API->>Stripe: createCheckoutSession(courseId, amount)
    Stripe-->>API: sessionUrl & sessionId
    API-->>Student: Redirect to Stripe Checkout

    Student->>Stripe: Complete Payment
    Stripe->>API: Webhook (checkout.session.completed)
    
    rect rgb(235, 245, 255)
        note over API,Prisma: Prisma ACID Transaction Block ($transaction)
        API->>Prisma: Create Payment Record
        API->>Prisma: Create PaymentTransaction Record
        API->>Prisma: Write AuditLog Entry
    end

    API->>DB: Update Student Enrollment Status
    API-->>Stripe: 200 OK Webhook Acknowledged
```

---

## 4. Key Architectural Patterns & Decisions

1. **Polyglot Persistence**: Seeding high-volume document data in MongoDB while isolating financial state in Prisma SQL tables ensures maximum throughput for educational content alongside strict ACID compliance for financial logs.
2. **Strategy Pattern for AI Tools**: All tools export a uniform interface (`name`, `description`, `execute`), enabling dynamic invocation by the AI agent without hardcoding branching statements.
3. **Defense in Depth**: Multi-layer security consisting of rate limiting at gateway, request body sanitization, regex prompt injection shielding, JWT auth, and granular RBAC checks.
4. **Resilient Third-Party Integrations**: External API calls are wrapped with 4-second execution timeouts, exponential retry policies, and fallback content generators.
5. **SEO-Optimized SSR**: Server-Side Rendering route `/ssr/courses` builds pre-rendered HTML on Express server to ensure instant indexing by search engines.

---

## 5. Deployment & Container Topology

ExplainAI is containerized using Docker Compose for deterministic deployment across development, staging, and production environments:

- `client` container: Vite React frontend built and served via lightweight Nginx / Node container.
- `server` container: Express.js REST API worker process.
- `mongo` container: MongoDB database service.
- `redis` container: Redis in-memory caching service.
