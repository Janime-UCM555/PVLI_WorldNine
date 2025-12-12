/**
 * @fileoverview Escena del combate contra el jefe Hades.
 * Nivel especial tipo boss fight contra Hades en el inframundo.
 * @module Scenes/BossHades
 */

import GameScenes from '../GameScenes.js';
import Pilar from '../../../gameObjects/LevelBlockObjects/Pilar.js';
import HadesBoss from '../../../gameObjects/BossesObjects/HadesBoss.js';
import spawnPowerUp from '../../../gameObjects/PowerUps/PowerUpSpawn.js';
import { PowerUp, POWERUP_TYPES } from '../../../gameObjects/PowerUps/PowerUps.js';

/**
 * Importación del jugador Mario.
 * @module Player/Mario
 */
import Mario from '../../../gameObjects/Player/Mario.js';

/**
 * @class BossHades
 * @extends GameScenes
 * @description Escena del combate contra Hades, el dios del viento.
 * Arena de batalla con ambiente egipcio.
 * El jugador debe derrotar a Horus evitando a los enemigos y superando las columnas que le lance.
 */
class BossHades extends GameScenes {
    /**
     * Crea una instancia del nivel Boss Hades.
     * Configura las capas de fondo temáticas del inframundo y el titán.
     */
    constructor() {
        super('BossHades', () => {
            const tilesetBG = this.map?.addTilesetImage('Hell_BG', 'bg_tileset_BH');
            const titanBG = this.map?.addTilesetImage('Titan_BG', 'bg_tileset_Titan');
            const tileset = this.map?.addTilesetImage('MapaTiles', 'mi_tileset');

            // Crear capas de fondo del inframundo
            let titanLayer = this.map?.createLayer('CapaTitan', titanBG, 0, 0);
            let bgLayer = this.map?.createLayer('CapaFondo', tilesetBG, 0, 0);
            bgLayer.setDepth(0);
            titanLayer.setDepth(1);

            // Capa frontal decorativa
            let frontLayer = this.map?.createLayer('CapaFrente', tileset, 0, 0);
            frontLayer.setDepth(5);
            
            // Crear jugador con configuración de boss
            this.jugador = new Mario(this, 75, 500, 'mario_run', 5, -3.75, true, true);
        }, true); // true = es nivel de jefe
    }
    
    /**
     * Inicializa las propiedades del nivel antes de la precarga.
     */
    init() {
        // Inicialización personalizada
    }

    /**
     * Precarga los recursos específicos del combate contra Hades.
     */
    preload() {
        console.log('=== INICIO ===');
        this.load.tilemapTiledJSON(this.mapKey, 'MapaDeTiled/BossHades.json');
        this.score = 0;
        this.coinScore = 0;
        this.purpleCoinScore = 0;
        this.enPausa = false;
        this.endTimer = false;
        this.bloquePausaActivo = null;
        this.impulsoActivo = null;
    }

    /**
     * Crea e inicializa la arena de combate contra Hades.
     * Configura el pilar de fuego, el boss y la música épica.
     */
    create() {
        super.create();

        // Spawn de power-up inicial (champiñón para vida extra)
        spawnPowerUp(this, 40, 500, POWERUP_TYPES.MUSHROOM);

        // Música de combate contra jefe
        if ((!this.levelMusic || !this.levelMusic.isPlaying) && !this.endTimer) {
            this.levelMusic = this.sound.add('Boss_Hades', { loop: false, volume: 1 });
            this.levelMusic.play();
        } else if (this.levelMusic) {
            this.levelMusic.stop();
        }
                // Crear pilar de fuego decorativo fuera de pantalla
        this.pilar = new Pilar(this,-1000,625,'pilar_fuego');
        this.pilar.setDepth(2);

        // Crear instancia del boss Hades
        this.hadesBoss = new HadesBoss(this, 550, 575, {
            player: this.jugador
        });

        // Iniciar batalla después de 2 segundos
        this.time.delayedCall(2000, () => {
            this.hadesBoss.startBattle();
        });

        // Limpiar el boss al cerrar la escena
        this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
            if (this.hadesBoss) {
                this.hadesBoss.destroy();
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

        // Cargar fuente antes de crear textos
        document.fonts.load('32px aku-kamu').then(() => {
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
        });
    }

    /**
     * Maneja la lógica cuando el jugador derrota a Hades.
     * Anima el pilar de fuego desvaneciéndose antes de completar el nivel.
     * @override
     * @param {Object} [barra] - Objeto de la barra final (no usado en esta implementación)
     */
    ganasPartida(barra) {
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
        this.pilar.velocidadPilar = 0;
        // Llamar a la lógica de victoria de la clase base
        super.ganasPartida();
    }
}

export default BossHades;