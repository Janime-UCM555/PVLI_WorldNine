// ==========================================================
//               POWER UP CONTROLLER DEL PLAYER
// ==========================================================
/**
 * Importación de los tipos de PowerUps
 * @module PowerUps/PowerUps
 */
import { POWERUP_TYPES } from "../PowerUps/PowerUps.js";
/**
 * Controlador de PowerUps del jugador.
 * Gestiona las habilidades especiales obtenidas mediante PowerUps:
 * - Lanzamiento de martillos
 * - Activación/desactivación de todos los PowerUps
 * - Restauración de estados base
 */
export default class PowerUpController {
    /**
     * Constructor del controlador de PowerUps
     * @param {Mario} player - Instancia del jugador a controlar
     */
    constructor(player) {
        this.player = player;
    }

    // ======================================================
    //                     TIRAR MARTILLO
    // ======================================================

    /**
     * Intenta lanzar un martillo (si el jugador tiene el PowerUp activo).
     * @returns {boolean} True si se lanzó exitosamente, false si falló
     */
    tryThrowHammer() {
        const p = this.player;

        if (!p.canThrowHammer) return;

        const currentTime = p.scene.time.now || 0;
        if (currentTime < p.hammerCooldown) return;

        p.hammerCooldown = currentTime + 1000; // 1s cooldown

        if (!p.scene.hammers) {
            console.warn("No hay grupo de martillos en la escena.");
            return;
        }
        if (!p.scene.requestHammer) {
            console.warn("La escena no tiene el método requestHammer().");
            return;
        }

        const hammer = p.scene.requestHammer(p);
        if (!hammer) return;

        // Mario siempre mira a la derecha en tu juego
        const dir = 1;

        const offsetX = p.width * p.scaleX * 0.6 * dir;
        const offsetY = p.height * p.scaleY * 0.2;

        hammer.setPosition(p.x + offsetX, p.y - offsetY);

        const hammerSpeedX = p.speed * 2.5 * dir;  // ~8-9 aprox
        const hammerSpeedY = -6;

        if (hammer.setVelocity) {
            hammer.setVelocity(hammerSpeedX, hammerSpeedY);
        } else if (hammer.body?.setVelocity) {
            hammer.body.setVelocity(hammerSpeedX, hammerSpeedY);
        }

        if (p.scene.anims.exists("mario_throw")) {
            p.play("mario_throw", true);
        }
    }

    // ======================================================
    //               DESACTIVAR POWER UP ACTUAL
    // ======================================================

    /**
     * Desactiva el PowerUp actual del jugador.
     * Restaura al jugador a su estado base o parcial según las opciones:
     * - Quita efectos visuales (tinte, parpadeo)
     * - Restaura tamaño y físicas
     * - Resetea flags de habilidades
     * - Maneja música y sonidos
     * 
     * @param {Object} [options] - Opciones de desactivación
     * @param {boolean} [options.keepSize=false] - Mantener tamaño de Super Mario
     */
    deactivatePowerUp(options = {}) {
        const player = this.player;

        if (!player.activePowerUp && !player.isSuperSize) return;

        const keepSize = options.keepSize ?? false;

        // -------------------------------
        // 1. Quitar efectos de estrella
        // -------------------------------
        if (player.invEvent?.remove) {
            player.invEvent.remove(false);
            player.invEvent = null;
        }

        if (player.invTimer?.remove) {
            player.invTimer.remove(false);
            player.invTimer = null;
        }

        if (player.warningTimer?.remove) {
            player.warningTimer.remove(false);
            player.warningTimer = null;
        }

        if (player.starman?.isPlaying) {
            player.starman.stop();
        }
        if (player.starEndingSound?.isPlaying) {
            player.starEndingSound.stop();
        }

        if (
            player.scene.levelMusic &&
            player.scene.levelMusic.isPaused &&
            !player.scene.endTimer
        ) {
            player.scene.levelMusic.resume();
        }

        // -------------------------------
        // 2. Restaurar apariencia
        // -------------------------------
        player.clearTint();
        player.alpha = 1;

        // -------------------------------
        // 3. Restaurar tamaño
        // -------------------------------
        if (!keepSize && player.isSuperSize) {

            player.setScale(player.base.scaleX, player.base.scaleY);

            // Restaurar body si existe
            if (player.baseBody && player.body?.setSize) {

                player.body.setSize(
                    player.baseBody.w * player.base.scaleX,
                    player.baseBody.h * player.base.scaleY
                );

                player.body.setOffset(
                    player.baseBody.offsetX,
                    player.baseBody.offsetY
                );
            }

            player.isSuperSize = false;
        }

        // -------------------------------
        // 4. Resetear flags
        // -------------------------------
        player.isInvincible = false;
        player.canThrowHammer = false;
        player.canDoubleJump = false;
        player.hasDoubleJumped = false;
        player.canDash = false;
        player.isDashing = false;
        player.canHighJump = false;

        player.highJumpMultiplier = 1.5;

        // -------------------------------
        // 5. Restaurar velocidad y salto
        // -------------------------------
        player.speed = player.base.speed;

        player.minJumpVelocity =
            player.base.minJumpVelocity ?? player.minJumpVelocity;

        player.maxJumpVelocity =
            player.base.maxJumpVelocity ??
            player.base.jumpForce ??
            player.maxJumpVelocity;

        // -------------------------------
        // 6. Determinar PowerUp activo
        // -------------------------------
        player.activePowerUp =
            keepSize && player.isSuperSize
                ? POWERUP_TYPES.MUSHROOM
                : null;
    }
}
