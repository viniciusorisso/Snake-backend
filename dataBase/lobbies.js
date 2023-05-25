
import GameLobby from "../models/GameLobby.js";
import User from "../models/User.js";
import { setNewUser } from "./users.js";

/**
 * @constant boardSize board size
 */
const boardSize = 40;

/**
 * @constant speed game speed
 */
const speed = 12;

/**
 * @constant _lobbies
 * @type {Array<GameLobby>}
 */
const _lobbies = [];

/**
 * @function createNewLobby
 * @param {string} userId 
 * @returns {string} lobbyId
 */
const createNewLobby = (userId) => {
  const lobbyId = `sala${_lobbies.length}`;

  const user = new User(userId, lobbyId);

  const lobby = new GameLobby(boardSize, speed, lobbyId);
  lobby.addUser(user);

  setNewUser(user);
  _lobbies.push(lobby);

  return lobby.id;
};

/**
 * @function removeLobbyById
 * @param {string} lobbyId
 */
const removeLobbyById = (lobbyId) => {
  for (let i = 0; i < _lobbies.length; i++)
    if (_lobbies[i].id === lobbyId)
      _lobbies.splice(i, 1);
}

/**
 * @function getLobbyById
 * @param {string} lobbyId 
 * @returns {GameLobby | undefined} game lobby found by its id
 */
const getLobbyById = (lobbyId) => {
  return _lobbies.find(el => el.id === lobbyId);
};

/**
 * @function getLobbies
 * @returns {Array<GameLobby>} Array of game lobbies
 */
const getLobbies = () => {
  return _lobbies;
}

export {
  createNewLobby,
  getLobbyById,
  removeLobbyById,
  getLobbies
}