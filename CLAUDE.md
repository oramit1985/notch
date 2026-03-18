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

## Architecture

### Backend — NestJS

- `src/main.ts` — bootstraps the NestJS app with CORS enabled; reads port from `local.env` via `src/config.ts`
- `src/config.ts` — loads `local.env` using `dotenv` and validates with `zod`
- `src/chat/chat.service.ts` — core logic: fires **two parallel OpenAI requests** per user message:
  1. Chat completion (Part A) — uses a system prompt to enforce unique emoji signatures
  2. Function calling with `record_sentiment` tool forced (Part B) — logs a 0–100 sentiment score to console
- The controller accepts `POST /chat` with `{ messages: {role, content}[] }` and returns `{ role, content }`

### Frontend — Vue 3 + Vite

- `src/App.vue` — maintains the full message history in a `ref<IMessage[]>`, maps `agent` → `assistant` when sending to the API, handles loading state and auto-scroll
- `src/components/ChatMessage.vue` — styled bubble: green (right-aligned) for user, blue (left-aligned) for agent
- The frontend sends the entire conversation history on every message so the backend can pass it to OpenAI for context

### API contract

`POST http://localhost:3000/chat`
```json
{ "messages": [{ "role": "user" | "assistant", "content": "..." }] }
```
Response:
```json
{ "role": "assistant", "content": "..." }
```

## Part C (if time allows)

The readme describes an optional "conversations" feature: a list view of ongoing conversations, ability to create/enter/navigate them, with state persisted across browser refresh (but not server restart). This would require adding Vue Router, a conversation store (Pinia or composable), and a server-side in-memory store keyed by conversation ID.
