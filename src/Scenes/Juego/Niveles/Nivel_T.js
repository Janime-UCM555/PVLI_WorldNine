/**
 * @fileoverview Nivel tutorial.
 * @module Scenes/Nivel_T
 */

import GameScenes from '../GameScenes.js'
import { PowerUp, POWERUP_TYPES } from '../../../gameObjects/PowerUps/PowerUps.js';
import spawnPowerUp from '../../../gameObjects/PowerUps/PowerUpSpawn.js';

/**
 * @class Nivel_T
 * @extends GameScenes
 * @description Escena del nivel tutorial en el bosque.
 * Primer nivel del juego, introduce mecánicas básicas al jugador.
 */
class Nivel_T extends GameScenes {
    /**
     * Crea una instancia del Nivel T (Tutorial/Bosque).
     */
    constructor() {
        super('Nivel_T', () => {
            const tilesetBG = this.map?.addTilesetImage('Forest_BG', 'bg_tileset_Bosque');
            const bgLayer = this.map?.createLayer('CapaFondo', tilesetBG, 0, 0);
        }, false);
    }

    /**
     * Inicializa las propiedades del nivel antes de precarga.
     */
    init() {
        // Inicialización personalizada del nivel
    }

    /**
     * Precarga los recursos específicos del nivel tutorial.
     */
    preload() {
        console.log('=== INICIO ===');
        this.load.tilemapTiledJSON(this.mapKey, 'MapaDeTiled/MapaTutorial.json');
        this.score = 0;
        this.coinScore = 0;
        this.purpleCoinScore = 0;
        this.timer = 80;
        this.enPausa = false;
        this.bloquePausaActivo = null;
        this.impulsoActivo = null;
    }

    /**
     * Crea e inicializa el nivel tutorial.
     * Configura la música y spawns de PowerUps para el aprendizaje.
     */
    create() {
        super.create();
        
        // Música de fondo del nivel
        if ((!this.levelMusic || !this.levelMusic.isPlaying) && !this.endTimer) {
            this.levelMusic = this.sound.add('tutorial_music', { loop: true, volume: 1 });
            this.levelMusic.play();
        } else if (this.levelMusic) {
            this.levelMusic.stop();
        }
        
        // spawnPowerUp(this, 50, 625, POWERUP_TYPES.HAMMER);
    }
}

export default Nivel_T;