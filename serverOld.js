// @ts-nocheck

import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import { db } from "./dataBase/index.js";
import http from 'http';
import { Server } from "socket.io";

const app = express();

app.use(
  cors({
    origin: "*",
    optionsSuccessStatus: 200,
  })
);


app.use(bodyParser.json());

app.post('/login', (req, res) => {
  const { userId, lobbyId } = req.body;

  let userLobbyId = null;

  let statusCode = 0;
  let errorMessage = 'Deu ruim!'

  try {
    if (!lobbyId) {
      userLobbyId = db.createNewLobby(userId);
    }
    else {
      userLobbyId = db.getLobbyById(lobbyId)?.id;
      db.addUserToLobby(userId, userLobbyId);
    }      
  } catch (error) {
    if(error?.type === 'UserAlreadyRegisteredError') {
      statusCode = 422;
      errorMessage = 'Username inválido.'
    }

    else if(error?.type === 'LobbyNotFoundError') {
      statusCode = 422;
      errorMessage = 'LobbyId inválido.'
    }
    else {
      statusCode = 500;
    }
  }

  if(statusCode !== 0) {
    res.status(statusCode).json({
      error: errorMessage
    });
  }
  else {
    res.status(201).json({
      data: {
        lobbyId: userLobbyId
      }
    });
  }
});

app.get('/:lobbyId/start/', (req, res) => {
  if(!req.params.lobbyId)
    res.json({statusCode: 500});

  try {
    const lobby = db.getLobbyById(req.params.lobbyId);
    lobby?.startLobby();
  } catch (error) {
    res.json({statusCode: 404});
  }

  res.json({statusCode: 201});
});

app.post('/player', (req, res) => {
  const { lobbyId, userId, userMovement } = req.body;

  let lobby;
  try {
    lobby = db.getLobbyById(lobbyId);
  } catch (error) {
    // createNewLobby(userId);
    // lobby?.startLobby();
  }

  try {
    // @ts-ignore
    lobby.userMove(userId, userMovement);
  } catch (error) {
    console.log(error);
    res.json({statusCode: 500});
  }

  const mapState = lobby.getMapState();

  /**
   * retornar lista de snakes e lista de targets
   */
  res.json({statusCode: 200, data: {
    mapState
  }});
});

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
    credentials: true
  }
});

io.on('connection', (socket) => {
  let socketLobbyId = null;
  let socketUserId = null;

  socket.on('move', (arg) => {
    const { userId, lobbyId, userMovement } = arg;

    let lobby = null;

    if(!socketLobbyId)
      socketLobbyId = lobbyId;

    try {
      lobby = db.getLobbyById(lobbyId);
    } catch (error) {
      // createNewLobby(userId);
      // lobby?.startLobby();
    }

    try {
      // @ts-ignore
      lobby.userMove(userId, userMovement);
    } catch (error) {
      console.log(error);
    }
  });

  socket.on('startGame', (arg) => {
    const { lobbyId } = arg;

    if(!lobbyId)
      return;
  
    try {
      const lobby = db.getLobbyById(lobbyId);
      lobby?.startLobby();
    } catch (error) {
      console.log(error);
    }
  });

  socket.on('joinLobby', (arg) => {
    const { lobbyId, userId } = arg;

    socketLobbyId = lobbyId;
    socketUserId = userId;
  });

  setInterval(() => {
    let currentLobby = null;

    try {
      currentLobby = db.getLobbyById(socketLobbyId); 
    } catch (error) {
      return;
    }

    if(currentLobby?.isFinished) {
      const mapState = currentLobby.getMapState();
      socket.emit('gameFinished', mapState);
    }

    if(currentLobby?.isRunning) {
      currentLobby.gameNewLoop(socketUserId);
      const mapState = currentLobby.getMapState();
      socket.emit('mapState', mapState);
    }
      
  }, 4000 / 12);
});


server.listen(3000, () => {
  console.log('Listening on port 3000');
});
