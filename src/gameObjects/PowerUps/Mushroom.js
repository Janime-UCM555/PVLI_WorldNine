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

        // Si el jugador aún no es Super, se le aplica el efecto de tamaño
        if (!player.isSuperSize) {
            this.enableSuperSize?.(player);
        }

        // Se registra este power-up como activo en el jugador
        player.activePowerUp = POWERUP_TYPES.MUSHROOM;

        // Se activa el estado Super en el jugador
        player.isSuper = true;

        // Se elimina el objeto de la escena tras ser recogido
        this.destroy();
    }
}
