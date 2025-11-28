import BossBase, { BOSS_STATE } from './BaseBoss.js';

export default class JupiterBoss extends BossBase {
    /**
     * @param {Phaser.Scene} scene
     * @param {number} x
     * @param {number} y
     * @param {object} config  - igual que BossBase (player, onBattleEnd, etc.)
     */
    constructor(scene, x, y, config = {}) {
        super(scene, x, y, 'jupiter_neutral', {
            ...config,
            // Valores por defecto específicos de Júpiter:
            introDuration: 750,   // duración de la animación de entrada
            neutralMoveSpeed: 0.075,   // Velocidad de Júpiter
        });

        // Precargar el sonido del rayo
        this.lightningSound = scene.sound.add('JupiterLightningSound');

        // Configuración específica de Júpiter
        this.lanes = []; // Posiciones Y de los 3 carriles
        this.laneWidth = 200; // Ancho de cada carril
        this.telegraphDuration = 1500; // Duración del aviso visual
        this.lightningDuration = 400; // Duración del rayo
        
        // Arrays para guardar referencias de efectos
        this.activeTelegraphs = [];
        this.activeLightnings = [];
        this.activeTriangles = [];

        // Variable para el movimiento oscilatorio
        this.oscillationTime = 0;

        // Zonas X donde Júpiter puede atacar
        this.attackZones = [
            { minX: 600, maxX: 1150, id: 1 }, // Zona 1
            { minX: 1250, maxX: 1800, id: 2 }, // Zona 2
            { minX: 2450, maxX: 3000, id: 3 }, // Zona 3
        ];

        this.zoneMovementEnabledIds = [2]; // Solo estas zonas activan movimiento especial

        // Control de estado de ataque
        this.lastAttackZoneId = null;
        this.canAttack = true;
        this.currentZoneId = null; // Zona actual donde está Mario
        this.hasLeftZoneAfterAttack = false; // Indica si Mario ha salido de la zona después del último ataque

        // Variables para el movimiento especial de zona de ataque
        this.isInZoneMovement = false;
        this.zoneMovementStartTime = 0;
        this.zoneMovementDuration = 2000; // 2 segundos de movimiento lento
        this.slowMoveSpeed = -0.0045; // Velocidad lenta durante 2 segundos
        this.fastMoveSpeed = 0.1; // Velocidad rápida para alcanzar la posición

        // Inicializar lanes en el constructor
        // Usar la posición Y del jugador si está disponible
        if (config.player) {
            this.initializeLanes(config.player.y - 130);
        } else {
            // Fallback: usar posición Y por defecto (aproximadamente donde estaría Mario)
            this.initializeLanes(625 - 130); // Posición Y inicial típica de Mario en BossJ
        }

        // Se puede ajustar escala, depth, etc.
        this.setDepth(20);
        this.setScale(4);
        this.setAlpha(0);
    }

    // Verificar si Mario está en una zona de ataque
    isMarioInAttackZone() {
        if (!this.player) {
            return false;
        }
        
        const marioX = this.player.x;
        const currentZone = this.attackZones.find(zone => 
            marioX >= zone.minX && marioX <= zone.maxX
        );
        
        // Verificar si Mario está en alguna de las zonas de ataque
        if (currentZone) {
            return currentZone;
        } else {
            return null;
        }
    }

    // Obtener la zona actual de Mario
    getCurrentAttackZone() {
        if (!this.player) return null;
        
        const marioX = this.player.x;
        
        return this.attackZones.find(zone => 
            marioX >= zone.minX && marioX <= zone.maxX
        );
    }

    // Inicializar lanes
    initializeLanes(baseY) {
        const laneSpacing = 75;
        
        // Las lanes se calculan en relación a la posición Y base
        this.lanes = [
            baseY - (2 * laneSpacing),  // Carril superior
            baseY - laneSpacing,        // Carril medio
            baseY                       // Carril inferior
        ];

        // Actualizar el ancho del carril al ancho de la cámara
        this.laneWidth = this.scene.cameras.main.width / this.scene.cameras.main.zoom;
    }

