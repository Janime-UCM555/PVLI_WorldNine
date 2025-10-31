class Mario extends Phaser.GameObjects.Sprite
{
    constructor(scene, x, y, texture, speed = 200, jumpForce = -400, flipHorizontal = true) {
        super(scene, x, y, texture);
        
        scene.add.existing(this);
        scene.physics.add.existing(this);
        
        // Propiedades esenciales
        this.speed = speed; // Velocidad del jugador
        this.jumpForce = jumpForce; // Fuerza con la que salta el jugador

        // Estados del jugador
        this.isGrounded = false; // Controlar si está en el suelo
        this.wasGrounded = false; // Para rastrear el estado anterior
        this.isStopped = false; // Controlar si está detenido
        this.hasJumped = false; // Controlar si ya ha saltado
        this.canJump = true; // Controlar si puede saltar
        this.isChargingJump = false; // Controlar si está cargando el salto

        // Sistema de salto
        this.jumpChargeTime = 0; // Tiempo de carga de salto
        this.maxChargeTime = 750; // Tiempo máximo de carga en milisegundos (0.75 segundos)
        this.maxJumpForce = -600; // Fuerza máxima de salto (más alta que la original)
        
        // Coyote time
        this.coyoteTime = 150; // Tiempo en ms para permitir salto después de dejar el suelo (0.15 segundos)
        this.coyoteTimeCounter = 0; // Contador para el coyote time

        if (flipHorizontal) {
            this.flipX = true; // Voltear horizontalmente
        }
        
        // Configuración de física
        if (this.body) {
            this.body.setVelocityX(this.speed);
            this.body.setGravityY(500);
            this.body.setCollideWorldBounds(false); // Desactivar colisión con bordes del mundo

            // Asegurar que el cuerpo es dinámico y puede colisionar
            this.body.setImmovable(false);
            this.body.moves = true;

            // Mejorar la detección de colisiones
            this.body.onWorldBounds = true;
        }
        
        this.setupMouseInput();
    }

    setupMouseInput() {
        // Limpiar eventos previos
        this.scene.input.off('pointerdown');
        this.scene.input.off('pointerup');

        // Al presionar el ratón
        this.scene.input.on('pointerdown', (pointer) => {
            if (pointer.leftButtonDown() && this.scene.scene.isActive()) {
                this.startJumpCharge();
            }
        });

        // Al soltar el ratón
        this.scene.input.on('pointerup', (pointer) => {
            if (this.isChargingJump && this.scene.scene.isActive()) {
                this.executeJump();
            }
        });
    }

    startJumpCharge() {
        // Permitir cargar salto siempre, solo verificando que no esté ya cargando
        if (!this.isChargingJump) {
            this.isChargingJump = true;
            this.jumpChargeTime = 0;
        }
    }

    executeJump() {
        if (!this.isChargingJump || !this.body) return;

        // Verificar condiciones para ejecutar el salto
        const canExecuteJump = this.canJump && (this.isGrounded || this.coyoteTimeCounter > 0);
        
        if (canExecuteJump) {
            // Calcular fuerza del salto basada en el tiempo de carga
            const chargeRatio = Phaser.Math.Clamp(this.jumpChargeTime / this.maxChargeTime, 0, 1);
            const calculatedJumpForce = this.jumpForce + ((this.maxJumpForce - this.jumpForce) * chargeRatio);
            
            this.body.setVelocityY(calculatedJumpForce);
            this.isGrounded = false; // Ya no está en el suelo
            this.hasJumped = true; // Marcar que ya ha saltado
            this.canJump = false; // No puede saltar nuevamente

            // Consumir coyote time al ejecutar el salto
            this.coyoteTimeCounter = 0;

            // Asegurar que la animación de salto se reproduzca
            if (this.scene.anims.exists('mario_jump')) {
                this.play('mario_jump', true);
            }

            if (this.isStopped) {
                this.resume();
            }
        } else if (this.isChargingJump) {
            // Si está cargando pero no puede ejecutar el salto, cancelar la carga
            this.isChargingJump = false;
            
            // Volver a la animación adecuada según el estado
            this.handleAnimations();
        }

        // Siempre resetear el estado de carga después de intentar ejecutar
        this.isChargingJump = false;
        this.jumpChargeTime = 0;
    }

    // Reanudar movimiento
    resume() {
        this.isStopped = false;
        if (this.body) {
            this.body.setVelocityX(this.speed);
        }
        if (!this.hasJumped && this.scene.anims.exists('mario_run')) {
            this.play('mario_run', true);
        }
    }

    // Detener el jugador
    stop() {
        this.isStopped = true;
        if (this.body) {
            this.body.setVelocityX(0);
        }
        // Cambiar a animación idle cuando se detiene
        if (!this.hasJumped && this.scene.anims.exists('mario_idle')) {
            this.play('mario_idle', true);
        }
    }

    update(time, delta) {
        // Actualizar tiempo de carga si está cargando
        if (this.isChargingJump) {
            this.jumpChargeTime += delta;
            
            // Limitar al tiempo máximo
            if (this.jumpChargeTime > this.maxChargeTime) {
                this.jumpChargeTime = this.maxChargeTime;
            }
        }

        // Iniciar animación si está disponible
        //if (this.scene.anims.exists('mario_run') && (!this.anims.currentAnim || this.anims.currentAnim.key !== 'mario_run')) {
            //this.play('mario_run');
        //}
        
        // Si está detenido
        if (this.isStopped) {
            if (this.body && !this.body.blocked.right) {
                this.resume();
            }
            return;
        }
        
        if (this.body) {
            // Movimiento horizontal hacia la derecha
            this.body.setVelocityX(this.speed);

            // Guardar el estado anterior antes de actualizar
            const previousGrounded = this.isGrounded; // Variable local para este frame
            
            // Verificar si está en el suelo
            this.isGrounded = this.body.blocked.down || this.body.touching.down;

            // Coyote time: Actualizar el contador
            if (this.isGrounded) {
                this.coyoteTimeCounter = this.coyoteTime; // Resetear cuando está en suelo
                // Resetear la capacidad de salto cuando toca el suelo
                this.canJump = true;
                this.hasJumped = false;
            } else if (this.wasGrounded && !this.isGrounded) {
                // Acaba de dejar el suelo, iniciar coyote time
                this.coyoteTimeCounter = this.coyoteTime;
            } else {
                // En el aire, reducir el coyote time
                if (this.coyoteTimeCounter > 0) {
                    this.coyoteTimeCounter -= delta;
                } else {
                    this.coyoteTimeCounter = 0;
                }
            }

            // Actualizar el estado anterior para el próximo frame
            this.wasGrounded = previousGrounded;


            // Manejo de animaciones basado en el estado
            this.handleAnimations();
            
            // Detectar colisión con paredes
            if (this.body.blocked.right) {
                this.stop();
            }
        }
    }

    handleAnimations() {
        if (!this.body) return;
        
        // En el suelo
        if (this.isGrounded) {
            if (this.body.velocity.x !== 0) {
                if (this.anims.currentAnim?.key !== 'mario_run') {
                    this.play('mario_run', true);
                }
            } else {
                if (this.anims.currentAnim?.key !== 'mario_idle') {
                    this.play('mario_idle', true);
                }
            }
        }

        // En el aire (saltando o cayendo)
        else {
            // Saltando (velocidad Y negativa)
            if (this.body.velocity.y < 0) {
                if (this.anims.currentAnim?.key !== 'mario_jump') {
                    this.play('mario_jump', true);
                }
            }
            // Cayendo (velocidad Y positiva)
            else if (this.body.velocity.y > 0) {
                if (this.anims.currentAnim?.key !== 'mario_fall') {
                    this.play('mario_fall', true);
                }
            }
        }
    }

    // Resetear estado de salto (útil al reiniciar nivel)
    resetJumpState() {
        this.hasJumped = false;
        this.canJump = true;
        this.isChargingJump = false;
        this.jumpChargeTime = 0;
        this.coyoteTimeCounter = this.coyoteTime;
    }
}
export default Mario;