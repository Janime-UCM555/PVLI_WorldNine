// BossH_Test.js
import Mario from '../../../gameObjects/Player/Mario.js';
import HorusBoss, { HORUS_SHEET_KEY } from "../../../gameObjects/BossesObjects/HorusBoss.js";
import Star from '../../../gameObjects/PowerUps/Star.js';
import {PowerUp, POWERUP_TYPES } from '../../../gameObjects/PowerUps/PowerUps.js';
import Hammer from '../../../gameObjects/PowerUps/Hammer.js';
import DoubleJump from '../../../gameObjects/PowerUps/DoubleJump.js';
import Mushroom from '../../../gameObjects/PowerUps/Mushroom.js';
import JumpBoots from '../../../gameObjects/PowerUps/HighJump.js';
import GameScenes from '../GameScenes.js';
import spawnPowerUp from '../../../gameObjects/PowerUps/PowerUpSpawn.js';

const CATEGORY_PLAYER  = 0x0001;
const CATEGORY_ENEMY   = 0x0002;
const CATEGORY_POWERUP = 0x0003;
const CATEGORY_TERRAIN = 0x0004;
const CATEGORY_FALLOFF = 0x0005;

export default class BossH_Test extends GameScenes{

    constructor() {
        super('BossH', ()=>
            {
                const tilesetBGD = this.map?.addTilesetImage('Piramid_BG', 'bg_tileset_P');
                const tilesetBGP = this.map?.addTilesetImage('MapaTiles', 'mi_tileset');
                
                // Capa de suelo
                let bgLayer = this.map?.createLayer('CapaFondo', [tilesetBGD, tilesetBGP], 0, 0);
                bgLayer.setDepth(0);
            }, true);
    }

    preload() {
        this.load.tilemapTiledJSON('map', 'MapaDeTiled/Prueba.json');
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
       
        this.jugador = new Mario(this, 100, 500, "mario_run", 3.5, -3.75, true);
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

        this.horus = new HorusBoss(this, 1500, 300, {
            player: this.jugador,

            columnsPerWave: 3,
            attackDistance: 22 * 32,
            columnSpeed: -4,

            laneYPositions: laneYPositions, 

            columnSpacingX: 260,

            koopaTexture: "Koopa_walk_D",
            koopaSpeed: 3,

            map: this.map,

            groundLayer: this.groundLayer,

        });

        // ---------------------------------------------------------
        // CÁMARA + BOUNDS
        // ---------------------------------------------------------
        this.cameras.main.startFollow(this.jugador, true, 0.1, 0.1);
        this.cameras.main.setZoom(1.65);

        this.matter.world.setBounds(
            0, 0,
            this.map.widthInPixels,
            this.map.heightInPixels,
            0, false, false, false, false
        );
    }
    

    update(time, delta) {
        super.update(time, delta);

        this.horus.update(time, delta);

        if (!this.bossIntroStarted && this.jugador.x >= 1200) {
            this.horus.startBattle();
            this.bossIntroStarted = true;
        }
    }

    ganasPartida() {
       this.horus.defeat();
    }

    restartLevel() {
        super.restartLevel();
        
    }
}