    changeState(newState) {
        if (this.state === newState) return;

        this.exitState(this.state);
        this.state = newState;
        this._stateTime = 0;

        // Asegurar cambio de sprite al cambiar estado
        switch (newState) {
            case BOSS_STATE.NEUTRAL:
                // Si está en movimiento especial, usar sprite jupiter_tired
                if (this.isInZoneMovement) {
                    this.setTexture('jupiter_tired');
                } else {
                    this.setTexture('jupiter_neutral');
                }
                break;
            case BOSS_STATE.ATTACK:
                // El ataque tiene prioridad sobre el movimiento especial
                this.setTexture('jupiter_attack');
                break;
            case BOSS_STATE.DEAD:
                // La muerte tiene máxima prioridad
                this.setTexture('jupiter_dead');
                break;
        }

        this.enterState(newState);
    }

    // ---------- INTRO ESPECÍFICA DE JÚPITER ----------
    onEnterIntro() {
        this.setAlpha(0);

        this.scene.tweens.add({
            targets: this,
            alpha: 1,
            duration: this.introDuration,
            onComplete: () => {
                // Cuando termina la intro, pasa a estado NEUTRAL
                this.changeState(BOSS_STATE.NEUTRAL);
            }
        });
    }

    updateIntro(time, delta) {
        // Llamar al método padre para que maneje la transición automática
        super.updateIntro(time, delta);
    }

    // ---------- NEUTRAL ----------
    onEnterNeutral() {
        // Llamar al método padre primero
        super.onEnterNeutral();

        // Usar sprite jupiter_neutral
        this.setTexture('jupiter_neutral');
    
        // Inicializar variables específicas de Júpiter
        this.canAttack = true;
    }
    
    // Solo contar tiempo para ataque si está en zona permitida
    updateNeutral(time, delta) {
        if (!this.player) {
            return;
        }

        // Obtener la posición X actual de Mario
        const marioX = this.player.x;

        // Verificar si Mario está en una zona de ataque
        const currentZone = this.attackZones.find(zone => 
            marioX >= zone.minX && marioX <= zone.maxX
        );

        // Manejar cambios de zona
        const previousZoneId = this.currentZoneId;
    
        if (currentZone) {
            // Mario está en una zona
            if (this.currentZoneId !== currentZone.id) {
                this.currentZoneId = currentZone.id;
            
                // Solo marcar hasLeftZoneAfterAttack como true si:
                // - Había una zona anterior (no es el primer ingreso)
                // - Y la zona anterior era diferente a la actual
                if (previousZoneId !== null && previousZoneId !== currentZone.id) {
                    this.hasLeftZoneAfterAttack = true;
                }

                // Iniciar movimiento especial 1.75 segundos después de que Mario entre en una nueva zona
                if (this.zoneMovementEnabledIds.includes(currentZone.id)) {
                    this.scene.time.delayedCall(1750, () => {
                        // Verificar si Mario sigue en una zona de ataque antes de iniciar el movimiento
                        const currentZoneNow = this.getCurrentAttackZone();
                        if (currentZoneNow && currentZoneNow.id === currentZone.id && this.isBattleActive && !this.isInZoneMovement) {
                            this.startZoneMovement();
                        }
                    });
                }
            }
        } else {
            // Mario no está en ninguna zona
            if (this.currentZoneId !== null) {
                this.currentZoneId = null;
                this.hasLeftZoneAfterAttack = true;
            }
        }

        // Condición de ataque
        const canAttackInThisZone = this.lastAttackZoneId === null || this.lastAttackZoneId !== currentZone?.id || this.hasLeftZoneAfterAttack;
    
        if (this.state === BOSS_STATE.NEUTRAL && this.canAttack && currentZone && canAttackInThisZone) {
            this.canAttack = false;
            this.lastAttackZoneId = currentZone.id;
            this.hasLeftZoneAfterAttack = false;
            this.changeState(BOSS_STATE.ATTACK);
        }
    }

