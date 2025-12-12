/**
 * Controlador del estado de burbuja del jugador
 * Maneja la lógica completa del estado de rescate en burbuja, incluyendo:
 * - Activación y desactivación de la burbuja
 * - Movimiento automático en 3 fases
 * - Oscilación vertical durante la fase 3
 * - Salida controlada del estado
 */
export default class PlayerBubbleController {
    /**
     * Constructor del controlador de burbuja
     * @param {Mario} player - Instancia del jugador a controlar
     */
    constructor(player) {
        this.player = player;
    }

    /**
     * Activa el estado de burbuja del jugador
     */
    Bubble() {
        const p = this.player;
        if (p.isInBubble) return;

        p.isInBubble = true;
        p.setVelocity(0, 0);
        p.isStopped = true;

        if (p.body) {
            p.body.ignoreGravity = true;
            p.setVelocityX(0);
            p.setVelocityY(0);
        }

        this.enterBubbleState();
    }

    /**
     * Inicia la fase 1 del estado de burbuja.
     * @private
     */
    enterBubbleState() {
        const p = this.player;
        const scene = p.scene;

        const camera = scene.cameras.main;
        const velBubble = -3;

        p.isInBubble = true;
        p.canDrop = false;
        p.bubblePhase = 1;

        p.powerUps.deactivatePowerUp({ keepSize: false });

        p.setVelocity(0, 0);
        if (p.body) {
            p.body.ignoreGravity = true;
            p.setSensor(true);
            p.body.collisionFilter.mask = 0;
        }

        p.play("mario_bubble", true);

        let initialX = Phaser.Math.Clamp(p.x, 100, scene.map.widthInPixels - 100);
        let initialY = Phaser.Math.Clamp(p.y, 100, scene.map.heightInPixels + 100);

        p.x = initialX;
        p.y = initialY;

        // Fase 1 → 1000ms
        scene.time.delayedCall(1000, () => {
            if (!p.isInBubble) return;

            scene.sound.play("bubbleCreate");
            p.bubblePhase = 2;

            p.setVelocityX(velBubble);

            const targetY = 290;
            const currentY = p.y;
            const intermediateY = currentY + ((targetY - currentY) * 0.9);

            scene.tweens.add({
                targets: p,
                y: intermediateY,
                duration: 1000,
                ease: "Linear",

                onUpdate: () => {
                    if (p.x > 50) p.setVelocityX(velBubble);
                    else p.setVelocityX(0);
                },

                onComplete: () => {

                    const startVelX = velBubble;
                    const endVelX = -2.45;

                    scene.tweens.add({
                        targets: p,
                        y: targetY,
                        duration: 250,
                        ease: "Cubic.Out",

                        onUpdate: (tween) => {
                            const progress = tween.progress;
                            const currentVelX = startVelX + ((endVelX - startVelX) * progress);

                            if (p.x > 50) p.setVelocityX(currentVelX);
                            else p.setVelocityX(0);

                            if (p.body) {
                                const M = Phaser.Physics.Matter.Matter;
                                M.Body.setPosition(p.body, { x: p.x, y: p.y });
                            }
                        },

                        onComplete: () => {
                            if (p.isInBubble) {
                                this.startBubblePhase2();
                            }
                        }
                    });

                }
            });

            // Habilitamos "drop" 
            scene.time.delayedCall(400, () => {
                if (p.isInBubble) p.canDrop = true;
            });

        });
    }

    /**
     * Inicia la fase 2 del estado de burbuja (movimiento oscilatorio).
     * Maneja el movimiento con oscilación
     * @private
     */
    startBubblePhase2() {
        const p = this.player;
        const scene = p.scene;

        if (!p.isInBubble) return;

        p.bubblePhase = 3;

        p.setVelocityY(0);
        p.setVelocityX(-2.45);

        p.bubbleOscillation = {
            amplitude: 40,
            frequency: 0.002,
            baseY: p.y,
            startTime: scene.time.now
        };

        scene.time.delayedCall(1500, () => {
            if (p.isInBubble && p.bubblePhase === 3) {
                if (p.x > 50) {

                    scene.tweens.add({
                        targets: p.body.velocity,
                        x: -5.75,
                        duration: 1250,
                        ease: "Cubic.InOut",

                        onComplete: () => {
                            if (p.isInBubble && p.bubblePhase === 3) {
                                p.setVelocityX(-5.75);
                            }
                        }
                    });
                }
            }
        });
    }

    /**
     * Sale del estado de burbuja.
     * Restaura controles, física y animaciones normales del jugador.
     */
    exitBubbleState() {
        const p = this.player;
        const scene = p.scene;

        if (!p.isInBubble) return;

        p.isInBubble = false;
        p.canDrop = false;
        p.bubblePhase = 0;
        p.bubbleOscillation = null;

        scene.tweens.killTweensOf(p);
        if (p.body) scene.tweens.killTweensOf(p.body.velocity);

        if (p.body) {
            p.body.ignoreGravity = false;
            p.setSensor(false);
            p.body.collisionFilter.mask = 0xFFFFFFFF;
        }

        if (!p.inBoss) p.play("mario_fall", true);
        else p.play("mario_panicfall", true);

        p.setVelocityX(0);
        p.setVelocityY(0);

        p.x = Math.max(p.x, 50);
        p.y = Math.max(p.y, 100);

        p.isJumping = false;
        p.isHoldingJump = false;
    }

    /**
     * Actualiza el estado de burbuja cada frame.
     * Maneja el movimiento, oscilación y transiciones durante el estado de burbuja.
     */
    update(time, delta) {
        const p = this.player;
        const dt = delta / 16.666;

        if (!p.body || !p.scene) return;

        if (p.isHurt) {
            p.handleAnimations();
            return;
        }

        if (p.isInBubble) {

            // Fase 2 y 3 → mantener velocidad X constante
            if (p.body) {
                p.body.ignoreGravity = true;

                if (p.bubblePhase === 2 || p.bubblePhase === 3) {
                    if (p.x > 50) {

                        if (p.bubblePhase === 3 && p.body.velocity.x > -2.45) {
                            p.setVelocityX(-2.45 * dt);
                        }

                    } else {
                        p.setVelocityX(0);
                    }

                    if (p.bubblePhase === 3) {

                        if (p.x > 50) {
                            const currentTime = p.scene.time.now;

                            if (currentTime - p.bubbleOscillation.startTime > 2500) {
                                p.setVelocityX(-5.75 * dt);
                            }
                        } else {
                            p.setVelocityX(0);
                        }

                        p.setVelocityY(0);
                    }

                }
            }

            // Oscilación de fase 3
            if (p.bubblePhase === 3 && p.bubbleOscillation) {
                const elapsed = time - p.bubbleOscillation.startTime;
                const osc = Math.sin(elapsed * p.bubbleOscillation.frequency)
                          * p.bubbleOscillation.amplitude;

                p.y = p.bubbleOscillation.baseY + osc;
            }

            p.handleAnimations();
            return;
        }
    }
}
