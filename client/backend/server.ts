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
                    socket.send(JSON.stringify({
                        type: 'error',
                        message: 'Room does not exist.'
                    }));
                    return;
                }
                
                // Add player if not already in the room
                if (!rooms[roomCode].players.includes(name)) {
                    rooms[roomCode].players.push(name);
                }

                // Print all players in the room
                console.log(`Current players in room ${roomCode}:`, rooms[roomCode].players);

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
            else if (data.type === 'createRoom') {
                const { name, roomCode } = data;


                if (rooms[roomCode]) {
                    socket.send(JSON.stringify({ type: 'error', message: 'Room already exists' }));
                    return;
                }

                rooms[roomCode] = { players: [name], host: name };
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

                console.log(`Room ${roomCode} created by ${name}`);
            } else {
                console.error('Unknown message type:', data.type);
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