    // ---------- ATAQUE ESPECÍFICO DE JÚPITER ----------
    // Estado ATTACK
    onEnterAttack() {
        // Usar sprite jupiter_attack
        this.setTexture('jupiter_attack');
        this.performAttack();
    }

    performAttack() {
        const laneIndex = Phaser.Math.Between(0, 2);
        const laneY = this.lanes[laneIndex];

        this.telegraphLane(laneIndex, laneY);

        this.scene.time.delayedCall(this.telegraphDuration, () => {
            this.spawnLightningInLane(laneIndex, laneY);

            this.scene.time.delayedCall(this.lightningDuration, () => {
                this.finishAttack();
            });
        });
    }

    // Función para el aviso visual
    telegraphLane(laneIndex, laneY) {
        if (!this.player) return;
    
        const marioX = this.player.x;

        // Calcular posición X del rectángulo
        const telegraphX = marioX + (this.laneWidth * 0.25); // Desplazado 25% a la derecha desde Mario

        // Aumentar el ancho del rectángulo para cubrir más área
        const extendedWidth = this.laneWidth * 1.5; // 50% más ancho

        // Crear efecto visual de advertencia (rectángulo rojo semitransparente)
        const telegraph = this.scene.add.rectangle(
            telegraphX,
            laneY,
            extendedWidth,
            100,
            0xff0000,
            0.3
        );
        telegraph.setDepth(15);
        
        // Animación de parpadeo
        this.scene.tweens.add({
            targets: telegraph,
            alpha: { from: 0.2, to: 0.5 },
            duration: 150,
            yoyo: true,
            repeat: 3
        });

        // Crear sprite de triángulo rojo
        const triangle = this.scene.add.sprite(
            marioX + 250,
            laneY - 30, // Posicionar arriba del carril
            'warning_triangle'
        );
        triangle.setDepth(16);
        triangle.setScale(0.8);

        // Animación de parpadeo del triángulo
        this.scene.tweens.add({
            targets: triangle,
            alpha: { from: 0.3, to: 1 },
            scaleX: { from: 0.7, to: 0.9 },
            scaleY: { from: 0.7, to: 0.9 },
            duration: 150,
            yoyo: true,
            repeat: 3
        });

        this.activeTelegraphs.push(telegraph);
        this.activeTriangles.push(triangle);
    }

    // Función para el rayo
    spawnLightningInLane(laneIndex, laneY) {
        if (!this.player) return;

        // Limpiar telegraph de este carril
        this.activeTelegraphs.forEach(telegraph => {
            if (telegraph.active) telegraph.destroy();
        });
        this.activeTriangles.forEach(triangle => {
            if (triangle.active) triangle.destroy();
        });
        
        this.activeTelegraphs = [];
        this.activeTriangles = [];

        // Obtener la posición X actual de Mario
        const marioX = this.player.x;

        // Crear sprite del rayo
        const lightning = this.scene.add.sprite(
            marioX,
            laneY,
            'lightning'
        );
        lightning.setDepth(16);

        // Sonido del rayo
        if (this.scene.sound) {
            this.scene.sound.play('JupiterLightningSound');
        }

        // Animación de aparición y desaparición del rayo
        lightning.setAlpha(0);
        this.scene.tweens.add({
            targets: lightning,
            alpha: 1,
            duration: 50,
            ease: 'Power2',
            onComplete: () => {
                this.scene.tweens.add({
                    targets: lightning,
                    alpha: 0,
                    duration: this.lightningDuration - 50,
                    ease: 'Power2'
                });
            }
        });

        this.activeLightnings.push(lightning);

        // Verificar si golpea al jugador
        this.checkPlayerHit(laneY);
    }

