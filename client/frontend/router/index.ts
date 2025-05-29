import { createRouter, createWebHistory } from 'vue-router'
import Room from '../views/Room.vue'
import Lobby from '@/views/Lobby.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'Lobby',
      component: Lobby,
    },
    {
      path: '/room/:code',
      name: 'Room',
      // route level code-splitting
      // this generates a separate chunk (About.[hash].js) for this route
      // which is lazy-loaded when the route is visited.
      component: Room,
    },
  ],
})

export default router
