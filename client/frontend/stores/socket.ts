const socket = new WebSocket("ws://localhost:8080");
socket.onopen = () => {
    console.log('WebSocket connection established');
};

socket.onmessage = (event) => {
  try {
    const data = JSON.parse(event.data);

    if (data.type === "players-update") {
      console.log("Players:", data.players);
      console.log("Host:", data.host);
    } else if (data.type === "error") {
      console.error("Server error:", data.message);
    }
  } catch (err) {
    console.error("Invalid JSON from server:", event.data);
  }
};

socket.onclose = () => {
    console.log('WebSocket connection closed');
};

socket.onerror = (error) => {
    console.error(`WebSocket error: ${error}`);
};

export default socket;