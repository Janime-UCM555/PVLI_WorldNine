class Goomba extends Phaser.GameObjects.Sprite
{
    constructor(scene, x, y, texture, speed = 50, isRome) {
        super(scene, x, y, texture);

        scene.add.existing(this);
        scene.matter.add.gameObject(this);

        this.speed = speed; // Velocidad del Goomba
        this.isRome = isRome; // Es romano o no
        this.direction = 1; // 1 = derecha, -1 = izquierda
        this.isAlive = true; // Estado de vivo o muerto
        this.currentlyVisible = false; // Estado actual de visibilidad
        this.shouldBeDestroyed = false; // Control de destrucción

        // Configuración de física
        //Sensores
        this.blocked= {
            left: false,
            right: false,
            bottom: false,
            up: false
        },
        this.numTouching= {
                left: 0,
                right: 0,
                bottom: 0,
                up:0
        }; 
        const sx = this.width/2;
        const sy = this.height/2;
        const w = this.width;
        const h = this.height;
        const M = Phaser.Physics.Matter.Matter;
        this.enemyBody = M.Bodies.rectangle(sx,sy, w, h, { chamfer: { radius: 10 } });
        this.sensors = {
            bottom: M.Bodies.rectangle(sx, h, sx, 5, { isSensor: true }),
            left: M.Bodies.rectangle(sx-w*0.45, sy, 5, h*0.25, { isSensor: true }),
            right: M.Bodies.rectangle(sx+w*0.45, sy, 5, h*0.25, { isSensor: true }),
        };
        const compoundBody = M.Body.create({
        parts: [this.enemyBody,this.sensors.bottom, this.sensors.left, this.sensors.right],
        friction: 0,
        frictionAir: 0,
        restitution: 0.05 // El jugador no se pega a paredes
        });
        this.setExistingBody(compoundBody);
        this.setFixedRotation();
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

        }
    }

    // Verificar visibilidad
    checkVisibility() {
        // Si está marcado para destrucción, no verificar visibilidad
        if (this.shouldBeDestroyed) return false;
        
        const camera = this.scene.cameras.main;
        
        // Verificar si está dentro de los límites de la cámara con un margen
        const margin = 15;
        const isVisible = this.x >= camera.scrollX - margin && this.x <= camera.scrollX + camera.width + margin && this.y >= camera.scrollY - margin && this.y <= camera.scrollY + camera.height + margin;
        
        return isVisible;
    }

    // Actualizar movimiento basado en visibilidad y dirección
    updateMovement() {
        // Si está marcado para destrucción, no actualizar movimiento
        if (this.shouldBeDestroyed) return;

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
            
                if (!this.anims.isPlaying || (this.isRome && this.anims.currentAnim.key !== 'gombrome_walk')) {
                    this.play('gombrome_walk');
                } else if (!this.anims.isPlaying || (!this.isRome && this.anims.currentAnim.key !== 'Gomb_Walk')) {
                    this.play('Gomb_Walk');
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

    // Cambiar dirección
    changeDirection() {
        this.direction *= -1;

        // Voltear horizontalmente
        this.flipX = (this.direction === -1);

        // Aplicar la nueva dirección inmediatamente
        this.setVelocityX(this.speed * this.direction);
    }

    // Manejar colisiones con paredes
    handleWallCollision(wall) {
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

    // Manejar colisiones con otros enemigos
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

    // Manejar colisiones con Mario
    handlePlayerCollision(player) {
        // Ignorar si está muerto
        if (!this.isAlive) return;

        if(player.isInvincible) {
            this.stomp();
            return;
        }

        // Verificar si Mario está cayendo y golpea desde arriba
        if (player.body.velocity.y>1) {
            // Hacer a Mario invulnerable temporalmente
            player.isInvulnerable = true;

            // Mario aplasta al Goomba
            player.isGrounded = true;
            this.stomp();
        
            // Pequeño rebote para Mario
            player.setVelocityY(-4.5);

            // Quitar invulnerabilidad temporal a Mario
            this.scene.time.delayedCall(150, () => {
                player.isInvulnerable = false;
            });
        } else if (this.isAlive && !player.isBeingPushed && !player.isInvulnerable) {
            // Colisión lateral
            let pushDirection = 0; // Determinar dirección del empuje

            // Calcular la dirección de la colisión
            if (player.x < this.x) {
                // Goomba está a la derecha de Mario -> empujar a Mario hacia la izquierda
                pushDirection = -1;
            } else {
                // Goomba está a la izquierda de Mario -> empujar a Mario hacia la derecha
                pushDirection = 1;
            }

            const playerWasSuperSize = player.isSuperSize;
            player.takeDamage(pushDirection);
            if (!playerWasSuperSize && !this.scene.endTimer) {
                // Si Mario ha colisionado lateralmente con un Goomba siendo pequeño se reinicia el nivel
                this.scene.sound.play('muerte');
                this.scene.restartLevel();
            }
        }
    }

    // Ser aplastado por Mario
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
        if (this.scene.textures.exists('GombRome_Stomp')) {
            this.setTexture('GombRome_Stomp');
        }

        this.scene.increaseScore(200, 'score');

        // Destruir después de un tiempo
        this.scene.time.delayedCall(2000, () => {
            this.safeDestroy();
        });
    }

    // Detectar bordes de plataformas
    checkForLedges() {
        if (!this.body || !this.blocked.bottom) return;
    
        // Raycast para detectar si hay suelo adelante
        const checkDistance = 5;
        const yOffset = 5; // Pequeño margen debajo de los pies
        const futureX = this.x + (this.direction * (this.width / 2 + checkDistance)); // Calcular posición X considerando la dirección y el ancho del sprite
        const futureY = this.body.bottom + yOffset; // Calcular posición Y (justo debajo de los pies del Goomba)

        let hasGroundAhead = false;

        // Verificar múltiples puntos para mayor precisión
        const checkPoints = [
            { x: futureX, y: futureY }, // Punto futuro
            { x: futureX + (this.direction * 5), y: futureY } // Punto futuro un poco más adelante
        ];

        // const rayHitsLabel = (label)=>
        // {
        //     for (const point of checkPoints)
        //     {
        //         const collisions = Phaser.Physics.Matter.Matter.Query.ray(
        //         this.scene.matter.world.localWorld.bodies,
        //         checkPoints,
        //         checkPoints
        //         );
                
        //         if (collisions.some(hit => hit.body.label === label)) {
        //             return true;
        //         }
        //     }
        //     return false;
        // }

        // Verificar en groundLayer
        // if (this.scene.groundLayer) {
        //     for (const point of checkPoints) {
        //         const tile = this.scene.groundLayer.getTileAtWorldXY(point.x, point.y);
        //         if (tile && tile.collides) {
        //             hasGroundAhead = true;
        //             break;
        //         }
        //     }
        // }
    
        // // Si no ha encontrado en groundLayer, verificar en blockLayer
        // if (!hasGroundAhead && this.scene.blockLayer) {
        //     for (const point of checkPoints) {
        //         const tile = this.scene.blockLayer.getTileAtWorldXY(point.x, point.y);
        //         if (tile && tile.collides) {
        //             hasGroundAhead = true;
        //             break;
        //         }
        //     }
        // }
        // if(rayHitsLabel('ground'))
        // {
        //     hasGroundAhead=true;
        // }
        // if(!hasGroundAhead && rayHitsLabel('block'))
        // {
        //     hasGroundAhead=true;
        // }

        // Si no hay suelo adelante, cambiar dirección
        // if (!hasGroundAhead) {
        //     this.changeDirection();
        // }
    }

    // Destrucción segura
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

    update(time, delta) {
        // Salir inmediatamente si ya está marcado para destrucción
        if (this.shouldBeDestroyed) return;

        const camera = this.scene.cameras.main;

        this.scene.matter.world.on('beforeupdate', function (event) {
            this.numTouching.left = 0;
            this.numTouching.right = 0;
            this.numTouching.bottom = 0;
        },this);

        this.scene.matter.world.on('collisionactive', (event) => {
            for (let i = 0; i < event.pairs.length; i++)            
            {
                const bodyA = event.pairs[i].bodyA;
                const bodyB = event.pairs[i].bodyB;
                if (bodyA === this.enemyBody || bodyB === this.enemyBody)
                {
                    continue;
                }
                if (bodyA === this.sensors.bottom || bodyB === this.sensors.bottom)
                {
                    this.numTouching.bottom += 1;
                }
                if ((bodyA === this.sensors.left && bodyB.isStatic) || (bodyB === this.sensors.left && bodyA.isStatic))
                {
                    this.numTouching.left += 1;
                }
                if ((bodyA === this.sensors.right && bodyB.isStatic) || (bodyB === this.sensors.right && bodyA.isStatic))
                {
                    this.numTouching.right += 1;
                }
            };
        });
        this.scene.matter.world.on('afterupdate', function (event) {
            this.blocked.right = this.numTouching.right > 0 ? true : false;
            this.blocked.left = this.numTouching.left > 0 ? true : false;
            this.blocked.bottom = this.numTouching.bottom > 0 ? true : false;
        },this);

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

        // Verificar bordes
        if (this.isAlive && !this.shouldBeDestroyed && this.blocked.bottom) {
            this.checkForLedges();
        }

        // Actualizar movimiento solo si está vivo y no está marcado para destrucción
        if (this.isAlive && !this.shouldBeDestroyed) {
            this.updateMovement();
        }
    }
}
export default Goomba;