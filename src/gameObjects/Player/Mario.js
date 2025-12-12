/**
 * Importación de los tipos de PowerUps
 * @module PowerUps/PowerUps
 */
import { POWERUP_TYPES } from "../PowerUps/PowerUps.js";

/**
 * Importación del controlador del estado de burbuja
 * @module Bubble
 */
import PlayerBubbleController from "./Bubble.js";

/**
 * Importación del controlador de PowerUps
 * @module PowerUpController
 */
import PowerUpController from "./PowerUpController.js";


/**
 * Importación de las categorías de colisión correspondientes
 * @module collisionCategories
 */
import{
    CATEGORY_PLAYER,
    CATEGORY_ENEMY,
    CATEGORY_POWERUP,
    CATEGORY_TERRAIN,
    CATEGORY_SENSOR
} from "../collisionCategories.js"
/**
 * Clase principal del jugador (Mario)
 * @extends Phaser.GameObjects.Sprite
 */

class Mario extends Phaser.GameObjects.Sprite
{
    /**
     * Constructor de la clase Mario
     * @param {Phaser.Scene} scene - Escena a la que pertenece
     * @param {number} x - Posición X inicial
     * @param {number} y - Posición Y inicial
     * @param {string} texture - Textura/animación base
     * @param {number} [speed=200] - Velocidad base de movimiento horizontal
     * @param {number} [jumpForce=-225] - Fuerza base del salto (negativa hacia arriba)
     * @param {boolean} [flipHorizontal=true] - Si el sprite debe voltearse horizontalmente
     * @param {boolean} [inBoss=false] - Si está en un nivel de jefe (cambia animaciones)
     * 
     * @property {PlayerBubbleController} bubble - Controlador del estado de burbuja
     * @property {PowerUpController} powerUps - Controlador de power-ups
     * @property {boolean} isGrounded - Indica si está tocando el suelo
     * @property {boolean} isInBubble - Indica si está en estado de burbuja
     * @property {string|null} activePowerUp - Tipo de power-up activo actualmente
     */
    constructor(scene, x, y, texture, speed = 200, jumpForce = -225, flipHorizontal = true, inBoss=false) {
        super(scene, x, y, texture);
        
        scene.add.existing(this);
        scene.matter.add.gameObject(this);
        
        // Propiedades esenciales
        this.speed = speed; // Velocidad del jugador

        // Estados del jugador
        this.isGrounded = true; // Controlar si está en el suelo
        this.wasGrounded = false; // Para rastrear el estado anterior
        this.canEnemyJump = false; // Para no poder saltar en más enemigos
        this.isStopped = false; // Controlar si está detenido
        this.isBeingPushed = false; // Indica si está siendo empujado
        this.isInvulnerable = false; // Controlar la invulnerabilidad temporal
        this.bubble = new PlayerBubbleController(this);
        this.powerUps = new PowerUpController(this);
        this.bubblePhase = 0; // 0: no burbuja, 1: espera, 2: movimiento fase1, 3: fase2
        this.isInBubble = false; // Controlar si está en la burbuja
        this.canDrop = false; // Indica si puede salir de la burbuja
        this.bubblesLeft = 2; // Número de burbujas restantes
        this.slop = 0;

        this.canSunJump = false;
        this.inImpulse=false;
        this.inBoss = inBoss;

        // Sistema de salto
        this.isJumping = false; // Indica si está en proceso de salto
        this.isHoldingJump = false; // Indica si está manteniendo el botón de salto
        this.jumpStartTime = 0; // Momento en que se inició el salto
        this.maxJumpHoldTime = 290; // Tiempo máximo que se puede mantener el salto en ms

        // Control del salto
        this.jumpVelocity = 0; // Velocidad de salto
        this.maxJumpVelocity = jumpForce; // Velocidad máxima hacia arriba
        this.minJumpVelocity = -1.0; // Velocidad mínima hacia arriba
        this.jumpAcceleration = -8.0; // Aceleración hacia arriba durante el salto
        
        // Coyote time
        this.coyoteTime = 50; // Tiempo en ms para permitir salto después de dejar el suelo (50 ms)
        this.coyoteTimeCounter = 0; // Contador para el coyote time
        this.enemyCoyoteTime = 1; // Tiempo en ms para permitir salto después de saltar encima de un enemigo (20 ms)

        // Control de entrada
        this.jumpRequested = false;
        this.jumpHeld = false;

        // Buffer de salto
        this.hasBufferedJump = false; // Indica si hay un salto en buffer
        this.wasHoldingJumpWhenBuffered = false; // Recordar si se estaba manteniendo el botón cuando se activó el buffer

        if (flipHorizontal) {
            this.flipX = true; // Voltear horizontalmente
        }

        //Sensores
        this.blocked = {
            left: false,
            right: false,
            bottom: false,
            up: false
        },

        this.numTouching = {
            left: 0,
            right: 0,
            bottom: 0,
            up:0
        };

        // MatterBody
        // this.setBody({
        //     type:'rectangle',
        //     width:this.width,
        //     height:this.height,
        // },{label:'mario',chamfer:{radius:10}})

        const sx = this.width/2;
        const sy = this.height/2;
        const w = this.width;
        const h = this.height;
        const M = Phaser.Physics.Matter.Matter;
        this.playerBody = M.Bodies.rectangle(sx,sy, w * 0.75, h, { chamfer: { radius: 10 }, label:"Mario" });
        this.sensors = {
            bottom: M.Bodies.rectangle(sx, sy+h/2, w*0.6, 8, { isSensor: true, label:"Mario" }),
            left: M.Bodies.rectangle(sx - w * 0.5, sy / 1.2, 5, h * 0.6, { isSensor: true, label:"Mario" }),
            right: M.Bodies.rectangle(sx + w * 0.5, sy / 1.2, 5, h * 0.6, { isSensor: true, label:"Mario" }),
        };

        const compoundBody = M.Body.create({
        parts: [this.playerBody,this.sensors.bottom, this.sensors.left, this.sensors.right],
        friction: 0,
        frictionAir: 0,
        restitution: 0.1, // El jugador no se pega a paredes
        label: "Mario"
        });

        this.body.label="Mario";
        this.setExistingBody(compoundBody);
        this.setCollisionCategory(CATEGORY_PLAYER);
        this.setCollidesWith([CATEGORY_TERRAIN, CATEGORY_ENEMY, CATEGORY_POWERUP, CATEGORY_SENSOR]);
        // Configuración de física
        if (this.body) {
            this.setFriction(0);
            this.setFrictionAir(0.02);
            this.setBounce(0.05);
            
            this.setVelocityX(this.speed);
            //     this.body.setGravityY(700);
            // this.setCollideWorldBounds(false); // Desactivar colisión con bordes del mundo

            //     // Asegurar que el cuerpo es dinámico y puede colisionar
            //     this.body.setImmovable(false);
            this.setStatic(false);
            // El cuerpo a la posición inicial
            M.Body.setPosition(compoundBody, { x, y });

            // Asociamos el cuerpo al sprite
            this.setPosition(x, y); // sincronizar la posición del sprite
            this.setFixedRotation();
        }
        this.body.moves = true;
        //     // Mejorar la detección de colisiones
        this.body.onWorldBounds = true;
        // }
        this.setBounce(0); // optional
        this.setFriction(0.05);
        this.setFixedRotation(); // Mario won't spin on collision
        this.setIgnoreGravity(false); // default false, so gravity applies


        
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

        // if(this.body){
        //     this.baseBody = {
        //         w: this.body.width,
        //         h: this.body.height,
        //         offsetX: this.body.offset.x || 0,
        //         offsetY: this.body.offset.y || 0
        //     };
        // }

        // this.body.setSize(
        //     this.baseBody.w * this.base.scaleX,
        //     this.baseBody.h * this.base.scaleY
        // );

        // Daño
        this.warningTimer = null;
        this.blinkEvent = null;

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

        // Configurar colisión con los bordes del mundo
        this.setUpWorldBoundsCollision();

        // Configurar entrada del ratón para saltar
        this.setupMouseInput();
    }
    
