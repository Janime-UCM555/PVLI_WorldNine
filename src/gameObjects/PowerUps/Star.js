import {PowerUp, POWERUP_TYPES} from './PowerUps.js';

const STAR_DURATION = 8000; // ms

export default class Star extends PowerUp {
    constructor(scene, x, y) {
        super(scene, x, y, POWERUP_TYPES.STAR, POWERUP_TYPES.STAR, 0);
    }

      collect(player) {
super.collect(player);
        
                player.speed = player.base.speed * 1.25;
        
                // Música
                if (player.scene.levelMusic && player.scene.levelMusic.isPlaying) {
                    player.scene.levelMusic.pause();
                }
                if (player.starman) {
                    player.starman.play({ loop: true });
                }
                // Efecto arcoíris
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
        
                if (player.invEvent?.remove) {
                    player.invEvent.remove(false);
                }
                player.invEvent = player.scene.time.addEvent({
                    delay: 100,
                    loop: true,
                    callback: () => {
                        player.setTint(rainbowColors[colorIndex]);
                        colorIndex = (colorIndex + 1) % rainbowColors.length;
                    }
                });
        
                // Timer de aviso de que se acaba la estrella
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
        
                // Timer principal de invencibilidad
                if (player.invTimer?.remove) {
                    player.invTimer.remove(false);
                }
                player.invTimer = player.scene.time.delayedCall(STAR_DURATION, () => {
                    this.endStarInvincibility();
                });
                
    }

    endStarInvincibility() {
        // Cancelar eventos y timers
        if (this.invEvent?.remove) {
            this.invEvent.remove(false);
            this.invEvent = null;
        }
        if (this.invTimer?.remove) {
            this.invTimer.remove(false);
            this.invTimer = null;
        }
        if (this.warningTimer?.remove) {
            this.warningTimer.remove(false);
            this.warningTimer = null;
        }

        this.speed = this.base.speed;

        // Parar músicas de estrella y reanudar música de nivel
        if (this.starman && this.starman.isPlaying||this.scene.endTimer) {
            this.starman.stop();
        }
        if (this.starEndingSound && this.starEndingSound.isPlaying) {
                this.starEndingSound.stop();
        }
        if (this.scene.levelMusic && this.scene.levelMusic.isPaused && !this.scene.endTimer) {
                this.scene.levelMusic.resume();
        }

        // Restaurar apariencia
        this.clearTint();
        this.alpha = 1;
        this.isInvincible = false;
    }
}