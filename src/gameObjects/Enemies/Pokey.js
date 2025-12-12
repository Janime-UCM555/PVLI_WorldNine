/**
 * Importación de los tipos de muerte disponibles
 * @module Goomba
 */
import { DIE_TYPES } from "./Goomba.js";

/**
 * Importación de las categorías de colisión correspondientes
 * @module collisionCategories
 */
import{
    CATEGORY_PLAYER,
    CATEGORY_ENEMY,
    CATEGORY_POWERUP,
    CATEGORY_TERRAIN,
    CATEGORY_FALLOFF,
    CATEGORY_DEBRIS
} from "../collisionCategories.js"

const M = Phaser.Physics.Matter.Matter;

/**
 * Clase que representa un enemigo Pokey (cactus segmentado) en el juego.
 * El Pokey está compuesto por múltiples segmentos corporales apilados y una cabeza.
 * Se mueve horizontalmente, detecta bordes y colisiones, y se desintegra al morir.
 * Incluye una animación de balanceo para simular movimiento natural.
 * @extends Phaser.GameObjects.Container
 */
class Pokey extends Phaser.GameObjects.Container
{
    /**
     * Constructor del Pokey
     * @param {Phaser.Scene} scene - La escena de Phaser donde se añade el Pokey
     * @param {number} x - Posición X inicial
     * @param {number} y - Posición Y inicial
     * @param {number} [segments=5] - Número de segmentos corporales (sin contar la cabeza)
     * @param {number} speed - Velocidad de movimiento horizontal
     */
    constructor(scene, x, y, segments = 5, speed) {
        super(scene, x, y);

        scene.add.existing(this);

        // Propiedades
        this.scene = scene;
        this.segments = segments;
        this.bodySegmentHeight = 23;
        this.headSegmentHeight = 30;
        this.speed = speed;
        this.direction = 1;
        this.isAlive = true;
        this.shouldBeDestroyed = false;
        this.currentlyVisible = false;
        this.isEnemy = true;
        this.isCrumbling = false;

        // Propiedades para la animación
        this.animationTime = 0;
        this.swayAmplitude = 7;
        this.swaySpeed = 5;

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
        this.bodyBodies = [];
        this.fallingSegments = [];

        this.createSegments();
        this.setupPhysics();

        this.setDepth(3);

        this.hitSound = scene.sound.add('aplastar');
        
        this.setUpWorldBoundsCollision();
    }
    
    /**
     * Configura los listeners de colisión con el mundo de Matter.js
     * Establece los manejadores para beforeupdate, collisionactive y afterupdate
     */
    setUpWorldBoundsCollision() {
        const world = this.scene.matter.world;

        world.off('beforeupdate', this.handleBeforeUpdate, this);
        world.off('collisionactive', this.handleCollisionActive, this);
        world.off('afterupdate', this.handleAfterUpdate, this);

        world.on('beforeupdate', this.handleBeforeUpdate, this);
        world.on('collisionactive', this.handleCollisionActive, this);
        world.on('afterupdate', this.handleAfterUpdate, this);
    }

    /**
     * Manejador llamado antes de cada actualización de física
     * Resetea los contadores de colisiones de todos los sensores
     * @param {Object} event - Evento de Matter.js
     */
    handleBeforeUpdate(event) {
        this.numTouching.left = 0;
        this.numTouching.right = 0;
        this.numTouching.bottom = 0;
        this.numTouching.bottomLeft = 0;
        this.numTouching.bottomRight = 0;
    }

