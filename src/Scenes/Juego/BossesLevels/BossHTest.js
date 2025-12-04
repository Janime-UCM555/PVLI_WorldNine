// BossH_Test.js
import Mario from '../../../gameObjects/Player/Mario.js';
import HorusBoss from "../../../gameObjects/BossesObjects/HorusBoss.js";
import Fin from '../../../gameObjects/LevelBlockObjects/BarraFin.js';

const CATEGORY_PLAYER  = 0x0001;
const CATEGORY_ENEMY   = 0x0002;
const CATEGORY_POWERUP = 0x0003;
const CATEGORY_TERRAIN = 0x0004;
const CATEGORY_FALLOFF = 0x0005;

export default class BossH_Test extends Phaser.Scene {

    constructor() {
        super({ key: "BossH_Test" });
    }

    preload() {
        this.load.tilemapTiledJSON('map1', 'MapaDeTiled/Prueba.json');
    }

    create() {
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
        // TILEMAP + FÍSICAS
        // ---------------------------------------------------------
        this.map = this.make.tilemap({ key: 'map1', tileWidth: 32, tileHeight: 32 });
        const tileset = this.map.addTilesetImage('MapaTiles', 'mi_tileset');

        this.groundLayer = this.map.createLayer('CapaSuelo', tileset, 0, 0);
        this.groundLayer.setDepth(1);

        const barraFinLayer = this.map.getObjectLayer('BarraFin').objects;

        this.map.setCollisionByExclusion([-1, 0]);
        this.matter.world.convertTilemapLayer(this.groundLayer);

        this.groundLayer.forEachTile(tile => {
            if (tile.physics.matterBody) {
                const body = tile.physics.matterBody.body;
                body.friction = 0;
                body.frictionStatic = 0;
                body.frictionAir = 0;
                body.restitution = 0;

                body.collisionFilter.category = CATEGORY_TERRAIN;
                body.collisionFilter.mask     = CATEGORY_PLAYER | CATEGORY_ENEMY;
            }
        });

        // ---------------------------------------------------------
        // BARRA FIN
        // ---------------------------------------------------------
        for (const barraPart of barraFinLayer)
        {
            this.barraFin = new Fin(
                this,
                barraPart.x + 32,
                barraPart.y, 
                'barra_tileset',
                0,
                600,
                80
            );
            this.barraFin.setCollisionCategory(CATEGORY_TERRAIN);
            this.barraFin.setCollidesWith([CATEGORY_PLAYER]);
        }

        // ---------------------------------------------------------
        // MARIO
        // ---------------------------------------------------------
        this.jugador = new Mario(this, 300, 600, "mario_run", 3.5, -3.75, true);

        // ---------------------------------------------------------
        // ✨ LANES desde el TILEMAP
        // ---------------------------------------------------------
        // Selecciona las filas del tilemap donde quieres que aparezcan las columnas
        const laneRows = [16, 17];   // <-- AJUSTA ESTO según tu mapa

        // Convierte cada fila de tiles en coordenada mundo Y
        const laneYPositions = laneRows.map(row =>
            this.map.tileToWorldY(row) + this.map.tileHeight / 2
        );

        console.log("LANES DEL TILEMAP:", laneYPositions);

        // ---------------------------------------------------------
        // HORUS BOSS (usando lanes del tilemap)
        // ---------------------------------------------------------
        this.horus = new HorusBoss(this, 900, 300, {
            player: this.jugador,

            columnsPerWave: 3,
            attackDistance: 22 * 32,
            columnSpeed: -4,

            laneYPositions: laneYPositions,    // <-- YA ESTÁN ALINEADAS AL MAPA

            columnSpacingX: 260,

            koopaTexture: "Koopa_walk_R",
            koopaSpeed: 30,

            map: this.map,

            groundLayer: this.groundLayer,

            onBattleEnd: () => {
                console.log("HORUS DERROTADO");
                this.transitionToMenu();
            }
        });

        this.horus.startBattle();

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
        if (this.jugador) this.jugador.update(time, delta);
        if (this.horus) this.horus.update(time, delta);
    }

    transitionToMenu() {
        this.scene.start("MainMenu");
    }
}
