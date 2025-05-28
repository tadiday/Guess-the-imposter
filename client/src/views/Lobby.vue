<template>
  <div class="lobby">
    <h1>Guess the Imposter</h1>

    <div class="boxes">
      <!-- Create Game -->
      <div class="box">
        <h2>Create Game</h2>
        <input v-model="playerName" placeholder="Enter your name" />
        <button @click="createRoom" :disabled="!playerName">Create Room</button>
      </div>

      <!-- Join Game -->
      <div class="box">
        <h2>Join Game</h2>
        <input v-model="playerName" placeholder="Enter your name" />
        <input v-model="roomCode" placeholder="Enter room code" />
        <button @click="joinRoom" :disabled="!playerName || !roomCode">Join Room</button>
      </div>
    </div>
  </div>
</template>


<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const playerName = ref('')
const roomCode = ref('')
const router = useRouter()

const joinRoom = () => {
  if (playerName.value && roomCode.value) {
    // Navigate to the room with the provided code
    router.push({ name: 'Room', params: { code: roomCode.value } })
  } else {
    alert('Please enter both your name and a room code.')
  }
}

const createRoom = () => {
  if (playerName.value) {
    // Generate a random room code (for simplicity, using a random number)
    const code = Math.random().toString(36).substring(2, 8).toUpperCase()
    // Navigate to the new room with the generated code
    router.push({ name: 'Room', params: { code } })
  } else {
    alert('Please enter your name.')
  }
}

</script>

<style scoped>
.lobby {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 2rem;
}

.boxes {
  display: flex;
  gap: 2rem;
  margin-top: 2rem;
}

.box {
  padding: 1.5rem;
  border: 1px solid #ccc;
  border-radius: 1rem;
  width: 250px;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  background-color: #f9f9f9;
}
</style>