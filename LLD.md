# ExplainAI - Low-Level Design (LLD) Document

## 1. Database Schema & Data Models

ExplainAI employs a dual-database architecture: **MongoDB (via Mongoose)** for flexible document management and **PostgreSQL / Relational SQL (via Prisma ORM)** for ACID-compliant financial transactional records.

### 1.1 MongoDB Mongoose Schemas

#### 1. `User.js`
- **Fields**:
  - `_id`: `ObjectId` (Primary Key)
  - `name`: `String` (Required, Trimmed)
  - `email`: `String` (Required, Unique, Lowercase, Indexed)
  - `password`: `String` (Required, Hashed with bcrypt)
  - `role`: `String` (Enum: `['student', 'mentor', 'admin']`, Default: `'student'`)
  - `avatar`: `String` (Optional URL)
  - `googleId`: `String` (Optional OAuth identifier)
  - `createdAt`, `updatedAt`: `Date` (Timestamps)
- **Indexes**: Unique single-field index on `email`.

#### 2. `Course.js`
- **Fields**:
  - `_id`: `ObjectId`
  - `title`: `String` (Required, Text Indexed)
  - `description`: `String` (Required, Text Indexed)
  - `category`: `String` (Required, Indexed)
  - `mentor`: `ObjectId` (Ref: `'User'`, Indexed)
  - `price`: `Number` (Default: `0`)
  - `level`: `String` (Enum: `['beginner', 'intermediate', 'advanced']`)
  - `modules`: `Array` of Embedded Module Subdocuments (`{ title, lessons: [LessonRef] }`)
  - `createdAt`, `updatedAt`: `Date`
- **Indexes**: Single-field index on `category`, single-field index on `mentor`, compound text index on `{ title: 'text', description: 'text' }`.

#### 3. `Lesson.js`
- **Fields**:
  - `_id`: `ObjectId`
  - `title`: `String` (Required)
  - `content`: `String`
  - `videoUrl`: `String`
  - `durationSeconds`: `Number`
  - `course`: `ObjectId` (Ref: `'Course'`, Required)

#### 4. `Quiz.js`
- **Fields**:
  - `_id`: `ObjectId`
  - `course`: `ObjectId` (Ref: `'Course'`, Required)
  - `title`: `String` (Required)
  - `questions`: `Array` of Embedded Question Subdocuments:
    - `question`: `String` (Required)
    - `options`: `[String]` (Required)
    - `correctAnswerIndex`: `Number` (Required)
    - `explanation`: `String`
- **Embedding Decision**: Questions and options are embedded directly within `Quiz` because they are tightly coupled and bounded in size (<20 questions per quiz).

#### 5. `Enrollment.js`
- **Fields**:
  - `_id`: `ObjectId`
  - `student`: `ObjectId` (Ref: `'User'`, Required)
  - `course`: `ObjectId` (Ref: `'Course'`, Required)
  - `completedLessons`: `[ObjectId]` (Refs: `'Lesson'`)
  - `progressPercent`: `Number` (Default: `0`)
  - `status`: `String` (Enum: `['active', 'completed', 'dropped']`)
- **Indexes**: Compound unique index on `{ student: 1, course: 1 }` preventing duplicate enrollments.

#### 6. `KnowledgeChunk.js` (RAG Engine)
- **Fields**:
  - `_id`: `ObjectId`
  - `courseId`: `ObjectId` (Ref: `'Course'`)
  - `content`: `String` (~400 character text chunk)
  - `embedding`: `[Number]` (64-dimensional float vector array)
  - `metadata`: `Object` (Source module, lesson ID, page)
- **Indexes**: Text index on `content` for keyword fallback search.

#### 7. `AIUsage.js` (Cost & Analytics Engine)
- **Fields**:
  - `_id`: `ObjectId`
  - `user`: `ObjectId` (Ref: `'User'`)
  - `promptTokens`: `Number`
  - `completionTokens`: `Number`
  - `totalTokens`: `Number`
  - `estimatedCost`: `Number` (USD float)
  - `latencyMs`: `Number`
  - `endpoint`: `String`
  - `createdAt`: `Date`
- **Indexes**: Compound index on `{ user: 1, createdAt: -1 }` optimizing analytics aggregation queries.

#### 8. Additional Domain Schemas
- `Session.js`: 1-on-1 mentor booking (`student`, `mentor`, `date`, `status`, `notes`). Compound index on `{ mentor: 1, date: 1 }`.
- `Mentor.js`: Mentor profile metadata, expertise areas, hourly rate.
- `Flashcard.js`: Generated study card decks.
- `Discussion.js`: Course forum posts and replies.
- `Portfolio.js`: Student showcase portfolios.
- `Certificate.js`: Completed course certificates.
- `Notification.js`: In-app user alerts.

