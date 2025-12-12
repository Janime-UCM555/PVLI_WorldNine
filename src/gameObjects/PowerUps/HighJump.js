import { PowerUp, POWERUP_TYPES } from './PowerUps.js';

/**
 * PowerUp de tipo Botas de Salto.
 * Permite al jugador saltar más alto y aumenta su velocidad de movimiento.
 * No altera el tamaño del jugador (compatible con estado Super).
 */
export default class JumpBoots extends PowerUp {

    /**
     * Crea un nuevo power-up de botas de salto en el mundo.
     * @param {Phaser.Scene} scene - Escena en la que se genera el power-up.
     * @param {number} x - Posición X en el mundo.
     * @param {number} y - Posición Y en el mundo.
     */
    constructor(scene, x, y) {
        super(scene, x, y, POWERUP_TYPES.JUMP_BOOTS, POWERUP_TYPES.JUMP_BOOTS, 0);
    }

    /**
     * Se ejecuta cuando el jugador recoge las botas de salto.
     * Aumenta la altura del salto y la velocidad de movimiento.
     * @param {Player} player - Jugador que recoge el power-up.
     */
    collect(player) {
        super.collect(player);
        
        player.activePowerUp = POWERUP_TYPES.JUMP_BOOTS;
        player.canHighJump = true;

        // Hacer el salto más alto
        const baseMaxJump =
            player.base.maxJumpVelocity ??
            player.base.jumpForce ??
            player.maxJumpVelocity;

        player.maxJumpVelocity = baseMaxJump * player.highJumpMultiplier;

        // Aumentar también la velocidad para diferenciarlo del doble salto
        player.speed = player.base.speed * 1.5;
    }
}
