/**
 * Tipos de muerte disponibles para los enemigos
 * @enum {string}
 */
export const DIE_TYPES = {
    STOMP:   'STOMP',    // Aplastado por Mario
    HAMMER:  'HAMMER',   // Golpeado por martillo
    STAR:    'STAR',     // Golpeado mientras Mario es invencible
    FALL:    'FALL',     // Caída al vacío
};

import{
    CATEGORY_PLAYER,
    CATEGORY_ENEMY,
    CATEGORY_POWERUP,
    CATEGORY_TERRAIN,
    CATEGORY_FALLOFF
} from "../collisionCategories.js"

/**
 * Clase que representa un enemigo Goomba en el juego.
 * El Goomba camina horizontalmente y al ser pisado se aplasta completamente.
 * Es el enemigo más básico del juego.
 * @extends Phaser.GameObjects.Sprite
 */
class Goomba extends Phaser.GameObjects.Sprite
{
    /**
     * Constructor del Goomba
     * @param {Phaser.Scene} scene - La escena de Phaser donde se añade el Goomba
     * @param {number} x - Posición X inicial
     * @param {number} y - Posición Y inicial
     * @param {string} texture - Clave de la textura a usar
     * @param {number} [speed=50] - Velocidad de movimiento horizontal
     * @param {Phaser.Scene} currentScene - Referencia a la escena actual
     * @param {number} type - Tipo de Goomba (0: normal, 1: roma, 2: egipcio, 3: griego)
     */
    constructor(scene, x, y, texture, speed = 50, currentScene, type) {
        super(scene, x, y, texture, null, speed, currentScene, type);

        scene.add.existing(this);
        scene.matter.add.gameObject(this);

        this.speed = speed; // Velocidad del Koopa
        this.type = type; // Tipo de koopa
        this.direction = -1; // 1 = derecha, -1 = izquierda
        this.isAlive = true; // Estado de vivo o muerto
        this.currentlyVisible = false; // Estado actual de visibilidad
        this.shouldBeDestroyed = false; // Control de destrucción
        this.isEnemy = true; // Marca como enemigo
        
        this.direction = 1; // 1 = derecha, -1 = izquierda
        this.type = type;

        // Configuración de física - Sensores
        this.blocked= {
            left: false,
            right: false,
        };
        this.numTouching= {
            left: 0,
            right: 0,
        }; 

        this.setDepth(2);
        this.setCollisionCategory([CATEGORY_ENEMY]);
        this.setCollidesWith([CATEGORY_PLAYER,CATEGORY_TERRAIN, CATEGORY_ENEMY]);
        const sx = this.width/2;
        const sy = this.height/2;
        const w = this.width;
        const h = this.height;
        const M = Phaser.Physics.Matter.Matter;
        this.enemyBody = M.Bodies.rectangle(sx,sy, w, h, { chamfer: { radius: 10 }, label:"Goomba" });
        this.sensors = {
            left: M.Bodies.rectangle(sx-w*0.45, sy, 5, h*0.25, { isSensor: true, label:"Goomba" }),
            right: M.Bodies.rectangle(sx+w*0.45, sy, 5, h*0.25, { isSensor: true, label:"Goomba" }),
        };
        const compoundBody = M.Body.create({
        parts: [this.enemyBody,this.sensors.left, this.sensors.right],
        friction: 0,
        frictionAir: 0,
        restitution: 0.05, // El jugador no se pega a paredes
        label:"Goomba"
        });
        this.setExistingBody(compoundBody);
        if (this.body) {
            // this.body.setCollideWorldBounds(false); // Desactivar colisión con bordes del mundo

            // Asegurar que el cuerpo es dinámico y puede colisionar
            // this.body.setImmovable(false);
            this.body.moves = true;

            // Mejorar la detección de colisiones
            this.body.onWorldBounds = true;

            this.setVelocityX(0); // Inicialmente detenido

            // Configurar las propiedades de colisión
            this.setBounce(0, 0);
            // this.setDrag(200, 0);
            // El cuerpo a la posición inicial
            M.Body.setPosition(compoundBody, { x, y });

            // Asociamos el cuerpo al sprite
            this.setExistingBody(compoundBody);
            this.setPosition(x, y); // sincronizar la posición del sprite
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

                // verificamos si esta tocando pared derecha
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
     * Método llamado cuando el Goomba muere
     * A diferencia del Koopa, el Goomba siempre se aplasta independientemente del tipo de muerte
     * @param {string} [killType=DIE_TYPES.STOMP] - Tipo de muerte (no afecta al Goomba)
     */
    die(killType = DIE_TYPES.STOMP) {
        this.stomp();
    }

    /**
     * Actualiza el movimiento del Goomba basado en visibilidad y dirección
     * Solo se mueve cuando está visible en cámara. Reproduce la animación de caminar según el tipo
     */
    updateMovement() {
        // Si está marcado para destrucción, no actualizar movimiento
        if (this.shouldBeDestroyed || !this.isAlive) return;

        const isVisible = this.checkVisibility();
        this.currentlyVisible = isVisible;
        
        if (this.isAlive && !this.shouldBeDestroyed) {
            if (isVisible) {
                // Aplicar movimiento en la dirección actual
                const targetVelocity = this.speed * this.direction;

                // Solo cambiar la velocidad si es diferente a la actual
                if (this.body.velocity.x !== targetVelocity) {
                    this.setVelocityX(targetVelocity);
                }
            
                if (!this.anims.isPlaying || (this.type === 0 && this.anims.currentAnim.key !== 'gomb_walk')) {
                    this.play('gomb_walk');
                } 
                else if (!this.anims.isPlaying || (this.type === 1 && this.anims.currentAnim.key !== 'gombrome_walk')) {
                    this.play('gombrome_walk');
                }
                else if (!this.anims.isPlaying || (this.type === 2 && this.anims.currentAnim.key !== 'gombegypt_walk')) {
                    this.play('gombegypt_walk');
                }
                else if (!this.anims.isPlaying || (this.type === 3 && this.anims.currentAnim.key !== 'gombgreece_walk')) {
                    this.play('gombgreece_walk');//
                }
            } else {
                // Detenerse completamente si no es visible
                this.setVelocityX(0);
                if (this.anims.isPlaying) {
                    this.anims.stop();
                }
            }
        } else {
            // Si está muerto, detener animación
            if (this.anims.isPlaying) {
                this.anims.stop();
            }
        }
    }

    /**
     * Cambia la dirección de movimiento del Goomba
     * Invierte la dirección y voltea el sprite horizontalmente
     */
    changeDirection() {
        this.direction *= -1;

        // Voltear horizontalmente
        this.flipX = (this.direction === -1);

        // Aplicar la nueva dirección inmediatamente
        this.setVelocityX(this.speed * this.direction);
    }

    /**
     * Maneja las colisiones con paredes
     * Cuando detecta una colisión lateral, retrocede ligeramente y cambia de dirección
     */
    handleWallCollision() {
        if (!this.isAlive) return;

        // Verificar si es una colisión lateral (no desde arriba/abajo)
        const isLateralCollision = 
            (this.blocked.right && this.direction === 1) ||
            (this.blocked.left && this.direction === -1) ||
            (this.blocked.right && this.direction === 1) ||
            (this.blocked.left && this.direction === -1);
        if (isLateralCollision) {
            // Pequeño retroceso para evitar que se peguen
            const pushBack = 5;
            if (this.direction === 1) {
                this.x -= pushBack;
            } else {
                this.x += pushBack;
            }
    
            // this.body.updateFromGameObject();
    
            // Cambiar dirección
            this.changeDirection();
        }
    }

    /**
     * Maneja las colisiones con otros enemigos
     * Separa físicamente los enemigos y hace que ambos cambien de dirección
     * @param {Enemies} otherEnemy - Referencia al otro enemigo con el que colisionó
     */
    handleEnemyCollision(otherEnemy) {
        // Ignorar si alguno está muerto
        if (!this.isAlive || !otherEnemy.isAlive) return;

        // Calcular superposición usando getBounds()
        const bounds1 = this.getBounds();
        const bounds2 = otherEnemy.getBounds();

        const overlapX = Math.min(bounds1.right, bounds2.right) - Math.max(bounds1.left, bounds2.left);

        // Si hay superposición significativa
        if (overlapX > 5) {
            // Separación física inmediata
            const separation = overlapX / 2 + 5;

            // Calcular dirección de la colisión
            const dx = otherEnemy.x - this.x;

            if (dx > 0) {
                // otherEnemy está a la derecha de this
                this.x -= separation;
                otherEnemy.x += separation;
            } else {
                // this está a la derecha de otherEnemy
                this.x += separation;
                otherEnemy.x -= separation;
            }
        }

        // Actualizar cuerpos físicos
        // this.body.updateFromGameObject();
        // otherEnemy.body.updateFromGameObject();

        // Ambos cambian de dirección
        this.changeDirection();
        otherEnemy.changeDirection();
    }

    /**
     * Maneja las colisiones con el jugador
     * Si el jugador cae sobre el Goomba, lo aplasta. 
     * Si colisiona lateralmente, causa daño al jugador o lo envía a estado de burbuja
     * @param {Object} player - Referencia al objeto jugador
     */
    handlePlayerCollision(player) {
        // Ignorar si está muerto
        if (!this.isAlive) return;

        if(player.isInvincible) {
            this.stomp();
            return;
        }

        // Verificar si Mario está cayendo y golpea desde arriba
        // console.log(player.body.velocity.y);
        if ((player.body.velocity.y > 0.7 || player.getCenter().y > this.sy)) {
            // Hacer a Mario invulnerable temporalmente
            player.isInvulnerable = true;

            // Mario aplasta al Goomba
            // player.isGrounded = true;
            player.canEnemyJump = true; 
            this.stomp()
            // Pequeño rebote para Mario
            player.setVelocityY(-4.5);

            // Quitar invulnerabilidad temporal a Mario
            this.scene.time.delayedCall(250, () => {
                player.canEnemyJump=false;
            });
            this.scene.time.delayedCall(150, () => {
                player.isInvulnerable = false;
                // player.canEnemyJump=false;
            });
        } else if (this.isAlive && !player.isBeingPushed && !player.isInvulnerable) {
            // Colisión lateral
            // Si Mario ha colisionado lateralmente con un Goomba siendo pequeño, Mario pasa a estado de burbuja si le quedan burbujas, si no se vuelve al menú
            if (!player.isSuperSize && !this.scene.endTimer) {
                this.scene.sound.play('muerte');

                // Detener cualquier movimiento de Mario antes de la burbuja
                player.setVelocity(0, 0);
                if (player.body) {
                    player.body.velocity.x = 0;
                    player.body.velocity.y = 0;
                }
                if (!this.scene.isBoss)
                {
                    if (player.bubblesLeft > 0) {
                        player.Bubble(); // Entra en burbuja
                    } else {
                        player.hurt();
                        player.setStatic(true);
                        this.body.collisionFilter.mask = 0; // Desactivar completamente las colisiones
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
                // Colisión lateral
                let pushDirection = 0; // Determinar dirección del empuje
                player.takeDamage(pushDirection);
            }
        }
    }

    /**
     * Aplasta al Goomba
     * Cambia el estado a muerto, detiene el movimiento, cambia a sprite aplastado,
     * otorga puntos al jugador y programa su destrucción
     */
    stomp() {
        // Si está muerto o marcado para destrucción, no aplicar empuje
        if (!this.isAlive || this.shouldBeDestroyed) return;
        
        this.stompSound.play();

        this.isAlive = false;
        this.setVelocity(0, 0);
        this.body.collisionFilter.mask = 0;
        // this.body.checkCollision.none = true;

        if (this.anims.isPlaying) {
            this.anims.stop();
        }
        
        // Cambiar a sprite de aplastado si existe
        if (this.scene.textures.exists('GombRome_Stomp') && this.type == 1) {
            this.setTexture('GombRome_Stomp');
        }else if (this.scene.textures.exists('Gomb_Stomp')&& this.type == 0)
        {
            this.setTexture('Gomb_Stomp');            
        }
        else if (this.scene.textures.exists('GombEgypt_Stomp')&& this.type == 2)
        {
            this.setTexture('GombEgypt_Stomp');            
        }
        else if (this.scene.textures.exists('GombGreece_Stomp')&& this.type == 3)
        {
            this.setTexture('GombGreece_Stomp');            
        }

        this.scene.increaseScore(200, 'score');

        // Destruir después de un tiempo
        this.scene.time.delayedCall(2000, () => {
            this.safeDestroy();
        });
    }

    /**
     * Detecta bordes de plataformas para evitar que el Goomba se caiga
     * Usa raycasting y verificación de tiles para determinar si hay suelo adelante
     */
    checkForLedges() {
        if (!this.body || !this.blocked.bottom) return;

        const checkDistance = 5;
        const yOffset = 5; // Pequeño margen debajo de los pies
        const futureX = this.x + (this.direction * (this.width / 2 + checkDistance)); // Calcular posición X considerando la dirección y el ancho del sprite
        const futureY = this.body.bottom + yOffset;  // Calcular posición Y (justo debajo de los pies del Goomba)

        let hasGroundAhead = false;

        // Verificar múltiples puntos para mayor precisión
        const checkPoints = [
            { x: futureX, y: futureY }, // Punto futuro
            { x: futureX + (this.direction * 5), y: futureY } // Punto futuro un poco más adelante
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

        // Verificar en groundLayer
        if (this.scene.groundLayer) {
            for (const point of checkPoints) {
                const tile = this.scene.groundLayer.getTileAtWorldXY(point.x, point.y);
                if (tile && tile.collides) {
                    hasGroundAhead = true;
                    break;
                }
            }
        }

        // Si no ha encontrado en groundLayer, verificar en blockLayer
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

        // Si no hay suelo adelante, cambiar dirección
        if (!hasGroundAhead) {
            this.changeDirection();
        }
    }

    /**
     * Destruye el Goomba de forma segura
     * Detiene física, animaciones y elimina el objeto completamente
     */
    safeDestroy() {
        // Si ya está marcado para destrucción, no hacer nada
        if (this.shouldBeDestroyed) return;
        
        this.shouldBeDestroyed = true;
        
        // Detener todas las físicas inmediatamente
        if (this.body) {
            this.setVelocity(0, 0);
            // this.body.checkCollision.none = true;
            this.body.enable = false;
        }
        
        // Detener animaciones
        if (this.anims) {
            this.anims.stop();
        }
        
        // Hacer invisible inmediatamente
        this.setVisible(false);
        this.setActive(false);
        
        // Destruir el objeto
        this.destroy();
    }

    /**
     * Verifica si el Goomba está dentro del área visible de la cámara
     * @returns {boolean} true si está visible, false en caso contrario
     */
    checkVisibility() {
        // Si está marcado para destrucción, no verificar visibilidad
        if (this.shouldBeDestroyed) return false;
        
        const camera = this.scene.cameras.main;
        
        // Verificar si está dentro de los límites de la cámara con un margen
        const margin = 15;
        const isVisible = this.x >= camera.scrollX - margin && this.x <= camera.scrollX + camera.width + margin && this.y >= camera.scrollY - margin && this.y <= camera.scrollY + camera.height + margin;
        
        return isVisible;
    }

    /**
     * Método de actualización llamado cada frame
     * Gestiona destrucción por salir de cámara o caer al vacío, colisiones con paredes
     * y actualiza el movimiento del Goomba
     * @param {number} time - Tiempo total transcurrido desde el inicio del juego
     * @param {number} delta - Tiempo transcurrido desde el último frame
     */
    update(time, delta) {
        // Salir inmediatamente si ya está marcado para destrucción
        if (!this.isAlive || this.shouldBeDestroyed) return;

        const camera = this.scene.cameras.main;

        // Destruir si se sale por la izquierda de la cámara
        if (this.x < camera.scrollX - 15) {
            this.safeDestroy();
            return; // Salir inmediatamente después de marcar para destrucción
        }
        
        // Destruir si se cae al vacío
        if (this.y > this.scene.matter.world.bounds + 100) {
            this.safeDestroy();
            return; // Salir inmediatamente después de marcar para destrucción
        }

        if(this.blocked.right || this.blocked.left)
        {
            this.handleWallCollision();
        }

        // // Verificar bordes
        // if (this.isAlive && !this.shouldBeDestroyed && !this.blocked.bottom) {
        //     this.checkForLedges();
        // }

        // Actualizar movimiento solo si está vivo y no está marcado para destrucción
        if (this.isAlive && !this.shouldBeDestroyed) {
            this.updateMovement();
        }
    }
}
export default Goomba;