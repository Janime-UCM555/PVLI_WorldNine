import DoubleJump from "./DoubleJump.js";
import Hammer from "./Hammer.js";
import JumpBoots from "./HighJump.js";
import Mushroom from "./Mushroom.js";
import {POWERUP_TYPES } from "./PowerUps.js";
import Star from "./Star.js";
// Spawner simple (tu PowerUp ya añade físicas y movimiento)
export const spawnPowerUp= (scene, x, y, type) =>
{
    let power;
    switch (type) {
    case POWERUP_TYPES.STAR:
        power = new Star(scene, x, y);
        break;
    case POWERUP_TYPES.HAMMER:
        power = new Hammer(scene, x, y);
        break;
    case POWERUP_TYPES.DOUBLE_JUMP:
        power = new DoubleJump(scene, x, y);
        break;
    case POWERUP_TYPES.JUMP_BOOTS:
        power = new JumpBoots(scene, x, y);
        break;
        case POWERUP_TYPES.MUSHROOM:
        power = new Mushroom(scene, x, y);
        break;
    }
    power.setVelocityX(power.body.velocity.x * 0.09315); // Salir del bloque hacia arriba
    power.setVelocityY(-power.body.velocity.x/2);
    this.scene.powerups.add(power);
    return this.scene.powerups;
}
export default spawnPowerUp;