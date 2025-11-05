class Goomba extends Phaser.GameObjects.Sprite
{
    constructor(scene, x, y, texture, speed = 50, isRome) {
        super(scene, x, y, texture);

        scene.add.existing(this);
        scene.physics.add.existing(this);

        this.speed = speed; // Velocidad del Goomba
        this.isRome = isRome; // Es romano o no
        this.direction = 1; // 1 = derecha, -1 = izquierda
        this.isAlive = true; // Estado de vivo o muerto
        this.currentlyVisible = false; // Estado actual de visibilidad
        this.shouldBeDestroyed = false; // Control de destrucción

        // Configuración de física
        if (this.body) {
            this.body.setGravityY(700);
            this.body.setCollideWorldBounds(false); // Desactivar colisión con bordes del mundo

            // Asegurar que el cuerpo es dinámico y puede colisionar
            this.body.setImmovable(false);
            this.body.moves = true;

            // Mejorar la detección de colisiones
            this.body.onWorldBounds = true;

            this.body.setVelocityX(0); // Inicialmente detenido

            // Configurar las propiedades de colisión
            this.body.setBounce(0, 0);
            this.body.setDrag(200, 0);
            
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
                    this.body.setVelocityX(targetVelocity);
                }
            
                if (!this.anims.isPlaying || (this.isRome && this.anims.currentAnim.key !== 'goombarome_walk')) {
                    this.play('goombarome_walk');
                } else if (!this.anims.isPlaying || (!this.isRome && this.anims.currentAnim.key !== 'goomba_walk')) {
                    this.play('goomba_walk');
                }
            } else {
                // Detenerse completamente si no es visible
                this.body.setVelocityX(0);
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
        this.body.setVelocityX(this.speed * this.direction);
    }

    // Ser aplastado por Mario
    stomp() {
        // Si está muerto o marcado para destrucción, no aplicar empuje
        if (!this.isAlive || this.shouldBeDestroyed) return;
        
        this.stompSound.play();

        this.isAlive = false;
        this.body.setVelocity(0, 0);
        this.body.checkCollision.none = true;

        if (this.anims.isPlaying) {
            this.anims.stop();
        }
        
        // Cambiar a sprite de aplastado si existe
        if (this.scene.textures.exists('GombRome_Stomp')) {
            this.setTexture('GombRome_Stomp');
        }

        // Destruir después de un tiempo
        this.scene.time.delayedCall(2000, () => {
            this.safeDestroy();
        });
    }

    // Detectar bordes de plataformas
    checkForLedges() {
        if (!this.body || !this.body.blocked.down) return;
    
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

        // Si no hay suelo adelante, cambiar dirección
        if (!hasGroundAhead) {
            this.changeDirection();
        }
    }

    // Destrucción segura
    safeDestroy() {
        // Si ya está marcado para destrucción, no hacer nada
        if (this.shouldBeDestroyed) return;
        
        this.shouldBeDestroyed = true;
        
        // Detener todas las físicas inmediatamente
        if (this.body) {
            this.body.setVelocity(0, 0);
            this.body.checkCollision.none = true;
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

        // Destruir si se sale por la izquierda de la cámara
        if (this.x < camera.scrollX - 15) {
            this.safeDestroy();
            return; // Salir inmediatamente después de marcar para destrucción
        }
        
        // Destruir si se cae al vacío
        if (this.y > this.scene.physics.world.bounds.bottom + 100) {
            this.safeDestroy();
            return; // Salir inmediatamente después de marcar para destrucción
        }

        // Verificar bordes
        if (this.isAlive && !this.shouldBeDestroyed && this.body.blocked.down) {
            this.checkForLedges();
        }

        // Actualizar movimiento solo si está vivo y no está marcado para destrucción
        if (this.isAlive && !this.shouldBeDestroyed) {
            this.updateMovement();
        }
    }
}
export default Goomba;