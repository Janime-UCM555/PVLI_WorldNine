/**
 * @fileoverview Enemigos que Hades puede spawnear
 * @module BossesObjects/HadesBoss
 */
import Goomba from '../../gameObjects/Enemies/Goomba.js';
import Koopa from '../../gameObjects/Enemies/Koopa.js';

/**
 * Importación de la clase madre y de los estados del boss
 * @module BaseBoss
 */
import BossBase, { BOSS_STATE } from './BaseBoss.js';

/**
 * Boss Hades - Dios del inframundo
 * Este boss se mantiene en una posición fija con movimiento oscilatorio vertical,
 * lanza fuegos fatuos hacia el jugador y genera enemigos constantemente.
 * @extends BossBase
 */
export default class HadesBoss extends BossBase { 
    /**
     * Constructor de Hades
     * @param {Phaser.Scene} scene - La escena de Phaser
     * @param {number} x - Posición X inicial
     * @param {number} y - Posición Y inicial
     * @param {Object} [config={}] - Configuración (igual que BossBase: player, onBattleEnd, etc.)
     */
    constructor(scene, x, y, config = {}) {
        super(scene, x, y, 'Hades', {
            ...config,
            introDuration: 750,
            neutralMoveSpeed: 0,
            attackCooldown: 2500,
        });

        this.player = this.scene.jugador;

        this.setDepth(10);
        this.setScale(4);
        this.setAlpha(0);

        // Propiedades para movimiento oscilatorio
        this.offsetX = 100;
        this.amplitude = 150;
        this.frequency = 0.001;

        this.originalX = x;
        this.originalY = y;
        this.oscillationTime = 0;

        // Propiedades para spawn de enemigos
        this.enemySpawnCooldown = 1500;
        this.timeSinceLastEnemySpawn = 0;
        this.canSpawnEnemies = false;
    }

    /**
     * Lógica al entrar en estado INTRO
     * Realiza fade-in y reproduce animación de Hades en bucle
     */
    onEnterIntro() {
        this.setAlpha(0);
        this.canSpawnEnemies = false;

        this.play('HadesAnim', true);

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
        // Lógica extra durante la intro si es necesaria
    }

    /**
     * Lógica al entrar en estado NEUTRAL
     * Activa spawn de enemigos y reproduce animación
     */
    onEnterNeutral() {
        super.onEnterNeutral();
        this.canSpawnEnemies = true;
        this.timeSinceLastEnemySpawn = 0;
        this.play('HadesAnim', true);
    }
    
    /**
     * Actualización durante estado NEUTRAL
     * Maneja el temporizador de ataque y actualiza la posición del boss
     * @param {number} time - Tiempo total del juego
     * @param {number} delta - Delta time
     */
    updateNeutral(time, delta) {
        super.updateNeutral(time, delta);
        this.updateBossPosition(time, delta);
    }

    /**
     * Lógica al entrar en estado ATTACK
     * Mantiene la animación y ejecuta el ataque
     */
    onEnterAttack() {
        this.play('HadesAnim', true);
        super.onEnterAttack();
    }

    /**
     * Actualización durante estado ATTACK
     * Continúa actualizando la posición del boss
     * @param {number} time - Tiempo total del juego
     * @param {number} delta - Delta time
     */
    updateAttack(time, delta) {
        this.updateBossPosition(time, delta);
    }

