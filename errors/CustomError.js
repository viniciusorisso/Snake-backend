/**
 * @class CustomError class
 */
export default class CustomError extends Error {
  /**
   * @constructor
   * @param {string} message
   */
  constructor(message) {
    super();
    this.message = message;
  }
}