    /**
     * Configura la entrada de ratón para controlar el jugador.
     */
    setupMouseInput() {
        // Limpiar eventos previos
        this.scene.input.off('pointerdown');
        this.scene.input.off('pointerup');
        
        if (!this.contextMenuDisabled) {
        this.contextMenuDisabled = true;

            if (this.scene.input.mouse && this.scene.input.mouse.disableContextMenu) {
                this.scene.input.mouse.disableContextMenu();
            }

            else {
                // Opción navegador estándar
                window.addEventListener("contextmenu", (e) => e.preventDefault());
            }
        }

        // Al presionar el ratón
        this.scene.input.on('pointerdown', (pointer) => {
                        
            if ((pointer.leftButtonDown() && this.scene.scene.isActive()))
            {
                // Si está en burbuja y puede salir, manejar la salida
                if (this.isInBubble && this.canDrop) {
                    this.scene.sound.play("bubblePop");
                    this.bubble.exitBubbleState();
                    return;
                }
                // Comportamiento normal de salto
                if (!this.isInBubble) {
                    this.canSunJump = true;
                    // console.log("on");
                    this.scene.time.delayedCall(100, ()=>{this.canSunJump=false;/*console.log("off")*/});
                    if (this.inImpulse)
                    {
                        return;
                    }
                    this.jumpRequested = true;
                    this.jumpHeld = true;
                    // Activar el buffer de salto cuando se presiona el botón en el aire
                    if (!this.isGrounded) {
                        this.hasBufferedJump = true;
                        this.wasHoldingJumpWhenBuffered = true; // Recordar que se estaba manteniendo el botón
                    }
                }
            }
            if (pointer.rightButtonDown()) {
                if (this.canThrowHammer) {
                    this.powerUps.tryThrowHammer();
                    // this.tryThrowHammer();
                }
            }
        });

        // Al soltar el ratón
        this.scene.input.on('pointerup', (pointer) => {
            if (this.scene.scene.isActive() && !this.isInBubble) {
                this.jumpHeld = false;
                this.isHoldingJump = false;
                // Si se suelta el botón, marcar que ya no se está manteniendo para el buffer
                this.wasHoldingJumpWhenBuffered = false;
            }
        });
    }

