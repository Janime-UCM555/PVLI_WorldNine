import { PowerUp, POWERUP_TYPES } from './PowerUps.js';

/**
 * PowerUp de tipo Seta.
 * Convierte al jugador en estado Super, aumentando su tamaño
 * y permitiéndole resistir un impacto adicional.
 */
export default class Mushroom extends PowerUp {

    /**
     * Crea un nuevo power-up de tipo seta en el mundo.
     * @param {Phaser.Scene} scene - Escena en la que se genera el power-up.
     * @param {number} x - Posición X en el mundo.
     * @param {number} y - Posición Y en el mundo.
     */
    constructor(scene, x, y) {
        super(scene, x, y, POWERUP_TYPES.MUSHROOM, POWERUP_TYPES.MUSHROOM, 0);
    }

    /**
     * Se ejecuta cuando el jugador recoge la seta.
     * Activa el estado Super del jugador.
     * @param {Player} player - Jugador que recoge el power-up.
     */
    collect(player) {
        super.collect(player);

        // Activar estado Super
        player.activePowerUp = POWERUP_TYPES.MUSHROOM;
        player.isSuper = true;
    }
}
