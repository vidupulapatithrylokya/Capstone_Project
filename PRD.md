# ExplainAI - Product Requirements Document (PRD)

## 1. Executive Summary & Overview
**ExplainAI** is an intelligent, full-stack AI-powered e-learning and mentorship platform designed to bridge the gap between traditional learning management systems (LMS) and interactive AI tutoring. The platform delivers multi-step AI study agents, real-time Server-Sent Event (SSE) streaming, specialized educational tool calling (calculators, flashcards, quiz generators), vector RAG (Retrieval-Augmented Generation) context lookup, Stripe-powered payment processing, and 1-on-1 mentorship session scheduling.

ExplainAI is built adhering to a 54-concept master rubric covering AI App Engineering, Auth & Security, Backend System Design, Database Modeling (MongoDB + SQL/Prisma), Frontend React Architecture, System Integrations, and DevOps Containerization.

---

## 2. Problem Statement
Traditional e-learning platforms present several key limitations:
1. **Static Learning Materials**: Students receive fixed video and text lessons without instant, personalized clarification when struggling with complex concepts.
2. **Lack of Autonomous AI Tools**: Existing AI assistants act as basic chat wrappers without ability to interact with real course data, evaluate student progress, calculate quantitative problems, or generate interactive quizzes on demand.
3. **Security & Prompt Vulnerabilities**: Educational AI bots are often vulnerable to prompt injection attacks, context leaks, and untracked API usage costs.
4. **Disjointed Systems**: Course consumption, AI assistance, payment transactions, and live mentorship session bookings often exist across separate, unintegrated applications.

---

## 3. Product Vision & Goals

### 3.1 Key Objectives
- **Interactive AI Tutor**: Provide continuous, context-aware AI learning assistance via streaming text and multi-step autonomous planning.
- **Integrated Educational Tooling**: Support function calling so the AI agent can dynamically search courses, track user progress, generate flashcards, create quizzes, and execute mathematical calculations.
- **Robust Security & Defense**: Protect against prompt injection attacks, sanitize user inputs against NoSQL/XSS vulnerabilities, and enforce granular Role-Based Access Control (RBAC).
- **Dual-Database Architecture**: Utilize MongoDB for flexible, high-volume document management (courses, lessons, quizzes, AI usage logs) and PostgreSQL/Prisma for ACID-compliant financial transactions (payments, audit logs).
- **Full E-Commerce & Mentorship Lifecycle**: Enable seamless student enrollment, Stripe payment processing, and 1-on-1 mentor session bookings.

---

## 4. User Roles & Personas

| Role | Description | Key Capabilities |
|---|---|---|
| **Student** | Primary learner interacting with courses and AI tools. | Browse catalog, stream AI responses, request autonomous agent execution, solve quizzes, generate flashcards, purchase premium courses, book mentor sessions. |
| **Mentor** | Educator or domain expert offering courses and live sessions. | Create and update courses, manage session availability slots, review student progress, conduct 1-on-1 sessions. |
| **Admin** | System administrator maintaining platform health and monitoring usage. | View system analytics, inspect LLM token usage and cost metrics (`AIUsage`), manage users, review audit logs. |

---

## 5. Functional Requirements

### 5.1 Auth & Security Subsystem
- **FR-1.1**: User registration and authentication using JWT (7-day expiration) with `bcryptjs` password hashing (10 salt rounds).
- **FR-1.2**: 3rd-party OAuth login support (Google OAuth token exchange).
- **FR-1.3**: Role-Based Access Control (RBAC) middleware enforcing access rules across `student`, `mentor`, and `admin` roles.
- **FR-1.4**: Request input sanitization blocking NoSQL query operators (`$gt`, `$where`) and malicious script injections (`<script>`).
- **FR-1.5**: Rate limiting middleware (20 requests/15m for Auth, 50 requests/15m for AI endpoints) using `express-rate-limit`.