    checkPlayerHit(laneY) {
        if (!this.player || this.player.isInBubble || this.player.isInvulnerable || this.player.isInvincible || this.player.isHurt) return;

        // Obtener los bounds (límites) de Mario
        const playerBounds = this.player.getBounds();

        // Definir el área del rayo
        const lightningWidth = 1000;
        const lightningHeight = 80;
        const lightningBounds = new Phaser.Geom.Rectangle(
            this.player.x - lightningWidth / 2, // Centro en la posición X de Mario
            laneY - lightningHeight / 2,        // Centro en la lane Y
            lightningWidth,
            lightningHeight
        );
        
        // Verificar si los bounds de Mario se solapan con los bounds del rayo
        if (Phaser.Geom.Rectangle.Overlaps(playerBounds, lightningBounds)) {
            // El jugador es golpeado por el rayo
            if (!this.scene.jugador.activePowerUp && !this.scene.jugador.isSuperSize) {
                this.scene.jugador.hurt();
                this.scene.jugador.setVelocityX(0);
                this.scene.jugador.setVelocityY(0);
                this.scene.jugador.body.ignoreGravity = true;
                this.scene.time.delayedCall(1000, () => {
                    this.scene.doubleEndTransition(()=>{
                        this.scene.scene.restart(); // Se reinicia el nivel
                    });
                });
            } else {
                this.scene.time.delayedCall(100, () => {
                    this.scene.jugador.deactivatePowerUp(); // Se le quita el PowerUp
                });
            }

            // Efecto visual cuando golpea al jugador
            this.scene.cameras.main.shake(250, 0.01);
        }
    }

    // Limpiar efectos al terminar el ataque
    finishAttack() {
        // Limpiar efectos
        this.activeTelegraphs.forEach(telegraph => {
            if (telegraph.active) telegraph.destroy();
        });
        this.activeTriangles.forEach(triangle => {
            if (triangle.active) triangle.destroy();
        });
        this.activeLightnings.forEach(lightning => {
            if (lightning.active) lightning.destroy();
        });
        
        this.activeTelegraphs = [];
        this.activeTriangles = [];
        this.activeLightnings = [];

        // Volver a NEUTRAL y permitir nuevo ataque
        if (this.state === BOSS_STATE.ATTACK) {
            this.canAttack = true; // Permitir atacar de nuevo, pero updateNeutral controlará si es en la misma zona
            this.changeState(BOSS_STATE.NEUTRAL);

            // Si estaba en movimiento especial antes del ataque, restaurar el sprite jupiter_tired
            if (this.isInZoneMovement) {
                this.setTexture('jupiter_tired');
            }
        }
    }

    resetAttackState() {
        // Mantener la batalla activa
        this.isBattleActive = true;
    
        // Resetear todas las variables de control de ataque
        this.lastAttackZoneId = null;
        this.canAttack = true;
        this.currentZoneId = null;
        this.hasLeftZoneAfterAttack = false;

        // Resetear también el estado de movimiento de zona
        this.isInZoneMovement = false;
        this.zoneMovementStartTime = 0;
    
        // Establecer sprite jupiter_neutral
        if (this.state === BOSS_STATE.NEUTRAL) {
            this.setTexture('jupiter_neutral');
        }
    
        // Limpiar cualquier ataque en curso
        this.finishAttack();
    
        // Si está en ATTACK, volver a NEUTRAL
        if (this.state === BOSS_STATE.ATTACK) {
            this.changeState(BOSS_STATE.NEUTRAL);
        }
    }

    // Iniciar movimiento especial de zona
    startZoneMovement() {
        // Verificar que Mario esté en una zona válida
        const currentZone = this.getCurrentAttackZone();
        if (!currentZone || !this.zoneMovementEnabledIds.includes(currentZone.id) || this.isInZoneMovement || !this.isBattleActive) {
            return;
        }
    
        this.isInZoneMovement = true;
        this.zoneMovementStartTime = this.scene.time.now;

        // Establecer sprite jupiter_tired al inicio (fase lenta)
        if (this.state !== BOSS_STATE.ATTACK && this.state !== BOSS_STATE.DEAD) {
            this.setTexture('jupiter_tired');
        }
    }

    // ---------- DERROTA ----------
    onEnterDead() {
        // Usar sprite jupiter_dead
        this.setTexture('jupiter_dead');

        // Limpiar efectos al morir
        this.finishAttack();

        // Llamar al método padre para la lógica base
        super.onEnterDead();
    }

