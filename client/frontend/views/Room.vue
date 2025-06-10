<template>
    <div class="room">
        <h1>Room Code: {{ roomCode }}</h1>

        <h2>Players:</h2>
        <ul>
            <li v-for="player in players" :key="player">{{ player }}</li>
        </ul>

        <!-- Host-only Settings Panel -->
        <div v-if="isHost && phase === 'waiting'" class="settings">
            <h3>Room Settings</h3>

            <label>
                Private Room:
                <input type="checkbox" v-model="roomSettings.isPrivate" />
            </label>

            <label>
                Max Players:
                <input type="number" v-model="roomSettings.maxPlayers" min="2" max="10" />
            </label>

            <label>
                Answer Time (sec):
                <input type="number" v-model="roomSettings.answerTime" min="10" max="60" />
            </label>

            <label>
                Voting Time (sec):
                <input type="number" v-model="roomSettings.votingTime" min="10" max="60" />
            </label>
        </div>

        <!-- Public Room Info -->
        <div v-if="phase === 'waiting'" class="room-info">
            <h3>Room Info</h3>
            <ul>
                <li>Visibility: {{ roomSettings.isPrivate ? 'Private' : 'Public' }}</li>
                <li>Max Players: {{ roomSettings.maxPlayers }}</li>
                <li>Answer Time: {{ roomSettings.answerTime }}s</li>
                <li>Voting Time: {{ roomSettings.votingTime }}s</li>
            </ul>
            <p>Waiting for players...</p>
            <button v-if="isHost" @click="startGame">Start Game</button>
        </div>



        <!-- Game Phases -->
        <div v-else-if="phase === 'question'">
          <Question
            :question="question"
            :countdown="countdown"
            @submit-answer="submitAnswer"
          />
        </div>

        <div v-else-if="phase === 'voting'">
          <Voting
            :players="players"
            :answers="answers"
            :countdown="countdown"
            @vote="vote"
          />
        </div>

        <div v-else-if="phase === 'results'">
            <h3>Votes</h3>
            <ul>
                <li v-for="(count, player) in votes" :key="player">
                    {{ player }}: {{ count }} votes
                </li>
            </ul>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import Voting from './Voting.vue'
import Question from './Question.vue'
import socket from '../stores/socket';

const route = useRoute()
const roomCode = route.params.code as string
const playerName = 'You' // Should come from global state/store
const isHost = true      // Simulated for now

const phase = ref<'waiting' | 'question' | 'voting' | 'results'>('waiting')
const players = ref<string[]>([]);
const host = ref<string | null>(null);
const imposter = ref<string>('Bob') // Simulated imposter for demo

const question = ref('')
const answer = ref('')
const answers = ref<{ name: string; answer: string }[]>([])
const votes = ref<Record<string, number>>({})


onMounted(() => {
  socket.onmessage = (event) => {
    try {
      const data = JSON.parse(event.data);
      if (data.type === 'players-update' && data.roomCode === roomCode) {
        players.value = data.players;
        host.value = data.host;
      }
    } catch (err) {
      console.error("Invalid JSON from server:", event.data);
    }
  };
});

// Room settings — editable by host
const roomSettings = ref({
  isPrivate: false,
  maxPlayers: 6,
  answerTime: 5,
  votingTime: 2,
})


const countdown = ref(0)
let countdownInterval: number | undefined

const startCountdown = (seconds: number, onComplete: () => void) => {
  countdown.value = seconds
  clearInterval(countdownInterval)

  countdownInterval = setInterval(() => {
    countdown.value--
    if (countdown.value <= 0) {
      clearInterval(countdownInterval)
      onComplete()
    }
  }, 1000)
}

// Start game logic
const startGame = () => {
  phase.value = 'question'
  question.value =
    playerName === imposter.value
      ? 'Pick a number between 1–100'
      : 'What is the best age to date?'

  // Auto-submit answer after timeout
    startCountdown(roomSettings.value.answerTime, submitAnswer)
}


// Submit answer and move to reveal phase
const submitAnswer = () => {
  answers.value.push({ name: playerName, answer: answer.value })
  answers.value.push({ name: 'Alice', answer: '25' })
  answers.value.push({ name: 'Bob', answer: '47' })

  phase.value = 'voting'

  setTimeout(() => {
    if (phase.value === 'voting') {
      phase.value = 'results'
    }
  }, roomSettings.value.votingTime * 1000)

    startCountdown(roomSettings.value.votingTime, () => {
    phase.value = 'results'
})
}

// Vote for a player
const vote = (player: string) => {
  if (!votes.value[player]) votes.value[player] = 0
  votes.value[player]++
  phase.value = 'results'
}
</script>

<style scoped>
.room {
  padding: 2rem;
}

.settings {
  margin-top: 1rem;
  padding: 1rem;
  background: #f1f1f1;
  border-radius: 8px;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.settings label {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.room-info {
  margin-top: 1rem;
}
</style>
