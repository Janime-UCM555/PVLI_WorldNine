/**
 * Importación de la clase madre y de los estados del boss
 * @module BaseBoss
 */
import BossBase, { BOSS_STATE } from "./BaseBoss.js";

/**
 * @fileoverview Objetos que Horus puede spawnear
 * @module BossesObjects/HorusBoss
 */
import Koopa from "../Enemies/Koopa.js";
import Pokey from "../Enemies/Pokey.js";
import HorusColumn from "./HorusColums.js";
import HorusWindZone from "./HorusWindZone.js";
import DoubleJump from "../PowerUps/DoubleJump.js";

// Nombre del spritesheet de Horus tal y como lo cargas en preload():
// this.load.spritesheet('horus_sheet', 'ruta/a/horus.png', { frameWidth, frameHeight });
export const HORUS_SHEET_KEY = "horus_sheet";

/**
 * IMPORTANTE:
 * - Rellena estos arrays con los índices de frame que SÍ quieres usar.
 * - NO incluyas los frames en negro.
 * - Ejemplo: si tu spritesheet tiene 0–7 pero 3 y 4 son negros,
 *   pon [0,1,2,5,6,7].
 */
const HORUS_IDLE_FRAMES  = [15, 7, 14];
const HORUS_INTRO_FRAMES = [30, 20, 15];
const HORUS_CAST_FRAMES  = [4, 12, 13, 1];
const HORUS_DEAD_FRAMES  = [6, 0, 2, 26, 23];

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
        this.baseOffsetY = -120;   // por encima

        this.followOffsetX = 200;
        this.followOffsetY = this.baseOffsetY;

        this.followSide = 1;       // 1 = delante, -1 = detrás
        this.followLerp = 0.08;    // suavidad del seguimiento

        // “Vueltecitas” y bobbing
        this.flightTime = 0;
        this.bobAmplitude = 10;         // cuánto sube/baja
        this.rollAmplitudeDeg = 12;     // inclinación máxima (grados)

        // Escala como si se acercara a cámara
        this.baseScale = 1.8;
        this.pulseScale = 0.5;         // cuánto varía la escala
        this.setScale(this.baseScale);

        // Sonidos opcionales
        // this.windSound = scene.sound.add("wind", { volume: 0.5, loop: false });
        // this.columnHitSound = scene.sound.add("columnHit", {
        //     volume: 0.7,
        //     loop: false,
        // });

        this.ensureAnimations();

        this.setDepth(4);
    }

    /**
     * Crea las animaciones de Horus en la escena si no ha habido ninguna instancia anterior.
     */
    ensureAnimations() {
        HorusBoss.createAnimations(this.scene);
    }

    /**
     * Crea (si no existen ya) todas las animaciones de Horus.
     * Llamar desde la escena antes o durante la creación del boss.
     * @param {Phaser.Scene} scene
     */
    static createAnimations(scene) {
        const anims = scene.anims;

        // Idle
        if (!anims.exists("horus_idle")) {
            anims.create({
                key: "horus_idle",
                frames: anims.generateFrameNumbers(HORUS_SHEET_KEY, {
                    frames: HORUS_IDLE_FRAMES,
                }),
                frameRate: 4,
                repeat: -1,
            });
            this.introDuration = anims.get("horus_idle").frames.length * (1000 / 4);
        }

        // Intro
        if (!anims.exists("horus_intro")) {
            anims.create({
                key: "horus_intro",
                frames: anims.generateFrameNumbers(HORUS_SHEET_KEY, {
                    frames: HORUS_INTRO_FRAMES,
                }),
                frameRate: 1,
                repeat: 0,
            });
        }

        // Casteando / ataque
        if (!anims.exists("horus_cast")) {
            anims.create({
                key: "horus_cast",
                frames: anims.generateFrameNumbers(HORUS_SHEET_KEY, {
                    frames: HORUS_CAST_FRAMES,
                }),
                frameRate: 6,
                repeat: -1,
            });
        }

        // Muerte
        if (!anims.exists("horus_dead")) {
            anims.create({
                key: "horus_dead",
                frames: anims.generateFrameNumbers(HORUS_SHEET_KEY, {
                    frames: HORUS_DEAD_FRAMES,
                }),
                frameRate: 2,
                repeat: 0,
            });
        }
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
        this.player.setStatic(true); // congelar a Mario durante la intro

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
                    duration: this.introDuration * 1.2,
                    ease: "Cubic.easeInOut",
                    onComplete: () => {
                        this.changeState(BOSS_STATE.NEUTRAL);
                        this.player.setStatic(false); // liberar a Mario
                        if ((!this.scene.levelMusic || !this.scene.levelMusic.isPlaying) && !this.scene.endTimer) {
                            this.scene.levelMusic = this.scene.sound.add('Boss_Horus', { loop: false, volume: 1 });
                            this.scene.levelMusic.play();
                        } else if (this.scene.levelMusic) {
                            this.scene.levelMusic.stop();
                        }
                        //Boss_Horus
                        this.lastAttackX = this.player ? this.player.x : 0;
                    },
                });
            },
        });
    }

    updateIntro(time, delta) {}

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

        if(this.x > this.player.x){
            this.flipX = false;
        }
        else{
            this.flipX = true;
        }
        
        this.setDepth((this.scale >= this.baseScale) ? 5 : -1)
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
                this.performSpawnMinionOrd();
                break;
            case "columnWave":
            default:
                this.performColumnAttack();
                break;
        }
    }


    getGroundAt(x){
        if(!this.scene.map || !this.scene.groundLayer){
            return ;
        }

        const tileX = this.scene.map.worldToTileX(x); 

        for(let i = this.scene.map.height - 1 ; i > 0; i--){
            const tile = this.scene.groundLayer.getTileAt(tileX, i);
            if(tile){
                continue;
            }
            else{
                return this.scene.map.tileToWorldY(i) + this.scene.map.tilesets[0].tileHeight / 2;
            }
        }
        return ;
    }

    getPlayerGroundAt(x){
        if(!this.scene.map || !this.scene.groundLayer || !this.player){
            return ;
        }

        const tileX = this.scene.map.worldToTileX(x); 

        for(let i = this.scene.map.worldToTileY(this.player.y); i < this.scene.map.height; i++){
            const tile = this.scene.groundLayer.getTileAt(tileX, i);
            if(!tile){
                continue;
            }
            else{
                return this.scene.map.tileToWorldY(i - 1) + this.scene.map.tilesets[0].tileHeight / 2;
            }
        }

        return this.getGroundAt(x)

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
        const spawnBaseX = player.x + 300;

        const lanes = Phaser.Utils.Array
            .Shuffle(this.laneYPositions.slice())
            .slice(0, this.columnsPerWave);

        for (let i = 0; i < this.columnsPerWave; i++) {
            const delay = i * 150;

            scene.time.delayedCall(delay, () => {
                const spawnX = spawnBaseX + i * this.columnSpacingX;
                const colheight = Phaser.Math.Between(3, 8);
                const hasHole = colheight > 3 || Math.random() < 0.5;
                const hole = hasHole? 3 : 0;
                const offset = Phaser.Math.Between(2, 3);
                const coltype = Phaser.Math.Between(0, 2);

                const col = new HorusColumn(
                    scene,
                    this.map,
                    this.groundLayer,
                    spawnX,
                    this.getPlayerGroundAt(spawnX), // Y del suelo donde empieza la columna
                    colheight,
                    hole,
                    offset,
                    "horus_column",     // ⬅ key del spritesheet de columnas
                    {
                        bottom: 6 + coltype,            // índice de frame de la base
                        middle: 3 + coltype,            // índice de frame del cuerpo
                        top: 0 + coltype,               // índice de frame de la parte superior
                    },
                    {
                        fromOffsetY: 96,      // cuánto “suben” desde abajo
                        duration: 500,
                        ease: "Back.easeOut",
                    }
                );
                this.columns.push(col);
            });
        };
        scene.time.delayedCall(1200, () => {
            this.finishAttack();
        });
    }


    performSpawnMinionOrd() {
        this.spawnWindKoopa(this.player.x + 8 * 32, this.getPlayerGroundAt(this.player.x + 8 * 32));
        if(Math.random() < 0.5) this.spawnExtraEnemy(this.player.x + 11 * 32, this.getPlayerGroundAt(this.player.x + 11 * 32));
        else {this.spawnWindKoopa(this.player.x + 11 * 32, this.getPlayerGroundAt(this.player.x + 11 * 32));}
        
        if(Math.random() < 0.5){
            let power = new DoubleJump(this.scene, this.player.x + 14 * 32, this.getPlayerGroundAt(this.player.x + 14 * 32));
            power.setVelocityX(power.body.velocity.x * -0.09315); // Salir del bloque hacia arriba
            power.setVelocityY(-power.body.velocity.x/2);
            this.scene.powerups.add(power);
        }
        else{
            this.spawnExtraEnemy(this.player.x + 14 * 32, this.getPlayerGroundAt(this.player.x + 14 * 32));
        }

        this.scene.time.delayedCall(1200, () => {
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
                2
            );
            koopa.direction = -1;
            koopa.setOrigin(0.5, 0.8);
            this.addMinion(koopa);

        } catch (e) {
            console.warn(
                "No se pudo crear Koopa para Horus (revisa textura/ruta):",
                e
            );
        }
    }

    spawnExtraEnemy(x, y) {
        const scene = this.scene;
        const cam = scene.cameras.main;

        let pokey = new Pokey(
            scene,
            x,
            y,
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

        for(let i = 0; i < Phaser.Math.Between(1, this.columnsPerWave); i++) {
            const delay = i * 150;

            scene.time.delayedCall(delay, () => {
                const width = 96;      // ancho de la zona de viento
                const height = 260;    // alto de la zona de viento
                const spawnX = spawnBaseX + i * this.columnSpacingX;

                const windZone = new HorusWindZone(
                    scene,
                    spawnX,
                    this.player.y + Phaser.Math.Between(-80, 20),
                    width,
                    height,
                    this.columnSpeed,
                    this.player
                );

                this.columns.push(windZone);
            });
        };

        scene.time.delayedCall(1200, () => {
            this.finishAttack();
        });
    }

    finishAttack() {
        this.lastAttackX = this.player.x;
        super.finishAttack();
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

        this.clearMinions();

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
            this.setDepth(4);
            this.rotation = 0;
            this.setOrigin(0.5, 0.6)
            this.player.setStatic(true); // congelar a Mario durante la intro

            // Timeline: se acerca por detrás, cruza por encima y se coloca en su posición de vuelo
            // 1er tween: aparece por detrás hasta casi encima
            this.scene.tweens.add({
                targets: this,
                alpha: 1,
                x: this.player.x + 60,
                y: this.player.y - 50,
                scale: this.baseScale,
                duration: this.introDuration,
                ease: "Cubic.easeInOut",
                onComplete: () => {
                    // 2º tween: se adelanta y “salta” por delante y arriba
                    this.scene.tweens.add({
                        targets: this,
                        y: this.laneYPositions[0],
                        duration: this.introDuration * 1.2,
                        ease: "Cubic.easeInOut",
                        onComplete: () => {
                            this.player.setStatic(false); // liberar a Mario
                            this.lastAttackX = this.player ? this.player.x : 0;
                             // Notificar que la animación de muerte ha terminado
                                if (this.scene && this.scene.events) {
                                    this.scene.events.emit('horus-death-complete');
                                }
                        },
                    });
                },
            });
        } else {
            super.onEnterDead();
        }
    }
}