    /**
     * Maneja la lógica del salto del jugador
     * @param {number} time - Tiempo actual del juego
     * @param {number} delta - Tiempo transcurrido desde el último frame
     */
    handleJump(time, delta) {
        if(this.inImpulse) {
            return;
        }
        this.isStopped = false;

        const canGroundJump = this.isGrounded || this.canEnemyJump || this.coyoteTimeCounter > 0;
        
        const canDoubleJump = this.canDoubleJump && !this.isGrounded && !this.hasDoubleJumped && !this.isInBubble;

        // Manejar inicio del salto desde buffer si está disponible solo si todavía se está manteniendo el botón
        if (this.hasBufferedJump && this.wasHoldingJumpWhenBuffered) {
            if (canGroundJump) {
                this.startJump(time)
                this.hasDoubleJumped = false; // Resetear doble salto al usar el buffer para salto desde suelo
            };

            this.hasBufferedJump = false;
            this.wasHoldingJumpWhenBuffered = false;
        }
        // Manejar inicio del salto normal
        if (this.jumpRequested) {
            if (canGroundJump && !this.inImpulse) {
                this.startJump(time);
                this.hasDoubleJumped = false; // Resetear doble salto al saltar desde suelo
                this.hasBufferedJump = false; // Limpiar el buffer también en salto normal
                this.wasHoldingJumpWhenBuffered = false;
            }
            else if (canDoubleJump) {
                this.startJump(time);
                this.hasDoubleJumped = true;
            }
        }
        
        // Aplicar fuerza de salto progresiva mientras se mantiene presionado y no está chocando por arriba
        if (this.isJumping && this.jumpHeld && this.isHoldingJump) {
            this.applyProgressiveJumpForce(time, delta);
        }

        // Resetear el booleano de solicitud
        this.jumpRequested = false;
    }

