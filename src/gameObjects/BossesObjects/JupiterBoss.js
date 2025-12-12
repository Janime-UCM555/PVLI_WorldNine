import BossBase, { BOSS_STATE } from './BaseBoss.js';

/**
 * Boss Júpiter - Dios del trueno
 * Este boss lanza rayos en carriles horizontales específicos cuando el jugador
 * entra en zonas de ataque predefinidas. Incluye movimiento especial y cambios de sprite.
 * @extends BossBase
 */
export default class JupiterBoss extends BossBase {
    /**
     * Constructor de Júpiter
     * @param {Phaser.Scene} scene - La escena de Phaser
     * @param {number} x - Posición X inicial
     * @param {number} y - Posición Y inicial
     * @param {Object} [config={}] - Configuración (igual que BossBase: player, onBattleEnd, etc.)
     * @param {Array<{minX: number, maxX: number, id: number}>} attackZones - Array de zonas donde Júpiter puede atacar
     */
    constructor(scene, x, y, config = {}, attackZones) {
        super(scene, x, y, 'jupiter_neutral', {
            ...config,
            introDuration: 750,
            neutralMoveSpeed: 0.075,
        },attackZones);
        this.attackZones = attackZones;

        this.lightningSound = scene.sound.add('JupiterLightningSound');

        // Configuración de carriles y efectos
        this.lanes = [];
        this.laneWidth = 200;
        this.telegraphDuration = 1500;
        this.lightningDuration = 400;
        
        this.activeTelegraphs = [];
        this.activeLightnings = [];
        this.activeTriangles = [];

        this.oscillationTime = 0;

        this.zoneMovementEnabledIds = [2];

        // Control de estado de ataque por zona
        this.lastAttackZoneId = null;
        this.canAttack = true;
        this.currentZoneId = null;
        this.hasLeftZoneAfterAttack = false;

        // Variables para movimiento especial
        this.isInZoneMovement = false;
        this.zoneMovementStartTime = 0;
        this.zoneMovementDuration = 2000;
        this.slowMoveSpeed = -0.0045;
        this.fastMoveSpeed = 0.1;

        if (config.player) {
            this.initializeLanes(config.player.y - 130);
        } else {
            this.initializeLanes(625 - 130);
        }

        this.setDepth(20);
        this.setScale(4);
        this.setAlpha(0);
    }

    /**
     * Verifica si Mario está en alguna zona de ataque
     * @returns {Object|null} Zona de ataque actual o null si no está en ninguna
     */
    isMarioInAttackZone() {
        if (!this.player) {
            return false;
        }
        
        const marioX = this.player.x;
        const currentZone = this.attackZones.find(zone => 
            marioX >= zone.minX && marioX <= zone.maxX
        );
        
        if (currentZone) {
            return currentZone;
        } else {
            return null;
        }
    }

    /**
     * Obtiene la zona de ataque actual donde se encuentra Mario
     * @returns {Object|null} Zona actual o null
     */
    getCurrentAttackZone() {
        if (!this.player) return null;
        
        const marioX = this.player.x;
        
        return this.attackZones.find(zone => 
            marioX >= zone.minX && marioX <= zone.maxX
        );
    }

    /**
     * Inicializa los carriles horizontales para los rayos
     * @param {number} baseY - Posición Y base desde donde calcular los carriles
     */
    initializeLanes(baseY) {
        const laneSpacing = 75;
        
        this.lanes = [
            baseY - (2 * laneSpacing),
            baseY - laneSpacing,
            baseY
        ];

        this.laneWidth = this.scene.cameras.main.width / this.scene.cameras.main.zoom;
    }

    /**
     * Sobrescribe el cambio de estado para manejar cambios de sprite
     * @param {string} newState - Nuevo estado (uno de BOSS_STATE)
     */
    changeState(newState) {
        if (this.state === newState) return;

        this.exitState(this.state);
        this.state = newState;
        this._stateTime = 0;

        switch (newState) {
            case BOSS_STATE.NEUTRAL:
                if (this.isInZoneMovement) {
                    this.setTexture('jupiter_tired');
                } else {
                    this.setTexture('jupiter_neutral');
                }
                break;
            case BOSS_STATE.ATTACK:
                this.setTexture('jupiter_attack');
                break;
            case BOSS_STATE.DEAD:
                this.setTexture('jupiter_dead');
                break;
        }

        this.enterState(newState);
    }

