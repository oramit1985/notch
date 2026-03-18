# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Running the project

The shared library must be built before the backend or frontend can use it:

```bash
# 1. Build shared library (required before first run and after any changes to shared/)
cd shared && npm install && npm run build

# 2. Backend (NestJS, runs on port 3000)
cd backend && npm install && npm start
# or for auto-reload during development:
cd backend && npm run start:dev

# 3. Frontend (Vue 3 + Vite, runs on port 5173)
cd frontend && npm install && npm run dev
```

If you change files in `shared/`, re-run `npm run build` inside `shared/` — the backend and frontend both reference it as `file:../shared` and consume the compiled `dist/` output.

Set your OpenAI API key in `backend/local.env` before starting the backend:
```
PORT=3000
OPENAI_API_KEY=sk-...
```

> **Note on secrets:** `backend/local.env` is intentionally committed to git for convenience in this project. In a production setup, this file should never be committed — secrets should be injected at deploy time from a vault (e.g. HashiCorp Vault, AWS Secrets Manager) via the CI/CD pipeline.

Set the API base URL in `frontend/.env` (or `frontend/local.env`):
```
VITE_API_URL=http://localhost:3000
```

## Architecture

### Shared library — `@notch/shared`

- `shared/src/types/enums.ts` — `MessageRole` (`user` | `assistant` | `system`), `OpenAiModels`
- `shared/src/types/interfaces.ts` — `ChatMessage`, `ChatRequest`, `ChatResponse`, `Conversation`, `ConversationSummary`, `CreateMessageRequest`
- `shared/src/utils/text.ts` — `truncateWithEllipsis` helper (used by both frontend and backend)
- Both backend and frontend import from `@notch/shared`

### Backend — NestJS

- `src/main.ts` — bootstraps the NestJS app with CORS enabled; reads port from `local.env` via `src/config.ts`
- `src/config.ts` — loads `local.env` using `dotenv` and validates with `zod`
- `src/chat/chat.service.ts` — core logic: fires **two parallel OpenAI requests** per user message:
  1. Chat completion (Part A) — uses a system prompt to enforce unique emoji signatures
  2. Function calling with `record_sentiment` tool forced (Part B) — logs a 0–100 sentiment score to console
- `src/conversation/conversation.service.ts` — in-memory store (`Map<string, Conversation>`); handles create, list, get, and sendMessage (appends user message, calls `ChatService`, appends assistant reply; sets title from first message)
- `src/conversation/conversation.controller.ts` — exposes the conversations REST API

### Frontend — Vue 3 + Vite

- `src/App.vue` — minimal shell; just renders `<RouterView />`
- `src/router/index.ts` — Vue Router with two routes:
  - `/` → `ConversationList.vue`
  - `/conversations/:id` → `ChatView.vue`
- `src/views/ConversationList.vue` — lists all conversations (fetched from `GET /conversations`), "New chat" button creates a conversation and navigates into it
- `src/views/ChatView.vue` — full chat UI for a single conversation; loads history on mount via `GET /conversations/:id`, sends messages via `POST /conversations/:id/chat`; sets title from the first message
- `src/components/ChatMessage.vue` — styled bubble: green (right-aligned) for user, blue (left-aligned) for agent

### API contract

```
GET  /conversations           → ConversationSummary[]
POST /conversations           → Conversation  (creates new, empty conversation)
GET  /conversations/:id       → Conversation  (full history)
POST /conversations/:id/chat  { content: string } → ChatResponse { role, content }
```

> **Note on persistence:** Conversations are stored in-memory (`Map<string, Conversation>` in `ConversationService`) as a deliberate simplification for this home assignment — they survive browser refreshes but are lost on server restart. In a real-world application this would be replaced with a database (e.g. PostgreSQL via TypeORM/Prisma), with each conversation and its messages persisted as rows.