    /**
     * Inicia un salto desde el suelo o usando doble salto
     * @param {number} time - Tiempo actual del juego
     */
    startJump(time) {
        // Iniciar el salto con velocidad mínima
        this.jumpVelocity = this.minJumpVelocity;
        this.setVelocityY(this.jumpVelocity);
        
        this.isGrounded = false; // Ya no está en el suelo
        // this.canEnemyJump = false;
        this.isJumping = true;
        this.isHoldingJump = true;
        this.jumpStartTime = time;

        this.coyoteTimeCounter = 0; // Consumir coyote time al ejecutar el salto
        
        this.hasBufferedJump = false; // Limpiar el buffer al iniciar el salto
        this.wasHoldingJumpWhenBuffered = false;
        this.jumpSound.play();
        if (this.scene.anims.exists('mario_jump') && !this.isGrounded && !this.inBoss) {
            this.play('mario_jump', true);
        }
        else if (this.scene.anims.exists('mario_panicjump') && !this.isGrounded)
        {
            this.play('mario_panicjump', true);
        }

        // Reanudar movimiento horizontal al saltar
        if (this.isStopped) {
            this.resume();
        }
    }

    /**
     * Aplica fuerza de salto progresiva mientras se mantiene presionado
     * @param {number} time - Tiempo actual del juego
     * @param {number} delta - Tiempo transcurrido desde el último frame
     */
    applyProgressiveJumpForce(time, delta) {
        const holdTime = time - this.jumpStartTime;
        
        // Si aún está dentro del tiempo máximo de salto
        if (holdTime <= this.maxJumpHoldTime) {
            // Aplicar aceleración hacia arriba mientras se mantiene presionado
            this.jumpVelocity += this.jumpAcceleration * (delta / 1000);
            
            // Limitar la velocidad máxima
            this.jumpVelocity = Phaser.Math.Clamp(this.jumpVelocity, -650, this.maxJumpVelocity);
            
            // Aplicar la velocidad calculada
            this.setVelocityY(this.jumpVelocity);
        } else {
            // Tiempo máximo alcanzado
            this.isHoldingJump = false;
        }
    }

    /**
     * Activa el estado de empuje (cuando es dañado)
     */
    startPush() {
        this.isBeingPushed = true;
        this.isStopped = true; // También detener el movimiento automático
    }

    /**
     * Desactiva el estado de empuje
     */
    endPush() {
        this.isBeingPushed = false;
        this.isStopped = false;
        this.isHurt = false; // Asegurar que ya no está en estado hurt
        
        // Reanudar movimiento normal
        if (this.body && !this.blocked.right) {
            this.resume();
        }
    }

    /**
     * Reanuda el movimiento automático del jugador
     */
    resume() {
        this.isStopped = false;
        if (this.body) {
            this.setVelocityX(this.speed);
        }
        if (!this.isJumping && this.scene.anims.exists('mario_run') && !this.inBoss) {
            this.play('mario_run', true);
        }
        else if (!this.isJumping && this.scene.anims.exists('mario_panicrun'))
        {
            this.play('mario_panicrun', true);
        }
    }

    /**
     * Detiene el movimiento del jugador
     */
    stop() {
        this.isStopped = true;
        if (this.body) {
            this.setVelocityX(0);
        }
        // Cambiar a animación idle cuando se detiene
        if (this.scene.anims.exists('mario_idle') && this.isGrounded) {
            this.play('mario_idle', true);
        }
        else if(this.scene.anims.exists('mario_fall') && !this.inBoss){
            this.play('mario_fall', true);
        }
        else if (this.scene.anims.exists('mario_panicfall') && this.inBoss)
        {
            this.play('mario_panicfall', true);
        }
    }
    