    /**
     * Lógica al entrar en estado INTRO
     * Realiza fade-in del boss
     */
    onEnterIntro() {
        this.setAlpha(0);

        this.scene.tweens.add({
            targets: this,
            alpha: 1,
            duration: this.introDuration,
            onComplete: () => {
                this.changeState(BOSS_STATE.NEUTRAL);
            }
        });
    }

    /**
     * Actualización durante estado INTRO
     * @param {number} time - Tiempo total del juego
     * @param {number} delta - Delta time
     */
    updateIntro(time, delta) {
        super.updateIntro(time, delta);
    }

    /**
     * Lógica al entrar en estado NEUTRAL
     * Configura sprite y resetea variables de ataque
     */
    onEnterNeutral() {
        super.onEnterNeutral();
        this.setTexture('jupiter_neutral');
        this.canAttack = true;
    }
    
    /**
     * Actualización durante estado NEUTRAL
     * Controla cuándo puede atacar basándose en la zona actual de Mario
     * @param {number} time - Tiempo total del juego
     * @param {number} delta - Delta time
     */
    updateNeutral(time, delta) {
        if (!this.player) {
            return;
        }

        const marioX = this.player.x;

        const currentZone = this.attackZones.find(zone => 
            marioX >= zone.minX && marioX <= zone.maxX
        );

        const previousZoneId = this.currentZoneId;
    
        if (currentZone) {
            if (this.currentZoneId !== currentZone.id) {
                this.currentZoneId = currentZone.id;
            
                if (previousZoneId !== null && previousZoneId !== currentZone.id) {
                    this.hasLeftZoneAfterAttack = true;
                }

                if (this.zoneMovementEnabledIds.includes(currentZone.id)) {
                    this.scene.time.delayedCall(1750, () => {
                        const currentZoneNow = this.getCurrentAttackZone();
                        if (currentZoneNow && currentZoneNow.id === currentZone.id && this.isBattleActive && !this.isInZoneMovement) {
                            this.startZoneMovement();
                        }
                    });
                }
            }
        } else {
            if (this.currentZoneId !== null) {
                this.currentZoneId = null;
                this.hasLeftZoneAfterAttack = true;
            }
        }

        const canAttackInThisZone = this.lastAttackZoneId === null || this.lastAttackZoneId !== currentZone?.id || this.hasLeftZoneAfterAttack;
    
        if (this.state === BOSS_STATE.NEUTRAL && this.canAttack && currentZone && canAttackInThisZone) {
            this.canAttack = false;
            this.lastAttackZoneId = currentZone.id;
            this.hasLeftZoneAfterAttack = false;
            this.changeState(BOSS_STATE.ATTACK);
        }
    }

    /**
     * Lógica al entrar en estado ATTACK
     * Cambia a sprite de ataque y ejecuta el ataque
     */
    onEnterAttack() {
        this.setTexture('jupiter_attack');
        this.performAttack();
    }

    /**
     * Ejecuta el ataque de Júpiter: rayo en un carril aleatorio
     * Primero muestra aviso visual (telegraph), luego lanza el rayo
     */
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

