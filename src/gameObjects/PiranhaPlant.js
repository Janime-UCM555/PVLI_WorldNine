class PiranhaPlant extends Phaser.GameObjects.Sprite
{
    constructor(scene, x, y, texture, hideTime = 2000, showTime = 2000) {
        super(scene, x, y, texture);

        scene.add.existing(this);
        scene.matter.add.gameObject(this);

        // Propiedades de comportamiento
        this.hideTime = hideTime; // Tiempo oculta (ms)
        this.showTime = showTime; // Tiempo visible (ms)
        this.isHidden = true; // Empieza oculta
        this.isMoving = false; // Está en transición
        this.isAlive = true;
        this.shouldBeDestroyed = false;

        // Posiciones
        this.hiddenY = y; // Posición cuando está oculta (dentro de la tubería)
        this.visibleY = y - 56; // Posición cuando está visible (sale 64px)
        this.y = this.hiddenY; // Empieza oculta

        // Configuración de física
        const sx = this.width / 2;
        const sy = this.height / 2;
        const w = this.width;
        const h = this.height;
        const M = Phaser.Physics.Matter.Matter;

        // Cuerpo principal (más pequeño para que sea justo)
        this.plantBody = M.Bodies.rectangle(sx, sy, w * 0.6, h * 0.8, { 
            chamfer: { radius: 5 },
            isSensor: true // Es un sensor para detectar colisiones sin física
        });

        const compoundBody = M.Body.create({
            parts: [this.plantBody],
            friction: 0,
            frictionAir: 0,
            restitution: 0
        });

        this.setExistingBody(compoundBody);
        this.setStatic(true); // La planta no se mueve por física
        this.setFixedRotation();

        // Posicionar el cuerpo
        M.Body.setPosition(compoundBody, { x, y: this.hiddenY });
        this.setPosition(x, this.hiddenY);

        // Iniciar el ciclo de aparición/ocultación
        this.startCycle();

        this.biteSound = scene.sound.add('aplastar');
    }

    startCycle() {
        // Esperar un tiempo aleatorio antes de empezar (para variedad)
        const initialDelay = Phaser.Math.Between(0, 1000);
        
        this.scene.time.delayedCall(initialDelay, () => {
            this.scheduleNextAction();
        });
    }

    scheduleNextAction() {
        if (!this.isAlive || this.shouldBeDestroyed) return;

        if (this.isHidden) {
            // Está oculta, programar para salir
            this.scene.time.delayedCall(this.hideTime, () => {
                this.emerge();
            });
        } else {
            // Está visible, programar para ocultarse
            this.scene.time.delayedCall(this.showTime, () => {
                this.hide();
            });
        }
    }

    emerge() {
        if (!this.isAlive || this.shouldBeDestroyed || this.isMoving) return;

        this.isMoving = true;
        this.isHidden = false;

        // Animación de salida
        this.scene.tweens.add({
            targets: this,
            y: this.visibleY,
            duration: 800,
            ease: 'Sine.easeInOut',
            onUpdate: () => {
                // Actualizar la posición del cuerpo de Matter
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

        // Reproducir animación de morder si existe
        if (this.scene.anims.exists('piranha_bite')) {
            this.play('piranha_bite');
        }
    }

    hide() {
        if (!this.isAlive || this.shouldBeDestroyed || this.isMoving) return;

        this.isMoving = true;
        this.isHidden = true;

        // Animación de entrada
        this.scene.tweens.add({
            targets: this,
            y: this.hiddenY,
            duration: 800,
            ease: 'Sine.easeInOut',
            onUpdate: () => {
                // Actualizar la posición del cuerpo de Matter
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

        // Detener animación
        if (this.anims.isPlaying) {
            this.anims.stop();
        }
    }

    handlePlayerCollision(player) {
        // Solo daña si está visible (no oculta)
        if (this.isHidden || !this.isAlive) return;

        // Si el jugador es invencible, no hace nada
        if (player.isInvincible) {
            return;
        }

        // La planta piraña siempre daña (no se puede saltar sobre ella)
        if (!player.isBeingPushed && !player.isInvulnerable) {
            // Determinar dirección del empuje
            let pushDirection = 0;
            if (player.x < this.x) {
                pushDirection = -1;
            } else {
                pushDirection = 1;
            }

            const playerWasSuperSize = player.isSuperSize;
            player.takeDamage(pushDirection);
            
            if (!playerWasSuperSize && !this.scene.endTimer) {
                // Si Mario ha colisionado siendo pequeño, reinicia el nivel
                this.scene.sound.play('muerte');
                this.scene.restartLevel();
            }

            this.biteSound.play();
        }
    }

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

    safeDestroy() {
        if (this.shouldBeDestroyed) return;
        
        this.shouldBeDestroyed = true;
        this.isAlive = false;
        
        // Cancelar todos los tweens
        this.scene.tweens.killTweensOf(this);
        
        // Detener animaciones
        if (this.anims) {
            this.anims.stop();
        }
        
        // Deshabilitar cuerpo
        if (this.body) {
            this.body.enable = false;
        }
        
        this.setVisible(false);
        this.setActive(false);
        this.destroy();
    }

    update(time, delta) {
        if (!this.isAlive || this.shouldBeDestroyed) return;

        const camera = this.scene.cameras.main;

        // Destruir si se sale por la izquierda de la cámara
        if (this.x < camera.scrollX - 50) {
            this.safeDestroy();
            return;
        }
    }
}

export default PiranhaPlant;