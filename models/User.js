/**
 * @class Create an user
 */
export default class User {
  /**
   * @property user ID
   * @type {string}
   */
  id;

  /**
   * @property if the user is current playing
   * @type {boolean}
   */
  isPlaying;

  /**
   * @property game lobby id
   * @type {string | null}
   */
  lobbyId;

  /**
   * @constructor
   * @param {string} userId
   * @param {string | null} lobbyId
   */
  constructor(userId, lobbyId = null) {
    this.id = userId;
    this.isPlaying = false;
    this.lobbyId = lobbyId;
  }
}