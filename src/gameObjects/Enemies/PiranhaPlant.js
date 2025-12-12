/**
 * Importación de los tipos de muerte disponibles
 * @module Goomba
 */
import { DIE_TYPES } from "./Goomba.js";

/**
 * Clase que representa una Planta Piraña en el juego.
 * Las plantas piraña emergen y se ocultan periódicamente desde tuberías,
 * dañando al jugador si hace contacto con ellas cuando están visibles.
 * @extends Phaser.GameObjects.Sprite
 */
class PiranhaPlant extends Phaser.GameObjects.Sprite
{
    /**
     * Constructor de la Planta Piraña
     * @param {Phaser.Scene} scene - La escena de Phaser donde se añade la planta
     * @param {number} x - Posición X inicial
     * @param {number} y - Posición Y inicial (posición oculta)
     * @param {string} texture - Clave de la textura a usar
     * @param {number} [hideTime=2000] - Tiempo en milisegundos que permanece oculta
     * @param {number} [showTime=2000] - Tiempo en milisegundos que permanece visible
     * @param {boolean} inverse - Si es true, la planta sale hacia abajo en lugar de hacia arriba
     */
    constructor(scene, x, y, texture, hideTime = 2000, showTime = 2000, inverse) {
        super(scene, x, y, texture);

        scene.add.existing(this);
        scene.matter.add.gameObject(this);

        // Propiedades de comportamiento
        this.hideTime = hideTime;
        this.showTime = showTime;
        this.isHidden = true;
        this.isMoving = false;
        this.isAlive = true;
        this.shouldBeDestroyed = false;
        this.isEnemy = true;

        // Posiciones
        this.hiddenY = y;
        if(!inverse)
        {
            this.visibleY = y - 56;
        }
        else
        {
            this.visibleY = y + 56;
            this.flipY = true;
        }
        this.y = this.hiddenY;

        // Configuración de física
        const sx = this.width / 2;
        const sy = this.height / 2;
        const w = this.width;
        const h = this.height;
        const M = Phaser.Physics.Matter.Matter;

        this.plantBody = M.Bodies.rectangle(sx, sy, w * 0.6, h * 0.8, { 
            chamfer: { radius: 5 },
            isSensor: true,
            label: "Piranha"
        });

        const compoundBody = M.Body.create({
            parts: [this.plantBody],
            friction: 0,
            frictionAir: 0,
            restitution: 0,
            label: "Piranha"
        });
        this.body.label="Piranha";

        const CATEGORY_PLAYER  = 0x0001;
        const CATEGORY_TERRAIN = 0x0004;
        this.setCollidesWith([CATEGORY_PLAYER,CATEGORY_TERRAIN]);

        this.setExistingBody(compoundBody);
        this.setStatic(true);
        this.setFixedRotation();
 
        M.Body.setPosition(compoundBody, { x, y: this.hiddenY });
        this.setPosition(x, this.hiddenY);

        this.startCycle();

        this.biteSound = scene.sound.add('aplastar');
    }

    /**
     * Método llamado cuando la planta muere
     * @param {string} [killType=DIE_TYPES.STOMP] - Tipo de muerte
     */
    die(killType = DIE_TYPES.STOMP) {
        this.safeDestroy();
    }

    /**
     * Inicia el ciclo de aparición y ocultación de la planta
     * Añade un retraso inicial aleatorio para crear variedad
     */
    startCycle() {
        const initialDelay = Phaser.Math.Between(0, 1000);
        
        this.scene.time.delayedCall(initialDelay, () => {
            this.scheduleNextAction();
        });
    }

    /**
     * Programa la siguiente acción (emerger u ocultarse) según el estado actual
     */
    scheduleNextAction() {
        if (!this.isAlive || this.shouldBeDestroyed) return;

        if (this.isHidden) {
            this.scene.time.delayedCall(this.hideTime, () => {
                this.emerge();
            });
        } else {
            this.scene.time.delayedCall(this.showTime, () => {
                this.hide();
            });
        }
    }

    /**
     * Hace emerger la planta desde su posición oculta
     * Reproduce una animación suave y actualiza el cuerpo de física
     */
    emerge() {
        if (!this.isAlive || this.shouldBeDestroyed || this.isMoving) return;

        this.isMoving = true;
        this.isHidden = false;

        this.scene.tweens.add({
            targets: this,
            y: this.visibleY,
            duration: 800,
            ease: 'Sine.easeInOut',
            onUpdate: () => {
                if (this.body) {
                    const M = Phaser.Physics.Matter.Matter;
                    M.Body.setPosition(this.body, { x: this.x, y: this.y });
                }
            },
            onComplete: () => {
                this.isMoving = false;
                this.scheduleNextAction();
            }
        });

        if (this.scene.anims.exists('piranha_movement')) {
            this.play('piranha_movement');
        }
    }

