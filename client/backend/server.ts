import { WebSocketServer } from 'ws';


interface Room {
  players: string[];
  host: string | null;
}

const rooms: Record<string, Room> = {};
const wss = new WebSocketServer({ port: 8080 });

wss.on('connection', (socket) => {
    console.log('New client connected');
    
    socket.on('message', (message) => {
        console.log(`Received message: ${message}`);

        try {
            const data  = JSON.parse(message.toString());
            // Handle different message types here
            if (data .type === 'joinRoom') {    
                const { name, roomCode } = data;


                if (!rooms[roomCode]) {
                    rooms[roomCode] = {
                        players: [],
                        host: null
                    };
                }

                // Add player if not already in the room
                if (!rooms[roomCode].players.includes(name)) {
                    rooms[roomCode].players.push(name);
                }

                // Set the host if not already set
                if (!rooms[roomCode].host) {
                    rooms[roomCode].host = name;
                }

                wss.clients.forEach(client => {
                    if (client.readyState === client.OPEN) {
                        client.send(JSON.stringify({
                            type: 'players-update',
                            roomCode,
                            players: rooms[roomCode].players,
                            host: rooms[roomCode].host
                        }));
                    }
                });

                console.log(`Player ${name} joined room ${roomCode}`);

            }
        } catch (error) {
            console.error('Error parsing message:', error);     
            socket.send(JSON.stringify({ type: 'error', message: 'Invalid JSON' }));
        }


    });
    
    socket.on('close', () => {
        console.log('Client disconnected');
    });
});
console.log('WebSocket server is running on ws://localhost:8080');  