    /**
     * Activa la animación de victoria
     */
    win() {
        this.hasWon = true;
        // Cambiar a animación idle cuando se detiene
        this.play('mario_stop', true);
    }
    

    /**
     * Activa la animación de daño
     */
    hurt() {
        this.isHurt = true;

        // Cambiar a animación idle cuando se detiene
        this.play('mario_hurt', true);
        if (this.starman)
        {
            this.starman.stop();
        }
        if (this.starEndingSound)
        {
        this.starEndingSound.stop();
        }
    }

    /**
     * Aplica daño al jugador con efectos visuales y físicos
     * @param {number} pushDirection - Dirección del empuje (-1 izquierda, 1 derecha)
     */
    takeDamage(pushDirection) {
        // Si ya es invencible (estrella) o está en ventana de daño, ignorar
        if (this.isInvincible || this.isInvulnerable) {
            return;
        }

        // Configurar tiempos
        const PUSH_DURATION = 200; // Tiempo de empuje
        const EXTRA_INVULNERABILITY = 1550; // Tiempo extra durante el que Mario es invulnerable
        const TOTAL_INVULNERABILITY = PUSH_DURATION + EXTRA_INVULNERABILITY; // Tiempo total: Tiempo de empuje + Tiempo extra de invulnerabilidad

        const hasMushroom = this.isSuperSize || this.activePowerUp === POWERUP_TYPES.MUSHROOM;
        const hasNonMushroomPower =
            this.activePowerUp &&
            this.activePowerUp !== POWERUP_TYPES.MUSHROOM &&
            this.activePowerUp !== POWERUP_TYPES.STAR;

        // ---- Gestión de estados de power-ups ----
        if (hasNonMushroomPower) {
            // Tenías martillo / doble salto / dash / botas
            // → Pierdes ese power-up ofensivo, pero te quedas como Super Mario
            this.powerUps.deactivatePowerUp({ keepSize: true });

            // Nos aseguramos de marcar que ahora estás en estado "solo champiñón"
            if (hasMushroom || this.isSuperSize) {
                this.isSuperSize = true;
                this.activePowerUp = POWERUP_TYPES.MUSHROOM;
            }
        }
        
        // Desactivar el estado de super tamaño si estaba activo
        if (!this.isSuperSize && !this.isInBubble) {
            this.hurtSound.play();
        } else if (!this.isInBubble) {
            // Solo champiñón → lo pierdes y te quedas pequeño
            this.powerUps.deactivatePowerUp({ keepSize: false });
            this.hurtSound.play();
        } 

        // ---- Empuje y ventana de invulnerabilidad ----
        this.hurt();

        this.startPush();
        this.isInvulnerable = true;

        // Empujar a Mario hacia la izquierda
        const pushSpeed = Phaser.Math.Clamp(15, -40, 40); // Velocidad alta para el empuje
        this.setVelocityX(0);
        this.setCollidesWith([CATEGORY_TERRAIN,CATEGORY_SENSOR]);


        // Parpadeo visual
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
            if (this.isHurt) {
                this.isHurt = false;
            }
            this.setCollidesWith([CATEGORY_TERRAIN, CATEGORY_ENEMY, CATEGORY_POWERUP,CATEGORY_SENSOR]);
        });
    }

    /**
     * Activa el estado de burbuja
     */
    Bubble() {
        this.bubble.Bubble();
    }

    /**
     * Actualización principal del jugador cada frame
     * @param {number} time - Tiempo actual del juego
     * @param {number} delta - Tiempo transcurrido desde el último frame
     */
    update(time, delta) {
        const dt = delta / 16.666;
        // Verificación de seguridad
        if (!this.body || !this.scene) {
            return;
        }
        
        // Si está herido, no procesar otras lógicas
        if (this.isHurt) {
            // Solo mantener la animación de hurt y salir
            this.handleAnimations();
            return;
        }

        // Lógica de burbuja primero
        this.bubble.update(time, delta);

        // ↓ SI ESTÁ EN BURBUJA YA RETORNÓ, tu código sigue normal ↓
        if (this.isInBubble) return;

        if (this.footstepCooldown > 0) {
            this.footstepCooldown -= delta;
        }

        const previousGrounded = this.isGrounded;

        // Manejar el salto
        this.handleJump(time, delta);
        
        // Si está detenido
        if (this.isStopped) {
            if (this.body && !this.blocked.right) {
                this.resume();
            }
            return;
        }

        // Manejo de animaciones
        this.handleAnimations();


        if (this.body && !this.isHurt && !this.hasWon) {
            // Solo aplicar velocidad hacia la derecha si no está siendo empujado y no está en la burbuja
            if (!this.isBeingPushed && !this.isInBubble) {
                this.setVelocityX(this.speed);
            }

            if (this.isGrounded) {
                this.coyoteTimeCounter = this.coyoteTime; // Resetear cuando está en suelo
                // Solo resetear estados de salto si no está actualmente saltando
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
            if (this.blocked.right) {
                this.stop();
            }
        }

        // Limitar velocidades después de todas las actualizaciones
        if (this.body && !this.isHurt && !this.isInBubble) {
            // Asegurar que las velocidades sean números válidos
            if (typeof this.body.velocity.x !== 'number' || isNaN(this.body.velocity.x)) {
                this.setVelocityX(this.isBeingPushed ? 0 : this.speed);
            }
            if (typeof this.body.velocity.y !== 'number' || isNaN(this.body.velocity.y)) {
                this.setVelocityY(0);
            }

            // Limitar velocidad X
            this.setVelocityX(Phaser.Math.Clamp(this.body.velocity.x, -650, 650));
        
            // Limitar velocidad Y
            this.setVelocityY(Phaser.Math.Clamp(this.body.velocity.y, -650, 650));
        }
    }

    /**
     * Maneja las animaciones del jugador según su estado
     */
    handleAnimations() {
        if (!this.body) return;

        // Mostrar siempre animación de burbuja si está en la burbuja
        if (this.isInBubble) {
            this.setScale(this.base.scaleX, this.base.scaleY);
            if (this.anims.currentAnim?.key !== 'mario_bubble') {
                this.play('mario_bubble', true);
            }
            return; // Salir inmediatamente - no permitir otras animaciones
        }

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
                if (this.anims.currentAnim?.key !== 'mario_jump' && !this.isGrounded && !this.inBoss) {
                    this.play('mario_jump', true);
                }
                else if (this.anims.currentAnim?.key !== 'mario_panicjump' && !this.isGrounded&&this.inBoss)
                {
                    this.play('mario_panicjump', true);
                }
                return; // Salir temprano - no verificar otras animaciones
            }
            // Cayendo (velocidad Y positiva)
            else if (this.body.velocity.y > 0) {
                if (this.anims.currentAnim?.key !== 'mario_fall' && !this.isGrounded && !this.inBoss) {
                    this.play('mario_fall', true);
                }
                else if (this.anims.currentAnim?.key !== 'mario_panicfall' && !this.isGrounded&&this.inBoss)
                {
                    this.play('mario_panicfall', true);
                }
                return; // Salir temprano - no verificar otras animaciones
            }
        }
    
        // Animaciones en el suelo
        if (this.isGrounded) {
            if (this.body.velocity.x !== 0 && !this.isStopped) {
                if (this.anims.currentAnim?.key !== 'mario_run' && !this.inBoss) {
                    this.play('mario_run', true);
                }
                else if(this.anims.currentAnim?.key !== 'mario_panicrun'&&this.inBoss){
                    this.play('mario_panicrun', true);
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
                else if (this.anims.currentAnim?.key !== 'mario_fall' && !this.isGrounded && !this.inBoss)
                {
                    this.play('mario_fall', true);
                }
                else if (this.anims.currentAnim?.key !== 'mario_fall' && !this.isGrounded&&this.inBoss)
                {
                    this.play('mario_panicfall', true);   
                }
            }
        }
    }

    /**
     * Configura los límites del mundo para colisiones
     */
    setUpWorldBoundsCollision() {
        const world = this.scene.matter.world;

        // Por si acaso se vuelve a crear el jugador, limpiamos listeners antiguos
        world.off('beforeupdate', this.handleBeforeUpdate, this);
        world.off('collisionactive', this.handleCollisionActive, this);
        world.off('afterupdate', this.handleAfterUpdate, this);

        world.on('beforeupdate', this.handleBeforeUpdate, this);
        world.on('collisionactive', this.handleCollisionActive, this);
        world.on('afterupdate', this.handleAfterUpdate, this);
    }

    /**
     * Resetea contadores de sensores antes de la actualización
     * @param {Object} event - Evento de beforeupdate
     */
    handleBeforeUpdate(event) {
        // Resetear contadores de sensores antes de la actualización
        this.numTouching.left = 0;
        this.numTouching.right = 0;
        this.numTouching.bottom = 0;
    }

    /**
     * Verifica si un cuerpo es terreno
     * @param {MatterJS.Body} body - Cuerpo a verificar
     * @returns {boolean} True si es terreno
     */
    isTerrain(body) {
        return (body.collisionFilter.category & CATEGORY_TERRAIN) !== 0;
    }

    /**
     * Maneja colisiones activas con sensores
     * @param {Object} event - Evento de collisionactive
     */
    handleCollisionActive(event) {
        for (let i = 0; i < event.pairs.length; i++)
        {
            const bodyA = event.pairs[i].bodyA;
            const bodyB = event.pairs[i].bodyB;

            // Saltar si uno de los cuerpos es el jugador
            if (bodyA === this.playerBody || bodyB === this.playerBody)
            {
                continue;
            }

            // verificamos si esta tocando suelo
            if ((bodyA === this.sensors.bottom && this.isTerrain(bodyB) && bodyB.isStatic)
                || (bodyB === this.sensors.bottom && this.isTerrain(bodyA) && bodyA.isStatic))
            {
                // Contar cualquier superficie como suelo (por ejemplo, saltar sobre una caja no estática).
                this.numTouching.bottom += 1;
            }

            // verificamos si esta tocando pared izquierda
            if ((bodyA === this.sensors.left && bodyB.isStatic && this.isTerrain(bodyB)) || 
            (bodyB === this.sensors.left && bodyA.isStatic && this.isTerrain(bodyA)))
            {
                // Solo los objetos estáticos cuentan ya que no queremos ser bloqueados por un objeto que
                // podemos empujar.
                this.numTouching.left += 1;
            }

            // verificamos si esta tocando pared derecha
            if ((bodyA === this.sensors.right && bodyB.isStatic && this.isTerrain(bodyB)) || 
            (bodyB === this.sensors.right && bodyA.isStatic && this.isTerrain(bodyA)))
            {
                this.numTouching.right += 1;
            }
        };
    }

    /**
     * Actualiza estados después de las colisiones
     * @param {Object} event - Evento de afterupdate
     */
    handleAfterUpdate(event) {
        // Actualizar estados de bloqueo basados en sensores
        this.blocked.right = this.numTouching.right > 0;
        this.blocked.left = this.numTouching.left > 0;
        this.blocked.bottom = this.numTouching.bottom > 0;

        // Actualizar si está en el suelo
        this.isGrounded = this.blocked.bottom;
    }

    /**
     * Resetea todos los estados del jugador a valores iniciales
     */
    resetStates() {
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
        this.bubblePhase = 0;
        this.isInBubble = false;
        this.canDrop = false;
        this.bubblesLeft = 2;
        this.setScale(this.base.scaleX, this.base.scaleY);
        this.isSuperSize = false;
        this.powerUps.deactivatePowerUp();
    }
}
export default Mario;