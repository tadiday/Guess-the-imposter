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
        <ul class="player-list">
            <li v-for="player in players" :key="player.name">
                <button 
                  @click="vote(player.name)"
                  :class="{ 
                    'host': player.role === 'host',
                    'current-player': player.name === currentPlayerName 
                  }"
                >
                  <span :class="{ 'player-name': true, 'bold': player.name === currentPlayerName }">
                    {{ player.name }}
                  </span>
                  <span v-if="player.role === 'host'" class="host-text"> (Host)</span>
                </button>
            </li>
        </ul>
    </div>
</template>



<script setup lang="ts">
interface Player {
  name: string;
  role: 'host' | 'player';
}

defineProps<{
  players: Player[],
  answers: { name: string; answer: string }[],
  countdown: number,
  currentPlayerName: string
}>()

const emit = defineEmits<{
  (e: 'vote', player: string): void
}>()

const vote = (player: string) => {
  emit('vote', player)
}

</script>


<style scoped>
.room {
  padding: 2rem;
}

.player-list {
  list-style: none;
  padding: 0;
  margin: 1rem 0;
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
}

.player-list button {
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 4px;
  background: #f5f5f5;
  cursor: pointer;
  font-size: 1rem;
  transition: all 0.2s ease;
}

.player-list button:hover {
  transform: translateY(-2px);
  background: #e0e0e0;
}

.player-list button.current-player {
  background: #fff3e0;
  border: 2px solid #ffb74d;
}

.host-text {
  color: #666;
  font-size: 0.9em;
}

.player-list button:hover {
  background: #f0f0f0;
}

.player-list button.current-player:hover {
  background: #ffe0b2;
}

.player-name.bold {
  font-weight: 700;
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
