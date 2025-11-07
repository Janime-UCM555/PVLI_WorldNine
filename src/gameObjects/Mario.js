import { POWERUP_TYPES } from "./PowerUps.js";

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
        this.isBeingPushed = false; // Indica si está siendo empujado
        this.isInvulnerable = false; // Para controlar la invulnerabilidad temporal

        // Sistema de salto
        this.isJumping = false; // Indica si está en proceso de salto
        this.isHoldingJump = false; // Indica si está manteniendo el botón de salto
        this.jumpStartTime = 0; // Momento en que se inició el salto
        this.maxJumpHoldTime = 290; // Tiempo máximo que se puede mantener el salto en ms

        // Control del salto
        this.jumpVelocity = 0; // Velocidad de salto
        this.maxJumpVelocity = jumpForce; // Velocidad máxima hacia arriba
        this.minJumpVelocity = -100; // Velocidad mínima hacia arriba
        this.jumpAcceleration = -800; // Aceleración hacia arriba durante el salto
        
        // Coyote time
        this.coyoteTime = 50; // Tiempo en ms para permitir salto después de dejar el suelo (50 ms)
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
        
        this.jumpSound = scene.sound.add('salto');
        this.hurtSound = scene.sound.add('PowerDown');
        this.powerUpSound = scene.sound.add('PowerUp');
        this.starman = scene.sound.add('starman');
        this.paso1 = scene.sound.add('paso1');
        this.paso2 = scene.sound.add('paso2');
        this.nextFootstep = 1;
        this.footstepCooldown = 0;

        this.base = {
            speed: speed,
            jumpForce: jumpForce,
            minJumpVelocity: this.minJumpVelocity,
            maxJumpVelocity: this.maxJumpVelocity,
            scaleX: 0.85,
            scaleY: 0.85
        }

        this.setScale(this.base.scaleX, this.base.scaleY);

        if(this.body){
            this.baseBody = {
                w: this.body.width,
                h: this.body.height,
                offsetX: this.body.offset.x || 0,
                offsetY: this.body.offset.y || 0
            };
        }

        this.body.setSize(
            this.baseBody.w * this.base.scaleX,
            this.baseBody.h * this.base.scaleY
        );

        this.activePowerUp = null;

        //Parametros Estrella
        this.isInvincible = false;
        this.invEvent = null;
        this.invTimer = null;

        //Martillo
        this.canThrowHammer = false;

        //Doble Salto
        this.canDoubleJump = false;
        this.hasDoubleJumped = false;
        
        //Dash
        this.canDash = false;
        this.isDashing = false;
        this.dashSpeed = this.speed * 2;
        this.dashDuration = 200;

        //Botas de salto
        this.canHighJump = false;
        this.highJumpMultiplier = 1.5;

        //Seta
        this.isSuperSize = false;
        this.scaleMultiplier = 1.35;

        // Configurar entrada del ratón para saltar
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
        this.jumpSound.play();
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
            this.jumpVelocity = Phaser.Math.Clamp(this.jumpVelocity, -650, this.maxJumpVelocity);
            
            // Aplicar la velocidad calculada
            this.body.setVelocityY(this.jumpVelocity);
        } else {
            // Tiempo máximo alcanzado
            this.isHoldingJump = false;
        }
    }

    // Activar empuje
    startPush() {
        this.isBeingPushed = true;
        this.isStopped = true; // También detener el movimiento automático
    }

    // Desactivar empuje
    endPush() {
        this.isBeingPushed = false;
        this.isStopped = false;
        this.isHurt = false; // Asegurar que ya no está en estado hurt
        
        // Reanudar movimiento normal
        if (this.body && !this.body.blocked.right) {
            this.resume();
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
    
    // Detener el jugador
    win() {
        this.hasWon = true;
        // Cambiar a animación idle cuando se detiene
        this.play('mario_stop', true);
    }
    

    //Daña al jugador
    hurt() {
        this.isHurt = true;

        // Cambiar a animación idle cuando se detiene
        this.play('mario_hurt', true);
    }

    takeDamage(pushDirection) {
        // Configurar tiempos
        const PUSH_DURATION = 200; // Tiempo de empuje
        const EXTRA_INVULNERABILITY = 1550; // Tiempo extra durante el que Mario es invulnerable
        const TOTAL_INVULNERABILITY = PUSH_DURATION + EXTRA_INVULNERABILITY; // Tiempo total: Tiempo de empuje + Tiempo extra de invulnerabilidad
        
        // Desactivar el estado de super tamaño si estaba activo
        if (this.isSuperSize) {
            this.hurtSound.play();
            this.isSuperSize = false;
            this.setScale(this.base.scaleX, this.base.scaleY); // Restaurar tamaño original
        }

        // Activar estado de daño
        this.hurt();
        this.startPush();
        this.isInvulnerable = true;

        // Empujar a Mario hacia la izquierda
        const pushSpeed = Phaser.Math.Clamp(500, -650, 650); // Velocidad alta para el empuje
        this.body.setVelocityX(pushSpeed * pushDirection);

        // Actualizar el cuerpo físico después del cambio de posición
        this.body.updateFromGameObject();
    
        // Restaurar hitbox original si existe
        if (this.baseBody && this.body) {
            this.body.setSize(this.baseBody.w, this.baseBody.h);
            this.body.setOffset(this.baseBody.offsetX, this.baseBody.offsetY);
        }
    
        // Efecto visual temporal (parpadeo)
        let blinkCount = 0;
        const maxBlinks = Math.floor(TOTAL_INVULNERABILITY / 50); // Calcular parpadeos basado en tiempo
        const blinkInterval = setInterval(() => {
            this.setVisible(!this.visible);
            blinkCount++;
            if (blinkCount >= maxBlinks) {
                clearInterval(blinkInterval);
                this.setVisible(true);
            }
        }, 50);

        // Terminar el empuje después del tiempo configurado
        this.scene.time.delayedCall(PUSH_DURATION, () => {
            this.isHurt = false;
            this.endPush(); // Esto quita isBeingPushed y reanuda movimiento
        });

        // Quitar la inmunidad después del tiempo total
        this.scene.time.delayedCall(TOTAL_INVULNERABILITY, () => {
            this.isInvulnerable = false;
            this.setVisible(true);
            clearInterval(blinkInterval);
            // Asegurarse de que el estado de hurt esté desactivado
            if (this.isHurt) {
                this.isHurt = false;
            }
        });
    }

    update(time, delta) {
        // Si está herido, no procesar otras lógicas
        if (this.isHurt) {
            // Solo mantener la animación de hurt y salir
            this.handleAnimations();
            return;
        }
        if (this.footstepCooldown > 0) {
            this.footstepCooldown -= delta;
        }

        // Manejar el salto
        this.handleJump(time, delta);
        
        // Si está detenido
        if (this.isStopped) {
            if (this.body && !this.body.blocked.right) {
                this.resume();
            }
            return;
        }

        // Manejo de animaciones
        this.handleAnimations();
        
        if (this.body && !this.isHurt && !this.hasWon) {
            // Solo aplicar velocidad hacia la derecha si no está siendo empujado
            if (!this.isBeingPushed) {
                this.body.setVelocityX(this.speed);
            }

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
            
            // Detectar colisión con paredes
            if (this.body.blocked.right) {
                this.stop();
            }
        }

        // Limitar velocidades después de todas las actualizaciones
        if (this.body && !this.isHurt) {
            // Asegurar que las velocidades sean números válidos
            if (typeof this.body.velocity.x !== 'number' || isNaN(this.body.velocity.x)) {
                this.body.velocity.x = this.isBeingPushed ? 0 : this.speed;
            }
            if (typeof this.body.velocity.y !== 'number' || isNaN(this.body.velocity.y)) {
                this.body.velocity.y = 0;
            }

            // Limitar velocidad X
            this.body.velocity.x = Phaser.Math.Clamp(this.body.velocity.x, -650, 650);
        
            // Limitar velocidad Y
            this.body.velocity.y = Phaser.Math.Clamp(this.body.velocity.y, -650, 650);
        }
    }

    handleAnimations() {
        if (!this.body) return;

        // Mostrar siempre animación de hurt si está herido
        if (this.isHurt) {
            if (this.anims.currentAnim?.key !== 'mario_hurt') {
                this.play('mario_hurt', true);
            }
            return; // Salir inmediatamente - no permitir otras animaciones
        }
        
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
                if (this.footstepCooldown <= 0) {
                    if (!this.paso1.isPlaying && !this.paso2.isPlaying) {
                        if (this.nextFootstep === 1) {
                            this.paso1.play();
                            this.nextFootstep = 2;
                    } else {
                        this.paso2.play();
                        this.nextFootstep = 1;
                    }
                    }
                this.footstepCooldown = 300;
                }
            } else {
                if (this.anims.currentAnim?.key !== 'mario_idle') {
                    this.play('mario_idle', true);
                }
            }
        }
    }

    // Resetear estados
    resetStates() {
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
        this.hasWon = false;
        this.setScale(this.base.scaleX, this.base.scaleY);
        this.isSuperSize = false;
        this.deactivatePowerUp();
    }
    
    setInvincible(durationMs) {

        if (this.isInvincible) {
            this.invTimer.remove(false);
        }

        this.isInvincible = true;
        this.activePowerUp = POWERUP_TYPES.STAR;
        this.scene.levelMusic.pause();
        this.starman.play();
        const rainbowColors = [
            0xFF0000, // Rojo
            0xFF7F00, // Naranja
            0xFFFF00, // Amarillo
            0x00FF00, // Verde
            0x0000FF, // Azul
            0x4B0082, // Índigo
            0x8B00FF // Violeta
        ];

        let colorIndex = 0;

        this.invEvent = this.scene.time.addEvent({
            delay: 100,
            loop: true,
            callback: () => {
                this.setTint(rainbowColors[colorIndex]);
                colorIndex = (colorIndex + 1) % rainbowColors.length;
            }
        });

    const warningTime = 1000; // 3 segundos antes del final
    const timeUntilWarning = durationMs - warningTime;
    
    this.warningTimer = this.scene.time.delayedCall(timeUntilWarning, () => {
        // Crear y reproducir el sonido de advertencia si no existe
        if (!this.starEndingSound) {
            this.starEndingSound = this.scene.sound.add('starEnding');
        }
        this.starEndingSound.play();
    });

        this.invTimer = this.scene.time.delayedCall(durationMs, () => {
           this.deactivatePowerUp();
        });
    }

    enableHammer() {

    }

    enableDoubleJump() {
    
    }

    enableDash(){

    }

    enableHighJump(){

    }

    deactivatePowerUp(){
       // 1. Cancelar eventos de la estrella (arcoíris)
        if (this.invEvent?.remove){
            this.invEvent.remove(false);
            this.invEvent = null;
        } 

        if (this._invTimer?.remove){
            this._invTimer.remove(false);
            this._invTimer = null;
        } 

        if (this.warningTimer?.remove){
            this.warningTimer.remove(false);
            this.warningTimer = null;
        }

        if (this.starman && this.starman.isPlaying) {
            this.starman.stop();
        }
        if (this.starEndingSound && this.starEndingSound.isPlaying) {
            this.starEndingSound.stop();
        }
        if (this.scene.levelMusic && this.scene.levelMusic.isPaused) {
            this.scene.levelMusic.resume();
        }


        // 2. Restaurar apariencia
        this.clearTint();
        this.alpha = 1;

        // 3. Restaurar tamaño si había super size
        if (this.activePowerUp === 'mushroom' && this._baseBody) {
            this.setScale(this.base.scaleX, this.base.scaleY);
            this.body.setSize(this._baseBody.w, this._baseBody.h, true);
            this.body.setOffset(this._baseBody.ox, this._baseBody.oy);
            this.isSuperSize = false;
        }

        // 4. Resetear flags y multiplicadores
        this.isInvincible = false;
        this.hammerEnabled = false;
        this.doubleJumpEnabled = false;
        this.doubleJumpAvailable = false;
        this.dashMultiplier = 1;
        this.highJumpMultiplier = 1;

        // 5. Restaurar velocidad y salto base
        this.speed = this.base.speed;
        this.minJumpVelocity = this.base.minJumpVelocity ?? this.base.jumpForce ?? this.minJumpVelocity;
        this.maxJumpVelocity = this.base.maxJumpVelocity ?? this.maxJumpVelocity;

        // 6. Limpieza final
        this.activePowerUp = null;
    }

    enableSuperSize(){
        // evita duplicar power-ups
        if (this.isSuperSize) {
            // aquí podrías sumar puntos, etc.
            return;
        }
        this.powerUpSound.play();
        const k = this.scaleMultiplier;
        this.activePowerUp = POWERUP_TYPES.MUSHROOM;
        this.isSuperSize = true;

        // Escala visual
        this.setScale(this.base.scaleX * k, this.base.scaleY * k);
    }
}
export default Mario;