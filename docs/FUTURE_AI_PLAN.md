# Future AI Plan – Phase 6

## Overview

After the March 22 local demo, the following AI features will be implemented for the March 29 production deployment.
All AI features use the **Anthropic Claude API** and **pgvector** (PostgreSQL extension).

---

## Feature 1: AI Itinerary Assistant (Gen AI + RAG)

**Where it appears:** Cruise detail page – "Ask Our AI Cruise Planner" panel

**User experience:**
> "Plan a relaxing 3-day itinerary for a couple who loves fine dining and minimal activities"
> → AI responds with a personalized day-by-day plan using real cruise data

**Backend implementation:**
```
POST /api/ai/itinerary
  body: { cruiseId, userQuery, preferences }

1. Embed userQuery via Anthropic or Voyage embeddings
2. pgvector similarity search over cruise_content table
   (pre-loaded descriptions of restaurants, shows, activities)
3. Build context string from top-k results
4. Call Claude claude-sonnet-4-5:
   system: "You are a luxury cruise planner. Only use the provided context."
   user: context + userQuery
5. Stream response back to client
```

**Database additions:**
```sql
CREATE TABLE cruise_content (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cruise_id UUID REFERENCES cruises(id),
  content_type VARCHAR(50),  -- 'restaurant', 'show', 'casino', 'faq'
  title VARCHAR(255),
  body TEXT,
  embedding vector(1536)     -- pgvector column
);

CREATE INDEX ON cruise_content USING ivfflat (embedding vector_cosine_ops);
```

---

## Feature 2: Personalized Activity Recommendations (Embeddings + Agentic)

**Where it appears:** Step 2 of booking wizard – "Recommended For You" sidebar

**Logic:**
1. When user has booked ≥1 activity, compute "interest profile" vector
   (average of booked activity embeddings)
2. Do pgvector similarity search for unbooked activities
3. Return top 3 suggestions with AI-generated explanation ("We think you'll enjoy this because…")

---

## Feature 3: Smart FAQ Bot (Gen AI + RAG)

**Where it appears:** Floating "Help" button on booking and itinerary pages

**Answers questions like:**
- "What is the dress code for dinner?"
- "Can children attend casino events?"
- "What happens if I cancel?"

**Implementation:** Pre-load FAQ markdown into `cruise_content` table with embeddings. Strict system prompt prevents hallucination.

---

## Feature 4: Admin AI Insights (Agentic AI)

**Where it appears:** Admin dashboard "AI Insights" panel

**What it does:**
- Summarises occupancy trends, nearly-full activities, and revenue patterns in plain English
- Flags anomalies: "Friday's 9 PM poker event is at 97% capacity – consider opening a second table"

**Implementation:**
```
GET /api/ai/admin-insights
  1. Run 5 SQL queries: occupancy per slot, top-booked shows, revenue by room type, etc.
  2. Format stats as structured text
  3. Call Claude: "Summarise these cruise operations stats and flag issues"
  4. Return human-readable insights
```

---

## Feature 5: Content Generation Helper (Admin Gen AI)

**Where it appears:** Admin CRUD forms – "Generate Description" button

**Usage:** Admin fills in name + cuisine type → clicks button → AI generates polished marketing copy

```
POST /api/ai/generate-description
  body: { type: 'restaurant' | 'show' | 'casino', fields: { name, cuisine, ... } }
  → returns: { description: "..." }
```

---

## Technology Requirements for Phase 6

```
npm install @anthropic-ai/sdk pgvector
```

Add to .env:
```
ANTHROPIC_API_KEY=sk-ant-...
```

Enable pgvector in PostgreSQL:
```sql
CREATE EXTENSION vector;
```

---

## Estimated Timeline

| Task | Time |
|---|---|
| pgvector setup + content table | 2 hours |
| Embed and load cruise content | 2 hours |
| RAG pipeline endpoint | 3 hours |
| Frontend chat widget | 3 hours |
| Admin insights endpoint | 2 hours |
| Content generation button | 1 hour |
| **Total** | **~13 hours** |