    /**
     * Crea el aviso visual antes del rayo
     * Muestra un rectángulo rojo parpadeante y un triángulo de advertencia
     * @param {number} laneIndex - Índice del carril (0-2)
     * @param {number} laneY - Posición Y del carril
     */
    telegraphLane(laneIndex, laneY) {
        if (!this.player) return;
    
        const marioX = this.player.x;

        const telegraphX = marioX + (this.laneWidth * 0.25);

        const extendedWidth = this.laneWidth * 1.5;

        const telegraph = this.scene.add.rectangle(
            telegraphX,
            laneY,
            extendedWidth,
            100,
            0xff0000,
            0.3
        );
        telegraph.setDepth(15);
        
        this.scene.tweens.add({
            targets: telegraph,
            alpha: { from: 0.2, to: 0.5 },
            duration: 150,
            yoyo: true,
            repeat: 3
        });

        const triangle = this.scene.add.sprite(
            marioX + 250,
            laneY - 30,
            'warning_triangle'
        );
        triangle.setDepth(16);
        triangle.setScale(0.8);

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

    /**
     * Genera el rayo en el carril especificado
     * Reproduce sonido, crea efecto visual y verifica si golpea al jugador
     * @param {number} laneIndex - Índice del carril (0-2)
     * @param {number} laneY - Posición Y del carril
     */
    spawnLightningInLane(laneIndex, laneY) {
        if (!this.player) return;

        this.activeTelegraphs.forEach(telegraph => {
            if (telegraph.active) telegraph.destroy();
        });
        this.activeTriangles.forEach(triangle => {
            if (triangle.active) triangle.destroy();
        });
        
        this.activeTelegraphs = [];
        this.activeTriangles = [];

        const marioX = this.player.x;

        const lightning = this.scene.add.sprite(
            marioX,
            laneY,
            'lightning'
        );
        lightning.setDepth(16);

        if (this.scene.sound) {
            this.scene.sound.play('JupiterLightningSound');
        }

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

        this.checkPlayerHit(laneY);
    }

    /**
     * Verifica si el rayo golpea al jugador
     * Si impacta, aplica daño o quita power-up según el estado del jugador
     * @param {number} laneY - Posición Y del rayo para verificar colisión
     */
    checkPlayerHit(laneY) {
        if (!this.player || this.player.isInBubble || this.player.isInvulnerable || this.player.isInvincible || this.player.isHurt) return;

        const playerBounds = this.player.getBounds();

        const lightningWidth = 1000;
        const lightningHeight = 80;
        const lightningBounds = new Phaser.Geom.Rectangle(
            this.player.x - lightningWidth / 2,
            laneY - lightningHeight / 2,
            lightningWidth,
            lightningHeight
        );
        
        if (Phaser.Geom.Rectangle.Overlaps(playerBounds, lightningBounds) &&!this.scene.endTimer) {
            if (!this.scene.jugador.activePowerUp && !this.scene.jugador.isSuperSize) {
                this.scene.jugador.hurt();
                this.scene.endTimer=true;
                this.scene.jugador.setVelocityX(0);
                this.scene.jugador.setVelocityY(0);
                this.scene.jugador.body.ignoreGravity = true;
                this.scene.time.delayedCall(1000, () => {
                    this.scene.doubleEndTransition(()=>{
                        this.scene.scene.restart();
                    });
                });
            } else {
                this.scene.time.delayedCall(100, () => {
                    this.scene.jugador.deactivatePowerUp();
                });
            }

            this.scene.cameras.main.shake(250, 0.01);
        }
    }

    /**
     * Limpia todos los efectos visuales y finaliza el ataque
     * Vuelve a estado NEUTRAL y permite atacar nuevamente
     */
    finishAttack() {
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

        if (this.state === BOSS_STATE.ATTACK) {
            this.canAttack = true;
            this.changeState(BOSS_STATE.NEUTRAL);

            if (this.isInZoneMovement) {
                this.setTexture('jupiter_tired');
            }
        }
    }

    /**
     * Resetea completamente el estado de ataque del boss
     * Útil cuando se reinicia la batalla o se necesita un reset limpio
     */
    resetAttackState() {
        this.isBattleActive = true;
    
        this.lastAttackZoneId = null;
        this.canAttack = true;
        this.currentZoneId = null;
        this.hasLeftZoneAfterAttack = false;

        this.isInZoneMovement = false;
        this.zoneMovementStartTime = 0;
    
        if (this.state === BOSS_STATE.NEUTRAL) {
            this.setTexture('jupiter_neutral');
        }
    
        this.finishAttack();
    
        if (this.state === BOSS_STATE.ATTACK) {
            this.changeState(BOSS_STATE.NEUTRAL);
        }
    }

    /**
     * Inicia el movimiento especial de zona
     * Cambia el comportamiento de movimiento y sprite durante un período limitado
     */
    startZoneMovement() {
        const currentZone = this.getCurrentAttackZone();
        if (!currentZone || !this.zoneMovementEnabledIds.includes(currentZone.id) || this.isInZoneMovement || !this.isBattleActive) {
            return;
        }
    
        this.isInZoneMovement = true;
        this.zoneMovementStartTime = this.scene.time.now;

        if (this.state !== BOSS_STATE.ATTACK && this.state !== BOSS_STATE.DEAD) {
            this.setTexture('jupiter_tired');
        }
    }

    /**
     * Lógica al entrar en estado DEAD
     * Cambia sprite y limpia efectos activos
     */
    onEnterDead() {
        this.setTexture('jupiter_dead');
        this.finishAttack();
        super.onEnterDead();
    }

    /**
     * Reproduce la animación de muerte específica de Júpiter
     */
    playDeathAnimation() {
        this.finishAttack();
        super.playDeathAnimation('jupiter_death');
    }

    /**
     * Método de actualización principal de Júpiter
     * Maneja la máquina de estados, movimiento y actualización de sprite
     * @param {number} time - Tiempo total del juego
     * @param {number} delta - Delta time
     */
    update(time, delta) {
        super.update(time, delta);
        this.updateBossMovement(time, delta);
        this.updateSprite();
    }

    /**
     * Actualiza el movimiento de Júpiter
     * Sigue al jugador en X con suavizado y oscila verticalmente
     * @param {number} time - Tiempo total del juego
     * @param {number} delta - Delta time
     */
    updateBossMovement(time, delta) {
        if (this.state === BOSS_STATE.DEAD || !this.player || !this.isBattleActive) return;

        const camera = this.scene.cameras.main;

        const cameraWidth = camera.width / camera.zoom;
        const cameraHeight = camera.height / camera.zoom;
        const cameraLeft = camera.scrollX;
        const cameraRight = cameraLeft + cameraWidth;
        const cameraTop = camera.scrollY;
        const cameraBottom = cameraTop + cameraHeight;
        const oscillationSpeed = 0.001;

        const marginLeft = 335;
        const targetX = cameraLeft + marginLeft;
        const diffX = targetX - this.x;

        let currentMoveSpeed;

        if (this.isInZoneMovement) {
            const elapsed = time - this.zoneMovementStartTime;
        
            if (elapsed < this.zoneMovementDuration) {
                currentMoveSpeed = this.slowMoveSpeed;
            } else {
                currentMoveSpeed = this.fastMoveSpeed;
            
                if (elapsed > this.zoneMovementDuration + 500) {
                    this.isInZoneMovement = false;
                }
            }
        
            this.x += diffX * currentMoveSpeed;
        } else {
            this.x += diffX * this.neutralMoveSpeed;
        }

        const minY = cameraTop + 275;
        const maxY = cameraBottom - 25;
        const centerY = (minY + maxY) / 2;
        const amplitude = (maxY - minY) / 2;
    
        if (!this.oscillationTime) this.oscillationTime = 0;
        this.oscillationTime += delta * oscillationSpeed;
    
        this.y = centerY + Math.sin(this.oscillationTime) * amplitude;

        this.flipX = this.player.x > this.x;
    }

    /**
     * Actualiza el sprite según el estado y fase actual
     * Centraliza la lógica de cambio de textura
     */
    updateSprite() {
        if (this.state === BOSS_STATE.DEAD) {
            this.setTexture('jupiter_dead');
        } else if (this.state === BOSS_STATE.ATTACK) {
            this.setTexture('jupiter_attack');
        } else if (this.isInZoneMovement) {
            const elapsed = this.scene.time.now - this.zoneMovementStartTime;
            if (elapsed < this.zoneMovementDuration) {
                this.setTexture('jupiter_tired');
            } else {
                this.setTexture('jupiter_neutral');
            }
        } else {
            this.setTexture('jupiter_neutral');
        }
    }

    /**
     * Sobrescribe el método destroy para asegurar limpieza completa
     */
    destroy() {
        this.finishAttack();
        super.destroy();
    }
}