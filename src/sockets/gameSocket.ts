import { Server, Socket } from 'socket.io';
import { v4 as uuidv4 } from 'uuid';

// Game state interfaces
interface Player {
  id: string;
  username: string;
  x: number;
  y: number;
  score: number;
  color: string;
  lastUpdate: number;
}

interface GameRoom {
  id: string;
  name: string;
  players: Map<string, Player>;
  gameObjects: any[];
  createdAt: number;
}

// Game state storage
const gameRooms = new Map<string, GameRoom>();

// Random color generator
const getRandomColor = () => {
  const colors = ['#FF5733', '#33FF57', '#3357FF', '#F3FF33', '#FF33F3', '#33FFF3'];
  return colors[Math.floor(Math.random() * colors.length)];
};

// Initialize game socket handlers
export const initGameSocket = (io: Server) => {
  // Create a namespace for the game
  const gameIO = io.of('/game');
  
  // Clean up inactive players every minute
  setInterval(() => {
    const now = Date.now();
    gameRooms.forEach((room, roomId) => {
      // Remove players inactive for more than 30 seconds
      room.players.forEach((player, playerId) => {
        if (now - player.lastUpdate > 30000) {
          room.players.delete(playerId);
          gameIO.to(roomId).emit('playerLeft', playerId);
        }
      });
      
      // Remove empty rooms older than 10 minutes
      if (room.players.size === 0 && now - room.createdAt > 600000) {
        gameRooms.delete(roomId);
      }
    });
  }, 60000);

  gameIO.on('connection', (socket: Socket) => {
    console.log('Player connected to game:', socket.id);
    let currentRoomId: string | null = null;

    // Create a new game room
    socket.on('createRoom', (roomName: string, callback) => {
      try {
        const roomId = uuidv4();
        gameRooms.set(roomId, {
          id: roomId,
          name: roomName,
          players: new Map(),
          gameObjects: [],
          createdAt: Date.now()
        });
        
        callback({ success: true, roomId });
      } catch (error) {
        console.error('Error creating room:', error);
        callback({ success: false, error: 'Failed to create room' });
      }
    });

    // Get available rooms
    socket.on('getRooms', (callback) => {
      try {
        const rooms = Array.from(gameRooms.values()).map(room => ({
          id: room.id,
          name: room.name,
          playerCount: room.players.size
        }));
        
        callback({ success: true, rooms });
      } catch (error) {
        console.error('Error getting rooms:', error);
        callback({ success: false, error: 'Failed to get rooms' });
      }
    });

    // Join a game room
    socket.on('joinRoom', (data: { roomId: string, username: string }, callback) => {
      try {
        const { roomId, username } = data;
        const room = gameRooms.get(roomId);
        
        if (!room) {
          callback({ success: false, error: 'Room not found' });
          return;
        }
        
        // Leave current room if in one
        if (currentRoomId) {
          leaveRoom();
        }
        
        // Join the new room
        socket.join(roomId);
        currentRoomId = roomId;
        
        // Create player
        const player: Player = {
          id: socket.id,
          username,
          x: Math.floor(Math.random() * 800),
          y: Math.floor(Math.random() * 600),
          score: 0,
          color: getRandomColor(),
          lastUpdate: Date.now()
        };
        
        room.players.set(socket.id, player);
        
        // Send current game state to the new player
        const players = Array.from(room.players.values());
        callback({ 
          success: true, 
          players,
          gameObjects: room.gameObjects
        });
        
        // Notify other players
        socket.to(roomId).emit('playerJoined', player);
      } catch (error) {
        console.error('Error joining room:', error);
        callback({ success: false, error: 'Failed to join room' });
      }
    });

    // Update player position
    socket.on('updatePosition', (position: { x: number, y: number }) => {
      if (!currentRoomId) return;
      
      const room = gameRooms.get(currentRoomId);
      if (!room) return;
      
      const player = room.players.get(socket.id);
      if (!player) return;
      
      // Update player position
      player.x = position.x;
      player.y = position.y;
      player.lastUpdate = Date.now();
      
      // Broadcast to other players
      socket.to(currentRoomId).emit('playerMoved', {
        id: socket.id,
        x: position.x,
        y: position.y
      });
    });

    // Player collected an item
    socket.on('collectItem', (itemId: string) => {
      if (!currentRoomId) return;
      
      const room = gameRooms.get(currentRoomId);
      if (!room) return;
      
      const player = room.players.get(socket.id);
      if (!player) return;
      
      // Update player score
      player.score += 10;
      player.lastUpdate = Date.now();
      
      // Remove item from game objects
      room.gameObjects = room.gameObjects.filter(obj => obj.id !== itemId);
      
      // Broadcast to all players in the room
      gameIO.to(currentRoomId).emit('itemCollected', {
        itemId,
        playerId: socket.id,
        newScore: player.score
      });
    });

    // Function to handle leaving a room
    const leaveRoom = () => {
      if (!currentRoomId) return;
      
      const room = gameRooms.get(currentRoomId);
      if (room) {
        room.players.delete(socket.id);
        socket.to(currentRoomId).emit('playerLeft', socket.id);
      }
      
      socket.leave(currentRoomId);
      currentRoomId = null;
    };

    // Leave room
    socket.on('leaveRoom', () => {
      leaveRoom();
    });

    // Disconnect
    socket.on('disconnect', () => {
      console.log('Player disconnected from game:', socket.id);
      leaveRoom();
    });
  });
}; 