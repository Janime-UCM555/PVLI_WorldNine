import { PowerUp, POWERUP_TYPES } from './PowerUps.js';

/**
 * PowerUp de tipo Martillo.
 * Permite al jugador lanzar martillos como ataque ofensivo.
 * No altera el tamaño del jugador (compatible con estado Super).
 */
export default class Hammer extends PowerUp {

    /**
     * Crea un nuevo martillo en el mundo.
     * @param {Phaser.Scene} scene - Escena en la que se genera el power-up.
     * @param {number} x - Posición X en el mundo.
     * @param {number} y - Posición Y en el mundo.
     */
    constructor(scene, x, y) {
        super(scene, x, y, POWERUP_TYPES.HAMMER, POWERUP_TYPES.HAMMER, 0);
    }

    /**
     * Se ejecuta cuando el jugador recoge el martillo.
     * Activa la habilidad de lanzar martillos y establece
     * este power-up como ofensivo activo.
     * @param {Player} player - Jugador que recoge el power-up.
     */
    collect(player) {
        super.collect(player);
        
        // Activar martillo como power-up ofensivo
        player.activePowerUp = POWERUP_TYPES.HAMMER;
        player.canThrowHammer = true;
    }
}
