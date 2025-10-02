import { WebSocketServer, WebSocket } from 'ws';

interface Player {
  name: string;
  role: 'host' | 'player';
  joinedAt: number;
}

interface Room {
  players: Player[];
  hostId: number; // Index of the host in the players array
}

const rooms: Record<string, Room> = {};
const clientRooms = new Map<WebSocket, string>(); // Track which room each client is in
const wss = new WebSocketServer({ port: 8080 });

function broadcastToRoom(roomCode: string) {
  const room = rooms[roomCode];
  if (!room) return;

  const roomData = {
    players: room.players.map(p => ({
      name: p.name,
      role: p.role
    })),
    host: room.players[room.hostId]?.name
  };

  wss.clients.forEach(client => {
    if (
      client.readyState === client.OPEN &&
      clientRooms.get(client) === roomCode
    ) {
      client.send(JSON.stringify({
        type: 'players-update',
        roomCode,
        ...roomData
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
        const existingPlayerIndex = rooms[roomCode].players.findIndex(p => p.name === name);
        if (existingPlayerIndex === -1) {
          rooms[roomCode].players.push({
            name,
            role: 'player',
            joinedAt: Date.now()
          });
        }

        clientRooms.set(socket, roomCode); // Track this client's room

        // Print all players in the room
        console.log(`Current players in room ${roomCode}:`, 
          rooms[roomCode].players.map(p => `${p.name} (${p.role})`));

        // --- Broadcast updated room state to all players ---
        broadcastToRoom(roomCode);

        console.log(`Player ${name} joined room ${roomCode}`);

      }
      else if (data.type === 'createRoom') {
        const { name, roomCode } = data;

        if (rooms[roomCode]) {
          socket.send(JSON.stringify({ type: 'error', message: 'Room already exists' }));
          return;
        }

        // Create room with creator as first player and host
        rooms[roomCode] = {
          players: [{
            name,
            role: 'host',
            joinedAt: Date.now()
          }],
          hostId: 0 // First player is the host
        };
        
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
      const room = rooms[roomCode];
      
      // If the host disconnects, make the longest-connected player the new host
      if (room.players[room.hostId]) {
        const remainingPlayers = room.players
          .filter(p => p.name !== room.players[room.hostId].name)
          .sort((a, b) => a.joinedAt - b.joinedAt);

        if (remainingPlayers.length > 0) {
          // Find index of the new host in the original array
          room.hostId = room.players.findIndex(p => p.name === remainingPlayers[0].name);
          room.players[room.hostId].role = 'host';
        }
      }

      broadcastToRoom(roomCode);
    }
    clientRooms.delete(socket);
    console.log('Client disconnected');
  });
});
console.log('WebSocket server is running on ws://localhost:8080');