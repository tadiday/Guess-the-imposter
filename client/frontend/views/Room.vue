<template>
    <div class="room">
        <h1>Room Code: {{ roomCode }}</h1>

        <h2>Players:</h2>
        <ul class="player-list">
            <li 
              v-for="player in players" 
              :key="player.name" 
              :class="{
                'host': player.role === 'host',
                'current-player': player.name === playerName
              }"
            >
              <span :class="{ 'player-name': true, 'bold': player.name === playerName }">
                {{ player.name }}
              </span>
              <span v-if="player.role === 'host'" class="host-text"> (Host)</span>
            </li>
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
        <div v-if="!isHost && phase === 'waiting'" class="room-info">
            <h3>Room Info</h3>
            <ul>
                <li>Visibility: {{ roomSettings.isPrivate ? 'Private' : 'Public' }}</li>
                <li>Max Players: {{ roomSettings.maxPlayers }}</li>
                <li>Answer Time: {{ roomSettings.answerTime }}s</li>
                <li>Voting Time: {{ roomSettings.votingTime }}s</li>
            </ul>
        </div>

        <!-- Waiting Phase -->
        <div v-if="phase === 'waiting'">
            <p>Waiting for players...</p>
            <button v-if="isHost" @click="startGame">Start Game</button>
        </div>

        <!-- Game Phases -->
        <div v-if="phase === 'question'">
          <Question
            :question="question"
            :countdown="countdown"
            @submit-answer="submitAnswer"
          />
        </div>

        <div v-if="phase === 'voting'">
          <Voting
            :players="players"
            :answers="answers"
            :countdown="countdown"
            :current-player-name="playerName"
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
import { ref, onMounted, onUnmounted } from 'vue'
import { useRoute } from 'vue-router'
import { usePlayerStore } from '../stores/player'
import Voting from './Voting.vue'
import Question from './Question.vue'
import socket from '../stores/socket';

const route = useRoute()
const roomCode = route.params.code as string
const playerStore = usePlayerStore()
const playerName = playerStore.name
const isHost = playerStore.isHost

const phase = ref<'waiting' | 'question' | 'voting' | 'results'>('waiting')
interface Player {
  name: string;
  role: 'host' | 'player';
}

const players = ref<Player[]>([]);
const host = ref<string | null>(null);
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
  votingTime: 30,
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
  if (!isHost) {
    console.error('Only host can start the game');
    return;
  }

  try {
    socket.send(JSON.stringify({
      type: 'startGame',
      roomCode
    }));
    console.log('Sent start game request');
  } catch (err) {
    console.error('Error starting game:', err);
  }
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

// Players update handling
const handlePlayersUpdate = (event: MessageEvent) => {
  try {
    const data = JSON.parse(event.data)
    if (data.type === 'players-update' && data.roomCode === roomCode) {
      players.value = data.players || []
      host.value = data.host || null
      playerStore.setIsHost(data.host === playerStore.name)
    }
  } catch {}
}

const handleGameStart = (event: MessageEvent) => {
  try {
    const data = JSON.parse(event.data)
    if (data.type === 'game-start' && data.roomCode === roomCode) {
      console.log('Game starting:', data);
      phase.value = data.phase;
      // Set player role based on server assignment
      const isImposter = data.isImposter === playerName;
      imposter.value = data.isImposter;
      
      // Set appropriate question based on role
      question.value = isImposter
        ? 'Pick a number between 1–100'
        : 'What is the best age to date?'
      
      // Start the countdown for all players
      startCountdown(roomSettings.value.answerTime, submitAnswer)
    }
  } catch (err) {
    console.error('Error handling game start:', err);
  }
}

onMounted(() => {
  socket.addEventListener('message', handlePlayersUpdate)
  socket.addEventListener('message', handleGameStart)

  // 👇 Auto-rejoin when socket reconnects
  socket.addEventListener('open', () => {
    if (playerName && roomCode) {
      socket.send(JSON.stringify({
        type: 'joinRoom',
        name: playerName,
        roomCode
      }))
      console.log(`Rejoined room ${roomCode} as ${playerName}`)
    }
  })
})

onUnmounted(() => {
  socket.removeEventListener('message', handlePlayersUpdate)
  socket.removeEventListener('message', handleGameStart)
})

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

.player-list {
  list-style: none;
  padding: 0;
  margin: 1rem 0;
}

.player-list li {
  padding: 0.5rem 1rem;
  margin: 0.5rem 0;
  background: #f5f5f5;
  border-radius: 4px;
  font-size: 1.1rem;
  transition: all 0.2s ease;
}

.player-list li:hover {
  transform: translateX(5px);
}

.player-list li.current-player {
  background: #fff3e0;
  border: 2px solid #ffb74d;
}

.host-text {
  color: #666;
  font-size: 0.9em;
}

.player-name.bold {
  font-weight: 700;
}
</style>
