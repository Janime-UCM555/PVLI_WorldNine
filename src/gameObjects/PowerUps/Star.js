import { PowerUp, POWERUP_TYPES } from './PowerUps.js';

/**
 * Duración del efecto de la estrella en milisegundos.
 * @constant {number}
 */
const STAR_DURATION = 8000; // ms

/**
 * PowerUp de tipo Estrella.
 * Otorga invencibilidad temporal al jugador, aumenta su velocidad,
 * reproduce música especial, aplica efecto arcoíris y gestiona temporizadores
 * de advertencia y finalización.
 */
export default class Star extends PowerUp {

    /**
     * Crea una nueva estrella en el mundo.
     * @param {Phaser.Scene} scene - Escena en la que se genera el power-up.
     * @param {number} x - Posición X en el mundo.
     * @param {number} y - Posición Y en el mundo.
     */
    constructor(scene, x, y) {
        super(scene, x, y, POWERUP_TYPES.STAR, POWERUP_TYPES.STAR, 0);
    }

    /**
     * Se ejecuta cuando el jugador recoge la estrella.
     * Activa invencibilidad, aumenta velocidad, cambia música,
     * aplica efecto arcoíris y lanza temporizadores.
     * @param {Player} player - Jugador que recoge el power-up.
     */
    collect(player) {
        player.activePowerUp = this.type;
        player.isInvincible = true;

        // Aumentar velocidad del jugador
        player.speed = player.base.speed * 1.25;

        // Gestión de música
        if (player.scene.levelMusic && player.scene.levelMusic.isPlaying) {
            player.scene.levelMusic.pause();
        }
        if (player.starman) {
            player.starman.play({ loop: true });
        }

        // Colores del efecto arcoíris
        const rainbowColors = [
            0xFF0000, // Rojo
            0xFF7F00, // Naranja
            0xFFFF00, // Amarillo
            0x00FF00, // Verde
            0x0000FF, // Azul
            0x4B0082, // Índigo
            0x8B00FF  // Violeta
        ];
        let colorIndex = 0;

        // Reiniciar evento de invencibilidad si existía
        if (player.invEvent?.remove) {
            player.invEvent.remove(false);
        }

        // Evento que cambia el color del jugador periódicamente
        player.invEvent = player.scene.time.addEvent({
            delay: 100,
            loop: true,
            callback: () => {
                player.setTint(rainbowColors[colorIndex]);
                colorIndex = (colorIndex + 1) % rainbowColors.length;
            }
        });

        // Temporizador de aviso antes de que termine la estrella
        const warningTime = 1000;
        const timeUntilWarning = STAR_DURATION - warningTime;

        if (player.warningTimer?.remove) {
            player.warningTimer.remove(false);
        }

        player.warningTimer = player.scene.time.delayedCall(timeUntilWarning, () => {
            if (!player.starEndingSound) {
                player.starEndingSound = player.scene.sound.add('starEnding');
            }
            player.starEndingSound.play();
        });

        // Temporizador principal de invencibilidad
        if (player.invTimer?.remove) {
            player.invTimer.remove(false);
        }

        player.invTimer = player.scene.time.delayedCall(STAR_DURATION, () => {
            this.endStarInvincibility(player);
        });
        
        this.destroy();
    }

    /**
     * Finaliza el estado de invencibilidad de la estrella.
     * Cancela temporizadores, restaura velocidad, música y apariencia del jugador.
     */
    endStarInvincibility(player) {

        // Cancelar eventos y temporizadores
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

        // Restaurar velocidad base
        player.speed = player.base.speed;

        // Parar música de estrella y reanudar música de nivel
        if (player.starman && player.starman.isPlaying || player.scene.endTimer) {
            player.starman.stop();
        }
        if (player.starEndingSound && player.starEndingSound.isPlaying) {
            player.starEndingSound.stop();
        }
        if (player.scene.levelMusic && player.scene.levelMusic.isPaused && !player.scene.endTimer) {
            player.scene.levelMusic.resume();
        }

        // Restaurar apariencia del jugador
        player.clearTint();
        player.alpha = 1;
        player.isInvincible = false;
    }
}
