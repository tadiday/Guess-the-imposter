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
defineProps<{
  players: string[],
  answers: { name: string; answer: string }[],
  countdown: number
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