    /**
     * Ejecuta el ataque específico de Hades: lanzar fuego fatuo
     * Crea un proyectil de fuego que viaja hacia el jugador con detección de colisión
     */
    performAttack() {
        const fire = this.scene.add.sprite(this.x, this.y, 'WispFire');
        fire.setDepth(16);
        fire.name = 'hades_fire';

        // Propiedades de control del fuego
        fire.hasHitPlayer = false;
        fire.isFadingOut = false;
        fire.currentTexture = 'WispFire';
        fire.damageApplied = false;

        // Configuración de hitbox
        fire.hitRadius = fire.displayWidth * 0.5;
        fire.hitboxOffsetX = -fire.displayWidth * 0.3;
        fire.hitboxOffsetY = fire.displayHeight * 0.07;

        fire.boss = this;
        fire.player = this.player;
    
        // Calcular trayectoria hacia el jugador
        const targetX = this.player.x - 50;
        const targetY = this.player.y;
    
        const dx = targetX - this.x;
        const dy = targetY - this.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        const speed = 300;
        const travelDuration = (distance / speed) * 1000;
        const fadeDuration = 1500;

        const angle = Math.atan2(dy, dx) - 2;
        fire.setRotation(angle);
        fire.setOrigin(0.5, 0.5);

        fire.directionX = dx / distance;
        fire.directionY = dy / distance;
        fire.originalSpeed = speed;
        fire.fadeDuration = fadeDuration;

        if (this.scene.anims.exists('WispFireAnim')) {
            fire.play('WispFireAnim');
        }
    
        // Tween de movimiento con detección de colisión
        const flightTween = this.scene.tweens.add({
            targets: fire,
            x: targetX,
            y: targetY,
            duration: travelDuration,
            ease: 'Linear',
            onUpdate: (tween, target) => {
                if (!fire.damageApplied && !fire.player.isInvincible) {
                    const hitboxCenterX = fire.x + fire.hitboxOffsetX;
                    const hitboxCenterY = fire.y + fire.hitboxOffsetY;

                    const playerBounds = fire.player.getBounds();
                
                    let closestX = hitboxCenterX;
                    let closestY = hitboxCenterY;
                
                    if (hitboxCenterX < playerBounds.left) {
                        closestX = playerBounds.left;
                    } else if (hitboxCenterX > playerBounds.right) {
                        closestX = playerBounds.right;
                    }
                
                    if (hitboxCenterY < playerBounds.top) {
                        closestY = playerBounds.top;
                    } else if (hitboxCenterY > playerBounds.bottom) {
                        closestY = playerBounds.bottom;
                    }
                
                    const distanceToClosest = Phaser.Math.Distance.Between(
                        hitboxCenterX, hitboxCenterY,
                        closestX, closestY
                    );
                
                    if (distanceToClosest < fire.hitRadius) {
                        fire.damageApplied = true;
                        this.handleFireHitPlayer(fire);
                    }
                }
            },
            onComplete: () => {
                if (!fire.isFadingOut) {
                    this.startFadeOut(fire);
                }
            }
        });

        fire.flightTween = flightTween;

        this.scene.time.delayedCall(travelDuration + fadeDuration, () => {
            if (fire && !fire.isFadingOut) {
                this.startFadeOut(fire);
            }
        });
    }

    /**
     * Inicia el desvanecimiento del fuego fatuo
     * Cambia textura, reduce escala y velocidad mientras desaparece
     * @param {Phaser.GameObjects.Sprite} fire - Sprite del fuego a desvanecer
     */
    startFadeOut(fire) {
        if (fire.isFadingOut) return;
    
        fire.isFadingOut = true;
    
        if (fire.flightTween) {
            fire.flightTween.stop();
            fire.flightTween.remove();
        }
    
        fire.anims.stop();
    
        fire.setTexture('WispFireFading');
        fire.currentTexture = 'WispFireFading';
        fire.setRotation(0);
    
        if (this.scene.anims.exists('WispFireFadingAnim')) {
            fire.play('WispFireFadingAnim');
        }

        const reducedSpeed = fire.originalSpeed * 0.1;
        
        const travelDistanceX = fire.directionX * reducedSpeed * (fire.fadeDuration / 500);
        const travelDistanceY = fire.directionY * reducedSpeed * (fire.fadeDuration / 500);
        
        const targetX = fire.x + travelDistanceX;
        const targetY = fire.y + travelDistanceY;

        this.scene.tweens.add({
            targets: fire,
            x: targetX,
            y: targetY,
            duration: fire.fadeDuration,
            ease: 'Linear',
            onComplete: () => {
                fire.movementStopped = true;
            }
        });
    
        const fadeTween = this.scene.tweens.add({
            targets: fire,
            alpha: 0,
            scaleX: 0.4,
            scaleY: 0.4,
            duration: fire.fadeDuration,
            ease: 'Power2',
            onComplete: () => {
                if (fire) {
                    fire.destroy();
                }
            
                if (this.state === BOSS_STATE.ATTACK) {
                    super.finishAttack();
                }
            }
        });
    
        fire.fadeTween = fadeTween;
    }

    /**
     * Maneja el impacto del fuego fatuo con el jugador
     * Aplica efecto visual de parpadeo y reduce la velocidad del jugador temporalmente
     * @param {Phaser.GameObjects.Sprite} fire - Sprite del fuego que golpeó
     */
    handleFireHitPlayer(fire) {
        fire.hasHitPlayer = true;
        fire.damageApplied = true;

        this.scene.time.delayedCall(75, () => {
            if (fire && !fire.isFadingOut) {
                this.startFadeOut(fire);
            }
        });

        if (!this.player.isInvincible && !this.player.isHurt) {
            const blinkDuration = 1000;
            const blinkInterval = 200;
        
            const blinkCount = Math.floor(blinkDuration / blinkInterval);
        
            this.blinkTween = this.scene.tweens.add({
                targets: this.player,
                alpha: 0.3,
                duration: blinkInterval / 2,
                yoyo: true,
                repeat: blinkCount - 1,
                ease: 'Linear',
                onUpdate: () => {
                    if (this.player.alpha < 0.5) {
                        this.player.setVisible(false);
                    } else {
                        this.player.setVisible(true);
                    }
                },
                onComplete: () => {
                    this.player.setAlpha(1);
                    this.player.setVisible(true);
                }
            });

            const originalPlayerSpeed = this.player.speed;
            this.player.speed *= 0.5;

            this.scene.time.delayedCall(1000, () => {
                this.player.speed = originalPlayerSpeed;
            });
        }
    }

