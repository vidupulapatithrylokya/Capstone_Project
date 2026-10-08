# ExplainAI - MongoDB Data Modeling & Indexing Strategy

## 1. Embedding vs Referencing Decisions

In ExplainAI, document modeling follows established database design principles based on data access patterns, query frequency, and record growth:

### Embedded Schemas (1:Few or Tightly-Coupled Subdocuments)
- **Quiz Questions & Options** (`Quiz.js`): Questions and options are embedded inside the `Quiz` document. Rationale: Questions are always queried together with the quiz and do not grow unboundedly.
- **Course Modules & Lessons Metadata** (`Lesson.js`): Small lesson metadata objects are stored directly inside parent course modules to eliminate `JOIN` overhead during video playback.

### Referenced Schemas (1:Many or Unbounded Entities)
- **User -> Courses / Enrollments** (`Enrollment.js`): `Enrollment` references `User` (`student`) and `Course` via `ObjectId`. Rationale: Students can enroll in hundreds of courses over time, which would exceed MongoDB's 16MB document size limit if stored in a single embedded array.
- **Mentor -> Sessions** (`Session.js`): 1-on-1 booking sessions reference `User` (`student` and `mentor`). Rationale: Sessions accumulate continuously and require independent query filtering by status, date, and user.
- **AI Usage Records** (`AIUsage.js`): Each LLM request creates an independent `AIUsage` log referencing `User`. Rationale: Allows high-throughput log insertion and analytical aggregation pipelines (`$group`, `$sum`, `$avg`) without mutating user profile documents.

---

## 2. Indexing Strategy & Active Schema Indexes

| Schema | Field(s) | Index Type | Purpose |
|---|---|---|---|
| `User.js` | `email` | Unique Single Field | Accelerates login/auth lookups & guarantees email uniqueness |
| `Course.js` | `category` | Single Field | Optimizes course catalog filtering by category |
| `Course.js` | `mentor` | Single Field | Accelerates queries for courses taught by a specific mentor |
| `Course.js` | `title`, `description` | Text Index | Enables fast full-text search across ExplainAI catalog |
| `Enrollment.js` | `student`, `course` | Compound Unique | Prevents duplicate student enrollments & speeds up progress lookup |
| `Session.js` | `mentor`, `date` | Compound | Fast availability lookup for mentor schedule slots |
| `AIUsage.js` | `user`, `createdAt` | Compound (-1) | High-performance date-range analytics aggregations for token costs |
| `KnowledgeChunk.js` | `content` | Text Index | Vector context similarity retrieval fallback |
