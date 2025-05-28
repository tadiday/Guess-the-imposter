<template>
  <div class="lobby">
    <h1>Guess the Imposter</h1>
    <input v-model="playerName" placeholder="Enter your name" />
    <input v-model="roomCode" placeholder="Enter room code" />
    <button @click="joinRoom">Join Game</button>
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

</script>

<style scoped>
.lobby {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-top: 4rem;
}
input {
  margin: 0.5rem 0;
  padding: 0.5rem;
}
button {
  padding: 0.5rem 1rem;
}
</style>