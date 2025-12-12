/**
 * Enumeración de estados posibles para un boss
 * @enum {string}
 * @readonly
 */
export const BOSS_STATE = {
    /** Animación de entrada / inicio de batalla */
    INTRO:   'INTRO',
    /** Estado de espera / persecución del jugador */
    NEUTRAL: 'NEUTRAL',
    /** Ejecutando un ataque o patrón de ataque */
    ATTACK:  'ATTACK',
    /** Boss derrotado */
    DEAD:    'DEAD',
};

/**
 * Clase base para todos los jefes del juego.
 * Implementa una máquina de estados (INTRO → NEUTRAL ⇄ ATTACK → DEAD)
 * y proporciona métodos virtuales para ser sobrescritos en clases derivadas.
 * @extends Phaser.GameObjects.Sprite
 */
export default class BossBase extends Phaser.GameObjects.Sprite {
    /**
     * Constructor de la clase base de boss
     * @param {Phaser.Scene} scene - La escena de Phaser donde se añade el boss
     * @param {number} x - Posición X inicial
     * @param {number} y - Posición Y inicial
     * @param {string} texture - Key del sprite del boss
     * @param {Object} [config={}] - Configuración genérica del boss
     * @param {Object} [config.player=null] - Referencia al jugador (opcional)
     * @param {number} [config.introDuration=1500] - Milisegundos que dura la intro
     * @param {number} [config.neutralMoveSpeed=0] - Velocidad en estado NEUTRAL (0 = quieto)
     * @param {number} [config.attackCooldown=2500] - Tiempo entre ataques en milisegundos
     * @param {Function} [config.onBattleEnd=null] - Callback cuando el boss es derrotado
     */
    constructor(scene, x, y, texture, config = {}) {
        super(scene, x, y, texture);

        scene.add.existing(this);

        // --- Config básica ---
        this.player            = config.player || null;
        this.introDuration     = config.introDuration ?? 1500;
        this.neutralMoveSpeed  = config.neutralMoveSpeed ?? 0;
        this.attackCooldown    = config.attackCooldown ?? 2500;
        this.onBattleEnd       = config.onBattleEnd || null;

        // --- Estado interno ---
        this.state             = null;
        this._stateTime        = 0;
        this._timeSinceAttack  = 0;
        this.isBattleActive    = false;

        this.setOrigin(0.5, 0.5);
    }

    /**
     * Inicia la batalla del boss
     * Debe ser llamado desde la escena cuando empiece realmente la pelea
     */
    startBattle() {
        if (this.isBattleActive) return;
        this.isBattleActive = true;
        this.changeState(BOSS_STATE.INTRO);
    }

    /**
     * Derrota al boss
     * Debe ser llamado desde la escena cuando el jugador gane el nivel
     */
    defeat() {
        if (!this.isBattleActive) return;
        if (this.state === BOSS_STATE.DEAD) return;
        this.changeState(BOSS_STATE.DEAD);
    }

    // ==========================================================
    //          MÁQUINA DE ESTADOS
    // ==========================================================

    /**
     * Cambia el estado actual del boss
     * Maneja la salida del estado anterior y entrada al nuevo estado
     * @param {string} newState - Nuevo estado (uno de BOSS_STATE)
     */
    changeState(newState) {
        if (this.state === newState) return;

        this.exitState(this.state);
        this.state = newState;
        this._stateTime = 0;

        this.enterState(newState);
    }

    /**
     * Ejecuta la lógica de entrada a un estado
     * @param {string} state - Estado al que se entra
     * @private
     */
    enterState(state) {
        switch (state) {
            case BOSS_STATE.INTRO:
                this.onEnterIntro();
                break;
            case BOSS_STATE.NEUTRAL:
                this.onEnterNeutral();
                break;
            case BOSS_STATE.ATTACK:
                this.onEnterAttack();
                break;
            case BOSS_STATE.DEAD:
                this.onEnterDead();
                break;
        }
    }

    /**
     * Ejecuta la lógica de salida de un estado
     * @param {string} state - Estado del que se sale
     * @private
     */
    exitState(state) {
        switch (state) {
            case BOSS_STATE.INTRO:
                this.onExitIntro();
                break;
            case BOSS_STATE.NEUTRAL:
                this.onExitNeutral();
                break;
            case BOSS_STATE.ATTACK:
                this.onExitAttack();
                break;
            case BOSS_STATE.DEAD:
                this.onExitDead();
                break;
        }
    }

    /**
     * Método de actualización principal del boss
     * Debe ser llamado desde Scene.update(time, delta)
     * @param {number} time - Tiempo total transcurrido desde el inicio del juego
     * @param {number} delta - Tiempo transcurrido desde el último frame en milisegundos
     */
    update(time, delta) {
        if (!this.isBattleActive) return;

        this._stateTime += delta;

        switch (this.state) {
            case BOSS_STATE.INTRO:
                this.updateIntro(time, delta);
                break;
            case BOSS_STATE.NEUTRAL:
                this.updateNeutral(time, delta);
                break;
            case BOSS_STATE.ATTACK:
                this.updateAttack(time, delta);
                break;
            case BOSS_STATE.DEAD:
                this.updateDead(time, delta);
                break;
        }
    }

    // ==========================================================
    //          LÓGICA POR DEFECTO DE CADA ESTADO
    //          (sobrescribe en los bosses concretos)
    // ==========================================================

    // ---------- INTRO (inicio de batalla) ----------

