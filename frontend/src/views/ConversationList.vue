<template>
  <div class="page-bg">
    <div class="panel">
      <header class="panel-header">
        <span class="panel-title">💬 Notch Chat</span>
        <button class="new-btn" @click="createConversation" :disabled="creating">
          <svg viewBox="0 0 24 24" fill="currentColor" width="16" height="16">
            <path d="M19 13H13v6h-2v-6H5v-2h6V5h2v6h6v2z" />
          </svg>
          New chat
        </button>
      </header>

      <div v-if="loading" class="state-msg">Loading…</div>
      <div v-else-if="conversations.length === 0" class="state-msg empty">
        No conversations yet.<br />Start a new one!
      </div>
      <ul v-else class="conversation-list">
        <li
          v-for="conv in conversations"
          :key="conv.id"
          class="conversation-item"
          @click="openConversation(conv.id)"
        >
          <div class="conv-avatar">💬</div>
          <div class="conv-info">
            <span class="conv-title">{{ conv.title }}</span>
            <span class="conv-date">{{ formatDate(conv.createdAt) }}</span>
          </div>
          <svg class="conv-arrow" viewBox="0 0 24 24" fill="currentColor" width="16" height="16">
            <path d="M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z" />
          </svg>
        </li>
      </ul>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import type { ConversationSummary } from '@notch/shared';

const router = useRouter();
const conversations = ref<ConversationSummary[]>([]);
const loading = ref(true);
const creating = ref(false);

const apiUrl = import.meta.env.VITE_API_URL;

onMounted(async () => {
  const res = await fetch(`${apiUrl}/conversations`);
  conversations.value = (await res.json()) as ConversationSummary[];
  loading.value = false;
});

async function createConversation() {
  creating.value = true;
  const res = await fetch(`${apiUrl}/conversations`, { method: 'POST' });
  const conv = (await res.json()) as { id: string };
  await router.push(`/conversations/${conv.id}`);
}

function openConversation(id: string) {
  router.push(`/conversations/${id}`);
}

function formatDate(ts: number) {
  return new Intl.DateTimeFormat('en', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(ts));
}
</script>

<style scoped>
.page-bg {
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #e9eef5;
}

.panel {
  width: 100%;
  max-width: 480px;
  height: 90vh;
  max-height: 760px;
  background: #fff;
  border-radius: 16px;
  box-shadow: 0 4px 32px rgba(0, 0, 0, 0.12);
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.panel-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 20px;
  background: #0084ff;
  color: white;
  flex-shrink: 0;
}

.panel-title {
  font-size: 17px;
  font-weight: 700;
}

.new-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 7px 14px;
  background: rgba(255, 255, 255, 0.2);
  color: white;
  border: 1.5px solid rgba(255, 255, 255, 0.5);
  border-radius: 20px;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s;
}

.new-btn:hover:not(:disabled) {
  background: rgba(255, 255, 255, 0.35);
}

.new-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.state-msg {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #8a8d91;
  font-size: 14px;
}

.empty {
  text-align: center;
  line-height: 2;
}

.conversation-list {
  flex: 1;
  overflow-y: auto;
}

.conversation-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px 20px;
  cursor: pointer;
  transition: background 0.15s;
  border-bottom: 1px solid #f0f2f5;
}

.conversation-item:hover {
  background: #f0f2f5;
}

.conv-avatar {
  width: 44px;
  height: 44px;
  border-radius: 50%;
  background: #e7f3ff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  flex-shrink: 0;
}

.conv-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 3px;
  min-width: 0;
}

.conv-title {
  font-size: 14px;
  font-weight: 600;
  color: #1c1e21;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.conv-date {
  font-size: 12px;
  color: #8a8d91;
}

.conv-arrow {
  color: #bcc0c4;
  flex-shrink: 0;
}
</style>
