import { DIE_TYPES } from "./Goomba.js";

class Pokey extends Phaser.GameObjects.Container
{
    constructor(scene, x, y, segments = 5, speed = 0.5) {
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

        // Sensores para detección de colisiones
        this.blocked = {
            left: false,
            right: false,
        };
        this.numTouching = {
            left: 0,
            right: 0,
        };

        // Arrays para guardar las partes
        this.bodySegments = [];
        this.bodyBodies = []; // Información de los segmentos

        // Crear los segmentos visuales
        this.createSegments();

        // Configurar Matter.js para todo el Pokey
        this.setupPhysics();

        this.hitSound = scene.sound.add('aplastar');

        // this.scene.matter.world.on('beforeupdate', this.resetTouching, this);
        // this.scene.matter.world.on('collisionactive', this.handleCollisions);
        // this.scene.matter.world.on('afterupdate', this.updateBlocked, this);
        // this.listenersAdded = true;

        this.scene.matter.world.on('beforeupdate', function (event) {
        this.numTouching.left = 0;
        this.numTouching.right = 0;
        }, this);
        this.scene.matter.world.on('collisionactive', (event) => {
        for (let i = 0; i < event.pairs.length; i++)            
        {
            const bodyA = event.pairs[i].bodyA;
            const bodyB = event.pairs[i].bodyB;
            if (bodyA === this.playerBody || bodyB === this.playerBody)
            {
                continue;
            }
            if (bodyA === this.sensors.left || bodyB === this.sensors.left)
            {
            this.numTouching.left++;
            }
            if (bodyA === this.sensors.right || bodyB === this.sensors.right)
            {
            this.numTouching.right++;
            }
        }
        });
        this.scene.matter.world.on('afterupdate', function (event) {
        this.blocked.right = this.numTouching.right > 0 ? true : false;
        this.blocked.left = this.numTouching.left > 0 ? true : false;
        }, this);
    }

