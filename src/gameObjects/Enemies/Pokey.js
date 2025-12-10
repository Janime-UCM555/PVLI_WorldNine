import { DIE_TYPES } from "./Goomba.js";
import Enemies from "./Enemies.js";

import{
    CATEGORY_PLAYER,
    CATEGORY_ENEMY,
    CATEGORY_POWERUP,
    CATEGORY_TERRAIN,
    CATEGORY_FALLOFF,
    CATEGORY_DEBRIS
} from "../collisionCategories.js"
const M = Phaser.Physics.Matter.Matter;

class Pokey extends Phaser.GameObjects.Container
{
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
        this.animationTime = 0; // Tiempo acumulado para la animación
        this.swayAmplitude = 7; // Amplitud del movimiento lateral (píxeles)
        this.swaySpeed = 5; // Velocidad de la oscilación

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

        // Crear los segmentos visuales
        this.createSegments();

        // Configurar Matter.js para todo el Pokey
        this.setupPhysics();

        this.setDepth(3);

        this.hitSound = scene.sound.add('aplastar');
        
        // Configurar colisión con los bordes del mundo
        this.setUpWorldBoundsCollision();
    }
    
    setUpWorldBoundsCollision() {
        const world = this.scene.matter.world;

        world.off('beforeupdate', this.handleBeforeUpdate, this);
        world.off('collisionactive', this.handleCollisionActive, this);
        world.off('afterupdate', this.handleAfterUpdate, this);

        world.on('beforeupdate', this.handleBeforeUpdate, this);
        world.on('collisionactive', this.handleCollisionActive, this);
        world.on('afterupdate', this.handleAfterUpdate, this);
    }

    handleBeforeUpdate(event) {
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

    handleAfterUpdate(event) {
        const wasGrounded = this.isGrounded;

        this.blocked.right = this.numTouching.right > 0;
        this.blocked.left = this.numTouching.left > 0;
        this.blocked.bottom = this.numTouching.bottom > 0;
        this.blocked.bottomLeft = this.numTouching.bottomLeft > 0;
        this.blocked.bottomRight = this.numTouching.bottomRight > 0;
    }

    die(killType = DIE_TYPES.STOMP) {
        this.crumble();
    }

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
    
    updateFallingSegments() {
        this.fallingSegments.forEach(segment => {
            if (segment.sprite && segment.body) {
                segment.sprite.x = segment.body.position.x;
                segment.sprite.y = segment.body.position.y + segment.sprite.height / 2;
                segment.sprite.rotation = segment.body.angle;
            }
        });
    }

    // Nuevo método: actualizar la animación de balanceo
    updateSwayAnimation(delta) {
        if (!this.isAlive || this.isCrumbling) return;

        // Incrementar el tiempo de animación
        this.animationTime += delta * 0.001; // Convertir a segundos

        // Animar cada segmento del cuerpo con un desfase
        this.bodySegments.forEach((segment, index) => {
            // Cada segmento tiene un desfase basado en su índice
            const phaseOffset = index * 0.5; // Ajusta este valor para más/menos desfase
            
            // Calcular el desplazamiento lateral usando seno
            const swayOffset = Math.sin(this.animationTime * this.swaySpeed + phaseOffset) * this.swayAmplitude;
            
            // Aplicar el desplazamiento manteniendo la posición Y original
            segment.x = swayOffset;
        });

        // La cabeza también se mueve pero con menor amplitud
        if (this.head) {
            const headPhaseOffset = (this.bodySegments.length) * 0.5;
            const headSwayOffset = Math.sin(this.animationTime * this.swaySpeed + headPhaseOffset) * (this.swayAmplitude * 0.7);
            this.head.x = headSwayOffset;
        }
    }

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
                        this.scene.doubleEndTransition(()=>{this.scene.scene.launch('MainMenu');
                            this.scene.scene.stop();});
                    }
                }
                else
                {
                    this.scene.jugador.hurt();
                    this.scene.endTimer=true;
                    this.scene.jugador.setStatic(true);
                    this.scene.doubleEndTransition(()=>{
                        this.scene.scene.restart();
                    });
                }
            }

            this.hitSound.play();
        }
    }

    changeDirection() {
        this.direction *= -1;
        M.Body.setVelocity(this.compoundBody, { x: this.compoundBody.velocity.x * this.direction, y: this.compoundBody.velocity.y });
    }

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

    handleLedges() {
        if ((this.direction === 1 && !this.blocked.bottomRight) || (this.direction === -1 && !this.blocked.bottomLeft)) 
        {
            this.changeDirection();
        }
    }

    handleWallCollision() {
        if (!this.isAlive) return;

        const isLateralCollision = 
            (this.blocked.right && this.direction === 1) ||
            (this.blocked.left && this.direction === -1);

        if (isLateralCollision) {
            this.changeDirection();
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

        if (this.compoundBody) {
            this.scene.matter.world.remove(this.compoundBody);
        }

        this.bodySegments.forEach(segment => segment.destroy());
        if (this.head) this.head.destroy();

        this.setVisible(false);
        this.setActive(false);
        this.destroy();
    }

    update(time, delta) {
        if (this.isCrumbling) {
            this.updateFallingSegments();
            return;
        }
        
        if (!this.isAlive || this.shouldBeDestroyed) return;

        // Actualizar la animación de balanceo
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