### 5.2 AI App Engineering Subsystem
- **FR-2.1 (SSE Streaming)**: Real-time Server-Sent Event (SSE) streaming endpoint (`POST /api/ai/stream`) streaming token chunks incrementally to client.
- **FR-2.2 (Multi-Step Agent)**: Autonomous planner agent (`POST /api/ai/agent`) executing multi-step reasoning loops (max 5 iterations) with timeout protection and loop prevention.
- **FR-2.3 (Function Calling & Tools)**: Modular tool architecture allowing AI to invoke:
  - `calculatorTool`: Math expression execution.
  - `courseSearchTool`: Catalog filtering.
  - `progressTool`: User course completion metrics.
  - `flashcardTool`: Dynamic study card generation.
  - `quizTool`: Interactive practice test generation.
  - `learningResourceTool`: Supplementary material lookup.
- **FR-2.4 (Prompt Injection Defenses)**: Regex classification defense system sanitizing prompt overrides and redacting API keys (`server/services/promptSanitizer.js`).
- **FR-2.5 (RAG Engine)**: Embeddings & vector retrieval system utilizing ~400-character text chunking, 64-dimensional vector representation, and cosine similarity lookup (`server/services/ragService.js`).
- **FR-2.6 (Token & Cost Monitoring)**: Automatic logging of prompt tokens, completion tokens, latency, and estimated cost per LLM invocation via `AIUsage` collection.
- **FR-2.7 (LLM Eval Suite)**: Automated evaluation suite testing 8 critical evaluation categories (factual accuracy, injection blocking, tool selection, RAG precision).

### 5.3 Course & Content Management Subsystem
- **FR-3.1**: Course creation, updating, deletion, and category filtering.
- **FR-3.2**: Lesson metadata embedding and multi-modal asset attachment with file upload handling (`multer` with MIME whitelist and 10MB limit).
- **FR-3.3**: Server-Side Rendered (SSR) HTML course catalog at `/ssr/courses` for optimal SEO indexing and fast initial paint.

### 5.4 Payment & Transaction Subsystem
- **FR-4.1**: Stripe Payment Gateway checkout session creation, backend verification, and webhook handling.
- **FR-4.2**: ACID transactional storage using Prisma ORM (`prisma.$transaction`) recording `UserRecord`, `Payment`, `PaymentTransaction`, and `AuditLog`.

### 5.5 Mentorship Subsystem
- **FR-5.1**: Mentor availability scheduling and 1-on-1 session reservation (`Session` model).
- **FR-5.2**: Student session tracking with status transitions (`scheduled`, `completed`, `cancelled`).

### 5.6 Caching & System Integration Subsystem
- **FR-6.1**: Redis caching layer (`ioredis`) with TTL for high-frequency catalog endpoints (`/api/courses`) with graceful memory fallback.
- **FR-6.2**: 3rd-party API client abstraction supporting 4-second timeouts and exponential retries.
- **FR-6.3**: `node-cron` background scheduler for periodic file cleanup and cost report generation.

---

## 6. Non-Functional Requirements (NFRs)

- **Performance & Latency**: AI streaming responses must begin rendering initial tokens within 500ms. Redis cached endpoints must return responses in <50ms.
- **Security**: All API traffic must enforce strict CORS headers, JWT verification, rate limiting, and zero exposure of secrets via `.env` exclusion.
- **Reliability & Resilience**: Circuit breakers and exponential retries handle external service failures gracefully without crashing Express workers.
- **Maintainability & Testing**: Automated test runner executing unit test suite (20 tests), API E2E integration suite (20 scenarios), and AI evaluation suite (8 scenarios) with 100% pass rates.
- **Deployment & Scalability**: Multi-stage Docker deployment (`docker-compose.yml`) containerizing client, server, MongoDB, and Redis.

---

## 7. Rubric & Verification Mapping

| Category | Target Requirements | Verification Method |
|---|---|---|
| AI App Engineering | Streaming, Multi-step Agent, RAG, Tools, Injection Defense, Evals | `npm run eval:ai` (100% pass rate) |
| Auth & Security | JWT, Bcrypt, OAuth, Rate Limiting, Input Sanitization, RBAC | `npm test` unit & E2E suite |
| Backend Architecture | REST design, File uploads, Models, Health checks | `GET /api/health` & `npm test` |
| Database Design | MongoDB embedding/referencing + SQL 3NF transactions | Mongoose schemas & Prisma migrations |
| System Integration | Stripe payment gateway, Redis cache, Cron scheduler, SSR | Integration test suite |
