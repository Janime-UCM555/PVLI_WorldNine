import Goomba from '../../gameObjects/Enemies/Goomba.js';
import Koopa from '../../gameObjects/Enemies/Koopa.js';
import BossBase, { BOSS_STATE } from './BaseBoss.js';

export default class HadesBoss extends BossBase {
    /**
     * @param {Phaser.Scene} scene
     * @param {number} x
     * @param {number} y
     * @param {object} config  - igual que BossBase (player, onBattleEnd, etc.)
     */
    constructor(scene, x, y, config = {}) {
        super(scene, x, y, 'Hades', {
            ...config,
            // Valores por defecto específicos de Hades:
            introDuration: 750,   // duración de la animación de entrada
            neutralMoveSpeed: 0,   // Velocidad de Hades (no la necesita)
            attackCooldown: 2500,  // cada 2.5s lanza un ataque
        });

        // Asegurar referencia al jugador
        this.player = this.scene.jugador;

        // Se puede ajustar escala, depth, etc.
        this.setDepth(10);
        this.setScale(4);
        this.setAlpha(0);

        // Propiedades para movimiento
        this.offsetX = 100;  // Distancia del borde derecho de la cámara
        this.amplitude = 150; // Amplitud del movimiento vertical
        this.frequency = 0.001; // Frecuencia del movimiento vertical

        this.originalX = x;
        this.originalY = y;
        this.oscillationTime = 0;

        // Spawn de enemigos cada 1.5 segundos
        this.enemySpawnCooldown = 1500; // ms
        this.timeSinceLastEnemySpawn = 0;
        this.canSpawnEnemies = false; // Se activará después de la intro
    }

