// BossH.js
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
import Pilar from '../../../gameObjects/LevelBlockObjects/Pilar.js';

const CATEGORY_PLAYER  = 0x0001;
const CATEGORY_ENEMY   = 0x0002;
const CATEGORY_POWERUP = 0x0003;
const CATEGORY_TERRAIN = 0x0004;
const CATEGORY_FALLOFF = 0x0005;

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

        this.pilar = new Pilar(this,-903,625,'pilar_ny');
        this.pilar.setStatic(true);
    }
    

    update(time, delta) {
        super.update(time, delta);

        this.horus.update(time, delta);

        if (!this.bossIntroStarted && this.jugador.x >= this.map.tileToWorldX(30)) {
            this.horus.startBattle();
            this.bossIntroStarted = true;
            this.pilar.setTint(0xFFFF00);
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

        this.horus.defeat();
    }

    restartLevel() {
        super.restartLevel();
    }
}
