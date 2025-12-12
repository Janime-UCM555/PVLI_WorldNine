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
    CATEGORY_FALLOFF
} from "../collisionCategories.js"

/**
 * Clase que representa un enemigo Koopa Troopa en el juego.
 * El Koopa camina horizontalmente y al ser pisado se convierte en caparazón.
 * Puede ser destruido completamente con martillo o estrella.
 * @extends Phaser.GameObjects.Sprite
 */
class Koopa extends Phaser.GameObjects.Sprite
{
    /**
     * Constructor del Koopa
     * @param {Phaser.Scene} scene - La escena de Phaser donde se añade el Koopa
     * @param {number} x - Posición X inicial
     * @param {number} y - Posición Y inicial
     * @param {string} texture - Clave de la textura a usar
     * @param {number} [speed=50] - Velocidad de movimiento horizontal
     * @param {number} type - Tipo de Koopa (0: verde, 1: rojo, 2: egipcio, 3: griego)
     */
    constructor(scene, x, y, texture, speed = 50, type) {
        super(scene, x, y, texture);

        scene.add.existing(this);
        scene.matter.add.gameObject(this);

        this.speed = speed;
        this.type = type;
        this.direction = -1;
        this.isAlive = true;
        this.currentlyVisible = false;
        this.shouldBeDestroyed = false;
        this.isEnemy = true;

        // Configuración de física - Sensores
        this.blocked= {
            left: false,
            right: false,
        },
        this.numTouching= {
            left: 0,
            right: 0,
        }; 
        const sx = this.width/2;
        const sy = this.height/2;
        const w = this.width/1.5;
        this.setDepth(2);
        this.setCollisionCategory([CATEGORY_ENEMY]);
        this.setCollidesWith([CATEGORY_PLAYER,CATEGORY_TERRAIN, CATEGORY_ENEMY]);

        const h = this.height/2;
        const M = Phaser.Physics.Matter.Matter;
        this.enemyBody = M.Bodies.rectangle(sx,sy*1.5, w, h, { chamfer: { radius: 10 }, label:"Koopa" });
        this.sensors = {
            left: M.Bodies.rectangle(sx-w*0.7, sy, 5, h/2, { isSensor: true, label:"Koopa" }),
            right: M.Bodies.rectangle(sx+w*0.7, sy, 5, h/2, { isSensor: true, label:"Koopa" }),
        };
        const compoundBody = M.Body.create({
        parts: [this.enemyBody,this.sensors.left, this.sensors.right,],
        friction: 0,
        frictionAir: 0,
        restitution: 0.05,
        label:"Koopa"
        });
        this.body.label="Koopa";
        this.setExistingBody(compoundBody);
        this.setFixedRotation();
        if (this.body) {
            this.body.moves = true;
            this.body.onWorldBounds = true;
            this.setVelocityX(0);
            this.setBounce(0, 0);

            M.Body.setPosition(compoundBody, { x, y });
            this.setExistingBody(compoundBody);
            this.setPosition(x, y);
            this.setFixedRotation();

            this.stompSound = scene.sound.add('aplastar');
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
            }
            });
            this.scene.matter.world.on('afterupdate', function (event) {
            this.blocked.right = this.numTouching.right > 0 ? true : false;
            this.blocked.left = this.numTouching.left > 0 ? true : false;
            }, this);
        }
    }

    /**
     * Método llamado cuando el Koopa muere
     * Si es aplastado (STOMP) se convierte en caparazón, en otros casos se destruye directamente
     * @param {string} [killType=DIE_TYPES.STOMP] - Tipo de muerte
     */
    die(killType = DIE_TYPES.STOMP) {
        if (killType === DIE_TYPES.STOMP) {
            this.stomp();
        } 
        else {
            this.safeDestroy();
        }
    }

    /**
     * Actualiza el movimiento del Koopa basado en visibilidad y dirección
     * Solo se mueve cuando está visible en cámara. Reproduce la animación de caminar según el tipo
     */
    updateMovement() {
        if (this.shouldBeDestroyed) return;

        const isVisible = this.checkVisibility();
        this.currentlyVisible = isVisible;
        
        if (this.isAlive && !this.shouldBeDestroyed) {
            if (isVisible) {
                const targetVelocity = this.speed * this.direction;

                if (this.body.velocity.x !== targetVelocity) {
                    this.setVelocityX(targetVelocity);
                }

                if (!this.anims.isPlaying || (this.type === 0 && this.anims.currentAnim.key !== 'Koopa_walk')) {
                    this.play('Koopa_walk');
                } 
                else if (!this.anims.isPlaying || (this.type === 1 && this.anims.currentAnim.key !== 'Koopa_walk_R')) {
                    this.play('Koopa_walk_R');
                }
                else if (!this.anims.isPlaying || (this.type === 2 && this.anims.currentAnim.key !== 'Koopa_walk_E')) {
                    this.play('Koopa_walk_E');
                }
                else if (!this.anims.isPlaying || (this.type === 3 && this.anims.currentAnim.key !== 'Koopa_walk_G')) {
                    this.play('Koopa_walk_G');
                }
            } else {
                this.setVelocityX(0);
                if (this.anims.isPlaying) {
                    this.anims.stop();
                }
            }
        } else {
            if (this.anims.isPlaying) {
                this.anims.stop();
            }
        }
    }

    /**
     * Cambia la dirección de movimiento del Koopa
     * Invierte la dirección y voltea el sprite horizontalmente
     */
    changeDirection() {
        this.direction *= -1;
        this.flipX = (this.direction === 1);
        this.setVelocityX(this.speed * this.direction);
    }

    /**
     * Maneja las colisiones con paredes
     * Cuando detecta una colisión lateral, retrocede ligeramente y cambia de dirección
     * @param {Object} wall - Objeto pared con el que colisionó (no usado actualmente)
     */
    handleWallCollision(wall) {
        if (!this.isAlive) return;

        const isLateralCollision = 
            (this.blocked.right && this.direction === 1) ||
            (this.blocked.left && this.direction === -1) ||
            (this.blocked.right && this.direction === 1) ||
            (this.blocked.left && this.direction === -1);

        if (isLateralCollision) {
            const pushBack = 5;
            if (this.direction === 1) {
                this.x -= pushBack;
            } else {
                this.x += pushBack;
            }
    
            this.changeDirection();
        }
    }

    /**
     * Maneja las colisiones con otros enemigos
     * Separa físicamente los enemigos y hace que ambos cambien de dirección
     * @param {Enemies} otherEnemy - Referencia al otro enemigo con el que colisionó
     */
    handleEnemyCollision(otherEnemy) {
        if (!this.isAlive || !otherEnemy.isAlive) return;

        const bounds1 = this.getBounds();
        const bounds2 = otherEnemy.getBounds();

        const overlapX = Math.min(bounds1.right, bounds2.right) - Math.max(bounds1.left, bounds2.left);

        if (overlapX > 5) {
            const separation = overlapX / 2 + 5;
            const dx = otherEnemy.x - this.x;

            if (dx > 0) {
                this.x -= separation;
                otherEnemy.x += separation;
            } else {
                this.x += separation;
                otherEnemy.x -= separation;
            }
        }

        this.changeDirection();
        otherEnemy.changeDirection();
    }

    /**
     * Verifica si el Koopa está dentro del área visible de la cámara
     * @returns {boolean} true si está visible, false en caso contrario
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
     * Maneja las colisiones con el jugador
     * Si el jugador cae sobre el Koopa, lo convierte en caparazón. 
     * Si colisiona lateralmente, causa daño al jugador
     * @param {Object} player - Referencia al objeto jugador
     */
    handlePlayerCollision(player) {
        if (!this.isAlive) return;

        if (player.isInvincible) {
            this.stomp();
            return;
        }

        if (player.body.velocity.y>0.7) {
            player.isInvulnerable = true;
            player.canEnemyJump = true; 
            this.stomp();
            player.setVelocityY(-4.5);

            this.scene.time.delayedCall(300, () => {
                player.canEnemyJump=false;
            });
            this.scene.time.delayedCall(150, () => {
                player.isInvulnerable = false;
            });
        } else if (this.isAlive && !player.isBeingPushed && !player.isInvulnerable) {
            if (!player.isSuperSize && !this.scene.endTimer) {
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
            } else {
                let pushDirection = 0;

                if (player.x < this.x) {
                    pushDirection = -1;
                } else {
                    pushDirection = 1;
                }

                player.takeDamage(pushDirection);
            }
        }
    }

    /**
     * Convierte al Koopa en caparazón
     * Cambia el estado a muerto, detiene el movimiento, cambia a sprite de caparazón y programa su destrucción
     */
    stomp() {
        if (!this.isAlive || this.shouldBeDestroyed) return;
        
        this.stompSound.play();

        this.isAlive = false;
        this.setVelocity(0, 0);
        this.body.collisionFilter.mask = 0;

        if (this.anims.isPlaying) {
            this.anims.stop();
        }
        
        if (this.scene.textures.exists('Koopa_shell_G') && this.type === 3) {
            this.setTexture('Koopa_shell_G');
        }
        else{
            this.setTexture('Koopa_shell');
        }

        this.scene.increaseScore(200, 'score');

        this.scene.time.delayedCall(2000, () => {
            this.safeDestroy();
        });
    }

    /**
     * Detecta bordes de plataformas para evitar que el Koopa se caiga
     * Usa raycasting y verificación de tiles para determinar si hay suelo adelante
     */
    checkForLedges() {
        if (!this.body) return;

        const checkDistance = 5;
        const yOffset = 5;
        const futureX = this.x + (this.direction * (this.width / 2 + checkDistance));
        const futureY = this.body.bottom + yOffset;

        let hasGroundAhead = false;

        const checkPoints = [
            { x: futureX, y: futureY },
            { x: futureX + (this.direction * 5), y: futureY }
        ];

        const rayHitsLabel = (label) => {
            for (const point of checkPoints) {
                const collisions = Phaser.Physics.Matter.Matter.Query.ray(
                    this.scene.matter.world.localWorld.bodies,
                    { x: point.x, y: point.y },
                    { x: point.x + this.direction * 10, y: point.y }
                );

                if (collisions.some(hit => hit.body.label === label)) {
                    return true;
                }
            }
            return false;
        };

        if (this.scene.groundLayer) {
            for (const point of checkPoints) {
                const tile = this.scene.groundLayer.getTileAtWorldXY(point.x, point.y);
                if (tile && tile.collides) {
                    hasGroundAhead = true;
                    break;
                }
            }
        }

        if (!hasGroundAhead && this.scene.blockLayer) {
            for (const point of checkPoints) {
                const tile = this.scene.blockLayer.getTileAtWorldXY(point.x, point.y);
                if (tile && tile.collides) {
                    hasGroundAhead = true;
                    break;
                }
            }
        }

        if (rayHitsLabel('ground') || rayHitsLabel('block')) {
            hasGroundAhead = true;
        }

        if (!hasGroundAhead) {
            this.changeDirection();
        }
    }

    /**
     * Destruye el Koopa de forma segura
     * Detiene física, animaciones y elimina el objeto completamente
     */
    safeDestroy() {
        if (this.shouldBeDestroyed) return;
        
        this.shouldBeDestroyed = true;
        
        if (this.body) {
            this.setVelocity(0, 0);
            this.body.enable = false;
        }
        
        if (this.anims) {
            this.anims.stop();
        }
        
        this.setVisible(false);
        this.setActive(false);
        
        this.destroy();
    }
    
    /**
     * Método de actualización llamado cada frame
     * Gestiona destrucción por salir de cámara o caer al vacío, y actualiza el movimiento
     * @param {number} time - Tiempo total transcurrido desde el inicio del juego
     * @param {number} delta - Tiempo transcurrido desde el último frame
     */
    update(time, delta) {
        if (!this.isAlive || this.shouldBeDestroyed) return;

        const camera = this.scene.cameras.main;

        if (this.x < camera.scrollX - 15) {
            this.safeDestroy();
            return;
        }
        
        if (this.y > this.scene.matter.world.bounds + 100) {
            this.safeDestroy();
            return;
        }
        if(this.blocked.right || this.blocked.left)
        {
            this.handleWallCollision();
        }

        if (this.isAlive && !this.shouldBeDestroyed) {
            this.updateMovement();
        }
    }
}
export default Koopa;