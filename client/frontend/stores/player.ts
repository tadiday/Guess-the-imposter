import { defineStore } from 'pinia'
import { ref } from 'vue'

export const usePlayerStore = defineStore('player', () => {
  const name = ref(localStorage.getItem('playerName') || '')
  const isHost = ref(localStorage.getItem('isHost') === 'true')

  const setPlayerName = (playerName: string) => {
    name.value = playerName
    localStorage.setItem('playerName', playerName)
  }

  const setIsHost = (hostStatus: boolean) => {
    isHost.value = hostStatus
    localStorage.setItem('isHost', String(hostStatus))
  }

  return {
    name,
    isHost,
    setPlayerName,
    setIsHost
  }
})
