import CustomError from "./CustomError.js";

/**
 * @class UserAlreadyRegisteredError
 */
export default class UserAlreadyRegisteredError extends CustomError {
  /**
   * @constructor
   * @param {string} message
   */
  constructor(message) {
    super(message);
    this.type = 'UserAlreadyRegisteredError';
  }
}