import { POWERUP_TYPES } from "./PowerUps.js";

class Mario extends Phaser.GameObjects.Sprite
{
    constructor(scene, x, y, texture, speed = 200, jumpForce = -225, flipHorizontal = true) {
        super(scene, x, y, texture);
        
        scene.add.existing(this);
        scene.matter.add.gameObject(this);
        
        // Propiedades esenciales
        this.speed = speed; // Velocidad del jugador

        // Estados del jugador
        this.isGrounded = false; // Controlar si está en el suelo
        this.wasGrounded = false; // Para rastrear el estado anterior
        this.isStopped = false; // Controlar si está detenido
        this.canJump = true; // Controlar si puede saltar
        this.isBeingPushed = false; // Indica si está siendo empujado
        this.isInvulnerable = false; // Controlar la invulnerabilidad temporal
        this.bubblePhase = 0; // 0: no burbuja, 1: espera, 2: movimiento fase1, 3: fase2
        this.isInBubble = false; // Controlar si está en la burbuja
        this.canDrop = false; // Indica si puede salir de la burbuja
        this.bubblesLeft = 2; // Número de burbujas restantes

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
        this.playerBody = M.Bodies.rectangle(sx,sy, w * 0.75, h, { chamfer: { radius: 10 } });
        this.sensors = {
            bottom: M.Bodies.rectangle(sx, h, sx, 5, { isSensor: true }),
            left: M.Bodies.rectangle(sx-w*0.45, sy, 5, h*0.25, { isSensor: true }),
            right: M.Bodies.rectangle(sx+w*0.45, sy, 5, h*0.25, { isSensor: true }),
            up: M.Bodies.rectangle(sx, -h/sy, sx, 5, { isSensor: true })
        };

        const compoundBody = M.Body.create({
        parts: [this.playerBody,this.sensors.bottom, this.sensors.left, this.sensors.right/*, this.sensors.up*/],
        friction: 0,
        frictionAir: 0,
        restitution: 0.05 // El jugador no se pega a paredes
        });

        this.setExistingBody(compoundBody);
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
            this.setExistingBody(compoundBody);
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

        // Configurar colisión con los bordes del mundo
        this.setUpWorldBoundsCollision();
    }

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

    handleBeforeUpdate(event) {
        // Resetear contadores de sensores antes de la actualización
        this.numTouching.left = 0;
        this.numTouching.right = 0;
        this.numTouching.bottom = 0;
        this.numTouching.up = 0;
    }

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
            if (bodyA === this.sensors.bottom || bodyB === this.sensors.bottom)
            {
                // Contar cualquier superficie como suelo (por ejemplo, saltar sobre una caja no estática).
                this.numTouching.bottom += 1;
            }

            // verificamos si esta tocando pared izquierda
            if ((bodyA === this.sensors.left && bodyB.isStatic) || (bodyB === this.sensors.left && bodyA.isStatic))
            {
                // Solo los objetos estáticos cuentan ya que no queremos ser bloqueados por un objeto que
                // podemos empujar.
                this.numTouching.left += 1;
            }

            // verificamos si esta tocando pared derecha
            if ((bodyA === this.sensors.right && bodyB.isStatic) || (bodyB === this.sensors.right && bodyA.isStatic))
            {
                this.numTouching.right += 1;
            }