    // ---------- INTRO ESPECÍFICA DE HADES ----------
    onEnterIntro() {
        this.setAlpha(0);
        this.canSpawnEnemies = false; // Asegurar que no spawnea enemigos durante la intro

        // Reproducir animación de Hades en bucle
        this.play('HadesAnim', true);

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

    // No se necesita el updateIntro por tiempo porque se usa el tween
    updateIntro(time, delta) {
        // Algo extra durante la intro se pone aquí.
    }

    // ---------- NEUTRAL ----------
    onEnterNeutral() {
        super.onEnterNeutral();
        // Activar spawn de enemigos al entrar en NEUTRAL (después de la intro)
        this.canSpawnEnemies = true;
        this.timeSinceLastEnemySpawn = 0;
        // Reproducir animación de Hades en bucle
        this.play('HadesAnim', true);
    }
    
    updateNeutral(time, delta) {
        // Llamar al método base primero para manejar el temporizador de ataque
        super.updateNeutral(time, delta);
    
        // Actualizar movimiento oscilatorio en estado NEUTRAL
        this.updateBossPosition(time, delta);
    }

    // ---------- ATAQUE ESPECÍFICO DE HADES ----------
    onEnterAttack() {
        // Mantener animación de Hades durante el ataque
        this.play('HadesAnim', true);
        // Llamar al método base que ejecuta performAttack()
        super.onEnterAttack();
    }

    updateAttack(time, delta) {
        this.updateBossPosition(time, delta);
    }

    performAttack() {
        // Crear el fuego fatuo en la posición de Hades
        const fire = this.scene.add.sprite(this.x, this.y, 'WispFire');
        fire.setDepth(16); // Un depth mayor que Hades para que se vea por encima
        fire.name = 'hades_fire'; // Identificador para las colisiones

        // Propiedades adicionales para controlar el comportamiento
        fire.hasHitPlayer = false; // Propiedad para controlar si ha colisionado con el jugador
        fire.isFadingOut = false; // Propiedad para controlar si se está desvaneciendo
        fire.currentTexture = 'WispFire'; // Textura actual
        fire.damageApplied = false; // Propiedad para controlar daño una sola vez

        // Definir radio de colisión para el fuego (más pequeño que el sprite)
        fire.hitRadius = fire.displayWidth * 0.5; // Radio de colisión basado en el tamaño del sprite

        // Offset de la hitbox: más a la izquierda y abajo
        // Valores negativos para izquierda, positivos para abajo
        fire.hitboxOffsetX = -fire.displayWidth * 0.3;  // 30% del ancho a la izquierda
        fire.hitboxOffsetY = fire.displayHeight * 0.07;  // 7% del alto hacia abajo

        // Añadir referencia al boss y jugador
        fire.boss = this;
        fire.player = this.player;
    
        // Calcular posición destino: 50px a la izquierda de Mario, misma Y
        const targetX = this.player.x - 50;
        const targetY = this.player.y;
    
        // Calcular dirección y velocidad
        const dx = targetX - this.x;
        const dy = targetY - this.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        const speed = 300;
        const travelDuration = (distance / speed) * 1000;
        const fadeDuration = 1500; // Duración del desvanecimiento

        // Calcular ángulo de rotación basado en la dirección
        const angle = Math.atan2(dy, dx) - 2; // Ángulo en radianes
        fire.setRotation(angle); // Rotar el sprite
        fire.setOrigin(0.5, 0.5); // Asegurar que rota desde el centro

        // Calcular velocidad normalizada para mantener la dirección después del golpe
        fire.directionX = dx / distance;
        fire.directionY = dy / distance;
        fire.originalSpeed = speed;
        fire.fadeDuration = fadeDuration; // Guardar la duración

        // Iniciar animación del fuego fatuo normal
        if (this.scene.anims.exists('WispFireAnim')) {
            fire.play('WispFireAnim');
        }
    
        // 1. Fase de vuelo: Mover hacia el jugador
        const flightTween = this.scene.tweens.add({
            targets: fire,
            x: targetX,
            y: targetY,
            duration: travelDuration,
            ease: 'Linear',
            onUpdate: (tween, target) => {
                // Verificar colisión con el jugador
                if (!fire.damageApplied && !fire.player.isInvincible) {
                    // Calcular la posición del centro de la hitbox con offset
                    const hitboxCenterX = fire.x + fire.hitboxOffsetX;
                    const hitboxCenterY = fire.y + fire.hitboxOffsetY;

                    // Obtener bounds del jugador (rectangular)
                    const playerBounds = fire.player.getBounds();
                
                    // Calcular el punto más cercano en el rectángulo del jugador al círculo del fuego
                    let closestX = hitboxCenterX;
                    let closestY = hitboxCenterY;
                
                    // Encontrar el punto X más cercano dentro del rectángulo del jugador
                    if (hitboxCenterX < playerBounds.left) {
                        closestX = playerBounds.left;
                    } else if (hitboxCenterX > playerBounds.right) {
                        closestX = playerBounds.right;
                    }
                
                    // Encontrar el punto Y más cercano dentro del rectángulo del jugador
                    if (hitboxCenterY < playerBounds.top) {
                        closestY = playerBounds.top;
                    } else if (hitboxCenterY > playerBounds.bottom) {
                        closestY = playerBounds.bottom;
                    }
                
                    // Calcular distancia entre el centro del fuego y el punto más cercano del jugador
                    const distanceToClosest = Phaser.Math.Distance.Between(
                        hitboxCenterX, hitboxCenterY,
                        closestX, closestY
                    );
                
                    // Detectar colisión si la distancia es menor que el radio del fuego
                    if (distanceToClosest < fire.hitRadius) {
                        fire.damageApplied = true;
                        this.handleFireHitPlayer(fire);
                    }
                }
            },
            onComplete: () => {
                // Comenzar desvanecimiento automáticamente al llegar al destino
                if (!fire.isFadingOut) {
                    this.startFadeOut(fire);
                }
            }
        });

        // Guardar referencia al tween
        fire.flightTween = flightTween;

        // 2. Desvanecimiento automático (por si no golpea al jugador)
        this.scene.time.delayedCall(travelDuration + fadeDuration, () => {
            if (fire && !fire.isFadingOut) {
                this.startFadeOut(fire);
            }
        });
    }

    // Método para iniciar desvanecimiento
    startFadeOut(fire) {
        if (fire.isFadingOut) return;
    
        fire.isFadingOut = true;
    
        // Detener el tween de vuelo si existe
        if (fire.flightTween) {
            fire.flightTween.stop();
            fire.flightTween.remove();
        }
    
        // Detener la animación actual de WispFireAnim
        fire.anims.stop();
    
        // Cambiar a la textura de fuego desvaneciéndose
        fire.setTexture('WispFireFading');
        fire.currentTexture = 'WispFireFading';
        fire.setRotation(0); // Restablecer rotación
    
        // Reproducir animación de WispFireFading
        if (this.scene.anims.exists('WispFireFadingAnim')) {
            fire.play('WispFireFadingAnim');
        }

        // Calcular movimiento continuo durante el desvanecimiento
        // Velocidad reducida al 10% de la original
        const reducedSpeed = fire.originalSpeed * 0.1;
        
        // Calcular desplazamiento basado en dirección y duración
        const travelDistanceX = fire.directionX * reducedSpeed * (fire.fadeDuration / 500);
        const travelDistanceY = fire.directionY * reducedSpeed * (fire.fadeDuration / 500);
        
        const targetX = fire.x + travelDistanceX;
        const targetY = fire.y + travelDistanceY;

        // 1. Tween para movimiento continuo durante el desvanecimiento
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
    
        // 2. Tween para desvanecimiento gradual
        const fadeTween = this.scene.tweens.add({
            targets: fire,
            alpha: 0,
            scaleX: 0.4,
            scaleY: 0.4,
            duration: fire.fadeDuration,
            ease: 'Power2',
            onComplete: () => {
                // Destruir el fuego cuando esté completamente transparente
                if (fire) {
                    fire.destroy();
                }
            
                // Si el boss estaba esperando a que termine el ataque, finalizarlo
                if (this.state === BOSS_STATE.ATTACK) {
                    super.finishAttack();
                }
            }
        });
    
        fire.fadeTween = fadeTween;
    }

    // Manejar el golpe del fuego al jugador
    handleFireHitPlayer(fire) {
        // Marcar como que ya golpeó al jugador
        fire.hasHitPlayer = true;
        fire.damageApplied = true;

        // Detener el pilar de la escena
        this.scene.pilar.isStatic = true;

        // Iniciar desvanecimiento
        this.scene.time.delayedCall(75, () => {
            if (fire && !fire.isFadingOut) {
                this.startFadeOut(fire);
            }
        });

        // Aplicar daño al jugador
        if (!this.player.isInvincible) {
            // Reproducir sonido de muerte
            this.scene.sound.play('muerte');
        
            this.player.hurt();
            this.player.setStatic(true);

            // Usar la transición de la escena después de un breve delay
            this.scene.time.delayedCall(300, () => {
                if (this.scene.doubleEndTransition) {
                    this.scene.doubleEndTransition(() => {
                        this.scene.scene.restart();
                    });
                } else {
                    this.scene.time.delayedCall(1000, () => {
                        this.scene.scene.restart();
                    });
                }
            });
        }
    }

    // ---------- DERROTA ----------
    // Se puede sobreescribir onEnterDead / playDeathAnimation para una muerte distinta

    onEnterDead() {
        // Detener spawn de enemigos al morir
        this.canSpawnEnemies = false;

        // Detener cualquier animación actual
        this.stop();
        
        // Reproducir animación de muerte específica de Hades
        if (this.scene.anims.exists('HadesDeadAnim')) {
            this.play('HadesDeadAnim', true);
        }
        
        // Llamar al método base para manejar la lógica de muerte
        super.onEnterDead();
    }

    playDeathAnimation() {
        // Llamar al método padre con la key específica
        super.playDeathAnimation('hades_death');
    }

    // ---------- UPDATE GENERAL ----------
    update(time, delta) {
        // Llamar al update del padre para la máquina de estados base
        super.update(time, delta);

        // Manejar spawn de enemigos (independiente del estado, excepto DEAD)
        this.handleEnemySpawn(time, delta);
        
        // Actualizar posición en todos los estados excepto DEAD
        if (this.state !== BOSS_STATE.DEAD) {
            this.updateBossPosition(time, delta);
        }
    }

    // Método de movimiento
    updateBossPosition(time, delta) {
        if (this.state === BOSS_STATE.DEAD || !this.player || !this.isBattleActive) return;

        const camera = this.scene.cameras.main;

        // Configuración de distancias
        const cameraWidth = camera.width / camera.zoom;
        const cameraHeight = camera.height / camera.zoom;
        const cameraLeft = camera.scrollX;
        const cameraRight = cameraLeft + cameraWidth;
        const cameraTop = camera.scrollY;
        const cameraBottom = cameraTop + cameraHeight;
        
        // 1. Posición X: distancia fija del borde derecho de la cámara
        const margin = 100;
        const minX = cameraLeft - margin;
        const maxX = cameraRight + margin;
        
        // Calcular la posición X objetivo - distancia fija del borde derecho
        let targetX = cameraRight + this.offsetX;
        targetX = Phaser.Math.Clamp(targetX, minX, maxX);
        
        // Asignar directamente la posición X (sin suavizado)
        this.x = targetX;

        // 2. Movimiento oscilatorio en el eje Y
        const minY = cameraTop + 275; // 275 píxeles desde el borde superior
        const maxY = cameraBottom - 25; // 25 píxeles desde el borde inferior
        const centerY = (minY + maxY) / 2;
        const amplitude = Math.min(this.amplitude, (maxY - minY) / 2);
        
        // Usar el tiempo acumulado para oscilación suave
        this.oscillationTime += delta * this.frequency;
        
        // Calcular posición Y con oscilación senoidal
        const targetY = centerY + Math.sin(this.oscillationTime) * amplitude;
        
        // Asignar directamente la posición Y
        this.y = targetY;

        // 3. Actualizar dirección para mirar hacia Mario
        this.flipX = this.player.x > this.x;
    }

    // Manejar spawn de enemigos independientemente del estado
    handleEnemySpawn(time, delta) {
        // Solo spawnear enemigos si está permitido (después de intro, antes de muerte)
        if (!this.canSpawnEnemies || !this.isBattleActive || this.state === BOSS_STATE.DEAD) {
            return;
        }

        // Actualizar temporizador
        this.timeSinceLastEnemySpawn += delta;

        // Spawnear enemigo si ha pasado el cooldown
        if (this.timeSinceLastEnemySpawn >= this.enemySpawnCooldown) {
            this.spawnRandomEnemy();
            this.timeSinceLastEnemySpawn = 0;
        }
    }

    // Spawn de enemigo aleatorio
    spawnRandomEnemy() {
        if (!this.player || !this.scene || !this.isBattleActive) return;

        // Calcular posición de spawn: 500px a la derecha de Mario, 100px arriba
        let spawnX = this.player.x + 500;
        let spawnY = this.player.y - 100;

        // Obtener límites del mapa
        const map = this.scene.map;
        const mapWidth = map.widthInPixels;
        const mapHeight = map.heightInPixels;

        // Asegurar que el spawn esté dentro de los límites del mapa con un margen de 50 píxeles
        const margin = 50;
        spawnX = Phaser.Math.Clamp(spawnX, margin, mapWidth - margin);
        spawnY = Phaser.Math.Clamp(spawnY, margin, mapHeight - margin);

        // Elegir aleatoriamente entre Goomba (0) y Koopa (1)
        const enemyType = Phaser.Math.Between(0, 1);

        let enemy;
        if (enemyType === 0) {
            // Spawnear Goomba
            enemy = new Goomba(
                this.scene,
                spawnX,
                spawnY,
                'gombrome_walk',
                1.0,
                true
            );
            enemy.direction = -1; // Ir hacia la izquierda (hacia Mario)
            this.scene.goombas.add(enemy);
        } else {
            // Spawnear Koopa
            enemy = new Koopa(
                this.scene,
                spawnX,
                spawnY,
                'Koopa_walk_R',
                1,
                true
            );
            enemy.direction = -1; // Ir hacia la izquierda (hacia Mario)
            this.scene.koopas.add(enemy);
        }

        // Configuración común
        enemy.setDepth(2);
        enemy.setCollisionCategory(0x0002); // CATEGORY_ENEMY
        enemy.setCollidesWith([0x0001, 0x0004, 0x0002]); // CATEGORY_PLAYER, CATEGORY_TERRAIN, CATEGORY_ENEMY

        // Efecto visual al spawn (aparición gradual)
        enemy.setAlpha(0);
        this.scene.tweens.add({
            targets: enemy,
            alpha: 1,
            duration: 500,
            ease: 'Linear'
        });
    }
}