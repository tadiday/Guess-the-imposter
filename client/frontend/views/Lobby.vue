<template>
  <div class="lobby">
    <h1>Guess the Imposter</h1>

    <div class="boxes">
      <!-- Create Game -->
      <div class="box">
        <h2>Create Game</h2>
        <input v-model="createName" placeholder="Enter your name" />
        <button @click="createRoom" :disabled="!createName">Create Room</button>
      </div>

      <!-- Join Game -->
      <div class="box">
        <h2>Join Game</h2>
        <input v-model="joinName" placeholder="Enter your name" />
        <input v-model="roomCode" placeholder="Enter room code" />
        <button @click="joinRoom" :disabled="!joinName || !roomCode">Join Room</button>
      </div>
    </div>
  </div>
</template>


<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import socket from '../stores/socket';

// Separate variables for each input
const createName = ref('')
const joinName = ref('')
const roomCode = ref('')
const router = useRouter()

// Simulate a global player name store (replace with Pinia or Vuex in real app)
let globalPlayerName = ref('')

const joinRoom = () => {
  if (joinName.value && roomCode.value) {
    const handleJoinResponse = (event: MessageEvent) => {
      try {
        const data = JSON.parse(event.data);
        if (data.type === 'players-update' && data.roomCode === roomCode.value) {
          socket.removeEventListener('message', handleJoinResponse);
          globalPlayerName.value = joinName.value; // Set global name
          router.push({ name: 'Room', params: { code: roomCode.value } });
        } else if (data.type === 'error') {
          socket.removeEventListener('message', handleJoinResponse);
          alert(data.message || 'Failed to join room.');
        }
      } catch (err) {
        // Ignore invalid JSON here
      }
    };
    socket.addEventListener('message', handleJoinResponse);
    socket.send(JSON.stringify({
      type: 'joinRoom',
      name: joinName.value,
      roomCode: roomCode.value
    }));
  } else {
    alert('Please enter both your name and a room code.')
  }
}

const createRoom = () => {
  if (createName.value) {
    const code = Math.random().toString(36).substring(2, 8).toUpperCase();
    globalPlayerName.value = createName.value; // Set global name
    socket.send(JSON.stringify({
      type: 'createRoom',
      name: createName.value,
      roomCode: code
    }));
    router.push({ name: 'Room', params: { code } });
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