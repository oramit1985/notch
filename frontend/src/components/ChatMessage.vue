<template>
  <div :class="['message-row', role === MessageRole.User ? 'row-user' : 'row-agent']">
    <div v-if="role === MessageRole.Assistant" class="avatar">N</div>
    <div :class="['bubble', role === MessageRole.User ? 'bubble-user' : 'bubble-agent']">
      {{ content }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { MessageRole } from '@notch/shared';

defineProps<{
  content: string;
  role: MessageRole;
}>();
</script>

<style scoped>
.message-row {
  display: flex;
  align-items: flex-end;
  gap: 8px;
  max-width: 75%;
}

.row-user {
  align-self: flex-end;
  flex-direction: row-reverse;
}

.row-agent {
  align-self: flex-start;
}

.avatar {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background: #0084ff;
  color: white;
  font-size: 12px;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  margin-bottom: 2px;
}

.bubble {
  padding: 10px 14px;
  border-radius: 18px;
  font-size: 14px;
  line-height: 1.45;
  word-break: break-word;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.08);
}

.bubble-user {
  background: #0084ff;
  color: white;
  border-bottom-right-radius: 4px;
}

.bubble-agent {
  background: #fff;
  color: #1c1e21;
  border-bottom-left-radius: 4px;
}
</style>
