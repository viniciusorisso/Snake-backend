/**
 * Creates a new Coordenates
 * @class
 */
export default class Coordenates {

    /**
     * @constructor
     * @param {number} x
     * @param {number} y
     */
    constructor(x, y) {
      this.x = x;
      this.y = y;
    }

    add (another) {
      return new Coordenates(
        this.x + another.x,
        this.y + another.y);
    }

    times (multiplier) {
      return new Coordenates(
        this.x * multiplier,
        this.y * multiplier);
    }
};
