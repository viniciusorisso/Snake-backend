import Coordenates from "../models/Coordenates.js";
import Movement from "../models/Movement.js";

/**
 * @constant
 * @type {Array<Movement>}
 */
const movements = [];

let newMovement = new Movement('left', 37, new Coordenates(-1, 0));
movements.push(newMovement);
newMovement = new Movement('top', 38, new Coordenates(0, -1));
movements.push(newMovement);
newMovement = new Movement('right', 39, new Coordenates(1, 0));
movements.push(newMovement);
newMovement = new Movement('down', 40, new Coordenates(0, 1));
movements.push(newMovement);

export default movements;
