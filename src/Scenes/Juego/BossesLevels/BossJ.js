/**
 * @fileoverview Escena del combate contra el jefe Júpiter.
 * Nivel especial tipo boss fight contra Júpiter en el Coliseo Romano.
 * @module Scenes/BossJ
 */

import GameScenes from '../GameScenes.js';
import Pilar from '../../../gameObjects/LevelBlockObjects/Pilar.js';
import JupiterBoss from '../../../gameObjects/BossesObjects/JupiterBoss.js';
import spawnPowerUp from '../../../gameObjects/PowerUps/PowerUpSpawn.js';
import { PowerUp, POWERUP_TYPES } from '../../../gameObjects/PowerUps/PowerUps.js';

/**
 * Importación del jugador Mario.
 * @module Player/Mario
 */
import Mario from '../../../gameObjects/Player/Mario.js';

/**
 * @class BossJ
 * @extends GameScenes
 * @description Escena del combate contra Júpiter, el dios del trueno.
 * Arena de batalla en el Coliseo Romano con agua y nubes de tormenta.
 * El jugador debe derrotar a Júpiter evitando sus rayos y ataques.
 */
class BossJ extends GameScenes {
    /**
     * Crea una instancia del nivel Boss Júpiter.
     * Configura las capas de fondo del Coliseo, agua y nubes de tormenta.
     */
    constructor() {
        super('BossJ', () => {
            const tilesetBGD = this.map?.addTilesetImage('Colosseum_BG', 'bg_tileset_BJ');
            const tilesetBGP = this.map?.addTilesetImage('MapaTiles', 'mi_tileset');

            // Crear capa de fondo del Coliseo
            let bgLayer = this.map?.createLayer('CapaFondo', [tilesetBGD, tilesetBGP], 0, 0);
            bgLayer.setDepth(0);

            // Crear capa frontal con agua y nubes
            const tilesetWater = this.map?.addTilesetImage('Water', 'water');
            const tilesetNube = this.map?.addTilesetImage('Cloud_BG', 'bg_tileset_Nube');
            let frontLayer = this.map?.createLayer('CapaFondo2', [tilesetNube, tilesetWater], 0, 0);
            frontLayer.setDepth(5);
            
            // Crear jugador con configuración de boss
            this.jugador = new Mario(this, 75, 600, 'mario_run', 5, -3.75, true, true);
        }, true); // true = es nivel de jefe
    }
    
    /**
     * Inicializa las propiedades del nivel antes de la precarga.
     */
    init() {
        // Inicialización personalizada
    }

    /**
     * Precarga los recursos específicos del combate contra Júpiter.
     */
    preload() {
        console.log('=== INICIO ===');
        this.load.tilemapTiledJSON(this.mapKey, 'MapaDeTiled/BossJupiter.json');
        this.score = 0;
        this.coinScore = 0;
        this.purpleCoinScore = 0;
        this.enPausa = false;
        this.endTimer = false;
        this.bloquePausaActivo = null;
        this.impulsoActivo = null;
    }

    /**
     * Crea e inicializa la arena de combate contra Júpiter.
     * Configura el pilar de nubes, las zonas de ataque y el boss con sus patrones.
     */
    create() {
        super.create();

        // Spawn de power-up inicial (champiñón para vida extra)
        spawnPowerUp(this, 40, 600, POWERUP_TYPES.MUSHROOM);

        // Música de combate contra jefe
        if ((!this.levelMusic || !this.levelMusic.isPlaying) && !this.endTimer) {
            this.levelMusic = this.sound.add('Boss_Jupiter', { loop: false, volume: 1 });
            this.levelMusic.play();
        } else if (this.levelMusic) {
            this.levelMusic.stop();
        }

        // Crear pilar de nubes/tormenta
        this.pilar = new Pilar(this, -903, 625, 'pilar_ny');

        // Cargar zonas de ataque desde Tiled
        const bossAttacks = this.map.getObjectLayer('ApareceJefe').objects;
        let id = 0;
        let attackZones = [];

        // Construir array de zonas donde el boss puede atacar
        for (const bossAttack of bossAttacks) {
            attackZones[id] = {
                minX: bossAttack.x, 
                maxX: bossAttack.x + 1150, 
                id: id
            };
            ++id;
        }

        // Crear instancia del boss Júpiter con zonas de ataque
        this.jupiterBoss = new JupiterBoss(this, 550, 575, {
            player: this.jugador
        }, attackZones);

        // Iniciar batalla después de 2 segundos
        this.time.delayedCall(2000, () => {
            this.jupiterBoss.startBattle();
        });

        // Limpiar el boss al cerrar la escena
        this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
            if (this.jupiterBoss) {
                this.jupiterBoss.destroy();
            }
        });
    }

    /**
     * Crea los elementos de texto de la UI para el combate de jefe.
     * Muestra FPS, puntuación y monedas.
     * @override
     */
    createText() {
        const posUI = this.cameras.main.centerX + this.cameras.main.centerX / 2;
        const fontSize = 29;

        // Texto de FPS (debug)
        this.fpsText = this.add.text(
            this.cameras.main.centerX, 
            this.cameras.main.centerY, 
            '- phaser text stroke -',
            { fontFamily: 'aku-kamu' }
        )
        .setOrigin(-2, 5)
        .setStroke('#000000ff', 6)
        .setFill('#38b762ff')
        .setFontSize(fontSize + 'px')
        .setDepth(6)
        .setScrollFactor(0);

        // Texto de puntuación
        this.textScore = this.add.text(
            posUI, 
            this.cameras.main.centerY,
            "".padStart(10, "0"),
            { fontFamily: 'aku-kamu' }
        )
        .setOrigin(1, 5)
        .setStroke('#000000ff', 6)
        .setFill('#ffffffff')
        .setDepth(6)
        .setFontSize(fontSize + 'px')
        .setScrollFactor(0);

        // Texto de monedas
        this.textCoins = this.add.text(
            posUI, 
            this.cameras.main.centerY, 
            "".padStart(2, "0"),
            { fontFamily: 'aku-kamu' }
        )
        .setOrigin(1, 4)
        .setStroke('#000000ff', 6)
        .setFill('#DBC716')
        .setDepth(6)
        .setFontSize(fontSize + 'px')
        .setScrollFactor(0);
    }

    /**
     * Maneja la lógica cuando el jugador derrota a Júpiter.
     * Anima el pilar de nubes desvaneciéndose antes de completar el nivel.
     * @override
     */
    ganasPartida() {
        // Animación de desvanecimiento del pilar
        const fadeTween = this.tweens.add({
            targets: this.pilar,
            alpha: 0,
            scaleX: 0.4,
            scaleY: 0.4,
            duration: 1000,
            ease: 'Cubic',
            onComplete: () => {
                if (this.pilar) {
                    this.pilar.destroy();
                }
            }
        });

        // Llamar a la lógica de victoria de la clase base
        super.ganasPartida();
    }

    /**
     * Sobrescribe el método del temporizador para los niveles de jefe.
     * Los niveles de jefe no usan temporizador de cuenta regresiva.
     * @override
     */
    timerMethod() {
        // Sin temporizador en niveles de jefe
    }
}

export default BossJ;