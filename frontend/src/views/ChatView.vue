<template>
  <div class="app-bg">
    <div class="chat-window">
      <header class="chat-header">
        <button class="back-btn" @click="router.push('/')" aria-label="Back">
          <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20">
            <path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z" />
          </svg>
        </button>
        <div class="header-avatar">N</div>
        <div class="header-info">
          <span class="header-name">{{ title }}</span>
          <span class="header-status">
            <span class="status-dot" :class="{ active: !isLoading }"></span>
            {{ isLoading ? 'Typing...' : 'Online' }}
          </span>
        </div>
      </header>

      <section class="chat-messages" ref="chatMessagesRef">
        <ChatMessage
          v-for="message in chatMessages"
          :key="message.id"
          :content="message.content"
          :role="message.role"
        />
        <div v-if="isLoading" class="typing-indicator">
          <span></span><span></span><span></span>
        </div>
      </section>

      <form class="input-bar" @submit.prevent="submitMessage">
        <input
          v-model="inputValue"
          type="text"
          placeholder="Type a message..."
          :disabled="isLoading"
          autocomplete="off"
        />
        <button type="submit" :disabled="isLoading || !inputValue.trim()" aria-label="Send">
          <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20">
            <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
          </svg>
        </button>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, nextTick, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import {MessageRole, type Conversation, type ChatResponse, truncateWithEllipsis} from '@notch/shared';
import ChatMessage from '../components/ChatMessage.vue';

interface DisplayMessage {
  id: string;
  role: MessageRole;
  content: string;
}

const route = useRoute();
const router = useRouter();
const conversationId = route.params.id as string;
const apiUrl = import.meta.env.VITE_API_URL;

const chatMessages = ref<DisplayMessage[]>([]);
const title = ref('Notch Assistant');
const inputValue = ref('');
const isLoading = ref(false);
const chatMessagesRef = ref<HTMLElement | null>(null);

onMounted(async () => {
  const res = await fetch(`${apiUrl}/conversations/${conversationId}`);
  const conv = (await res.json()) as Conversation;
  title.value = conv.title;
  chatMessages.value = conv.messages.map((m, i) => ({
    id: String(i),
    role: m.role,
    content: m.content,
  }));
  await nextTick();
  scrollToBottom();
});

function scrollToBottom() {
  if (chatMessagesRef.value) {
    chatMessagesRef.value.scrollTop = chatMessagesRef.value.scrollHeight;
  }
}

async function submitMessage() {
  const message = inputValue.value.trim();
  if (!message || isLoading.value) return;

  inputValue.value = '';
  chatMessages.value.push({
    id: String(chatMessages.value.length),
    role: MessageRole.User,
    content: message,
  });

  if (chatMessages.value.length === 1) {
    title.value = truncateWithEllipsis(message, 45);
  }

  isLoading.value = true;
  await nextTick();
  scrollToBottom();

  try {
    const res = await fetch(
      `${apiUrl}/conversations/${conversationId}/chat`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: message }),
      },
    );

    const data = (await res.json()) as ChatResponse;
    chatMessages.value.push({
      id: String(chatMessages.value.length),
      role: MessageRole.Assistant,
      content: data.content,
    });
  } catch {
    chatMessages.value.push({
      id: String(chatMessages.value.length),
      role: MessageRole.Assistant,
      content: 'Sorry, something went wrong. Please try again.',
    });
  } finally {
    isLoading.value = false;
    await nextTick();
    scrollToBottom();
  }
}
</script>

<style scoped>
.app-bg {
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #e9eef5;
}

.chat-window {
  display: flex;
  flex-direction: column;
  width: 100%;
  max-width: 680px;
  height: 90vh;
  max-height: 820px;
  background: #fff;
  border-radius: 16px;
  box-shadow: 0 4px 32px rgba(0, 0, 0, 0.12);
  overflow: hidden;
}

.chat-header {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 14px 20px;
  background: #0084ff;
  color: white;
  flex-shrink: 0;
}

.back-btn {
  background: none;
  border: none;
  color: white;
  cursor: pointer;
  padding: 4px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background 0.15s;
  flex-shrink: 0;
}

.back-btn:hover {
  background: rgba(255, 255, 255, 0.2);
}

.header-avatar {
  width: 38px;
  height: 38px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.25);
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 16px;
  flex-shrink: 0;
}

.header-info {
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
}

.header-name {
  font-weight: 600;
  font-size: 15px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.header-status {
  font-size: 12px;
  opacity: 0.9;
  display: flex;
  align-items: center;
  gap: 5px;
}

.status-dot {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.4);
  transition: background 0.3s;
  flex-shrink: 0;
}

.status-dot.active {
  background: #7fff7f;
}

.chat-messages {
  flex: 1;
  overflow-y: auto;
  padding: 20px 16px;
  display: flex;
  flex-direction: column;
  gap: 4px;
  background: #f0f2f5;
}

.typing-indicator {
  display: flex;
  align-items: center;
  gap: 5px;
  padding: 10px 16px;
  background: #fff;
  border-radius: 18px 18px 18px 4px;
  width: fit-content;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
}

.typing-indicator span {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #aaa;
  animation: bounce 1.2s infinite ease-in-out;
}

.typing-indicator span:nth-child(2) { animation-delay: 0.2s; }
.typing-indicator span:nth-child(3) { animation-delay: 0.4s; }

@keyframes bounce {
  0%, 60%, 100% { transform: translateY(0); }
  30% { transform: translateY(-6px); }
}

.input-bar {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px 16px;
  background: #fff;
  border-top: 1px solid #e4e6eb;
  flex-shrink: 0;
}

.input-bar input {
  flex: 1;
  padding: 10px 16px;
  border: 1.5px solid #e4e6eb;
  border-radius: 24px;
  font-size: 14px;
  background: #f0f2f5;
  color: #1c1e21;
  transition: border-color 0.2s, background 0.2s;
  outline: none;
}

.input-bar input:focus {
  border-color: #0084ff;
  background: #fff;
}

.input-bar input::placeholder {
  color: #8a8d91;
}

.input-bar button {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  border: none;
  background: #0084ff;
  color: white;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  transition: background 0.2s, transform 0.1s;
}

.input-bar button:not(:disabled):hover { background: #0073e6; }
.input-bar button:not(:disabled):active { transform: scale(0.92); }
.input-bar button:disabled {
  background: #bcc0c4;
  cursor: not-allowed;
}
</style>
