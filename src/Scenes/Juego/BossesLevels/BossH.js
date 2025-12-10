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
            
            }, true);
    }

    preload() {
        this.load.tilemapTiledJSON('map', 'MapaDeTiled/Prueba.json');
        this.load.spritesheet(HORUS_SHEET_KEY, 'assets/GameSprites/Characters/Bosses/Horus/spritesheet_uniforme_completa.png', { frameWidth: 74, frameHeight: 69 });
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

        // ---------------------------------------------------------
        // MARIO
        // ---------------------------------------------------------
        this.jugador = new Mario(this, 100, 500, "mario_run", 3.5, -3.75, true);
        super.create();
        
        this.anims.create({
            key: 'mario_run',
            frames: this.anims.generateFrameNumbers('mario_run', { start: 0, end: 3 }),
            frameRate: 8,
            repeat: -1
        });
        this.anims.create({
            key: 'mario_idle',
            frames: this.anims.generateFrameNumbers('mario_idle', { start: 0, end: 2 }),
            frameRate: 1,
            repeat: -1
        });
        this.anims.create({
            key: 'mario_jump',
            frames: this.anims.generateFrameNumbers('mario_jump', { start: 0, end: 1 }),
            frameRate: 8,
            repeat: -1
        });
        this.anims.create({
            key: 'mario_fall',
            frames: this.anims.generateFrameNumbers('mario_fall', { start: 0, end: 1 }),
            frameRate: 8,
            repeat: -1
        });
        this.anims.create({
            key: 'mario_hurt',
            frames: this.anims.generateFrameNumbers('mario_hurt', { start: 0, end: 0 }),
            frameRate: 8,
            repeat: -1
        });

        this.anims.create({
            key: 'mario_stop',
            frames: this.anims.generateFrameNumbers('mario_stop', { start: 0, end: 0 }),
            frameRate: 8,
            repeat: -1
        });

        this.anims.create({
            key: 'mario_victory',
            frames: this.anims.generateFrameNumbers('mario_victory', { start: 0, end: 0 }),
            frameRate: 8,
            repeat: -1
        });

        this.anims.create({
            key: 'mario_bubble',
            frames: this.anims.generateFrameNumbers('mario_bubble', {start: 0, end: 0}),
            frameReate: 8,
            repeat: -1
        })

        this.anims.create({
            key: 'mario_throw',
            frames: this.anims.generateFrameNumbers('mario_throw', {start: 0, end: 3}),
            frameReate: 8,
            repeat: 0
        })

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
        // POWER-UPS para probar
        // ---------------------------------------------------------


        spawnPowerUp(this, 350, 500, POWERUP_TYPES.JUMP_BOOTS)
        spawnPowerUp(this, 350, 500, POWERUP_TYPES.MUSHROOM)
        spawnPowerUp(this, 350, 500, POWERUP_TYPES.DOUBLE_JUMP)


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
}
