import { WebSocketServer, WebSocket } from 'ws';

interface Room {
  players: string[];
  host: string | null;
}

const rooms: Record<string, Room> = {};
const clientRooms = new Map<WebSocket, string>(); // Track which room each client is in
const wss = new WebSocketServer({ port: 8080 });

function broadcastToRoom(roomCode: string) {
  wss.clients.forEach(client => {
    if (
      client.readyState === client.OPEN &&
      clientRooms.get(client) === roomCode
    ) {
      client.send(JSON.stringify({
        type: 'players-update',
        roomCode,
        players: rooms[roomCode].players,
        host: rooms[roomCode].host
      }));
    }
  });
}

function broadcastGameStart(roomCode: string) {
  wss.clients.forEach(client => {
    if (
      client.readyState === client.OPEN &&
      clientRooms.get(client) === roomCode
    ) {
      client.send(JSON.stringify({
        type: 'game-start',
        roomCode
      }));
    }
  });
}

wss.on('connection', (socket) => {
  console.log('New client connected');
  
  socket.on('message', (message) => {
    console.log(`Received message: ${message}`);

    try {
      const data  = JSON.parse(message.toString());
      // Handle different message types here
      if (data.type === 'joinRoom') {    
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

        clientRooms.set(socket, roomCode); // Track this client's room

        // Print all players in the room
        console.log(`Current players in room ${roomCode}:`, rooms[roomCode].players);

        // Set the host if not already set
        if (!rooms[roomCode].host) {
          rooms[roomCode].host = name;
        }

        // --- Send the current player list to the joining player ---
        socket.send(JSON.stringify({
          type: 'players-update',
          roomCode,
          players: rooms[roomCode].players,
          host: rooms[roomCode].host
        }));

        // --- Then broadcast to everyone else in the room ---
        broadcastToRoom(roomCode);

        console.log(`Player ${name} joined room ${roomCode}`);

      }
      else if (data.type === 'createRoom') {
        const { name, roomCode } = data;

        if (rooms[roomCode]) {
          socket.send(JSON.stringify({ type: 'error', message: 'Room already exists' }));
          return;
        }

        rooms[roomCode] = { players: [name], host: name };
        clientRooms.set(socket, roomCode); // Track this client's room

        broadcastToRoom(roomCode);

        console.log(`Room ${roomCode} created by ${name}`);
      } else if (data.type === 'startGame') {
        const { roomCode } = data;
        broadcastGameStart(roomCode);
      } else {
        console.error('Unknown message type:', data.type);
      }

    } catch (error) {
      console.error('Error parsing message:', error);     
      socket.send(JSON.stringify({ type: 'error', message: 'Invalid JSON' }));
    }
  });
  
  socket.on('close', () => {
    // Remove player from room on disconnect
    const roomCode = clientRooms.get(socket);
    if (roomCode && rooms[roomCode]) {
      // Remove player from players array
      rooms[roomCode].players = rooms[roomCode].players.filter(
        player => player !== rooms[roomCode].host // Optionally, track player names per socket
      );
      broadcastToRoom(roomCode);
    }
    clientRooms.delete(socket);
    console.log('Client disconnected');
  });
});
console.log('WebSocket server is running on ws://localhost:8080');