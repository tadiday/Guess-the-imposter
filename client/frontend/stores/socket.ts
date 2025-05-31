
const socket = new WebSocket(`ws://localhost:8080`);

socket.onopen = () => {
    console.log('WebSocket connection established');
};

socket.onmessage = (event) => {
    console.log(`Message from server: ${event.data}`);
};  

socket.onclose = () => {
    console.log('WebSocket connection closed');
};

socket.onerror = (error) => {
    console.error(`WebSocket error: ${error}`);
};

export default socket;