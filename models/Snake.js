import constants from "../utils/constants.js";
import Coordenates from "./Coordenates.js";
import Movement from "./Movement.js";

/**
 * @constant defaultSnakeCoordenates posição padrão para o mapa modificar depois
 * @type {Coordenates}
 */
const defaultSnakeCoordenates = new Coordenates(0, 0);

/**
 * Creates a new Snake
 * @class
 */
export default class Snake {
  /**
   * @property vertebraes
   * @type {Array<Coordenates>}
   */
  vertebraes;

  /**
   * @property direction
   * @type {Movement}
   */
  direction;

  /**
   * @type {number}
   */
  score = 0;

  /**
   * @constructor
   * @param {Coordenates} mapMiddleCell 
   */
  constructor(mapMiddleCell = defaultSnakeCoordenates) {
    this.vertebraes = [];
    this.vertebraes.unshift(new Coordenates(mapMiddleCell.x, mapMiddleCell.y));
    const randomDirectionIndex = Math.floor(Math.random() * 4);
    this.direction = constants[randomDirectionIndex];
  }
  get tail() {
    return this.vertebraes[0];
  }
  get size() {
    return this.vertebraes.length;
  }
  /**
   * @function amountCellsInSnake
   * @param {Coordenates|null} targetCell 
   * @returns {number}
   */
  amountCellsInSnake(targetCell = null) {
    let cell = targetCell ?? this.tail;
    return this.vertebraes.filter(({ x, y }) => x === cell.x && y === cell.y)
      .length;
  }

  /**
   * @function newHead Adds new head to the snake and add more points to score
   * @param {Coordenates} param0
   * @param {number} speed
   */
  newHead({ x, y }, speed) {
    const newHeadCell = new Coordenates(x, y);

    this.vertebraes.unshift(newHeadCell);
    this.score += speed;
  }

  /**
   * @function lostTail
   * @param {Coordenates} foodCoord 
   */
  lostTail(foodCoord) {
    this.vertebraes.unshift(foodCoord);
    this.vertebraes.pop();
  }

  /**
   * @method getSnakeState
   * @returns {any}
   */
  getSnakeState() {
    return {
      vertebraes: this.vertebraes,
      direction: this.direction,
      score: this.score
    }
  }
};