// @ts-nocheck

import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import { db } from "./dataBase/index.js";

const app = express();

app.use(
  cors({
    origin: "*",
    optionsSuccessStatus: 200,
  })
);

app.use(bodyParser.json());

app.get('/', (req, res) => {
  res.json('Hello World');
});

app.get('/login/:user', (req, res) => {
  let userId = req.params.user;
  const lobbyId = db.createNewLobby(userId);

  res.json({
    statusCode: 201,
    data: {
      lobbyId: lobbyId
    }
  });
});

app.get('/:lobbyId/start', (req, res) => {
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

  console.log(mapState);

  /**
   * retornar lista de snakes e lista de targets
   */
  res.json({statusCode: 200, data: {
    mapState
  }});
});

app.listen(3000, () => {
  console.log('Listening on port 3000');
});