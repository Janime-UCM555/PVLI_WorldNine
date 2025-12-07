// HorusBoss.js
// Boss Horus basado en viento y columnas, usando BossBase y siguiendo a Mario.

import BossBase, { BOSS_STATE } from "./BaseBoss.js";
import Koopa from "../Enemies/Koopa.js";
import Pokey from "../Enemies/Pokey.js";
import HorusColumn from "./HorusColums.js";
import HorusWindZone from "./HorusWindZone.js";
import DoubleJump from "../PowerUps/DoubleJump.js";

export default class HorusBoss extends BossBase {
    /**
     * @param {Phaser.Scene} scene
     * @param {number} x
     * @param {number} y
     * @param {object} config
     *   {
     *      player,
     *      onBattleEnd,
     *      columnSpeed,
     *      columnsPerWave,
     *      koopaTexture,
     *      koopaSpeed,
     *      laneYPositions,
     *      attackDistance,
     *      endX,
     *      columnSpacingX
     *   }
     */
    constructor(scene, x, y, config = {}) {
        const {
            player,
            onBattleEnd,

            columnSpeed = -4,
            columnsPerWave = 3,
            koopaTexture = "Koopa_R",
            koopaSpeed = 2,
            laneYPositions = [520, 560, 600],

            attackDistance = 4000000.00,
            endX = null,

            columnSpacingX = 260, // separación entre columnas de una misma oleada

            map = scene.make.tilemap({ key: 'map1', tileWidth: 32, tileHeight: 32 }),
            tileset = map.addTilesetImage('MapaTiles', 'mi_tileset'),

            groundLayer = map.createLayer('CapaSuelo', tileset, 0, 0).setDepth(1),

        } = config;

        super(scene, x, y, "horus_idle", {
            player,
            introDuration: 1200,
            neutralMoveSpeed: 0,
            attackCooldown: 9999999, // no lo usamos por tiempo
            onBattleEnd,
        });

        this.player = player;

        this.columnSpeed = columnSpeed;
        this.columnsPerWave = columnsPerWave;
        this.koopaTexture = koopaTexture;
        this.koopaSpeed = koopaSpeed;
        this.laneYPositions = laneYPositions;

        this.attackDistance = attackDistance;
        this.endX = endX;

        this.map = map;
        this.groundLayer = groundLayer;

        this.columnSpacingX = columnSpacingX;

        this.lastAttackX = player ? player.x : 0;
        this.columns = [];
        this.attackPatterns = ["windZones", "columnWave", "spawnEnemys"];
        
        // ---------------------------
        // Minions invocados por Horus
        // ---------------------------
        /**
         * Enemigos (Koopas, Pokeys, etc.) creados por este boss.
         * Se actualizan desde el preUpdate de Horus.
         * @type {Phaser.GameObjects.GameObject[]}
         */
        this.minions = [];


        // ---------------------------
        // Seguimiento y vuelo bonito
        // ---------------------------

        // Offset base de posición respecto a Mario
        this.baseOffsetX = 200;    // delante/detrás
        this.baseOffsetY = -220;   // por encima

        this.followOffsetX = 200;
        this.followOffsetY = this.baseOffsetY;

        this.followSide = 1;       // 1 = delante, -1 = detrás
        this.followLerp = 0.08;    // suavidad del seguimiento

        // “Vueltecitas” y bobbing
        this.flightTime = 0;
        this.bobAmplitude = 10;         // cuánto sube/baja
        this.rollAmplitudeDeg = 12;     // inclinación máxima (grados)

        // Escala como si se acercara a cámara
        this.baseScale = 1.0;
        this.pulseScale = 0.18;         // cuánto varía la escala
        this.setScale(this.baseScale);

        // Sonidos opcionales
        // this.windSound = scene.sound.add("wind", { volume: 0.5, loop: false });
        // this.columnHitSound = scene.sound.add("columnHit", {
        //     volume: 0.7,
        //     loop: false,
        // });

        this.setDepth(30);
    }