    /**
     * Manejador de colisiones activas
     * Detecta colisiones con los sensores laterales e inferiores del Pokey
     * @param {Object} event - Evento que contiene pares de colisión
     */
    handleCollisionActive(event) {
        for (let i = 0; i < event.pairs.length; i++)
        {
            const bodyA = event.pairs[i].bodyA;
            const bodyB = event.pairs[i].bodyB;

            if (bodyA === this.playerBody || bodyB === this.playerBody)
            {
                continue;
            }

            if (bodyA === this.sensors.bottom || bodyB === this.sensors.bottom)
            {
                this.numTouching.bottom += 1;
            }

            if ((bodyA === this.sensors.left && (bodyB.isStatic||bodyB.label == "Pokey" ||bodyB.label == "Goomba" || bodyB.label == "Koopa")) ||
             (bodyB === this.sensors.left && (bodyA.isStatic ||bodyA.label == "Pokey" ||bodyA.label == "Goomba" || bodyA.label == "Koopa")))
            {
                this.numTouching.left += 1;
            }

            if ((bodyA === this.sensors.right && (bodyB.isStatic||bodyB.label == "Pokey" ||bodyB.label == "Goomba" || bodyB.label == "Koopa")) ||
             (bodyB === this.sensors.right && (bodyA.isStatic ||bodyA.label == "Pokey" ||bodyA.label == "Goomba" || bodyA.label == "Koopa")))
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

    /**
     * Manejador llamado después de cada actualización de física
     * Actualiza el estado de bloqueo basándose en los contadores de colisiones
     * @param {Object} event - Evento de Matter.js
     */
    handleAfterUpdate(event) {
        const wasGrounded = this.isGrounded;

        this.blocked.right = this.numTouching.right > 0;
        this.blocked.left = this.numTouching.left > 0;
        this.blocked.bottom = this.numTouching.bottom > 0;
        this.blocked.bottomLeft = this.numTouching.bottomLeft > 0;
        this.blocked.bottomRight = this.numTouching.bottomRight > 0;
    }

    /**
     * Método llamado cuando el Pokey muere
     * @param {string} [killType=DIE_TYPES.STOMP] - Tipo de muerte
     */
    die(killType = DIE_TYPES.STOMP) {
        this.crumble();
    }

    /**
     * Desintegra el Pokey en segmentos individuales que caen
     * Cada segmento se convierte en un cuerpo físico independiente con velocidad aleatoria
     */
    crumble() {
        if (this.isCrumbling || !this.isAlive) return;
        
        this.isCrumbling = true;
        this.isAlive = false;
        
        this.hitSound.play();
        
        if (this.compoundBody) {
            this.scene.matter.world.remove(this.compoundBody);
            this.compoundBody = null;
        }

        const DEBRIS_MASK = 0x0004;
        const allSegments = [...this.bodySegments, this.head];
        
        allSegments.forEach((segment, index) => {
            if (!segment) return;
            
            const worldX = this.x + segment.x;
            const worldY = this.y + segment.y;
            
            const isHead = (index === allSegments.length - 1);
            const height = isHead ? this.headSegmentHeight : this.bodySegmentHeight;
            const width = 24;
            
            const segmentBody = M.Bodies.rectangle(
                worldX,
                worldY - height / 2,
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
            
            const randomVelocityX = (Math.random() - 0.5) * 2;
            const randomVelocityY = -1 - Math.random() * 2;
            
            M.Body.setVelocity(segmentBody, {
                x: randomVelocityX,
                y: randomVelocityY
            });
            
            M.Body.setAngularVelocity(segmentBody, (Math.random() - 0.5) * 0.1);
            
            this.scene.matter.world.add(segmentBody);
            
            this.remove(segment, false);
            
            this.scene.add.existing(segment);
            
            this.fallingSegments.push({
                sprite: segment,
                body: segmentBody
            });
        });
        
        this.bodySegments = [];
        this.head = null;
        
        this.scene.time.delayedCall(3000, () => {
            this.cleanupFallingSegments();
        });
    }
    
    /**
     * Limpia todos los segmentos que están cayendo
     * Elimina los cuerpos de física y sprites, luego destruye el contenedor
     */
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
        
        this.destroy();
    }
    
    /**
     * Actualiza las posiciones y rotaciones de los segmentos que están cayendo
     * Sincroniza los sprites con sus cuerpos físicos correspondientes
     */
    updateFallingSegments() {
        this.fallingSegments.forEach(segment => {
            if (segment.sprite && segment.body) {
                segment.sprite.x = segment.body.position.x;
                segment.sprite.y = segment.body.position.y + segment.sprite.height / 2;
                segment.sprite.rotation = segment.body.angle;
            }
        });
    }

    /**
     * Actualiza la animación de balanceo del Pokey
     * Cada segmento se balancea con un desfase para crear un movimiento ondulante
     * @param {number} delta - Tiempo transcurrido desde el último frame en milisegundos
     */
    updateSwayAnimation(delta) {
        if (!this.isAlive || this.isCrumbling) return;

        this.animationTime += delta * 0.001;

        this.bodySegments.forEach((segment, index) => {
            const phaseOffset = index * 0.5;
            
            const swayOffset = Math.sin(this.animationTime * this.swaySpeed + phaseOffset) * this.swayAmplitude;
            
            segment.x = swayOffset;
        });

        if (this.head) {
            const headPhaseOffset = (this.bodySegments.length) * 0.5;
            const headSwayOffset = Math.sin(this.animationTime * this.swaySpeed + headPhaseOffset) * (this.swayAmplitude * 0.7);
            this.head.x = headSwayOffset;
        }
    }

    /**
     * Crea los segmentos visuales del Pokey (cuerpo y cabeza)
     * Los segmentos se apilan verticalmente desde la base hasta la cabeza
     */
    createSegments() {
        let currentY = 0;
        
        for (let i = 0; i < this.segments - 1; i++) {
            const yPos = -currentY;
            const segment = this.scene.add.sprite(0, yPos, 'pokey', 0);
            segment.setOrigin(0.5, 1);
            this.add(segment);
            this.bodySegments.push(segment);

            this.bodyBodies.push({
                yOffset: yPos,
                isHead: false,
                height: this.bodySegmentHeight
            });
            segment.setDepth(3);
            
            currentY += this.bodySegmentHeight;
        }

        const headY = -currentY;
        this.head = this.scene.add.sprite(0, headY, 'pokey', 1);
        this.head.setOrigin(0.5, 1);
        this.add(this.head);

        this.bodyBodies.push({
            yOffset: headY,
            isHead: true,
            height: this.headSegmentHeight
        });
        
        this.totalHeight = currentY + this.headSegmentHeight;
    }

    /**
     * Configura el sistema de física de Matter.js para el Pokey
     * Crea un cuerpo compuesto con sensores laterales e inferiores para detección de colisiones
     */
    setupPhysics() {
        const totalWidth = 24;
        const mask = CATEGORY_PLAYER | CATEGORY_TERRAIN | CATEGORY_ENEMY;
        const bodyCenterY = this.y - (this.totalHeight / 2);

        this.enemyBody = M.Bodies.rectangle(
            this.x,
            bodyCenterY,
            totalWidth,
            this.totalHeight,
            { 
                chamfer: { radius: 5 },
                density: 0.001,
                category: CATEGORY_ENEMY,
                mask: mask,
                label: "Pokey"
            }
        );

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

        this.compoundBody = M.Body.create({
            parts: [this.enemyBody,this.sensors.left, this.sensors.right, this.sensors.bottomLeft, this.sensors.bottomRight, this.sensors.bottom],
            friction: 0,
            frictionAir: 0.01,
            restitution: 0.05,
            label: "Pokey"
        });
        this.compoundBody.label="Pokey";

        M.Body.setStatic(this.compoundBody, false);

        M.Body.setInertia(this.compoundBody, Infinity);

        this.scene.matter.world.add(this.compoundBody);
        
        this.compoundBody.gameObject = this;
        this.enemyBody.gameObject = this;
        this.sensors.left.gameObject = this;
        this.sensors.right.gameObject = this;
        this.sensors.bottom.gameObject = this;
        this.sensors.bottomLeft.gameObject = this;
        this.sensors.bottomRight.gameObject = this;

        M.Body.setVelocity(this.compoundBody, { x: this.speed * this.direction, y: 0 });
    }

    /**
     * Maneja la colisión con el jugador
     * Determina si el jugador recibe daño o si el Pokey se desintegra (si el jugador es invencible)
     * @param {Object} player - Referencia al objeto jugador
     */
    handlePlayerCollision(player) {
        if (!this.isAlive || this.isCrumbling) return;

        if (player.isInvincible) {
            this.crumble();
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

            this.hitSound.play();
        }
    }

    /**
     * Cambia la dirección de movimiento del Pokey
     * Invierte la velocidad horizontal del cuerpo físico
     */
    changeDirection() {
        this.direction *= -1;
        M.Body.setVelocity(this.compoundBody, { x: this.compoundBody.velocity.x * this.direction, y: this.compoundBody.velocity.y });
    }

    /**
     * Actualiza el movimiento del Pokey
     * Solo se mueve si está visible en cámara. Sincroniza la posición del contenedor con el cuerpo físico
     */
    updateMovement() {
        if (this.shouldBeDestroyed || !this.isAlive) return;

        const isVisible = this.checkVisibility();
        this.currentlyVisible = isVisible;

        if (this.isAlive) {
            if (isVisible) {
                const targetVelocity = this.speed * this.direction;

                if (Math.abs(this.compoundBody.velocity.x - targetVelocity) > 0.01) {
                    M.Body.setVelocity(this.compoundBody, { 
                        x: targetVelocity, 
                        y: this.compoundBody.velocity.y 
                    });
                }
            } else {
                M.Body.setVelocity(this.compoundBody, { x: 0, y: this.compoundBody.velocity.y });
            }
        }

        this.setPosition(this.compoundBody.position.x, this.compoundBody.position.y + this.totalHeight/2);
    }

    /**
     * Maneja la detección de bordes/precipicios
     * Cambia de dirección si detecta que no hay suelo adelante para evitar caerse
     */
    handleLedges() {
        if ((this.direction === 1 && !this.blocked.bottomRight) || (this.direction === -1 && !this.blocked.bottomLeft)) 
        {
            this.changeDirection();
        }
    }

    /**
     * Maneja las colisiones con paredes
     * Cambia de dirección cuando choca lateralmente con un objeto estático u otro enemigo
     */
    handleWallCollision() {
        if (!this.isAlive) return;

        const isLateralCollision = 
            (this.blocked.right && this.direction === 1) ||
            (this.blocked.left && this.direction === -1);

        if (isLateralCollision) {
            this.changeDirection();
        }
    }

    /**
     * Verifica si el Pokey está dentro del área visible de la cámara
     * @returns {boolean} true si el Pokey es visible en cámara, false en caso contrario
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
     * Destruye el Pokey de forma segura
     * Elimina el cuerpo físico, destruye todos los segmentos y limpia el contenedor
     */
    safeDestroy() {
        if (this.shouldBeDestroyed) return;
        
        this.shouldBeDestroyed = true;
        this.isAlive = false;

        if (this.compoundBody) {
            this.scene.matter.world.remove(this.compoundBody);
        }

        this.bodySegments.forEach(segment => segment.destroy());
        if (this.head) this.head.destroy();

        this.setVisible(false);
        this.setActive(false);
        this.destroy();
    }

    /**
     * Método de actualización llamado cada frame
     * Gestiona la animación de balanceo, verifica límites del mundo, maneja colisiones y movimiento
     * @param {number} time - Tiempo total transcurrido desde el inicio del juego
     * @param {number} delta - Tiempo transcurrido desde el último frame en milisegundos
     */
    update(time, delta) {
        if (this.isCrumbling) {
            this.updateFallingSegments();
            return;
        }
        
        if (!this.isAlive || this.shouldBeDestroyed) return;

        this.updateSwayAnimation(delta);

        const camera = this.scene.cameras.main;

        if (this.x < camera.scrollX - 50) {
            this.safeDestroy();
            return;
        }

        if (this.y > this.scene.map.heightInPixels + 100) {
            this.safeDestroy();
            return;
        }

        if (this.isAlive && !this.shouldBeDestroyed) {
            this.handleWallCollision();
            if(this.blocked.bottom)
            {
                this.handleLedges();
            }
        }

        if (this.isAlive && !this.shouldBeDestroyed) {
            this.updateMovement();
        }
    }
}

export default Pokey;