<template>
  <div class="room">
    <p>Time left: {{ countdown }}s</p>
    <p><strong>Question:</strong> {{ question }}</p>
    <input v-model="localAnswer" placeholder="Your answer..." />
    <button @click="submitAnswer">Submit</button>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

defineProps<{
  question: string,
  countdown: number
}>()

const emit = defineEmits<{
  (e: 'submit-answer', answer: string): void
}>()

const localAnswer = ref('')

const submitAnswer = () => {
  if (localAnswer.value.trim() !== '') {
    emit('submit-answer', localAnswer.value.trim())
  }
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
