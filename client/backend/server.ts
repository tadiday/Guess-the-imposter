import { WebSocketServer } from 'ws';

const wss = new WebSocketServer({ port: 8080 });
wss.on('connection', (socket) => {
    console.log('New client connected');
    
    socket.on('message', (message) => {
        console.log(`Received message: ${message}`);
        // Echo the message back to the client
        socket.send(`Server received: ${message}`);
    });
    
    socket.on('close', () => {
        console.log('Client disconnected');
    });
    });
console.log('WebSocket server is running on ws://localhost:8080');  