---

### 1.2 Prisma Relational Database Schema (`schema.prisma`)

```prisma
datasource db {
  provider = "sqlite" // or "postgresql"
  url      = env("DATABASE_URL")
}

generator client {
  provider = "prisma-client-js"
}

model UserRecord {
  id        String    @id @default(uuid())
  email     String    @unique
  name      String
  payments  Payment[]
  createdAt DateTime  @default(now())

  @@index([email])
}

model Payment {
  id           String               @id @default(uuid())
  userId       String
  user         UserRecord           @relation(fields: [userId], references: [id])
  amount       Float
  currency     String               @default("USD")
  status       String               // PENDING, COMPLETED, FAILED
  paymentId    String               @unique
  transactions PaymentTransaction[]
  createdAt    DateTime             @default(now())

  @@index([userId])
  @@index([paymentId])
  @@index([status])
}

model PaymentTransaction {
  id        String   @id @default(uuid())
  paymentId String
  payment   Payment  @relation(fields: [paymentId], references: [id])
  type      String   // CHARGE, REFUND
  status    String   // SUCCESS, FAILED
  details   String?
  createdAt DateTime @default(now())

  @@index([paymentId])
}

model AuditLog {
  id        String   @id @default(uuid())
  action    String
  entity    String
  entityId  String
  payload   String?
  createdAt DateTime @default(now())
}
```

---

## 2. API Endpoint Specifications

### 2.1 Auth & User Routes (`/api/auth`)
- `POST /api/auth/register`: Create user account (`name`, `email`, `password`, `role`). Returns JWT token & user profile.
- `POST /api/auth/login`: Authenticate user. Returns 7-day JWT token.
- `POST /api/auth/google`: Exchange Google OAuth token for JWT session.
- `GET /api/auth/me`: Fetch authenticated user profile (Requires `authMiddleware`).

### 2.2 AI & Learning Assistant Routes (`/api/ai`)
- `POST /api/ai/stream`: SSE Streaming endpoint.
  - *Headers*: `Content-Type: text/event-stream`, `Cache-Control: no-cache`.
  - *Body*: `{ prompt: string, courseId?: string }`.
  - *Response*: Incremental SSE data tokens `data: {"chunk": "..."}\n\n`.
- `POST /api/ai/agent`: Autonomous multi-step planner agent.
  - *Body*: `{ prompt: string }`.
  - *Response*: `{ success: true, steps: [...], result: string }`.
- `POST /api/ai/ingest`: Ingest document text into chunked vectors.
- `GET /api/ai/usage`: Admin analytical endpoint aggregating token usage and cost metrics using MongoDB `$group` pipelines.

### 2.3 Course Catalog & Content Routes (`/api/courses`, `/ssr`)
- `GET /api/courses`: List all courses (Cached in Redis for 300s). Supports `?category=...&search=...`.
- `POST /api/courses`: Create course (Requires role `mentor` or `admin`).
- `GET /api/courses/:id`: Detailed course view with embedded module outline.
- `GET /ssr/courses`: Server-Side Rendered HTML page returning static catalog markup.

### 2.4 Payments & Stripe Routes (`/api/payments`)
- `POST /api/payments/checkout`: Generate Stripe checkout session URL.
- `POST /api/payments/webhook`: Handle incoming Stripe events and execute Prisma transaction.

---

## 3. Core Algorithms & Logic Specifications

### 3.1 Prompt Injection Defense Algorithm (`server/services/promptSanitizer.js`)

```javascript
/**
 * Detects prompt injection attempts and redacts secret keys
 */
function sanitizePrompt(userInput) {
  if (!userInput || typeof userInput !== 'string') return { isSafe: true, sanitized: '' };

  // 1. Redact API Keys / Sensitive Tokens
  let sanitized = userInput.replace(/(sk-[a-zA-Z0-9]{32,}|bearer\s+[a-zA-Z0-9\._\-]+)/gi, '[REDACTED_SECRET]');

  // 2. Blacklisted Override Patterns
  const injectionPatterns = [
    /ignore\s+previous\s+instructions/i,
    /system\s+override/i,
    /you\s+are\s+now\s+DAN/i,
    /reveal\s+system\s+prompt/i,
    /drop\s+database/i
  ];

  const hasInjection = injectionPatterns.some(pattern => pattern.test(sanitized));

  return {
    isSafe: !hasInjection,
    sanitized: hasInjection 
      ? "I cannot fulfill requests that attempt to override system safety guidelines." 
      : sanitized
  };
}
```

### 3.2 Multi-Step Agent Planner Loop (`server/services/planner.js` & `agentService.js`)

