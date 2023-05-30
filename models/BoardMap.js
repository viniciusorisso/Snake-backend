import SnakeNotFoundError from "../errors/SnakeNotFoundError.js";
import { movements, gamePossibleStates } from "../utils/constants.js";
import Coordenates from "./Coordenates.js";
import Snake from "./Snake.js";

/**
 * Creates a new BoardMap
 * @class
 */
export default class BoardMap {
  /**
   * @property boardSize
   * @type {Coordenates}
   */
  boardSize;

  /**
   * @property targetCells
   * @type {Array<Coordenates>}
   */
  targetCells = [];

  /**
   * @property users
   * @type {Map<string,Snake>}
   */
  snakes = new Map();

  /**
   * @property gameState
   * @type {gamePossibleStates}
   */
  gameState;

  /**
   * @property speed
   * @type {number}
   */
  speed;

  /**
   * @type {Map<string, number>}
   */
  scores = new Map();

  /**
   * @constructor
   * @param {number} boardSize 
   * @param {number} speed 
   */
  constructor(boardSize = 0, speed) {
    this.boardSize = new Coordenates(boardSize, boardSize);
    this.gameState = gamePossibleStates.NOT_STARTED;
    this.speed = speed;
  }

  /**
   * @function 
   * @returns {Coordenates} BoardMap center's Coordenates
   */
  middleCell() {
    let middleX = Math.round(this.boardSize.x / 2);
    let middleY = Math.round(this.boardSize.y / 2);

    return new Coordenates(middleX, middleY);
  }

  /**
   * @function 
   * Create a new Snake and push to the Snake's Map
   * @param {string} userId
   */
  newSnake(userId) {
    const middleCell = this.middleCell();
    this.snakes.set(userId, new Snake(middleCell));
  }

  /**
   * @function 
   * Generates a new Target in the BoardMap and push to the Target's Array
   */
  generateRandomTargetCell() {
    if (this.targetCells.length === this.snakes.size) 
      return;

    let targetCell = this.getRandomCell();

    this.targetCells.push(targetCell);
  }

  /**
   * @function 
   * @returns {Coordenates} Returns a random Coordenates inside the BoardMap
   */
  getRandomCell() {
    return new Coordenates(
      Math.floor(Math.random() * this.boardSize.x),
      Math.floor(Math.random() * this.boardSize.y)
    );
  }

  /**
   * @function 
   * @param {Coordenates} param0 
   * @param {Snake} snake
   * @returns {Coordenates | undefined} Returns if this snake's movement is towards a Target
   */
  isTargetNewHead({ x, y }, snake) {
    let cell = this.targetCells.find(
      cell => 
        x + snake.direction.move.x === cell.x &&
        y + snake.direction.move.y === cell.y
    );
    
    return cell;
  }

  /**
   * @function 
   * @param {Coordenates} param0 
   * @returns {boolean} Returns if this snake's movement is inside or not of the BoardMap
   */
  isCellOutOfBoard({ x, y }) {
    return x < 0 || y < 0 || x >= this.boardSize.x || y >= this.boardSize.y;
  }

  /**
   * @function 
   * @returns {number} Returns a delay snake movement
   */
  getMoveDelay() {
    return (2 / Number(this.speed)) * 1000;
  }

  /**
   * @function 
   * Start the game
   * Create new Snakes
   * Start the movement
   * @param {Array<string>} playersIds
   */
  startGame(playersIds) {
    this.gameState = gamePossibleStates.RUNNING;
    this.targetCells = [];

    if(!this.snakes.size) {
      playersIds.map(userId => {
        this.newSnake(userId);
      });
    }

    this.snakes.forEach(
      (snake) => this.move(snake)
    );
  }

  /**
   * @function Snake's movement function
   * @param {Snake} snake
   */
  move(snake) {
    if (this.gameState !== gamePossibleStates.RUNNING) {
      return;
    }

    this.generateRandomTargetCell();

    const newHeadCell = new Coordenates(
      snake.tail.x + snake.direction.move.x,
      snake.tail.y + snake.direction.move.y
    );

    if (
      this.isCellOutOfBoard(newHeadCell) ||
      snake.amountCellsInSnake() > 1
    ) {
      this.stop();
      return;
    }

    for (let i = 0; i < this.targetCells.length; i++) {
      if (this.isTargetNewHead(newHeadCell, snake)) {
        snake.newHead(newHeadCell, this.speed);
        this.targetCells.splice(i, 1);
      } else {
        snake.lostTail(newHeadCell);
      }
    }

    setTimeout(() => this.move(snake), this.getMoveDelay());
  }

  /**
   * @function 
   * @param {string} userId
   * @param {string} movement 
   */
  onKeyPress(userId, movement) {
    if (this.gameState !== gamePossibleStates.RUNNING) return;
    if (!this.snakes.get(userId)) 
      throw new SnakeNotFoundError(`Snake with userId ${userId} not found.`);

    let newDirection = movements.find(_movement => _movement.direction === movement);
    
    if(!newDirection) return;
    /**
     * TODO: Movement not found ERROR
     */

    // @ts-ignore
    if (Math.abs(newDirection.keyCode - this.snakes.get(userId).direction.keyCode) !== 2) {
      // @ts-ignore
      this.snakes.get(userId).direction = newDirection;
    }
  }

  /**
   * @function 
   * Stop's Game function
   * Clear and reset BoardMap info
   */
  stop() {
    this.gameState = gamePossibleStates.FINISHED;
    this.snakes = new Map();
    this.targetCells = [];
  }

  getState() {
    const keys = Array.from( this.snakes.keys() ) ;
    const snakes = new Map();
    for (let index = 0; index < keys.length; index++) {
      const snake = this.snakes.get(keys[index]);

      /**
       * TODO: implementar erro
       */
      if(!snake) {
        throw new Error();
      }

      snakes.set(keys[index], snake.getSnakeState())
    }

    return { 
      snakes,
      targetCells: this.targetCells
    }
  }
};