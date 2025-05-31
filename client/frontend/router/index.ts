import { createRouter, createWebHistory } from 'vue-router'
import Room from '../views/Room.vue'
import Lobby from '@/views/Lobby.vue'
import QuestionView from '../views/Question.vue'
import VotingView from '../views/Voting.vue'
import ResultsView from '../views/Results.vue'

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
      component: Room,
    },
    { path: '/question', component: QuestionView },
    { path: '/voting', component: VotingView },
    { path: '/results', component: ResultsView },
  ],
})

export default router
