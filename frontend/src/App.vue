<template>
  <div class="app-bg">
    <div class="chat-window">
      <!-- Header -->
      <header class="chat-header">
        <div class="header-avatar">N</div>
        <div class="header-info">
          <span class="header-name">Notch Assistant</span>
          <span class="header-status">
            <span class="status-dot" :class="{ active: !isLoading }"></span>
            {{ isLoading ? 'Typing...' : 'Online' }}
          </span>
        </div>
      </header>

      <!-- Messages -->
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

      <!-- Input bar -->
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
import { ref, nextTick } from 'vue';
import ChatMessage from './components/ChatMessage.vue';

interface IMessage {
  id: string;
  role: 'user' | 'agent';
  content: string;
}

interface ApiMessage {
  role: 'user' | 'assistant';
  content: string;
}

const chatMessages = ref<IMessage[]>([
  { id: '1', role: 'agent', content: 'Hello! How can I help you today? 👋' },
]);

const inputValue = ref('');
const isLoading = ref(false);
const chatMessagesRef = ref<HTMLElement | null>(null);

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
    id: String(chatMessages.value.length + 1),
    role: 'user',
    content: message,
  });

  isLoading.value = true;
  await nextTick();
  scrollToBottom();

  try {
    const apiMessages: ApiMessage[] = chatMessages.value.map((m) => ({
      role: m.role === 'agent' ? 'assistant' : 'user',
      content: m.content,
    }));

    const response = await fetch('http://localhost:3000/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ messages: apiMessages }),
    });

    const data = (await response.json()) as { role: string; content: string };

    chatMessages.value.push({
      id: String(chatMessages.value.length + 1),
      role: 'agent',
      content: data.content,
    });
  } catch (error) {
    console.error('Failed to get response:', error);
    chatMessages.value.push({
      id: String(chatMessages.value.length + 1),
      role: 'agent',
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

/* Header */
.chat-header {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px 20px;
  background: #0084ff;
  color: white;
  flex-shrink: 0;
}

.header-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.25);
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 18px;
  flex-shrink: 0;
}

.header-info {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.header-name {
  font-weight: 600;
  font-size: 15px;
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
}

.status-dot.active {
  background: #7fff7f;
}

/* Messages */
.chat-messages {
  flex: 1;
  overflow-y: auto;
  padding: 20px 16px;
  display: flex;
  flex-direction: column;
  gap: 4px;
  background: #f0f2f5;
}

/* Typing dots animation */
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

.typing-indicator span:nth-child(2) {
  animation-delay: 0.2s;
}

.typing-indicator span:nth-child(3) {
  animation-delay: 0.4s;
}

@keyframes bounce {
  0%, 60%, 100% { transform: translateY(0); }
  30% { transform: translateY(-6px); }
}

/* Input bar */
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

.input-bar button:not(:disabled):hover {
  background: #0073e6;
}

.input-bar button:not(:disabled):active {
  transform: scale(0.92);
}

.input-bar button:disabled {
  background: #bcc0c4;
  cursor: not-allowed;
}
</style>