    /**
     * Lógica al entrar en estado DEAD
     * Detiene spawn de enemigos y reproduce animación de muerte
     */
    onEnterDead() {
        this.canSpawnEnemies = false;
        this.stop();
        
        if (this.scene.anims.exists('HadesDeadAnim')) {
            this.play('HadesDeadAnim', true);
        }
        
        super.onEnterDead();
    }

    /**
     * Reproduce la animación de muerte específica de Hades
     */
    playDeathAnimation() {
        super.playDeathAnimation('hades_death');
    }

    /**
     * Método de actualización principal de Hades
     * Maneja la máquina de estados, spawn de enemigos y posición
     * @param {number} time - Tiempo total del juego
     * @param {number} delta - Delta time
     */
    update(time, delta) {
        super.update(time, delta);

        this.handleEnemySpawn(time, delta);
        
        if (this.state !== BOSS_STATE.DEAD) {
            this.updateBossPosition(time, delta);
        }
    }

    /**
     * Actualiza la posición de Hades con movimiento oscilatorio
     * Mantiene una distancia fija del borde derecho de la cámara y oscila verticalmente
     * @param {number} time - Tiempo total del juego
     * @param {number} delta - Delta time
     */
    updateBossPosition(time, delta) {
        if (this.state === BOSS_STATE.DEAD || !this.player || !this.isBattleActive) return;

        const camera = this.scene.cameras.main;

        const cameraWidth = camera.width / camera.zoom;
        const cameraHeight = camera.height / camera.zoom;
        const cameraLeft = camera.scrollX;
        const cameraRight = cameraLeft + cameraWidth;
        const cameraTop = camera.scrollY;
        const cameraBottom = cameraTop + cameraHeight;
        
        const margin = 100;
        const minX = cameraLeft - margin;
        const maxX = cameraRight + margin;
        
        let targetX = cameraRight + this.offsetX;
        targetX = Phaser.Math.Clamp(targetX, minX, maxX);
        
        this.x = targetX;

        const minY = cameraTop + 275;
        const maxY = cameraBottom - 25;
        const centerY = (minY + maxY) / 2;
        const amplitude = Math.min(this.amplitude, (maxY - minY) / 2);
        
        this.oscillationTime += delta * this.frequency;
        
        const targetY = centerY + Math.sin(this.oscillationTime) * amplitude;
        
        this.y = targetY;

        this.flipX = this.player.x > this.x;
    }

    /**
     * Maneja el spawn periódico de enemigos
     * Genera enemigos cada 1.5 segundos cuando está activo
     * @param {number} time - Tiempo total del juego
     * @param {number} delta - Delta time
     */
    handleEnemySpawn(time, delta) {
        if (!this.canSpawnEnemies || !this.isBattleActive || this.state === BOSS_STATE.DEAD) {
            return;
        }

        this.timeSinceLastEnemySpawn += delta;

        if (this.timeSinceLastEnemySpawn >= this.enemySpawnCooldown) {
            this.spawnRandomEnemy();
            this.timeSinceLastEnemySpawn = 0;
        }
    }

    /**
     * Genera un enemigo aleatorio (Goomba o Koopa)
     * El enemigo aparece 500px a la derecha del jugador con fade-in
     */
    spawnRandomEnemy() {
        if (!this.player || !this.scene || !this.isBattleActive) return;

        let spawnX = this.player.x + 500;
        let spawnY = 500;

        const map = this.scene.map;
        const mapWidth = map.widthInPixels;
        const mapHeight = map.heightInPixels;

        const margin = 50;
        spawnX = Phaser.Math.Clamp(spawnX, margin, mapWidth - margin);
        spawnY = Phaser.Math.Clamp(spawnY, margin, mapHeight - margin);

        const enemyType = Phaser.Math.Between(0, 1);

        let enemy;
        if (enemyType === 0) {
            enemy = new Goomba(
                this.scene,
                spawnX,
                spawnY, 
                'GombGreece_Walk',
                1,
                1,
                3
            );
            console.log("Goomba spawneado - Type:", enemy.type, "Texture:", enemy.texture.key);
            enemy.direction = -1;
            this.scene.goombas.add(enemy);
        } else {
            enemy = new Koopa(
                this.scene,
                spawnX,
                spawnY,
                'Koopa_walk_R',
                1,
                3
            );
            enemy.direction = -1;
            this.scene.koopas.add(enemy);
        }

        enemy.setDepth(2);
        enemy.setCollisionCategory(0x0002);
        enemy.setCollidesWith([0x0001, 0x0004, 0x0002]);

        enemy.setAlpha(0);
        this.scene.tweens.add({
            targets: enemy,
            alpha: 1,
            duration: 500,
            ease: 'Linear'
        });
    }
}