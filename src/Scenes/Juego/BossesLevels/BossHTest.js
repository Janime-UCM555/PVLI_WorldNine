// BossH_Test.js
import Mario from '../../../gameObjects/Player/Mario.js';
import HorusBoss from "../../../gameObjects/BossesObjects/HorusBoss.js";
import Star from '../../../gameObjects/PowerUps/Star.js';
import Fin from '../../../gameObjects/LevelBlockObjects/BarraFin.js';
import {PowerUp, POWERUP_TYPES } from '../../../gameObjects/PowerUps/PowerUps.js';
import Hammer from '../../../gameObjects/PowerUps/Hammer.js';

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
        const laneRows = [17];   // <-- AJUSTA ESTO según tu mapa

        // Convierte cada fila de tiles en coordenada mundo Y
        const laneYPositions = laneRows.map(row =>
            this.map.tileToWorldY(row) + this.map.tileHeight / 2
        );
              this.hammers = this.add.group();

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

        this.powerups = this.add.group();

        this.spawnPowerUp(350, 500, POWERUP_TYPES.HAMMER)

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
      spawnPowerUp(x, y, type) {
            let power;
            if(type != POWERUP_TYPES.STAR){
                power = new Hammer(this, x, y)
            }
            else{
                power = new Star(this, x, y);
            }
            power.setVelocityX(power.body.velocity.x * 0.09315); // Salir del bloque hacia arriba
            power.setVelocityY(-power.body.velocity.x/2);
            this.powerups.add(power);
            return this.powerups;
        }

        requestHammer(player) {
            let hammer = this.hammers.getChildren().find(h => !h.active);
        
            if (!hammer) {
                hammer = this.matter.add.sprite(player.x, player.y, 'hammer');
                hammer.setCircle(8);
                hammer.setBounce(0.8);
                hammer.setIgnoreGravity(false);
                hammer.setFixedRotation();
                hammer.isHammer = true;
                hammer.used = false;
                hammer.setDepth(6);
        
                // Config rebotes por primera vez
                hammer._bounces = 0;
                hammer._maxBounces = 3;
        
                // Manejar colisiones
               hammer.setOnCollide((collision) => {
                    if (hammer.used) return; // si ya no hace daño, ignorar
        
                    const bodyA = collision.bodyA;
                    const bodyB = collision.bodyB;
                    const other = (bodyA === hammer.body) ? bodyB : bodyA;
        
                    const otherGO = other?.gameObject;
        
                    // 🔹 Interface común de enemigos
                    if (otherGO && otherGO.isEnemy && typeof otherGO.die === 'function') {
                        otherGO.die(DIE_TYPES.HAMMER);
                    }
        
                    // Rebote solo contra bloques u objetos estáticos
                    if (other && other.isStatic) {
                        hammer._bounces++;
        
                        if (hammer._bounces >= hammer._maxBounces) {
                            hammer.used = true;        // ya no hace daño
                            hammer.setBounce(0);       // sin rebote
        
                            // Desaparecer después de 0.3s
                            this.time.delayedCall(300, () => {
                                this.recycleHammer(hammer);
                            });
                        }
                    }
                });
        
                this.hammers.add(hammer);
            }
        
            hammer.used = false;
            hammer._bounces = 0;
            hammer.setBounce(0.4);
            hammer.setIgnoreGravity(false);
            hammer.setActive(true);
            hammer.setVisible(true);
            hammer.setVelocity(0, 0);
            hammer.setAngularVelocity(0);
            hammer.setDepth(6);
        
            return hammer;
        }
        
        
        recycleHammer(hammer) {
            if (!hammer) return;
        
            hammer.used = false;
            hammer._bounces = 0;
            hammer.setActive(false);
            hammer.setVisible(false);
            hammer.setVelocity(0, 0);
            hammer.setAngularVelocity(0);
            hammer.setPosition(-1000, -1000);
        }
        
    

    update(time, delta) {
        if (this.jugador) this.jugador.update(time, delta);
        if (this.horus) this.horus.update(time, delta);
    }

    transitionToMenu() {
        this.scene.start("MainMenu");
    }
}
