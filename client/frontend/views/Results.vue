<template>
    <div class="room">
        <p>Time left: {{ countdown }}s</p>

        <h3>All Answers</h3>
        <ul>
            <li v-for="entry in answers" :key="entry.name">
                {{ entry.name }}: {{ entry.answer }}
            </li>
        </ul>

        <h3>Vote: Who is the imposter?</h3>
        <ul>
            <li v-for="player in players" :key="player">
                <button @click="vote(player)">{{ player }}</button>
            </li>
        </ul>
    </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()
const roomCode = route.params.code as string
const playerName = 'You' // Should come from global state/store
const isHost = true      // Simulated for now

const phase = ref<'waiting' | 'question' | 'voting' | 'results'>('waiting')
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
