import CustomError from "./CustomError.js";

/**
 * @class SnakeNotFoundError
 */
export default class SnakeNotFoundError extends CustomError {
  /**
   * @constructor
   * @param {string} message
   */
  constructor(message) {
    super(message);
    this.type = 'SnakeNotFoundError';
  }
}