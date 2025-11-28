export const BOSS_STATE = {
    INTRO:   'INTRO',    // Animación / inicio de batalla
    NEUTRAL: 'NEUTRAL',  // Idle / perseguir
    ATTACK:  'ATTACK',   // Ataque
    DEAD:    'DEAD',     // Derrota
};

export default class BossBase extends Phaser.GameObjects.Sprite {
    /**
     * @param {Phaser.Scene} scene
     * @param {number} x
     * @param {number} y
     * @param {string} texture  - key del sprite
     * @param {object} config   - configuración genérica
     *   {
     *      player: referencia a Mario (opcional),
     *      introDuration: ms que dura la intro,
     *      neutralMoveSpeed: velocidad en NEUTRAL (0 = quieto),
     *      attackCooldown: tiempo entre ataques en ms,
     *      onBattleEnd: callback cuando el boss es derrotado
     *   }
     */
    constructor(scene, x, y, texture, config = {}) {
        super(scene, x, y, texture);

        scene.add.existing(this);

        // --- Config básica ---
        this.player            = config.player || null;
        this.introDuration     = config.introDuration ?? 1500;
        this.neutralMoveSpeed  = config.neutralMoveSpeed ?? 0;  // 0 = sólo idle
        this.attackCooldown    = config.attackCooldown ?? 2500;
        this.onBattleEnd       = config.onBattleEnd || null;

        // --- Estado interno ---
        this.state             = null;
        this._stateTime        = 0;           // ms en el estado actual
        this._timeSinceAttack  = 0;           // ms desde último ataque
        this.isBattleActive    = false;

        this.setOrigin(0.5, 0.5);
    }

    // Llamar desde la escena cuando empieza realmente la pelea
    startBattle() {
        if (this.isBattleActive) return;
        this.isBattleActive = true;
        this.changeState(BOSS_STATE.INTRO);
    }

    // Llamar desde la escena cuando el jugador gana el nivel
    defeat() {
        if (!this.isBattleActive) return;
        if (this.state === BOSS_STATE.DEAD) return;
        this.changeState(BOSS_STATE.DEAD);
    }

    // ==========================================================
    //          MÁQUINA DE ESTADOS
    // ==========================================================

    changeState(newState) {
        if (this.state === newState) return;

        this.exitState(this.state);
        this.state = newState;
        this._stateTime = 0;

        this.enterState(newState);
    }

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

    // Llamar desde Scene.update(time, delta)
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

    onEnterIntro() {
        // Ejemplo por defecto: fade-in sencillo
        this.setAlpha(0);
        this.scene.tweens.add({
            targets: this,
            alpha: 1,
            duration: this.introDuration,
        });
        // Aquí se podría disparar una animación tipo 'boss_intro'
        // this.play('boss_intro');
    }

    updateIntro(time, delta) {
        // Por defecto: cuando termina la intro → NEUTRAL
        if (this._stateTime >= this.introDuration) {
            this.changeState(BOSS_STATE.NEUTRAL);
        }
    }

    onExitIntro() { /* vacío por defecto */ }

    // ---------- NEUTRAL (idle / persecución) ----------

    onEnterNeutral() {
        this._timeSinceAttack = 0;
        // this.play('boss_idle'); // si existiera idle
    }

    updateNeutral(time, delta) {
        this._timeSinceAttack += delta;

        // Cuando se cumpla el cooldown → entra en ATTACK
        if (this._timeSinceAttack >= this.attackCooldown) {
            this.changeState(BOSS_STATE.ATTACK);
        }
    }

    onExitNeutral() { /* vacío por defecto */ }

    // ---------- ATTACK (ataque/patrón) ----------

    onEnterAttack() {
        // Por defecto, se llama a performAttack() una vez
        this.performAttack();
    }

    updateAttack(time, delta) {
        // Si un boss necesita lógica frame a frame durante el ataque,
        // se puede sobrescribir este método en la subclase.
    }

    onExitAttack() { /* vacío por defecto */ }

    // Lógica genérica de ataque: al terminar, vuelve a NEUTRAL
    finishAttack() {
        this._timeSinceAttack = 0;
        if (this.state === BOSS_STATE.ATTACK) {
            this.changeState(BOSS_STATE.NEUTRAL);
        }
    }

    /**
     * Método pensado para ser SOBREESCRITO por cada boss.
     * Aquí se define qué hace el ataque (rayos, columnas, minions, etc).
     * Cuando acabe el ataque, hay que llamar a this.finishAttack().
     */
    performAttack() {
        // Por defecto: pequeño parpadeo y terminar
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

    onEnterDead() {
        this.isBattleActive = false; // ya no se actualiza lógica de pelea
        this.playDeathAnimation();
    }

    updateDead(time, delta) {
        // Nada; sólo esperar a que acabe la animación de muerte
    }

    onExitDead() { /* normalmente nunca sale de DEAD */ }

    playDeathAnimation(animationKey = 'default') {
        // Limpiar cualquier ataque en curso si existe
        if (this.finishAttack) {
            this.finishAttack();
        }

        if (animationKey === 'default') {
            // Si existe anim 'boss_die', se usa; si no, fade-out
            const hasDeathAnim = !!(this.anims && this.anims.animationManager && this.anims.animationManager.get('boss_die'));
            if (hasDeathAnim) {
                this.play('boss_die');
                this.once(Phaser.Animations.Events.ANIMATION_COMPLETE, () => {
                    this.handleBossDefeated();
                });
            }
        } else if (animationKey === 'jupiter_death') {
            // Calcular posición objetivo
            const targetX = this.player.x + 150;
            const targetY = 375;

            // Configurar la animación de movimiento hacia arriba + fade-out
            this.scene.tweens.add({
                targets: this,
                x: targetX,
                y: targetY,
                alpha: 0,
                scaleX: 0.3,
                scaleY: 0.3,
                duration: 1500, // 1.5 segundos para la animación completa
                ease: 'Cubic.Out',
                onUpdate: () => {
                    // Rotación gradual durante el movimiento
                    this.rotation += 0.035;
                },
                onComplete: () => {
                    this.handleBossDefeated();
                }
            });
        }
    }

    handleBossDefeated() {
        if (typeof this.onBattleEnd === 'function') {
            this.onBattleEnd(this);
        }
        this.destroy();
    }
}