    die(killType = DIE_TYPES.STOMP) {
        this.safeDestroy();
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
                mask: mask
            }
        );

        // Sensores para detectar paredes y suelo (sin colisión física)
        this.sensors = {
            // bottom: M.Bodies.rectangle(this.x, this.y + 5, totalWidth * 1.5, 5, { isSensor: true ,
            // collisionFilter: {
            //     category: CATEGORY_ENEMY,
            //     mask: mask
            // }}), // Más largo para detectar bordes
            left: M.Bodies.rectangle(this.x - totalWidth * 1.05, bodyCenterY, 5, this.totalHeight * 0.5, { isSensor: true,
            collisionFilter: {
                category: CATEGORY_ENEMY,
                mask: mask
            }}),
            right: M.Bodies.rectangle(this.x + totalWidth * 1.05, bodyCenterY, 5, this.totalHeight * 0.5, { isSensor: true,
            collisionFilter: {
                category: CATEGORY_ENEMY,
                mask: mask
            }})
        };

        // Crear un cuerpo compuesto con el cuerpo principal y los sensores
        this.compoundBody = M.Body.create({
            parts: [this.enemyBody,this.sensors.left, this.sensors.right],
            friction: 0,
            frictionAir: 0.01,
            collisionFilter: {
            category: CATEGORY_ENEMY,
            mask: mask
            },
            restitution: 0.05
        });
        // Mask categories

        // Apply to all parts
        // this.enemyBody.collisionFilter.category = CATEGORY_ENEMY;
        // this.enemyBody.collisionFilter.mask = mask;

        // this.sensors.bottom.collisionFilter.category = CATEGORY_ENEMY;
        // this.sensors.bottom.collisionFilter.mask = mask;

        // this.sensors.left.collisionFilter.category = CATEGORY_ENEMY;
        // this.sensors.left.collisionFilter.mask = mask;

        // this.sensors.right.collisionFilter.category = CATEGORY_ENEMY;
        // this.sensors.right.collisionFilter.mask = mask;

        // this.compoundBody.collisionFilter.category = CATEGORY_ENEMY;
        // this.compoundBody.collisionFilter.mask = mask;


        // Hacer el cuerpo dinámico (no estático) para que pueda moverse
        M.Body.setStatic(this.compoundBody, false);

        // Desactivar rotación
        M.Body.setInertia(this.compoundBody, Infinity);

        // Añadir el cuerpo al mundo de Matter
        this.scene.matter.world.add(this.compoundBody);
        
        // Guardar referencia al Pokey en TODOS los cuerpos (incluyendo sensores)
        this.compoundBody.gameObject = this;
        this.enemyBody.gameObject = this;
        // this.sensors.bottom.gameObject = this;
        this.sensors.left.gameObject = this;
        this.sensors.right.gameObject = this;

        // Configurar velocidad inicial
        M.Body.setVelocity(this.compoundBody, { x: this.speed * this.direction, y: 0 });
    }

    handlePlayerCollision(player) {
        if (!this.isAlive) return;

        // Si el jugador es invencible, destruir el Pokey
        if (player.isInvincible) {
            this.safeDestroy();
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
                    if (this.compoundBody)
                    {
                        this.compoundBody.collisionFilter.mask = 0;
                        Phaser.Physics.Matter.Matter.Body.setStatic(this.compoundBody, true);
                    }
                    this.doubleEndTransition(()=>{this.scene.scene.launch('MainMenu');
                        this.scene.stop();});
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
        this.x = this.compoundBody.position.x;
        this.y = this.compoundBody.position.y + (this.totalHeight / 2); // Ajustar a la base
    }

    // Detección de bordes (similar al Koopa)
    checkForLedges() {
        if (!this.compoundBody || !this.blocked.bottom) return;

        const checkDistance = 5;
        const yOffset = 5;
        const futureX = this.x + (this.direction * (12 + checkDistance));
        const futureY = this.y + yOffset;

        let hasGroundAhead = false;

        const checkPoints = [
            { x: futureX, y: futureY },
            { x: futureX + (this.direction * 5), y: futureY }
        ];

        // Verificar en groundLayer
        if (this.scene.groundLayer) {
            for (const point of checkPoints) {
                const tile = this.scene.groundLayer.getTileAtWorldXY(point.x, point.y);
                if (tile && tile.collides)
                {
                        hasGroundAhead = true;
                    break;
                }
            }
        }

        // Si no hay suelo adelante, cambiar dirección
        if (!hasGroundAhead) {
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

    
    /** Update simple para rebotar en paredes y moverse. */
    preUpdate(time, delta) {
        // super.preUpdate(time, delta);
        // console.log(this.blocked.left);
        if (this.blocked.left) 
        {
            const M = Phaser.Physics.Matter.Matter;
            M.Body.setVelocity(this.compoundBody, { x: Math.abs(this.compoundBody.velocity.x), y: this.compoundBody.velocity.y });
        
        }
        else if (this.blocked.right) 
        {
            const M = Phaser.Physics.Matter.Matter;
            M.Body.setVelocity(this.compoundBody, { x: -Math.abs(this.compoundBody.velocity.x), y: this.compoundBody.velocity.y });
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

        // Configurar listeners de Matter (solo una vez)
        // if (!this.listenersAdded) {
        //     this.scene.matter.world.on('beforeupdate', this.resetTouching, this);
        //     this.scene.matter.world.on('collisionactive', this.handleCollisions, this);
        //     this.scene.matter.world.on('afterupdate', this.updateBlocked, this);
        //     this.listenersAdded = true;
        // }

        // Verificar bordes si está en el suelo
        // if (this.isAlive && !this.shouldBeDestroyed && this.blocked.bottom) {
        //     this.checkForLedges();
        // }

        // Manejar colisiones con paredes
        if (this.isAlive && !this.shouldBeDestroyed) {
            this.handleWallCollision();
        }

        // Actualizar movimiento
        if (this.isAlive && !this.shouldBeDestroyed) {
            this.updateMovement();
        }
        
        // console.log(this);
    }
}

export default Pokey;