    playDeathAnimation() {
        // Limpiar cualquier ataque en curso
        this.finishAttack();

        // Llamar al método padre con la key específica
        super.playDeathAnimation('jupiter_death');
    }

    // ---------- TODOS LOS ESTADOS ----------
    update(time, delta) {
        // Llamar al update del padre para la máquina de estados base
        super.update(time, delta);
    
        // Movimiento continuo independientemente del estado
        this.updateBossMovement(time, delta);

        // Asegurar que el sprite sea el correcto en cada frame
        this.updateSprite();
    }

    updateBossMovement(time, delta) {
        if (this.state === BOSS_STATE.DEAD || !this.player || !this.isBattleActive) return;

        const camera = this.scene.cameras.main;

        // Configuración de distancias
        const cameraWidth = camera.width / camera.zoom; // Ancho real de la vista
        const cameraHeight = camera.height / camera.zoom; // Altura real de la vista
        const cameraLeft = camera.scrollX;
        const cameraRight = cameraLeft + cameraWidth;
        const cameraTop = camera.scrollY;
        const cameraBottom = cameraTop + cameraHeight;
        const oscillationSpeed = 0.001; // Velocidad de oscilación vertical

        // 1. Seguir a Mario en el eje X manteniendo distancia
        const marginLeft = 335; // Margen desde el borde derecho
        const targetX = cameraLeft + marginLeft;
        const diffX = targetX - this.x;

        // Determinar velocidad actual según el estado
        let currentMoveSpeed;

        if (this.isInZoneMovement) {
            const elapsed = time - this.zoneMovementStartTime;
        
            if (elapsed < this.zoneMovementDuration) {
                // Fase 1: Movimiento lento durante 2 segundos
                currentMoveSpeed = this.slowMoveSpeed;
            } else {
                // Fase 2: Movimiento rápido para alcanzar la posición
                currentMoveSpeed = this.fastMoveSpeed;
            
                if (elapsed > this.zoneMovementDuration + 500) {
                    // Ha alcanzado la posición, terminar el movimiento especial
                    this.isInZoneMovement = false;
                }
            }
        
            // Aplicar movimiento en X durante el movimiento especial
            this.x += diffX * currentMoveSpeed;
        } else {
            // Movimiento suavizado en X
            this.x += diffX * this.neutralMoveSpeed;
        }

        // 2. Movimiento oscilatorio en el eje Y
        const minY = cameraTop + 275; // 275 píxeles desde el borde superior de la cámara
        const maxY = cameraBottom - 25; // 25 píxeles desde el borde inferior de la cámara
        const centerY = (minY + maxY) / 2;
        const amplitude = (maxY - minY) / 2;
    
        // Usar el tiempo acumulado para oscilación suave
        if (!this.oscillationTime) this.oscillationTime = 0;
        this.oscillationTime += delta * oscillationSpeed;
    
        this.y = centerY + Math.sin(this.oscillationTime) * amplitude;

        // 3. Actualizar dirección para mirar hacia Mario
        this.flipX = this.player.x > this.x;
    }

    // Método centralizado para actualizar el sprite según el estado actual
    updateSprite() {
        if (this.state === BOSS_STATE.DEAD) {
            this.setTexture('jupiter_dead');
        } else if (this.state === BOSS_STATE.ATTACK) {
            this.setTexture('jupiter_attack');
        } else if (this.isInZoneMovement) {
            // Durante movimiento especial, decidir según la fase
            const elapsed = this.scene.time.now - this.zoneMovementStartTime;
            if (elapsed < this.zoneMovementDuration) {
                // Fase lenta: sprite jupiter_tired
                this.setTexture('jupiter_tired');
            } else {
                // Fase rápida: sprite jupiter_neutral
                this.setTexture('jupiter_neutral');
            }
        } else {
            this.setTexture('jupiter_neutral');
        }
    }

    // Asegurar limpieza si el boss es destruido
    destroy() {
        this.finishAttack();
        super.destroy();
    }
}