    /**
     * Oculta la planta moviéndola a su posición escondida
     * Detiene las animaciones y actualiza el cuerpo de física
     */
    hide() {
        if (!this.isAlive || this.shouldBeDestroyed || this.isMoving) return;

        this.isMoving = true;
        this.isHidden = true;

        this.scene.tweens.add({
            targets: this,
            y: this.hiddenY,
            duration: 800,
            ease: 'Sine.easeInOut',
            onUpdate: () => {
                if (this.body) {
                    const M = Phaser.Physics.Matter.Matter;
                    M.Body.setPosition(this.body, { x: this.x, y: this.y });
                }
            },
            onComplete: () => {
                this.isMoving = false;
                this.scheduleNextAction();
            }
        });

        if (this.anims.isPlaying) {
            this.anims.stop();
        }
    }

    /**
     * Maneja la colisión con el jugador
     * La planta solo daña cuando está visible. El jugador no puede saltarla.
     * @param {Object} player - Referencia al objeto jugador
     */
    handlePlayerCollision(player) {
        if (this.isHidden || !this.isAlive) return;

        if (player.isInvincible) {
            return;
        }

        if (!player.isBeingPushed && !player.isInvulnerable) {
            let pushDirection = 0;
            if (player.x < this.x) {
                pushDirection = -1;
            } else {
                pushDirection = 1;
            }

            const playerWasSuperSize = player.isSuperSize;
            if (playerWasSuperSize) {
                player.takeDamage(pushDirection);
            } else if (!playerWasSuperSize && !this.scene.endTimer) {
                this.scene.sound.play('muerte');
                
                player.setVelocity(0, 0);
                if (player.body) {
                    player.body.velocity.x = 0;
                    player.body.velocity.y = 0;
                }

                if (!this.scene.isBoss)
                {
                    if (player.bubblesLeft > 0) {
                        player.Bubble();
                    } else {
                        player.hurt();
                        player.setStatic(true);
                        this.body.collisionFilter.mask = 0;
                        this.setStatic(true);
                        this.scene.doubleEndTransition(()=>{this.scene.scene.launch('LevelSelection');
                            this.scene.scene.stop();});
                    }
                }
                else
                {
                    this.scene.jugador.hurt();
                    this.scene.endTimer=true;
                    this.scene.jugador.setStatic(true);
                    const sceneRef = this.scene;
                    sceneRef.doubleEndTransition(()=>{
                        sceneRef.scene.restart();
                    });
                }
            }

            this.biteSound.play();
        }
    }

    /**
     * Verifica si la planta está dentro del área visible de la cámara
     * @returns {boolean} true si la planta es visible en cámara, false en caso contrario
     */
    checkVisibility() {
        if (this.shouldBeDestroyed) return false;
        
        const camera = this.scene.cameras.main;
        const margin = 50;
        
        const isVisible = 
            this.x >= camera.scrollX - margin && 
            this.x <= camera.scrollX + camera.width + margin && 
            this.y >= camera.scrollY - margin && 
            this.y <= camera.scrollY + camera.height + margin;
        
        return isVisible;
    }

    /**
     * Destruye la planta de forma segura
     * Limpia todos los tweens, animaciones y cuerpos de física antes de destruir el objeto
     */
    safeDestroy() {
        if (this.shouldBeDestroyed) return;
        
        this.shouldBeDestroyed = true;
        this.isAlive = false;
        
        this.scene.tweens.killTweensOf(this);
        
        if (this.anims) {
            this.anims.stop();
        }
        
        if (this.body) {
            this.body.enable = false;
        }
        
        this.setVisible(false);
        this.setActive(false);
        this.destroy();
    }

    /**
     * Método de actualización llamado cada frame
     * Verifica si la planta ha salido del área de la cámara por la izquierda
     * @param {number} time - Tiempo total transcurrido desde el inicio del juego
     * @param {number} delta - Tiempo transcurrido desde el último frame
     */
    update(time, delta) {
        if (!this.isAlive || this.shouldBeDestroyed) return;

        const camera = this.scene.cameras.main;

        if (this.x < camera.scrollX - 50) {
            this.safeDestroy();
            return;
        }
    }
}

export default PiranhaPlant;