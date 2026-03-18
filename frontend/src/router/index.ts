import { createRouter, createWebHistory } from 'vue-router';
import ConversationList from '../views/ConversationList.vue';
import ChatView from '../views/ChatView.vue';

export const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', component: ConversationList },
    { path: '/conversations/:id', component: ChatView },
  ],
});