    // -------------------------------------------------------
    // INTRO: aparece por detrás, se pone delante y sobrevuela a Mario
    // -------------------------------------------------------
    onEnterIntro() {
        if (!this.player) {
            console.warn("HorusBoss: no hay jugador asignado para la intro.");
            return;
        }

        // Colocamos a Horus un poco detrás y arriba de Mario
        this.setAlpha(0);
        this.x = this.player.x - 250;
        this.y = this.player.y - 150;
        this.setScale(this.baseScale * 0.8); // empieza un poco más pequeño

        if (this.scene.anims.exists("horus_intro")) {
            this.play("horus_intro");
        }

        // Timeline: se acerca por detrás, cruza por encima y se coloca en su posición de vuelo
        // 1er tween: aparece por detrás hasta casi encima
        this.scene.tweens.add({
            targets: this,
            alpha: 1,
            x: this.player.x - 60,
            y: this.player.y - 80,
            scale: this.baseScale,
            duration: this.introDuration,
            ease: "Cubic.easeInOut",
            onComplete: () => {
                // 2º tween: se adelanta y “salta” por delante y arriba
                this.scene.tweens.add({
                    targets: this,
                    x: this.player.x + this.baseOffsetX,
                    y: this.player.y + this.baseOffsetY,
                    duration: this.introDuration * 0.6,
                    ease: "Cubic.easeInOut",
                    onComplete: () => {
                        this.changeState(BOSS_STATE.NEUTRAL);
                    },
                });
            },
        });
    }

    // -------------------------------------------------------
    // SEGUIMIENTO SUAVE + VUELTECITAS + ESCALA
    // -------------------------------------------------------
    updateFollowAroundPlayer(delta) {
        if (!this.player) return;

        this.flightTime += delta;

        // Decidimos la posición objetivo respecto a Mario
        const desiredX = this.player.x + this.followSide * this.baseOffsetX; // delante o detrás
        const desiredY = this.player.y + this.baseOffsetY;

        // Lerp suave hacia la posición objetivo
        const t = this.followLerp * (delta / 16.67);
        const clampT = Phaser.Math.Clamp(t, 0, 1);

        this.x += (desiredX - this.x) * clampT;
        this.y += (desiredY - this.y) * clampT;

        // Bobbing arriba/abajo (vuelo flotante)
        const bob = Math.sin(this.flightTime * 0.004) * this.bobAmplitude;
        this.y += bob;

        // Rotación suave (como si hiciera vueltecitas / se inclinara)
        const rollRad =
            Phaser.Math.DegToRad(this.rollAmplitudeDeg) *
            Math.sin(this.flightTime * 0.005);
        this.rotation = rollRad;

        // Escala que pulsa ligeramente (como acercarse/alejarse de la cámara)
        const pulse = Math.sin(this.flightTime * 0.003) * this.pulseScale;
        this.setScale(this.baseScale + pulse);

        // Limitar a la cámara para que no se vaya muy lejos
        const cam = this.scene.cameras.main;
        const left = cam.scrollX + 40;
        const right = cam.scrollX + cam.width - 60;
        const top = cam.scrollY + 30;
        const bottom = cam.scrollY + cam.height - 180;

        this.x = Phaser.Math.Clamp(this.x, left, right);
        this.y = Phaser.Math.Clamp(this.y, top, bottom);
    }

    // -------------------------------------------------------
    // NEUTRAL: sobrevuela a Mario y decide cuándo atacar
    // -------------------------------------------------------
    onEnterNeutral() {
        this._timeSinceAttack = 0;

        if (this.scene.anims.exists("horus_idle")) {
            this.play("horus_idle");
        }

        if (this.player && (this.lastAttackX === null || this.lastAttackX === undefined)) {
            this.lastAttackX = this.player.x;
        }

        // A veces se pone delante, a veces un poco por detrás
        this.followSide = Math.random() < 0.6 ? 1 : -1; // 60% delante, 40% detrás
        if (this.followSide === -1) { this.flipX = true;}
    }