    /**
     * Método virtual: Lógica al entrar en estado INTRO
     * Por defecto realiza un fade-in sencillo
     */
    onEnterIntro() {
        this.setAlpha(0);
        this.scene.tweens.add({
            targets: this,
            alpha: 1,
            duration: this.introDuration,
        });
    }

    /**
     * Método virtual: Actualización durante estado INTRO
     * Por defecto transiciona a NEUTRAL cuando termina la duración
     * @param {number} time - Tiempo total del juego
     * @param {number} delta - Delta time
     */
    updateIntro(time, delta) {
        if (this._stateTime >= this.introDuration) {
            this.changeState(BOSS_STATE.NEUTRAL);
        }
    }

    /**
     * Método virtual: Lógica al salir del estado INTRO
     */
    onExitIntro() { /* vacío por defecto */ }

    // ---------- NEUTRAL (idle / persecución) ----------

    /**
     * Método virtual: Lógica al entrar en estado NEUTRAL
     * Resetea el temporizador de ataque
     */
    onEnterNeutral() {
        this._timeSinceAttack = 0;
    }

    /**
     * Método virtual: Actualización durante estado NEUTRAL
     * Por defecto cuenta tiempo hasta el próximo ataque
     * @param {number} time - Tiempo total del juego
     * @param {number} delta - Delta time
     */
    updateNeutral(time, delta) {
        this._timeSinceAttack += delta;

        if (this._timeSinceAttack >= this.attackCooldown) {
            this.changeState(BOSS_STATE.ATTACK);
        }
    }

    /**
     * Método virtual: Lógica al salir del estado NEUTRAL
     */
    onExitNeutral() { /* vacío por defecto */ }

    // ---------- ATTACK (ataque/patrón) ----------

    /**
     * Método virtual: Lógica al entrar en estado ATTACK
     * Por defecto ejecuta performAttack() una vez
     */
    onEnterAttack() {
        this.performAttack();
    }

    /**
     * Método virtual: Actualización durante estado ATTACK
     * Útil para lógica frame a frame durante el ataque en subclases
     * @param {number} time - Tiempo total del juego
     * @param {number} delta - Delta time
     */
    updateAttack(time, delta) {
        // Implementar en subclases si se necesita lógica continua durante ataque
    }

    /**
     * Método virtual: Lógica al salir del estado ATTACK
     */
    onExitAttack() { /* vacío por defecto */ }

    /**
     * Finaliza el ataque actual y vuelve a estado NEUTRAL
     * Debe ser llamado manualmente cuando termine la lógica del ataque
     */
    finishAttack() {
        this._timeSinceAttack = 0;
        if (this.state === BOSS_STATE.ATTACK) {
            this.changeState(BOSS_STATE.NEUTRAL);
        }
    }

    /**
     * Método virtual para ser SOBRESCRITO por cada boss específico
     * Define el comportamiento del ataque (rayos, proyectiles, minions, etc)
     * IMPORTANTE: Debe llamar a this.finishAttack() cuando termine el ataque
     */
    performAttack() {
        this.scene.tweens.add({
            targets: this,
            alpha: 0.5,
            yoyo: true,
            repeat: 2,
            duration: 150,
            onComplete: () => {
                this.setAlpha(1);
                this.finishAttack();
            }
        });
    }

    // ---------- DEAD (derrota) ----------

    /**
     * Método virtual: Lógica al entrar en estado DEAD
     * Desactiva la batalla y reproduce animación de muerte
     */
    onEnterDead() {
        this.isBattleActive = false;
        this.playDeathAnimation();
    }

    /**
     * Método virtual: Actualización durante estado DEAD
     * Por defecto no hace nada (espera a que termine la animación)
     * @param {number} time - Tiempo total del juego
     * @param {number} delta - Delta time
     */
    updateDead(time, delta) {
        // Solo esperar a que acabe la animación de muerte
    }

    /**
     * Método virtual: Lógica al salir del estado DEAD
     * Normalmente nunca se sale de este estado
     */
    onExitDead() { /* normalmente nunca sale de DEAD */ }

    /**
     * Reproduce la animación de muerte del boss
     * @param {string} [animationKey='default'] - Tipo de animación de muerte a usar
     */
    playDeathAnimation(animationKey = 'default') {
        if (this.finishAttack) {
            this.finishAttack();
        }

        if (animationKey === 'default') {
            const hasDeathAnim = !!(this.anims && this.anims.animationManager && this.anims.animationManager.get('boss_die'));
            if (hasDeathAnim) {
                this.play('boss_die');
                this.once(Phaser.Animations.Events.ANIMATION_COMPLETE, () => {
                    this.handleBossDefeated();
                });
            }
        } else {
            const targetX = this.player.x + 150;
            const targetY = 375;

            this.scene.tweens.add({
                targets: this,
                x: targetX,
                y: targetY,
                alpha: 0,
                scaleX: 0.3,
                scaleY: 0.3,
                duration: 1500,
                ease: 'Cubic.Out',
                onUpdate: () => {
                    this.rotation += 0.035;
                },
                onComplete: () => {
                    this.handleBossDefeated();
                }
            });
        }
    }

    /**
     * Maneja la lógica cuando el boss ha sido completamente derrotado
     * Ejecuta el callback onBattleEnd si existe y destruye el boss
     * @private
     */
    handleBossDefeated() {
        if (typeof this.onBattleEnd === 'function') {
            this.onBattleEnd(this);
        }
        this.destroy();
    }
}