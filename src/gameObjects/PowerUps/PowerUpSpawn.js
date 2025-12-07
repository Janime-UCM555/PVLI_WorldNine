import DoubleJump from "./DoubleJump.js";
import Hammer from "./Hammer.js";
import JumpBoots from "./HighJump.js";
import Mushroom from "./Mushroom.js";
import { POWERUP_TYPES } from "./PowerUps.js";
import Star from "./Star.js";

/**
 * Spawnea un nuevo PowerUp en la escena según su tipo.
 * 
 * @function spawnPowerUp
 * @param {Phaser.Scene} scene - La escena donde se creará el PowerUp.
 * @param {number} x - Coordenada X de aparición.
 * @param {number} y - Coordenada Y de aparición.
 * @param {POWERUP_TYPES} type - Tipo de PowerUp a generar.
 * 
 * @returns {Phaser.GameObjects.GameObject} El PowerUp generado.
 * 
 * @description
 * Crea una instancia del PowerUp adecuado según el tipo recibido,
 * aplica una velocidad inicial para que salga "expulsado" del bloque
 * y lo añade al grupo `scene.powerups`.
 */
export const spawnPowerUp = (scene, x, y, type) =>
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

    // Velocidades iniciales para simular que sale disparado del bloque
    power.setVelocityX(power.body.velocity.x * 0.09315);
    power.setVelocityY(-power.body.velocity.x / 2);

    // Añadir al grupo de PowerUps de la escena. En caso de no existir, mostrar advertencia.
    scene.powerups?.add(power) || console.warn("El grupo 'powerups' no existe en la escena.");

    return power;
};

export default spawnPowerUp;
