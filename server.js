// @ts-nocheck

import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import {db} from "./dataBase/index.js";
import http from "http";
import {Server} from "socket.io";

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

/**
 * @type {Map<string, Array<string>>}
 */
const roomsList = new Map();

io.on('connection', (socket) => {

    socket.on('newLobby', newLobby);

    socket.on('joinLobby', joinLobby);

    socket.on('move', move);

    socket.on('startSoloGame', startSoloGame);

    function newLobby(arg) {
        const {userId} = arg;

        let lobbyId = 0
        let roomName = `sala${lobbyId}`
        while (roomsList.get(roomName)) {
            roomName = `sala${++lobbyId}`
        }

        try {
            db.createNewLobby(userId, roomName);
        } catch (error) {
            socket.emit('invalidUser');
            return;
        }

        clientRooms[userId] = roomName;
        roomsList.set(roomName, [userId]);

        socket.join(roomName);
        socket.number = 1;

        socket.emit('joinedLobby', {lobbyId: roomName});
    }

    function joinLobby(arg) {
        const {lobbyId, userId} = arg;

        if (!lobbyId) {
            socket.emit('invalidLobbyId');

            return;
        }

        try {
            const gameIsRunning = db.getLobbyById(lobbyId).isRunning;

            if (gameIsRunning) {
                socket.emit('gameAlreadyStarted');

                return;
            }
        } catch (error) {
            socket.emit('invalidLobbyId');

            return;
        }

        const room = io.sockets.adapter.rooms.get(lobbyId);

        if (!room) return;

        let countUsers = null;
        if (room) {
            countUsers = room.size;
        }

        if (countUsers === 0) {
            socket.emit('Error');
            return;
        } else if (countUsers > 1) {
            socket.emit('tooManyPlayers');
            return;
        }

        try {
            db.addUserToLobby(userId, lobbyId);
            roomsList.get(lobbyId).push(userId);
        } catch (error) {
            socket.emit('invalidUser');

            return;
        }

        clientRooms[userId] = lobbyId;

        socket.join(lobbyId);
        socket.number = 2;

        startGameInterval(lobbyId);

        socket.emit('joinedLobby', {lobbyId});
    }

    function move(arg) {
        const {userId, userMovement} = arg;

        const room = clientRooms[userId];

        if (!room) return;

        let lobby = null;

        try {
            lobby = db.getLobbyById(room);
        } catch (error) {
            socket.emit('invalidLobbyId')

            return;
        }

        try {
            // @ts-ignore
            lobby.userMove(userId, userMovement);
        } catch (error) {
            socket.emit('invalidMove');
        }
    }

    function startSoloGame(arg) {
        const {userId} = arg;
        const lobbyId = clientRooms[userId];
        if (!lobbyId) return;
        startGameInterval(lobbyId)
    }


    const startGameInterval = (lobbyId) => {
        const currentLobby = db.getLobbyById(lobbyId);
        currentLobby.startLobby();

        const intervalId = setInterval(() => {
            if (currentLobby.isFinished) {
                const mapState = currentLobby.getMapState();
                emitGameOver(lobbyId, mapState);
                const users = currentLobby.users;
                users.forEach(user => delete clientRooms[user.id]);
                db.removeLobbyById(lobbyId);
                clearInterval(intervalId);
            }

            if (currentLobby.isRunning) {
                currentLobby.gameNewLoop();
                const mapState = currentLobby.getMapState();
                emitGameState(lobbyId, mapState);
            }
        }, 5 * 1000 / 12);
    };

    const emitGameState = (lobbyId, mapState) => {
        io.sockets.in(lobbyId)
            .emit('mapState', mapState);
    }

    const emitGameOver = (lobbyId, mapState) => {
        io.sockets.in(lobbyId)
            .emit('gameFinished', mapState);
        io.sockets.socketsLeave(lobbyId);

        roomsList.delete(lobbyId);
    }
})

server.listen(3000, () => {
    console.log('Listening on port 3000');
});
