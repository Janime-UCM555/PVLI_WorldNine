class Mario extends Phaser.GameObjects.Sprite
{
    constructor(scene, x, y, texture, speed = 200, jumpForce = -225, flipHorizontal = true) {
        super(scene, x, y, texture);
        
        scene.add.existing(this);
        scene.physics.add.existing(this);
        
        // Propiedades esenciales
        this.speed = speed; // Velocidad del jugador

        // Estados del jugador
        this.isGrounded = false; // Controlar si está en el suelo
        this.wasGrounded = false; // Para rastrear el estado anterior
        this.isStopped = false; // Controlar si está detenido
        this.canJump = true; // Controlar si puede saltar

        // Sistema de salto
        this.isJumping = false; // Indica si está en proceso de salto
        this.isHoldingJump = false; // Indica si está manteniendo el botón de salto
        this.jumpStartTime = 0; // Momento en que se inició el salto
        this.maxJumpHoldTime = 400; // Tiempo máximo que se puede mantener el salto en ms

        // Control del salto
        this.jumpVelocity = 0; // Velocidad de salto
        this.maxJumpVelocity = -350; // Velocidad máxima hacia arriba
        this.minJumpVelocity = jumpForce; // Velocidad mínima hacia arriba
        this.jumpAcceleration = -900; // Aceleración hacia arriba durante el salto
        
        // Coyote time
        this.coyoteTime = 150; // Tiempo en ms para permitir salto después de dejar el suelo (0.15 segundos)
        this.coyoteTimeCounter = 0; // Contador para el coyote time

        // Control de entrada
        this.jumpRequested = false;
        this.jumpHeld = false;

        // Buffer de salto
        this.hasBufferedJump = false; // Indica si hay un salto en buffer
        this.wasHoldingJumpWhenBuffered = false; // Recordar si se estaba manteniendo el botón cuando se activó el buffer

        if (flipHorizontal) {
            this.flipX = true; // Voltear horizontalmente
        }
        
        // Configuración de física
        if (this.body) {
            this.body.setVelocityX(this.speed);
            this.body.setGravityY(700);
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
                this.jumpRequested = true;
                this.jumpHeld = true;
                // Activar el buffer de salto cuando se presiona el botón en el aire
                if (!this.isGrounded) {
                    this.hasBufferedJump = true;
                    this.wasHoldingJumpWhenBuffered = true; // Recordar que se estaba manteniendo el botón
                }
            }
        });

        // Al soltar el ratón
        this.scene.input.on('pointerup', (pointer) => {
            if (this.scene.scene.isActive()) {
                this.jumpHeld = false;
                this.isHoldingJump = false;
                // Si se suelta el botón, marcar que ya no se está manteniendo para el buffer
                this.wasHoldingJumpWhenBuffered = false;
            }
        });
    }

    handleJump(time, delta) {
        // Manejar inicio del salto desde buffer si está disponible solo si todavía se está manteniendo el botón
        if (this.hasBufferedJump && this.isGrounded && this.canJump && this.wasHoldingJumpWhenBuffered) {
            this.startJump(time);
            this.hasBufferedJump = false;
            this.wasHoldingJumpWhenBuffered = false;
        }
        
        // Manejar inicio del salto normal
        if (this.jumpRequested && this.canJump && (this.isGrounded || this.coyoteTimeCounter > 0)) {
            this.startJump(time);
            this.hasBufferedJump = false; // Limpiar el buffer también en salto normal
            this.wasHoldingJumpWhenBuffered = false;
        }
        
        // Aplicar fuerza de salto progresiva mientras se mantiene presionado y no está chocando por arriba
        if (this.isJumping && this.jumpHeld && this.isHoldingJump && !this.body.blocked.up) {
            this.applyProgressiveJumpForce(time, delta);
        }

        // Resetear el booleano de solicitud
        this.jumpRequested = false;
    }

    startJump(time) {
        // Iniciar el salto con velocidad mínima
        this.jumpVelocity = this.minJumpVelocity;
        this.body.setVelocityY(this.jumpVelocity);
        
        this.isGrounded = false; // Ya no está en el suelo
        this.canJump = false; // No puede saltar nuevamente
        this.isJumping = true;
        this.isHoldingJump = true;
        this.jumpStartTime = time;

        this.coyoteTimeCounter = 0; // Consumir coyote time al ejecutar el salto
        
        this.hasBufferedJump = false; // Limpiar el buffer al iniciar el salto
        this.wasHoldingJumpWhenBuffered = false;

        if (this.scene.anims.exists('mario_jump')) {
            this.play('mario_jump', true);
        }

        // Reanudar movimiento horizontal al saltar
        if (this.isStopped) {
            this.resume();
        }
    }

    applyProgressiveJumpForce(time, delta) {
        const holdTime = time - this.jumpStartTime;
        
        // Si aún está dentro del tiempo máximo de salto
        if (holdTime <= this.maxJumpHoldTime) {
            // Aplicar aceleración hacia arriba mientras se mantiene presionado
            this.jumpVelocity += this.jumpAcceleration * (delta / 1000);
            
            // Limitar la velocidad máxima
            this.jumpVelocity = Math.max(this.jumpVelocity, this.maxJumpVelocity);
            
            // Aplicar la velocidad calculada
            this.body.setVelocityY(this.jumpVelocity);
        } else {
            // Tiempo máximo alcanzado
            this.isHoldingJump = false;
        }
    }

    // Reanudar movimiento
    resume() {
        this.isStopped = false;
        if (this.body) {
            this.body.setVelocityX(this.speed);
        }
        if (!this.isJumping && this.scene.anims.exists('mario_run')) {
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
        if (!this.isJumping && this.scene.anims.exists('mario_idle')) {
            this.play('mario_idle', true);
        }
    }
    
    //Daña al jugador
    hurt()
    {
        this.isHurt = true;
        if (this.body) {
            this.body.setVelocityX(0);
        }
        // Cambiar a animación idle cuando se detiene
        this.play('mario_hurt', true);
    }

    update(time, delta) {
        // Manejar el salto
        this.handleJump(time, delta);
        
        // Si está detenido
        if (this.isStopped) {
            if (this.body && !this.body.blocked.right) {
                this.resume();
            }
            return;
        }
        
        if (this.body && !this.isHurt) {
            // Movimiento horizontal hacia la derecha
            this.body.setVelocityX(this.speed);

            // Guardar el estado anterior antes de actualizar
            const previousGrounded = this.isGrounded; // Variable local para este frame
            
            // Verificar si está en el suelo
            this.isGrounded = this.body.blocked.down || this.body.touching.down;

            // Si choca por arriba, cancelar el salto progresivo
            if (this.body.blocked.up) {
                this.isHoldingJump = false;
                // Ajustar la velocidad Y para que comience a caer inmediatamente
                if (this.body.velocity.y < 0) {
                    this.body.setVelocityY(0);
                }
            }

            if (this.isGrounded) {
                this.coyoteTimeCounter = this.coyoteTime; // Resetear cuando está en suelo
                // Solo resetear estados de salto si no está actualmente saltando
                if (!this.isJumping) {
                    this.canJump = true;
                }
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
                // Si está en el aire y su velocidad Y se vuelve positiva (comienza a caer), entonces el salto ha terminado
                if (this.isJumping && this.body.velocity.y > 0) {
                    this.isJumping = false;
                    this.isHoldingJump = false;
                }
            }

            // Actualizar el estado anterior para el próximo frame
            this.wasGrounded = previousGrounded;


            // Manejo de animaciones basado en el estado
            if (!this.isHurt)
            {
                this.handleAnimations();
            }
            
            // Detectar colisión con paredes
            if (this.body.blocked.right) {
                this.stop();
            }
        }
    }

    handleAnimations() {
        if (!this.body) return;
        
        // Animaciones de salto y caída (si está en el aire)
        if (!this.isGrounded) {
            // Saltando (velocidad Y negativa)
            if (this.body.velocity.y < 0) {
                if (this.anims.currentAnim?.key !== 'mario_jump') {
                    this.play('mario_jump', true);
                }
                return; // Salir temprano - no verificar otras animaciones
            }
            // Cayendo (velocidad Y positiva)
            else if (this.body.velocity.y > 0) {
                if (this.anims.currentAnim?.key !== 'mario_fall') {
                    this.play('mario_fall', true);
                }
                return; // Salir temprano - no verificar otras animaciones
            }
        }
    
        // Animaciones en el suelo
        if (this.isGrounded) {
            if (this.body.velocity.x !== 0 && !this.isStopped) {
                if (this.anims.currentAnim?.key !== 'mario_run') {
                    this.play('mario_run', true);
                }
            } else {
                if (this.anims.currentAnim?.key !== 'mario_idle') {
                    this.play('mario_idle', true);
                }
            }
        }
    }

    // Resetear estado de salto
    resetJumpState() {
        this.canJump = true;
        this.isJumping = false;
        this.isHoldingJump = false;
        this.jumpVelocity = 0;
        this.coyoteTimeCounter = this.coyoteTime;
        this.jumpRequested = false;
        this.jumpHeld = false;
        this.hasBufferedJump = false;
        this.wasHoldingJumpWhenBuffered = false;
        this.isHurt = false;
    }
}
export default Mario;