    updateNeutral(time, delta) {
        if (!this.player) return;

        // vuelo alrededor de Mario
        this.updateFollowAroundPlayer(delta);

        // Fin opcional por endX
        if (
            this.endX !== null &&
            this.player.x >= this.endX &&
            this.state !== BOSS_STATE.DEAD
        ) {
            this.defeat();
            return;
        }

        // Atacar según la distancia recorrida por Mario
        const distance = this.player.x - this.lastAttackX;

        if (distance >= this.attackDistance) {
            this.lastAttackX = this.player.x;
            this.changeState(BOSS_STATE.ATTACK);
        }
    }

    // -------------------------------------------------------
    // ATTACK: oleada de columnas + Koopas, mientras sigue sobrevolando
    // -------------------------------------------------------
    onEnterAttack() {
        if (this.scene.anims.exists("horus_cast")) {
            this.play("horus_cast");
        }

        this.followSide = 1;

        this.performAttack();
    }

    performAttack() {
        // Elegimos un patrón aleatorio de la lista
        const pattern = Phaser.Utils.Array.GetRandom(this.attackPatterns);
        switch (pattern) {
            case "windZones":
                this.performWindAttack();
                break;
            case "spawnEnemys":
                this.spawnWindKoopa(this.player.x + 400, this.laneYPositions[0]);
                this.spawnExtraEnemy(this.player.x + 600, this.laneYPositions[0]);
               
                let power = new DoubleJump(this.scene, this.player.x + 1000, this.laneYPositions[0]);

                power.setVelocityX(power.body.velocity.x * -0.09315); // Salir del bloque hacia arriba
                power.setVelocityY(-power.body.velocity.x/2);
                this.scene.powerups.add(power);

                this.scene.time.delayedCall(1200, () => {
                    this.finishAttack();
                });
                break;
            case "columnWave":
            default:
                this.performColumnAttack();
                break;
        }
    }

        // Patrón 1: columnas sólidas + Koopas (tu patrón original)
    performColumnAttack() {
        const scene = this.scene;
        const player = this.player;

        if (!player) {
            this.finishAttack();
            return;
        }

        if (this.windSound) {
            this.windSound.play();
        }

        // X base algo por delante del jugador
        const spawnBaseX = player.x + 400;

        const lanes = Phaser.Utils.Array
            .Shuffle(this.laneYPositions.slice())
            .slice(0, this.columnsPerWave);

        lanes.forEach((laneY, index) => {
            const delay = index * 150;

            scene.time.delayedCall(delay, () => {
                const spawnX = spawnBaseX + index * this.columnSpacingX;
                const colheight = Phaser.Math.Between(3, 8);
                const hasHole = colheight > 4 || Math.random() < 0.5;
                const hole = hasHole? 3 : 0;
                const offset = Phaser.Math.Between(2, 4);

                const col = new HorusColumn(
                    scene,
                    this.map,
                    this.groundLayer,
                    spawnX,
                    laneY,
                    colheight,
                    hole,
                    offset
                );
                this.columns.push(col);
            });
        });
        scene.time.delayedCall(1200, () => {
            this.finishAttack();
        });
    }

      /**
     * preUpdate de Horus: deja que BossBase haga su lógica interna
     * y luego actualizamos a todos los minions.
     */
    preUpdate(time, delta) {
        // Lógica de estados / animaciones definida en BossBase
        super.preUpdate(time, delta);

        // Actualizar minions invocados
        this.updateMinions(time, delta);
    }

    // -------------------------------------------------------
    // MINIONS: gestión genérica de enemigos invocados
    // -------------------------------------------------------
    /**
     * Registra un minion para que el boss lo actualice y limpie.
     * @param {Phaser.GameObjects.GameObject} minion 
     */
    addMinion(minion) {
        if (!minion) return;
        this.minions.push(minion);
    }

