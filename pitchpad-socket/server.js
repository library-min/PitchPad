// pitchpad-socket/server.js
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');

const app = express();
app.use(cors());

const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: "*", methods: ["GET", "POST"] }
});

io.on('connection', (socket) => {
  console.log(`User connected: ${socket.id}`);

  socket.on('join-board', ({ boardId, user }) => {
    socket.join(boardId);
    socket.boardId = boardId;
    socket.userData = user;
    console.log(`User joined board ${boardId}: ${user?.email || 'Anonymous'}`);
  });

  socket.on('collaboration-request', ({ boardId, requester }) => {
    socket.to(boardId).emit('collaboration-request-received', {
      socketId: socket.id,
      requester
    });
  });

  socket.on('collaboration-accept', ({ targetSocketId }) => {
    io.to(targetSocketId).emit('collaboration-approved');
  });

  socket.on('collaboration-reject', ({ targetSocketId }) => {
    io.to(targetSocketId).emit('collaboration-denied');
  });

  socket.on('drawing-update', (data) => {
    socket.to(data.boardId).emit('drawing-update-received', {
      ...data,
      socketId: socket.id
    });
  });

  // Player Synchronization Events
  socket.on('player-add', (data) => {
    socket.to(data.boardId).emit('player-added', { ...data, socketId: socket.id });
  });

  socket.on('player-move', (data) => {
    socket.to(data.boardId).emit('player-moved', { ...data, socketId: socket.id });
  });

  socket.on('player-remove', (data) => {
    socket.to(data.boardId).emit('player-removed', { ...data, socketId: socket.id });
  });

  // YouTube Synchronization Events
  socket.on('youtube-url-update', (data) => {
    socket.to(data.boardId).emit('youtube-url-updated', { ...data, socketId: socket.id });
  });

  socket.on('youtube-play', (data) => {
    socket.to(data.boardId).emit('youtube-played', { ...data, socketId: socket.id });
  });

  socket.on('youtube-pause', (data) => {
    socket.to(data.boardId).emit('youtube-paused', { ...data, socketId: socket.id });
  });

  socket.on('youtube-seek', (data) => {
    socket.to(data.boardId).emit('youtube-seeked', { ...data, socketId: socket.id });
  });

  socket.on('disconnect', () => {
    console.log(`User disconnected: ${socket.id}`);
  });
});

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`Socket.io server running on port ${PORT}`);
});
