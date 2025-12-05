import { PowerUp, POWERUP_TYPES } from './PowerUps.js';

/**
 * PowerUp de tipo Doble Salto.
 * Permite al jugador realizar un segundo salto en el aire.
 * No altera el tamaño del jugador (compatible con estado Super).
 */
export default class DoubleJump extends PowerUp {

    /**
     * Crea un nuevo power-up de doble salto en el mundo.
     * @param {Phaser.Scene} scene - Escena en la que se genera el power-up.
     * @param {number} x - Posición X en el mundo.
     * @param {number} y - Posición Y en el mundo.
     */
    constructor(scene, x, y) {
        super(scene, x, y, POWERUP_TYPES.DOUBLE_JUMP, POWERUP_TYPES.DOUBLE_JUMP, 0);
    }

    /**
     * Se ejecuta cuando el jugador recoge el power-up de doble salto.
     * Activa la habilidad de hacer doble salto y reinicia el estado
     * de si ya ha realizado el segundo salto.
     * @param {Player} player - Jugador que recoge el power-up.
     */
    collect(player) {
        super.collect(player);
        
        // Activar doble salto como power-up de movilidad
        player.activePowerUp = POWERUP_TYPES.DOUBLE_JUMP;
        player.canDoubleJump = true;
        player.hasDoubleJumped = false;
    }
}