            // verificamos si esta tocando techo
            if ((bodyA === this.sensors.up && bodyB.isStatic) || (bodyB === this.sensors.up && bodyA.isStatic))
            {
                this.numTouching.up += 1;
            }
        };
    }

    handleAfterUpdate(event) {
        // Actualizar estados de bloqueo basados en sensores
        this.blocked.right = this.numTouching.right > 0;
        this.blocked.left = this.numTouching.left > 0;
        this.blocked.bottom = this.numTouching.bottom > 0;
        this.blocked.up = this.numTouching.up > 0;

        // Actualizar si está en el suelo
        this.isGrounded = this.blocked.bottom;
    }
    
    setupMouseInput() {
        // Limpiar eventos previos
        this.scene.input.off('pointerdown');
        this.scene.input.off('pointerup');

        // Al presionar el ratón
        this.scene.input.on('pointerdown', (pointer) => {
            if (pointer.leftButtonDown() && this.scene.scene.isActive()) {
                // Si está en burbuja y puede salir, manejar la salida
                if (this.isInBubble && this.canDrop) {
                    this.exitBubbleState();
                    return;
                }

                // Comportamiento normal de salto
                if (!this.isInBubble) {
                    this.jumpRequested = true;
                    this.jumpHeld = true;
                    // Activar el buffer de salto cuando se presiona el botón en el aire
                    if (!this.isGrounded) {
                        this.hasBufferedJump = true;
                        this.wasHoldingJumpWhenBuffered = true; // Recordar que se estaba manteniendo el botón
                }
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

    handleJump(time, delta) {
        // Manejar inicio del salto desde buffer si está disponible solo si todavía se está manteniendo el botón
        if (this.hasBufferedJump && (this.isGrounded || this.canJump) && this.wasHoldingJumpWhenBuffered) {
            this.startJump(time);
            this.hasBufferedJump = false;
            this.wasHoldingJumpWhenBuffered = false;
        }
        // Manejar inicio del salto normal
        if (this.jumpRequested && (this.isGrounded || (this.canJump)|| this.coyoteTimeCounter > 0)) {
            this.startJump(time);
            this.hasBufferedJump = false; // Limpiar el buffer también en salto normal
            this.wasHoldingJumpWhenBuffered = false;
        }
        
        // Aplicar fuerza de salto progresiva mientras se mantiene presionado y no está chocando por arriba
        if (this.isJumping && this.jumpHeld && this.isHoldingJump && !this.blocked.up) {
            this.applyProgressiveJumpForce(time, delta);
        }

        // Resetear el booleano de solicitud
        this.jumpRequested = false;
    }

    startJump(time) {
        // Iniciar el salto con velocidad mínima
        this.jumpVelocity = this.minJumpVelocity;
        this.setVelocityY(this.jumpVelocity);
        
        this.isGrounded = false; // Ya no está en el suelo
        this.canJump=false;
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
            this.setVelocityY(this.jumpVelocity);
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
        if (this.body && !this.blocked.right) {
            this.resume();
        }
    }

    // Reanudar movimiento
    resume() {
        this.isStopped = false;
        if (this.body) {
            this.setVelocityX(this.speed);
        }
        if (!this.isJumping && this.scene.anims.exists('mario_run')) {
            this.play('mario_run', true);
        }
    }

    // Detener el jugador
    stop() {
        this.isStopped = true;
        if (this.body) {
            this.setVelocityX(0);
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
        this.body.collisionFilter.mask = 1;

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
        const pushSpeed = Phaser.Math.Clamp(15, -40, 40); // Velocidad alta para el empuje
        this.setVelocityX(pushSpeed * pushDirection);

        // Actualizar el cuerpo físico después del cambio de posición
        // this.body.updateFromGameObject();
    
        // Restaurar hitbox original si existe
        if (this.baseBody && this.body) {
            this.setRectangle(w, h);
            // this.body.setSize(this.baseBody.w, this.baseBody.h);
            // this.body.setOffset(this.baseBody.offsetX, this.baseBody.offsetY);
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

    Bubble() {
        if (this.isInBubble) {
            return;
        }

        this.bubblesLeft -= 1;

        this.isInBubble = true;

        // Detener cualquier movimiento previo inmediatamente
        this.setVelocity(0, 0);
        // Detener el movimiento automático
        this.isStopped = true;
        if (this.body) {
            this.body.velocity.x = 0;
            this.body.velocity.y = 0;
            this.body.ignoreGravity = true;
        }

        this.enterBubbleState();
    }

    enterBubbleState() {
        const camera = this.scene.cameras.main;

        // 1. Marcar el estado inmediatamente
        this.isInBubble = true;
        this.canDrop = false;
        this.bubblePhase = 1;

        // 2. Detener inmediatamente todas las físicas
        this.setVelocity(0, 0);
        if (this.body) {
            this.body.ignoreGravity = true;
            this.setSensor(true);
            this.body.collisionFilter.mask = 0; // Desactivar completamente las colisiones
            // Forzar velocidad cero
            this.body.velocity.x = 0;
            this.body.velocity.y = 0;
        }

        // 3. Cambiar a textura de burbuja
        this.play('mario_bubble', true);

        // 4. Posicionar a Mario cerca del punto de caída
        const cameraViewHeight = camera.height / camera.zoom;
        let initialX = this.x;
        let initialY = this.y;

        initialX = Phaser.Math.Clamp(initialX, 100, this.scene.map.widthInPixels - 100);
        initialY = Phaser.Math.Clamp(initialY, 100, this.scene.map.heightInPixels + 100);

        this.x = initialX;
        this.y = initialY;

        // 5. Esperar 2500ms sin moverse (Fase 1 - Espera)
        this.scene.time.delayedCall(2500, () => {
            if (!this.isInBubble) return;
        
            this.bubblePhase = 2; // Fase 1 - Movimiento
        
            // 6. Movimiento diagonal
            this.setVelocityX(-9); // Velocidad hacia izquierda
            
            // Calcular velocidad Y para llegar a la posición Y objetivo (290)
            const targetY = 290; // Posición Y objetivo
            const currentY = this.y;

            // Calcular posición intermedia (90% del camino) para el movimiento constante
            const intermediateY = currentY + ((targetY - currentY) * 0.9);

            // Primer tween: movimiento constante (1000ms)
            this.scene.tweens.add({
                targets: this,
                y: intermediateY,
                duration: 1000,
                ease: 'Linear', // Movimiento completamente lineal/constante
                onUpdate: () => {
                    // Mantener velocidad X constante
                    if (this.x > 50) {
                        this.setVelocityX(-9);
                    } else {
                        this.setVelocityX(0);
                    }
                },
                onComplete: () => {
                    // Guardar velocidades iniciales
                    const startVelX = -9;
                    const endVelX = -2.45;

                    // Segundo tween: desaceleración (250ms)
                    this.scene.tweens.add({
                        targets: this,
                        y: targetY,
                        duration: 250,
                        ease: 'Cubic.Out',
                        onUpdate: (tween) => {
                            // Calcular progreso manualmente (0 a 1)
                            const progress = tween.progress;
            
                            // Interpolar velocidad X basada en el progreso
                            const currentVelX = startVelX + ((endVelX - startVelX) * progress);
            
                            // Aplicar velocidad
                            if (this.x > 50) {
                                this.setVelocityX(currentVelX);
                            } else {
                                this.setVelocityX(0);
                            }

                            // Actualizar cuerpo de Matter
                            if (this.body) {
                                const M = Phaser.Physics.Matter.Matter;
                                M.Body.setPosition(this.body, { 
                                    x: this.x, 
                                    y: this.y 
                                });
                            }
                        },
                        onComplete: () => {
                            if (this.isInBubble) {
                                this.startBubblePhase2();
                            }
                        }
                    });
                }
            });

            // 7. Permitir salir después de 400ms de empezar el movimiento
            this.scene.time.delayedCall(400, () => {
                if (this.isInBubble) {
                    this.canDrop = true;
                }
            });
        });
    }

    startBubblePhase2() {
        if (!this.isInBubble) return;

        this.bubblePhase = 3; // Fase 2
    
        // 1. Detener movimiento vertical inicial
        this.setVelocityY(0);
    
        // 2. Configurar velocidad horizontal inicial
        this.setVelocityX(-2.45);
    
        // 3. Configurar movimiento oscilatorio vertical
        this.bubbleOscillation = {
            amplitude: 40, // Amplitud de la oscilación
            frequency: 0.002, // Frecuencia de la oscilación
            baseY: this.y, // Posición base para la oscilación
            startTime: this.scene.time.now
        };

        // 4. Acelerar gradualmente después de 1500ms
        this.scene.time.delayedCall(1500, () => {
            if (this.isInBubble && this.bubblePhase === 3) {
                // Solo acelerar si no ha llegado al borde izquierdo
                if (this.x > 50) {
                    // Transición suave a mayor velocidad
                    this.scene.tweens.add({
                        targets: this.body.velocity,
                        x: -5.75,
                        duration: 1250, // Duración de la transición en ms
                        ease: 'Cubic.InOut',
                        onComplete: () => {
                            if (this.isInBubble && this.bubblePhase === 3) {
                                // Establecer velocidad constante después de la transición
                                this.setVelocityX(-5.75);
                            }
                        }
                    });
                }
            }
        });
    }

    exitBubbleState() {
        if (!this.isInBubble) {
            return;
        }
    
        // 1. Limpiar propiedades de la burbuja
        this.isInBubble = false;
        this.canDrop = false;
        this.bubblePhase = 0;
        this.bubbleOscillation = null;

        // 2. Reactivar el cuerpo físico
        if (this.body) {
            this.body.ignoreGravity = false; // Reactivar gravedad
            this.setSensor(false); // Restaurar colisiones normales
            this.body.collisionFilter.mask = 0xFFFFFFFF; // Máscara para colisionar con todo
        }
    
        // 3. Cambiar a animación de caída
        this.play('mario_fall', true);
    
        // 4. Asegurarse de que no sea superSize
        if (this.isSuperSize) {
            this.isSuperSize = false;
            this.setScale(this.base.scaleX, this.base.scaleY);
        }

        // 5. Resetear velocidades para caída
        this.setVelocityX(this.speed);
        this.setVelocityY(0);

        // 6. Posicionar a Mario en una posición segura
        this.x = Math.max(this.x, 50);
        this.y = Math.max(this.y, 100);

        // 7. Resetear estados de salto
        this.isJumping = false;
        this.isHoldingJump = false;
    }

    update(time, delta) {
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

        // Si está en burbuja, no ejecutar la lógica normal
        if (this.isInBubble) {
            // Forzar gravedad cero durante todo el estado de burbuja
            if (this.body) {
                this.body.ignoreGravity = true;

                // En fase 2 y 3, mantener la velocidad X constante si no hay tweens activos
                if (this.bubblePhase === 2 || this.bubblePhase === 3) {
                    // Solo aplicar si no está cerca del borde izquierdo
                    if (this.x > 50) {
                        // Mantener velocidad X mínima en fase 3
                        if (this.bubblePhase === 3 && this.body.velocity.x > -2.45) {
                            this.setVelocityX(-2.45);
                        }
                    } else {
                        // Detener al llegar al borde izquierdo
                        this.setVelocityX(0);
                    }
                
                    // Mantener velocidad Y en 0 para fase 3
                    if (this.bubblePhase === 3) {
                        // Mantener velocidad X constante si no está cerca del borde
                        if (this.x > 50) {
                            // Si ya ha completado la aceleración, mantener velocidad constante
                            const currentTime = this.scene.time.now;
                            if (currentTime - this.bubbleOscillation.startTime > 2500) { // 1500 + 1000 = 2500ms
                                this.setVelocityX(-5.75);
                            }
                        } else {
                            // Detener al llegar al borde izquierdo
                            this.setVelocityX(0);
                        }

                        this.setVelocityY(0);
                    }
                }
            }

            // Actualizar movimiento oscilatorio de la fase 2 de la burbuja
            if (this.bubblePhase === 3 && this.bubbleOscillation) {
                const elapsed = time - this.bubbleOscillation.startTime;
                
                // Aplicar oscilación vertical
                const oscillationY = Math.sin(elapsed * this.bubbleOscillation.frequency) * this.bubbleOscillation.amplitude;
                this.y = this.bubbleOscillation.baseY + oscillationY;
            }

            // Manejar animaciones
            this.handleAnimations();
            return; // Salir inmediatamente - no ejecutar física normal
        }

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

            // Si choca por arriba, cancelar el salto progresivo
            if (this.blocked.up) {
                this.isHoldingJump = false;
                // Ajustar la velocidad Y para que comience a caer inmediatamente
                if (this.body.velocity.y < 0) {
                    this.setVelocityY(0);
                }
            }
                // console.log(this.isGrounded);
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

    handleBeforeUpdate(event) {
        // Resetear contadores de sensores antes de la actualización
        this.numTouching.left = 0;
        this.numTouching.right = 0;
        this.numTouching.bottom = 0;
        this.numTouching.up = 0;
    }

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
            if (bodyA === this.sensors.bottom || bodyB === this.sensors.bottom)
            {
                // Contar cualquier superficie como suelo (por ejemplo, saltar sobre una caja no estática).
                this.numTouching.bottom += 1;
            }

            // verificamos si esta tocando pared izquierda
            if ((bodyA === this.sensors.left && bodyB.isStatic) || (bodyB === this.sensors.left && bodyA.isStatic))
            {
                // Solo los objetos estáticos cuentan ya que no queremos ser bloqueados por un objeto que
                // podemos empujar.
                this.numTouching.left += 1;
            }

            // verificamos si esta tocando pared derecha
            if ((bodyA === this.sensors.right && bodyB.isStatic) || (bodyB === this.sensors.right && bodyA.isStatic))
            {
                this.numTouching.right += 1;
            }

            // verificamos si esta tocando techo
            if ((bodyA === this.sensors.up && bodyB.isStatic) || (bodyB === this.sensors.up && bodyA.isStatic))
            {
                this.numTouching.up += 1;
            }
        };
    }

    handleAfterUpdate(event) {
        // Actualizar estados de bloqueo basados en sensores
        this.blocked.right = this.numTouching.right > 0;
        this.blocked.left = this.numTouching.left > 0;
        this.blocked.bottom = this.numTouching.bottom > 0;
        this.blocked.up = this.numTouching.up > 0;

        // Actualizar si está en el suelo
        this.isGrounded = this.blocked.bottom;
    }

    centerCameraOnPlayer() {
        // Obtener las dimensiones reales de la vista de la cámara considerando el zoom
        const camera = this.scene.cameras.main;
        const cameraViewWidth = camera.width / camera.zoom;
        const cameraViewHeight = camera.height / camera.zoom;

        // Seguimiento horizontal
        let targetX;

        // Establecer el objetivo de la cámara horizontalmente
        if (this.x < cameraViewWidth *0.25) {
            targetX = -200;
        }
        else if(Math.abs(this.body.velocity.x) < 1) {
            targetX = this.x - cameraViewWidth *0.66;
        }
        else {
            targetX = this.x - cameraViewWidth * 0.5;
        }

        // Seguimiento vertical
        let targetY;
    
        if (this.isInBubble) {
            // Cuando está en la burbuja, posicionar más alto en la pantalla
            targetY = this.y - cameraViewHeight * 0.4;
        } else {
            // Calcular la posición vertical ideal
            const baseTargetY = this.y - cameraViewHeight * 0.65;

            if (!this.isGrounded) {
                // Cuando salta, mantener la cámara un poco más alta
                targetY = this.y - cameraViewHeight * 0.7;
            } else {
                // Cuando está en el suelo, mantenerlo en la posición vertical ideal
                targetY = baseTargetY
            }
        }

        // Suavizado tipo "spring" con LERP para el movimiento suave
        const smoothFactorX = 0.1;  // Ajustar la suavidad horizontal
        const smoothFactorY = 0.05; // Ajustar la suavidad vertical

        // // Movimiento de la cámara suavizado
        // const dx = targetX - cam.scrollX;
        // const dy = targetY - cam.scrollY;

        // // Aplicar el suavizado con un Lerp (Interpolación lineal)
        // const moveX = cam.scrollX + dx * smoothFactorX;
        // const moveY = cam.scrollY + dy * smoothFactorY;

        camera.scrollX += (targetX-camera.scrollX)*smoothFactorX;
        camera.scrollY += (targetY-camera.scrollY)*smoothFactorY;
    }

    /*
    updateBlocked() {
        this.blocked.right = this.numTouching.right > 0;
        this.blocked.left = this.numTouching.left > 0;
        this.blocked.bottom = this.numTouching.bottom > 0;
        this.blocked.up = this.numTouching.up > 0;
        this.isGrounded = this.blocked.bottom;
    }

    resetTouching() {
        this.numTouching.left = 0;
        this.numTouching.right = 0;
        this.numTouching.bottom = 0;
        this.numTouching.up = 0;
    }

    handleCollisions(event) {
        for (let i = 0; i < event.pairs.length; i++) {
            const bodyA = event.pairs[i].bodyA;
            const bodyB = event.pairs[i].bodyB;

            // Detectar contacto con el suelo
            if (bodyA === this.sensors.bottom || bodyB === this.sensors.bottom) {
                const otherBody = bodyA === this.sensors.bottom ? bodyB : bodyA;
            
                // Solo contar como suelo si es estático o es un enemigo (para stomp)
                if (otherBody.isStatic || 
                    (otherBody.gameObject && 
                    (otherBody.gameObject instanceof Goomba || otherBody.gameObject instanceof Koopa))) {
                    this.numTouching.bottom += 1;
                }
            }

            // Detectar contacto con pared izquierda
            if ((bodyA === this.sensors.left && bodyB.isStatic) || 
                (bodyB === this.sensors.left && bodyA.isStatic)) {
                this.numTouching.left += 1;
            }

            // Detectar contacto con pared derecha  
            if ((bodyA === this.sensors.right && bodyB.isStatic) || 
                (bodyB === this.sensors.right && bodyA.isStatic)) {
                this.numTouching.right += 1;
            }
        }
    }
    */

    // Resetear estados
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
        this.deactivatePowerUp();
    }
    
    // --------------------------
    //  POWER-UP: ESTRELLA
    // --------------------------
    setInvincible(durationMs) {
        // Evitar reaplicar si ya está la estrella activa
        if (this.isInvincible) return;

        this.isInvincible = true;
        this.activePowerUp = POWERUP_TYPES.STAR;

        // Música
        if (!this.starman) {
            this.starman = this.scene.sound.add('starman', { loop: true, volume: 0.5 });
        }
        if (this.scene.levelMusic && this.scene.levelMusic.isPlaying) {
            this.scene.levelMusic.pause();
        }
        this.starman.play();

        // Efecto arcoíris
        const rainbowColors = [
            0xff0000, // rojo
            0xff7f00, // naranja
            0xffff00, // amarillo
            0x00ff00, // verde
            0x0000ff, // azul
            0x4b0082, // índigo
            0x8b00ff  // violeta
        ];
        let colorIndex = 0;

        if (this.invEvent?.remove) {
            this.invEvent.remove(false);
        }

        this.invEvent = this.scene.time.addEvent({
            delay: 100,
            loop: true,
            callback: () => {
                this.setTint(rainbowColors[colorIndex]);
                colorIndex = (colorIndex + 1) % rainbowColors.length;
            }
        });

        // Aviso de que se acaba la estrella
        const warningTime = 1000;
        const timeUntilWarning = durationMs - warningTime;

        if (this.warningTimer?.remove) {
            this.warningTimer.remove(false);
        }

        this.warningTimer = this.scene.time.delayedCall(timeUntilWarning, () => {
            if (!this.starEndingSound) {
                this.starEndingSound = this.scene.sound.add('starEnding');
            }
            this.starEndingSound.play();
        });

        // Cuando se acabe la estrella, desactivar power-up
        if (this.invTimer?.remove) {
            this.invTimer.remove(false);
        }

        this.invTimer = this.scene.time.delayedCall(durationMs, () => {
            this.deactivatePowerUp();
        });
    }

    // --------------------------
    //  POWER-UP: MARTILLO
    // --------------------------
    enableHammer() {
        // Aquí solo marcamos que puede lanzar martillo.
        // El click derecho lo gestionas en la escena usando this.canThrowHammer.
        this.canThrowHammer = true;
        // Por si quieres un sonido genérico de coger power-up
        this.powerUpSound?.play();
    }

    // --------------------------
    //  POWER-UP: DOBLE SALTO
    // --------------------------
    enableDoubleJump() {
        this.canDoubleJump = true;
        this.hasDoubleJumped = false; // se reseteará al tocar suelo
        this.powerUpSound?.play();
    }

    // --------------------------
    //  POWER-UP: DASH
    // --------------------------
    enableDash() {
        // Habilitamos la posibilidad de hacer dash, la lógica del dash
        // la disparas con el click derecho usando this.canDash / this.isDashing
        this.canDash = true;
        this.isDashing = false;
        // Por si quieres usar una velocidad especial al hacer dash:
        this.dashSpeed = this.base.speed * 2;
        this.powerUpSound?.play();
    }

    // --------------------------
    //  POWER-UP: BOTAS DE SALTO
    // --------------------------
    enableHighJump() {
        this.canHighJump = true;
        // Aumentamos la altura de salto usando el multiplicador
        this.maxJumpVelocity = this.base.maxJumpVelocity * this.highJumpMultiplier;
        this.powerUpSound?.play();
    }

    // --------------------------
    //  LIMPIAR POWER-UP ACTIVO
    // --------------------------
    deactivatePowerUp() {
        // 1. Cancelar eventos de la estrella
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

        // 2. Parar músicas de estrella y reanudar música de nivel
        if (this.starman && this.starman.isPlaying) {
            this.starman.stop();
        }
        if (this.starEndingSound && this.starEndingSound.isPlaying) {
            this.starEndingSound.stop();
        }
        if (this.scene.levelMusic && this.scene.levelMusic.isPaused) {
            this.scene.levelMusic.resume();
        }

        // 3. Restaurar apariencia
        this.clearTint();
        this.alpha = 1;

        // 4. Restaurar tamaño si estábamos en modo champiñón
        if (this.isSuperSize) {
            this.setScale(this.base.scaleX, this.base.scaleY);
            this.isSuperSize = false;
        }

        // 5. Resetear flags de power-ups
        this.isInvincible = false;

        this.canThrowHammer = false;

        this.canDoubleJump = false;
        this.hasDoubleJumped = false;

        this.canDash = false;
        this.isDashing = false;

        this.canHighJump = false;

        // 6. Restaurar velocidad y salto base
        this.speed = this.base.speed;
        this.minJumpVelocity = this.base.minJumpVelocity ?? this.minJumpVelocity;
        this.maxJumpVelocity = this.base.maxJumpVelocity ?? this.maxJumpVelocity;

        // 7. Limpiar referencia
        this.activePowerUp = null;
    }

    // --------------------------
    //  POWER-UP: CHAMPIÑÓN
    // --------------------------
    enableSuperSize() {
        // Evita duplicar
        if (this.isSuperSize) return;

        this.powerUpSound?.play();

        const k = this.scaleMultiplier;
        this.isSuperSize = true;

        // Escala visual (Super Mario / Powered-Up)
        this.setScale(this.base.scaleX * k, this.base.scaleY * k);
    }

}
export default Mario;