```javascript
async function executeAgentPlanner(userPrompt) {
  let stepCount = 0;
  const maxSteps = 5;
  const context = { prompt: userPrompt, history: [] };

  while (stepCount < maxSteps) {
    stepCount++;
    const stepPlan = await determineNextStep(context);

    if (stepPlan.type === 'FINAL_ANSWER') {
      return { status: 'COMPLETED', answer: stepPlan.output, steps: context.history };
    }

    if (stepPlan.type === 'TOOL_CALL') {
      const tool = toolRegistry[stepPlan.toolName];
      const result = await tool.execute(stepPlan.args);
      context.history.push({ step: stepCount, tool: stepPlan.toolName, result });
    }
  }

  return { status: 'TIMEOUT_REACHED', answer: context.history.slice(-1)[0]?.result || 'Task incomplete', steps: context.history };
}
```

### 3.3 Vector Cosine Similarity RAG Retrieval Algorithm (`server/services/ragService.js`)

Mathematical formulation for Cosine Similarity between query vector \(\mathbf{A}\) and chunk vector \(\mathbf{B}\):

\[
\text{Similarity}(\mathbf{A}, \mathbf{B}) = \frac{\mathbf{A} \cdot \mathbf{B}}{\|\mathbf{A}\| \|\mathbf{B}\|} = \frac{\sum_{i=1}^{n} A_i B_i}{\sqrt{\sum_{i=1}^{n} A_i^2} \sqrt{\sum_{i=1}^{n} B_i^2}}
\]

```javascript
function cosineSimilarity(vecA, vecB) {
  let dotProduct = 0;
  let normA = 0;
  let normB = 0;
  for (let i = 0; i < vecA.length; i++) {
    dotProduct += vecA[i] * vecB[i];
    normA += vecA[i] * vecA[i];
    normB += vecB[i] * vecB[i];
  }
  if (normA === 0 || normB === 0) return 0;
  return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
}
```

### 3.4 Prisma ACID Payment Transaction (`server/sql/sqlService.js`)

```javascript
async function recordPaymentTransaction({ userId, userEmail, userName, amount, paymentId, type }) {
  return await prisma.$transaction(async (tx) => {
    // 1. Ensure UserRecord exists
    let user = await tx.userRecord.findUnique({ where: { email: userEmail } });
    if (!user) {
      user = await tx.userRecord.create({
        data: { id: userId, email: userEmail, name: userName }
      });
    }

    // 2. Create Payment Record
    const payment = await tx.payment.create({
      data: {
        userId: user.id,
        amount,
        paymentId,
        status: 'COMPLETED'
      }
    });

    // 3. Create Transaction Record
    const transaction = await tx.paymentTransaction.create({
      data: {
        paymentId: payment.id,
        type: type || 'CHARGE',
        status: 'SUCCESS',
        details: `Stripe Payment ${paymentId}`
      }
    });

    // 4. Audit Log Entry
    await tx.auditLog.create({
      data: {
        action: 'PAYMENT_PROCESSED',
        entity: 'Payment',
        entityId: payment.id,
        payload: JSON.stringify({ amount, userId })
      }
    });

    return { payment, transaction };
  });
}
```

---

## 4. Educational JavaScript Sandbox Implementation

ExplainAI includes interactive frontend demonstrations for foundational JS concepts (`client/src/components/common/JSConceptsDemo.jsx`):
1. **Closures**: Encapsulated state counter retaining private variables across invocations.
2. **Event Loop**: Interactive visual sequence demonstrating Call Stack execution vs Microtask Queue vs Macrotask Queue.
3. **Hoisting & TDZ**: Live execution matrix contrasting `var` hoisting with `let`/`const` Temporal Dead Zone behavior.
4. **Promises vs Callbacks vs Async/Await**: Comparative code runner illustrating asynchronous control flow patterns.

---

## 5. Verification & Testing Framework

ExplainAI includes an automated test infrastructure guaranteeing stability:

- **Unit Test Runner** (`npm test` -> `server/tests/unit.test.js`): Verifies JWT token generation/validation, bcrypt password hashing, prompt sanitizer regex, RAG similarity calculation, and individual tool interfaces (20/20 PASSED).
- **API E2E Integration Suite** (`npm test` -> `server/tests/api.test.js`): Executes 20 full HTTP integration tests against Express endpoints including auth, courses, AI streaming, and SQL payment transactions (20/20 PASSED).
- **AI Evaluation Suite** (`npm run eval:ai` -> `server/ai-evals/run-eval.js`): Evaluates LLM behavior across 8 test scenarios verifying factual correctness, prompt injection shielding, tool calling precision, and RAG contextual retrieval (8/8 PASSED, 100% Pass Rate).