    /**
     * Llamada cada frame desde preUpdate.
     * Actualiza a todos los minions vivos y limpia los caídos.
     */
    updateMinions(time, delta) {
        for (let i = this.minions.length - 1; i >= 0; i--) {
            const m = this.minions[i];

            // Si el minion ha sido destruido o ya no está activo, lo eliminamos
            if (!m || !m.active) {
                this.minions.splice(i, 1);
                continue;
            }

            // Si el minion tiene un update(time, delta) propio, lo llamamos
            if (typeof m.update === "function") {
                m.update(time, delta);
            }
        }
    }

    /**
     * Destruye todos los minions asociados a este boss.
     * Se usa al morir Horus o si quieres limpiar la arena.
     */
    clearMinions() {
        for (let i = 0; i < this.minions.length; i++) {
            const m = this.minions[i];
            if (m && typeof m.destroy === "function") {
                m.destroy();
            }
        }
        this.minions.length = 0;
    }


    spawnWindKoopa(x, y) {
        const scene = this.scene;
        try {
            const koopa = new Koopa(
                scene,
                x,
                y,
                this.koopaTexture,
                this.koopaSpeed,
                true
            );
            koopa.direction = -1; // viento hacia la izquierda
            this.addMinion(koopa);

        } catch (e) {
            console.warn(
                "No se pudo crear Koopa para Horus (revisa textura/ruta):",
                e
            );
        }
    }

    spawnExtraEnemy() {
        const scene = this.scene;

        if (Math.random() > 0.3) return;

        const cam = scene.cameras.main;
        const spawnX = cam.scrollX + cam.width + 100;
        const spawnY = Phaser.Utils.Array.GetRandom(this.laneYPositions);

        let pokey = new Pokey(
            scene,
            spawnX,
            spawnY - 32,
            Phaser.Math.Clamp(Math.floor(Math.random()/0.2), 2, 5),
            1.5
        );
        this.addMinion(pokey);

    }

        // Patrón 2: zonas de viento atravesables + Koopas
    performWindAttack() {
        const scene = this.scene;
        const player = this.player;

        if (!player) {
            this.finishAttack();
            return;
        }

        if (this.windSound) {
            this.windSound.play();
        }

        const spawnBaseX = player.x + 400;

        const lanes = Phaser.Utils.Array
            .Shuffle(this.laneYPositions.slice())
            .slice(0, this.columnsPerWave);

        lanes.forEach((laneY, index) => {
            const delay = index * 150;

            scene.time.delayedCall(delay, () => {
                const width = 96;      // ancho de la zona de viento
                const height = 260;    // alto de la zona de viento
                const spawnX = spawnBaseX + index * this.columnSpacingX;

                const windZone = new HorusWindZone(
                    scene,
                    spawnX,
                    this.player.y,
                    width,
                    height,
                    this.columnSpeed,
                    this.player
                );

                this.columns.push(windZone);
            });
        });

        scene.time.delayedCall(1200, () => {
            this.finishAttack();
        });
    }


    updateAttack(time, delta){
        this.x += this.player.speed * delta/21;
    }

    // -------------------------------------------------------
    // DEAD / DERROTA
    // -------------------------------------------------------
    onEnterDead() {
        if (this.windSound && this.windSound.isPlaying) {
            this.windSound.stop();
        }

        if (this.columns) {
            this.columns.forEach((col) => {
                if (col && col.body) {
                    col.setVelocityX(0);
                }
            });
        }

        if (this.scene.anims.exists("horus_dead")) {
            this.play("horus_dead");
            this.once(
                Phaser.Animations.Events.ANIMATION_COMPLETE,
                () => {
                    super.onEnterDead();
                }
            );
        } else {
            super.onEnterDead();
        }
    }
}
