// @ts-nocheck

import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import { db } from "./dataBase/index.js";
import http from "http";
import { Server } from "socket.io";

const app = express();

app.use(
  cors({
    origin: "*",
    optionsSuccessStatus: 200,
  })
);

app.use(bodyParser.json());

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
    credentials: true
  }
});

const clientRooms = {};

io.on('connection', (socket) => {

  socket.on('newLobby', (arg) => {
    const { userId } = arg;

    const roomName = `sala${db.getLobbies().length}`;
    clientRooms[userId] = roomName;

    db.createNewLobby(userId);
    
    socket.join(roomName);
    socket.number = 1;

    console.log(`USERID: ${userId} - CREATES - NEW LOBBY: ${roomName}\n`);
  });

  socket.on('joinLobby', (arg) => {
    const { lobbyId, userId } = arg;

    if (!lobbyId) return;

    const room = io.sockets.adapter.rooms.get(lobbyId);

    if (!room) return;

    let countUsers = null;
    if(room) {
      countUsers = room.size;
    }

    if(countUsers === 0) {
      socket.emit('Error');
      return;
    }
    else if (countUsers > 1) {
      socket.emit('tooManyPlayers');
      return;
    }

    db.addUserToLobby(userId, lobbyId);    
    clientRooms[userId] = lobbyId;

    socket.join(lobbyId);
    socket.number = 2;
  
    console.log(`USERID: ${userId} - JOINS - NEW LOBBY: ${lobbyId}\n`);
    startGameInterval(lobbyId);
  });

  socket.on('move', (arg) => {
    const { userId, userMovement } = arg;

    const room = clientRooms[userId];

    if(!room) return;

    let lobby = null;

    try {
      lobby = db.getLobbyById(room);
    } catch (error) {
      // createNewLobby(userId);
      // lobby?.startLobby();
    }
    // console.log(lobby);
    try {
      // @ts-ignore
      lobby.userMove(userId, userMovement);
    } catch (error) {
      console.log(error);
    }
  });

  socket.on('startSoloGame', (arg) => {
    const { userId } = arg;
    const lobbyId = clientRooms[userId];
    if (!lobbyId) return;
    startGameInterval(lobbyId);
  });
});

const startGameInterval = (lobbyId) => {
  const currentLobby = db.getLobbyById(lobbyId);
  currentLobby.startLobby();

  const intervalId = setInterval(() => {
    if(currentLobby.isFinished) {
      const mapState = currentLobby.getMapState();
      emitGameOver(lobbyId, mapState);
      const users = db.getLobbyById(lobbyId).users;
      users.forEach(
        user => delete clientRooms[user.id]
      );
      db.removeLobbyById(lobbyId);
      clearInterval(intervalId);
    }

    if(currentLobby.isRunning) {
      currentLobby.gameNewLoop();
      const mapState = currentLobby.getMapState();
      emitGameState(lobbyId, mapState);
    }
  }, 3000/12);
};

const emitGameState = (lobbyId, mapState) => {
  io.sockets.in(lobbyId)
    .emit('mapState', mapState);
}

const emitGameOver = (lobbyId, mapState) => {
  delete clientRooms[lobbyId];
  io.sockets.in(lobbyId)
    .emit('gameFinished', mapState);
}

server.listen(3000, () => {
  console.log('Listening on port 3000');
});