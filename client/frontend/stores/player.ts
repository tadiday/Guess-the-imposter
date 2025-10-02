import { defineStore } from 'pinia'
import { ref } from 'vue'

export const usePlayerStore = defineStore('player', () => {
  const name = ref('')
  const isHost = ref(false)
  
  const setPlayerName = (playerName: string) => {
    name.value = playerName
  }

  const setIsHost = (hostStatus: boolean) => {
    isHost.value = hostStatus
  }

  return {
    name,
    isHost,
    setPlayerName,
    setIsHost
  }
})
