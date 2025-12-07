import { DIE_TYPES } from "./Goomba.js";

class Pokey extends Phaser.GameObjects.Container
{
    constructor(scene, x, y, segments = 5, speed) {
        super(scene, x, y);

        scene.add.existing(this);

        // Propiedades
        this.scene = scene;
        this.segments = segments; // Total incluyendo cabeza
        this.bodySegmentHeight = 23; // Altura de las bolas del cuerpo (más pequeñas)
        this.headSegmentHeight = 30; // Altura de la cabeza (más grande)
        this.speed = speed; // Velocidad de movimiento (muy lenta)
        this.direction = 1; // 1 = derecha, -1 = izquierda
        this.isAlive = true;
        this.shouldBeDestroyed = false;
        this.currentlyVisible = false;
        this.isEnemy = true; // Marca como enemigo
        this.isCrumbling = false; // Nuevo: para controlar el estado de desmoronamiento

        // Sensores para detección de colisiones
        this.blocked = {
            left: false,
            right: false,
            bottom: false,
            bottomLeft:false,
            bottomRight:false

        };
        this.numTouching = {
            left: 0,
            right: 0,
            bottom:0,
            bottomLeft:0,
            bottomRight:0
        };

        // Arrays para guardar las partes
        this.bodySegments = [];
        this.bodyBodies = []; // Información de los segmentos
        this.fallingSegments = []; // Nuevo: para guardar los segmentos que caen

        // Crear los segmentos visuales
        this.createSegments();

        // Configurar Matter.js para todo el Pokey
        this.setupPhysics();

        this.hitSound = scene.sound.add('aplastar');
        
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
        this.numTouching.bottomLeft = 0;
        this.numTouching.bottomRight = 0;
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

            if ((bodyA === this.sensors.bottomLeft && bodyB.isStatic) || (bodyB === this.sensors.bottomLeft && bodyA.isStatic))
            {
                this.numTouching.bottomLeft += 1;
            }

            if ((bodyA === this.sensors.bottomRight && bodyB.isStatic) || (bodyB === this.sensors.bottomRight && bodyA.isStatic))
            {
                this.numTouching.bottomRight += 1;
            }
        };
    }

    handleAfterUpdate(event) {

        const wasGrounded = this.isGrounded;

        // Actualizar estados de bloqueo basados en sensores
        this.blocked.right = this.numTouching.right > 0;
        this.blocked.left = this.numTouching.left > 0;
        this.blocked.bottom = this.numTouching.bottom > 0;
        this.blocked.bottomLeft = this.numTouching.bottomLeft > 0;
        this.blocked.bottomRight = this.numTouching.bottomRight > 0;
    }

    die(killType = DIE_TYPES.STOMP) {
        this.crumble();
    }

    // Nuevo método: hacer que el Pokey se desmorone
    crumble() {
        if (this.isCrumbling || !this.isAlive) return;
        
        this.isCrumbling = true;
        this.isAlive = false;
        
        // Reproducir sonido
        this.hitSound.play();
        
        // Remover el cuerpo compuesto original
        if (this.compoundBody) {
            this.scene.matter.world.remove(this.compoundBody);
            this.compoundBody = null;
        }
        
        const M = Phaser.Physics.Matter.Matter;
        const CATEGORY_DEBRIS = 0x0008; // Nueva categoría para escombros
        const DEBRIS_MASK = 0x0004; // Solo colisiona con terreno
        
        // Crear cuerpos físicos independientes para cada segmento
        const allSegments = [...this.bodySegments, this.head];
        
        allSegments.forEach((segment, index) => {
            if (!segment) return;
            
            // Calcular la posición mundial del segmento
            const worldX = this.x + segment.x;
            const worldY = this.y + segment.y;
            
            // Crear un cuerpo físico para este segmento
            const isHead = (index === allSegments.length - 1);
            const height = isHead ? this.headSegmentHeight : this.bodySegmentHeight;
            const width = 24;
            
            const segmentBody = M.Bodies.rectangle(
                worldX,
                worldY - height / 2, // Ajustar al centro del segmento
                width,
                height,
                {
                    chamfer: { radius: 5 },
                    density: 0.001,
                    friction: 0.3,
                    restitution: 0.3,
                    collisionFilter: {
                        category: CATEGORY_DEBRIS,
                        mask: DEBRIS_MASK
                    }
                }
            );
            
            // Aplicar una pequeña velocidad lateral aleatoria para separar los segmentos
            const randomVelocityX = (Math.random() - 0.5) * 2; // Entre -1 y 1
            const randomVelocityY = -1 - Math.random() * 2; // Un pequeño impulso hacia arriba
            
            M.Body.setVelocity(segmentBody, {
                x: randomVelocityX,
                y: randomVelocityY
            });
            
            // Aplicar una pequeña rotación aleatoria
            M.Body.setAngularVelocity(segmentBody, (Math.random() - 0.5) * 0.1);
            
            // Añadir el cuerpo al mundo
            this.scene.matter.world.add(segmentBody);
            
            // Remover el segmento del Container
            this.remove(segment, false);
            
            // Añadir el segmento directamente a la escena
            this.scene.add.existing(segment);
            
            // Guardar referencia para actualizar
            this.fallingSegments.push({
                sprite: segment,
                body: segmentBody
            });
        });
        
        // Limpiar los arrays originales
        this.bodySegments = [];
        this.head = null;
        
        // Programar la limpieza después de que caigan
        this.scene.time.delayedCall(3000, () => {
            this.cleanupFallingSegments();
        });
    }
    
    // Nuevo método: limpiar los segmentos que caen
    cleanupFallingSegments() {
        this.fallingSegments.forEach(segment => {
            if (segment.body) {
                this.scene.matter.world.remove(segment.body);
            }
            if (segment.sprite) {
                segment.sprite.destroy();
            }
        });
        
        this.fallingSegments = [];
        this.shouldBeDestroyed = true;
        
        // Destruir el Container
        this.destroy();
    }
    
    // Actualizar la posición de los segmentos que caen
    updateFallingSegments() {
        this.fallingSegments.forEach(segment => {
            if (segment.sprite && segment.body) {
                segment.sprite.x = segment.body.position.x;
                segment.sprite.y = segment.body.position.y + segment.sprite.height / 2;
                segment.sprite.rotation = segment.body.angle;
            }
        });
    }

    createSegments() {
        let currentY = 0; // Posición acumulada desde la base
        
        // Crear segmentos de cuerpo (de abajo hacia arriba)
        for (let i = 0; i < this.segments - 1; i++) {
            const yPos = -currentY;
            const segment = this.scene.add.sprite(0, yPos, 'pokey', 0); // Frame 0 = cuerpo
            segment.setOrigin(0.5, 1); // Origen en la base
            this.add(segment);
            this.bodySegments.push(segment);

            // Guardar el offset Y relativo para referencia
            this.bodyBodies.push({
                yOffset: yPos,
                isHead: false,
                height: this.bodySegmentHeight
            });
            
            currentY += this.bodySegmentHeight; // Avanzar según altura del cuerpo
        }

        // Crear cabeza (encima de todo)
        const headY = -currentY;
        this.head = this.scene.add.sprite(0, headY, 'pokey', 1); // Frame 2 = cabeza
        this.head.setOrigin(0.5, 1);
        this.add(this.head);

        // Guardar el offset de la cabeza
        this.bodyBodies.push({
            yOffset: headY,
            isHead: true,
            height: this.headSegmentHeight
        });
        
        // Guardar altura total
        this.totalHeight = currentY + this.headSegmentHeight;
    }

    setupPhysics() {
        
        const M = Phaser.Physics.Matter.Matter;

        const totalWidth = 24;
        const CATEGORY_PLAYER  = 0x0001;
        const CATEGORY_ENEMY   = 0x0002;
        const CATEGORY_TERRAIN = 0x0004;
        const mask = CATEGORY_PLAYER | CATEGORY_TERRAIN | CATEGORY_ENEMY;
        // El Container está en la base (y), así que el centro del cuerpo está en y - (altura/2)
        const bodyCenterY = this.y - (this.totalHeight / 2);

        // Cuerpo principal SÓLIDO (no sensor) - Este colisionará con el suelo
        this.enemyBody = M.Bodies.rectangle(
            this.x,
            bodyCenterY,
            totalWidth,
            this.totalHeight,
            { 
                chamfer: { radius: 5 },
                density: 0.001, // Darle peso
                category: CATEGORY_ENEMY,
                mask: mask,
                label: "Pokey"
            }
        );

        // Sensores para detectar paredes y suelo (sin colisión física)
        this.sensors = {
            left: M.Bodies.rectangle(this.x - totalWidth * 0.75, bodyCenterY, 5, this.totalHeight * 0.5, { isSensor: true,
            collisionFilter: {
                category: CATEGORY_ENEMY,
                mask: mask,
            },label:"Pokey"}),
            right: M.Bodies.rectangle(this.x + totalWidth * 0.75, bodyCenterY, 5, this.totalHeight * 0.5, { isSensor: true,
            collisionFilter: {
                category: CATEGORY_ENEMY,
                mask: mask,
            }, label:"Pokey"}),
            bottom: M.Bodies.rectangle(this.x, bodyCenterY + this.totalHeight/2 + 3, totalWidth * 1.1, 10, { isSensor: true}),
            bottomLeft: M.Bodies.rectangle(this.x - totalWidth * 1.1, bodyCenterY + this.totalHeight/2 + 3, 10, 5, { isSensor:true }),
            bottomRight: M.Bodies.rectangle(this.x + totalWidth * 1.1, bodyCenterY + this.totalHeight/2 + 3, 10, 5, { isSensor:true }),
        };

        // Crear un cuerpo compuesto con el cuerpo principal y los sensores
        this.compoundBody = M.Body.create({
            parts: [this.enemyBody,this.sensors.left, this.sensors.right, this.sensors.bottomLeft, this.sensors.bottomRight, this.sensors.bottom],
            friction: 0,
            frictionAir: 0.01,
            restitution: 0.05,
            label: "Pokey"
        });
        this.compoundBody.label="Pokey";

        // Hacer el cuerpo dinámico (no estático) para que pueda moverse
        M.Body.setStatic(this.compoundBody, false);

        // Desactivar rotación
        M.Body.setInertia(this.compoundBody, Infinity);

        // Añadir el cuerpo al mundo de Matter
        this.scene.matter.world.add(this.compoundBody);
        
        // Guardar referencia al Pokey en TODOS los cuerpos (incluyendo sensores)
        this.compoundBody.gameObject = this;
        this.enemyBody.gameObject = this;
        this.sensors.left.gameObject = this;
        this.sensors.right.gameObject = this;
        this.sensors.bottom.gameObject = this;
        this.sensors.bottomLeft.gameObject = this;
        this.sensors.bottomRight.gameObject = this;

        // Configurar velocidad inicial
        M.Body.setVelocity(this.compoundBody, { x: this.speed * this.direction, y: 0 });
    }

    handlePlayerCollision(player) {
        if (!this.isAlive || this.isCrumbling) return;

        // Si el jugador es invencible, destruir el Pokey
        if (player.isInvincible) {
            this.crumble();
            return;
        }

        // El Pokey siempre daña (no se puede saltar sobre él como las plantas)
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
                
                // Detener cualquier movimiento de Mario antes de la burbuja
                player.setVelocity(0, 0);
                if (player.body) {
                    player.body.velocity.x = 0;
                    player.body.velocity.y = 0;
                }

                if (player.bubblesLeft > 0) {
                    player.Bubble(); // Entra en burbuja sin empuje
                } else {
                    player.hurt();
                    player.setStatic(true);
                    if (this.compoundBody)
                    {
                        this.compoundBody.collisionFilter.mask = 0;
                        Phaser.Physics.Matter.Matter.Body.setStatic(this.compoundBody, true);
                    }
                    this.scene.doubleEndTransition(()=>{this.scene.scene.launch('MainMenu');
                        this.scene.scene.stop();});
                    }
            }

            this.hitSound.play();
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

    // Cambiar dirección
    changeDirection() {
        this.direction *= -1;
        // Aplicar la nueva dirección
        const M = Phaser.Physics.Matter.Matter;
        M.Body.setVelocity(this.compoundBody, { x: this.compoundBody.velocity.x * this.direction, y: this.compoundBody.velocity.y });
        
    }

    // Actualizar movimiento basado en visibilidad
    updateMovement() {
        if (this.shouldBeDestroyed || !this.isAlive) return;

        const isVisible = this.checkVisibility();
        this.currentlyVisible = isVisible;

        if (this.isAlive) {
            if (isVisible) {
                // Aplicar movimiento en la dirección actual
                const M = Phaser.Physics.Matter.Matter;
                const targetVelocity = this.speed * this.direction;

                // Solo cambiar la velocidad si es diferente
                if (Math.abs(this.compoundBody.velocity.x - targetVelocity) > 0.01) {
                    M.Body.setVelocity(this.compoundBody, { 
                        x: targetVelocity, 
                        y: this.compoundBody.velocity.y 
                    });
                }
            } else {
                // Detenerse si no es visible
                const M = Phaser.Physics.Matter.Matter;
                M.Body.setVelocity(this.compoundBody, { x: 0, y: this.compoundBody.velocity.y });
            }
        }

        // Sincronizar posición del Container con el cuerpo de Matter
        // El cuerpo está centrado en el Pokey completo, pero el Container está en la BASE
        this.setPosition(this.compoundBody.position.x, this.compoundBody.position.y + this.totalHeight/2);
    }

    // Detección de bordes (similar al Koopa)
    handleLedges() {
        if ((this.direction === 1 && !this.blocked.bottomRight) || (this.direction === -1 && !this.blocked.bottomLeft)) 
        {
            this.changeDirection();
        }
    }

    // Manejar colisiones con paredes
    handleWallCollision() {
        if (!this.isAlive) return;

        const isLateralCollision = 
            (this.blocked.right && this.direction === 1) ||
            (this.blocked.left && this.direction === -1);

        if (isLateralCollision) {
            this.changeDirection();
        }
    }

    
    safeDestroy() {
        if (this.shouldBeDestroyed) return;
        
        this.shouldBeDestroyed = true;
        this.isAlive = false;

        // Remover el cuerpo de Matter
        if (this.compoundBody) {
            this.scene.matter.world.remove(this.compoundBody);
        }

        // Destruir todos los sprites
        this.bodySegments.forEach(segment => segment.destroy());
        if (this.head) this.head.destroy();

        this.setVisible(false);
        this.setActive(false);
        this.destroy();
    }

    update(time, delta) {
        // Si está desmoronándose, solo actualizar los segmentos que caen
        if (this.isCrumbling) {
            this.updateFallingSegments();
            return;
        }
        
        if (!this.isAlive || this.shouldBeDestroyed) return;

        const camera = this.scene.cameras.main;

        // Destruir si se sale por la izquierda de la cámara
        if (this.x < camera.scrollX - 50) {
            this.safeDestroy();
            return;
        }

        // Destruir si se cae al vacío
        if (this.y > this.scene.map.heightInPixels + 100) {
            this.safeDestroy();
            return;
        }

        // Manejar colisiones con paredes
        if (this.isAlive && !this.shouldBeDestroyed) {
            this.handleWallCollision();
            if(this.blocked.bottom)
            {
                this.handleLedges();
            }
        }

        // Actualizar movimiento
        if (this.isAlive && !this.shouldBeDestroyed) {
            this.updateMovement();
        }
    }
}

export default Pokey;