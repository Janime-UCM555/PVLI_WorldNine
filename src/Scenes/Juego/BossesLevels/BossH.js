// BossH.js
import Mario from '../../../gameObjects/Player/Mario.js';
import HorusBoss, { HORUS_SHEET_KEY } from "../../../gameObjects/BossesObjects/HorusBoss.js";
import {PowerUp, POWERUP_TYPES } from '../../../gameObjects/PowerUps/PowerUps.js';
import GameScenes from '../GameScenes.js';
import spawnPowerUp from '../../../gameObjects/PowerUps/PowerUpSpawn.js';
import Pilar from '../../../gameObjects/LevelBlockObjects/Pilar.js';

export default class BossH extends GameScenes{

    constructor() {
        super('BossH', ()=>
            {
                const tilesetBGD = this.map?.addTilesetImage('Pyramid_BG', 'bg_tileset_P');
                const tilesetBGP = this.map?.addTilesetImage('MapaTiles', 'mi_tileset');
                
                // Capa de suelo
                let bgLayer = this.map?.createLayer('CapaFondo', [tilesetBGD, tilesetBGP], 0, 0);
                bgLayer.setDepth(-2);
            }, true);
    }

    preload() {
        this.load.tilemapTiledJSON(this.mapKey, 'MapaDeTiled/Prueba.json');
        this.load.spritesheet(HORUS_SHEET_KEY, 'assets/GameSprites/Characters/Bosses/Horus/spritesheet_uniforme_completa.png', { frameWidth: 74, frameHeight: 69 });
        this.load.spritesheet('horus_column', 'assets/GameSprites/ObjetosBosses/Jarrones.png', { frameWidth: 32, frameHeight: 32 });
        this.score = 0;
        this.timer = 60;
        this.coinScore = 0;
        this.purpleCoinScore = 0;
        this.enPausa = false;
        this.endTimer=false;
        this.bloquePausaActivo = null;
        this.impulsoActivo = null;
    }

    create() {

        this.bossIntroStarted = false;

        // ---------------------------------------------------------
        // MARIO
        // ---------------------------------------------------------
        spawnPowerUp(this,32 * 5, 32 * 23, POWERUP_TYPES.MUSHROOM);
        this.jugador = new Mario(this, 32 * 5, 32 * 23, "mario_run", 5, -4, true);
        super.create();

        // ---------------------------------------------------------
        // ✨ LANES desde el TILEMAP
        // ---------------------------------------------------------
        // Selecciona las filas del tilemap donde quieres que aparezcan las columnas
        const laneRows = [17];   // <-- AJUSTA ESTO según tu mapa

        // Convierte cada fila de tiles en coordenada mundo Y
        const laneYPositions = laneRows.map(row =>
            this.map.tileToWorldY(row) + this.map.tileHeight / 2
        );
              this.hammers = this.add.group();

        // ---------------------------------------------------------
        // HORUS BOSS (usando lanes del tilemap)
        // ---------------------------------------------------------

        // Escuchar evento de muerte completa de Horus
        this.events.once('horus-death-complete', () => {
            super.ganasPartida();
        });

        this.horus = new HorusBoss(this, 200, this.cameras.main.heightInPixels + 100, {
            player: this.jugador,

            columnsPerWave: 3,
            attackDistance: 20 * 32,
            columnSpeed: -4,

            laneYPositions: laneYPositions, 

            columnSpacingX: 260,

            koopaTexture: "Koopa_walk_D",
            koopaSpeed: 3,

            map: this.map,

            groundLayer: this.groundLayer,

        });

        this.pilar = new Pilar(this,-903,625,'pilar_arena');
    }
    

    createText()
    {
        // Este gráfico representa la línea dónde se alinea la UI por la derecha

        // var graphics = this.add.graphics();

        const posUI = this.cameras.main.centerX+this.cameras.main.centerX/2; // Posición UI por la derecha
        // graphics.lineStyle(1, 0xffffff, 1);
        // graphics.lineBetween(posUI, 0,posUI, 600);
        // graphics.setScrollFactor(0);

        const fontSize = 29; // 50 / 1.65 ≈ 29
            this.fpsText = this.add.text(this.cameras.main.centerX, this.cameras.main.centerY, '- phaser text stroke -',{fontFamily: 'aku-kamu'})
            .setOrigin(-2,5)
            .setStroke('#000000ff', 6)
            .setFill('#38b762ff')
            .setFontSize(fontSize + 'px')
            .setDepth(6)
            // .setText("60")
            .setScrollFactor(0);

            this.textScore = this.add.text(posUI, this.cameras.main.centerY,"".padStart(10,"0"),{fontFamily: 'aku-kamu'})
            .setOrigin(1,5)
            .setStroke('#000000ff', 6)
            .setFill('#ffffffff')
            .setDepth(6)
            .setFontSize(fontSize + 'px')
            .setScrollFactor(0);

            this.textCoins = this.add.text(posUI, this.cameras.main.centerY, "".padStart(2,"0"),{fontFamily: 'aku-kamu'})
            .setOrigin(1,4)
            .setStroke('#000000ff', 6)
            .setFill('#DBC716')
            .setDepth(6)
            .setFontSize(fontSize + 'px')
            .setScrollFactor(0);
    }
    ganasPartida()
    {
        const fadeTween = this.tweens.add({
            targets: this.pilar,
            alpha: 0,
            scaleX: 0.4,
            scaleY: 0.4,
            duration: 1000,
            ease: 'Cubic',
            onComplete: () => {
                // Destruir el pilar cuando esté completamente transparente
                if (this.pilar) {
                    this.pilar.destroy();
                }
            }
        });
        super.ganasPartida();
    }
    timerMethod()
    {
    }
    update(time, delta) {
        super.update(time, delta);

        this.horus.update(time, delta);

        if (!this.bossIntroStarted && this.jugador.x >= this.map.tileToWorldX(30)) {
            this.horus.startBattle();
            this.bossIntroStarted = true;
            this.pilar.setStatic(false);
        }
    }

    ganasPartida() {

        if (this.barraFinLayer) {
            this.barraFinLayer.getChildren().forEach(barra => {
                // Si BarraFin es un Matter sprite:
                if (barra.body && barra.setCollidesWith) {
                barra.setCollidesWith([]); // que no choque con nada
                }
                if (barra.body && barra.body.collisionFilter) {
                barra.body.collisionFilter.mask = 0; // por si acaso
                }
            });
        }
        super.ganasPartida();
        this.horus.defeat();
    }
}
