
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

app.post('/player', (req, res) => {
  const { lobbyId, userId, userMovement } = req.body;

  let lobby;
  try {
    lobby = db.getLobbyById(lobbyId);
  } catch (error) {
    // createNewLobby(userId);
  }
  finally {
    lobby?.startLobby();
  }

  try {
    // @ts-ignore
    lobby.userMove(userId, userMovement);
  } catch (error) {
    console.log(error);
    res.json({statusCode: 500});
  }

  res.json({statusCode: 200});
});

app.listen(3000, () => {
  console.log('Listening on port 3000');
});