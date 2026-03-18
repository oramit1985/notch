# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Running the project

```bash
# Backend (NestJS, runs on port 3000)
cd backend && npm install && npm start
# or for auto-reload during development:
cd backend && npm run start:dev

# Frontend (Vue 3 + Vite, runs on port 5173)
cd frontend && npm install && npm run dev
```

Set your OpenAI API key in `backend/local.env` before starting the backend:
```
PORT=3000
OPENAI_API_KEY=sk-...
```

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

> Conversations are stored in-memory on the server — they persist across browser refreshes but are lost on server restart.