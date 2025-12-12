/**
 * @fileoverview Nivel de Roma.
 * @module Scenes/Nivel_R
 */

import GameScenes from '../GameScenes.js';
import spawnPowerUp from '../../../gameObjects/PowerUps/PowerUpSpawn.js';

/**
 * @class Nivel_R
 * @extends GameScenes
 * @description Escena del nivel de Roma.
 * Configura el mapa temático romano con arquitectura imperial.
 */
class Nivel_R extends GameScenes {
    /**
     * Crea una instancia del Nivel R (Roma).
     */
    constructor() {
        super('Nivel_R', () => {
            const tilesetBG = this.map.addTilesetImage('bg', 'bg_tileset');
            const bgLayer = this.map.createLayer('CapaFondo', tilesetBG, 0, 0);
        }, false);
    }
    
    /**
     * Inicializa las propiedades del nivel antes de precarga.
     */
    init() {
        // Inicialización personalizada del nivel
    }

    /**
     * Precarga los recursos específicos del nivel de Roma.
     */
    preload() {
        console.log('=== INICIO ===');
        this.load.tilemapTiledJSON(this.mapKey, 'MapaDeTiled/ElMapa.json');
        this.score = 0;
        this.coinScore = 0;
        this.purpleCoinScore = 0;
        this.timer = 70;
    }

    /**
     * Crea e inicializa el nivel de Roma.
     * Configura la música específica del nivel romano.
     */
    create() {
        super.create();
        
        // Música de fondo del nivel
        if (!this.levelMusic || !this.levelMusic.isPlaying) {
            this.levelMusic = this.sound.add('level_music', { loop: true, volume: 1 });
            this.levelMusic.play();
        }
        spawnPowerUp(this, 50, 625, POWERUP_TYPES.HAMMER);
    }
}

export default Nivel_R;