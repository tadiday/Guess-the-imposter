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
      <p><strong>Question:</strong> {{ question }}</p>
      <input v-model="answer" placeholder="Your answer..." />
      <button @click="submitAnswer">Submit</button>
    </div>

    <div v-else-if="phase === 'reveal'">
      <h3>All Answers</h3>
      <ul>
        <li v-for="entry in answers" :key="entry.name">
          {{ entry.name }}: {{ entry.answer }}
        </li>
      </ul>
      <button @click="goToVoting">Vote</button>
    </div>

    <div v-else-if="phase === 'voting'">
      <h3>Vote: Who is the imposter?</h3>
      <ul>
        <li v-for="player in players" :key="player">
          <button @click="vote(player)">{{ player }}</button>
        </li>
      </ul>
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
import { ref } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()
const roomCode = route.params.code as string
const playerName = 'You' // Should come from global state/store
const isHost = true      // Simulated for now

const phase = ref<'waiting' | 'question' | 'reveal' | 'voting' | 'results'>('waiting')
const players = ref<string[]>(['You', 'Alice', 'Bob'])
const imposter = ref<string>('Bob') // Simulated imposter for demo

const question = ref('')
const answer = ref('')
const answers = ref<{ name: string; answer: string }[]>([])
const votes = ref<Record<string, number>>({})

// Room settings — editable by host
const roomSettings = ref({
  isPrivate: false,
  maxPlayers: 6,
  answerTime: 30,
  votingTime: 20,
})

// Start game logic
const startGame = () => {
  phase.value = 'question'
  question.value =
    playerName === imposter.value
      ? 'Pick a number between 1–100'
      : 'What is the best vacation destination?'

  // Auto-submit answer after timeout
  setTimeout(() => {
    if (phase.value === 'question') {
      submitAnswer()
    }
  }, roomSettings.value.answerTime * 1000)
}

// Submit answer and move to reveal phase
const submitAnswer = () => {
  answers.value.push({ name: playerName, answer: answer.value })
  answers.value.push({ name: 'Alice', answer: 'Hawaii' })
  answers.value.push({ name: 'Bob', answer: '47' })
  phase.value = 'reveal'
}

// Move to voting phase and auto-end after timeout
const goToVoting = () => {
  phase.value = 'voting'

  setTimeout(() => {
    if (phase.value === 'voting') {
      phase.value = 'results'
    }
  }, roomSettings.value.votingTime * 1000)
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
