/**
 * @fileoverview Nivel del desierto egipcio.
 * @module Scenes/Nivel_D
 */

import GameScenes from '../GameScenes.js';
import { PowerUp, POWERUP_TYPES } from '../../../gameObjects/PowerUps/PowerUps.js';
import spawnPowerUp from '../../../gameObjects/PowerUps/PowerUpSpawn.js';

/**
 * @class Nivel_D
 * @extends GameScenes
 * @description Escena del nivel del desierto (Egipto).
 * Configura el mapa temático con pirámides y ambiente desértico.
 */
class Nivel_D extends GameScenes {
    /**
     * Crea una instancia del Nivel D (Desierto/Egipto).
     */
    constructor() {
        super('Nivel_D', () => {
            const tilesetBGD = this.map?.addTilesetImage('bg', 'bg_tileset_D');
            const tilesetBGP = this.map?.addTilesetImage('Pyramid_BG', 'bg_tileset_P');
            const bgLayer = this.map?.createLayer('CapaFondo', [tilesetBGD, tilesetBGP], 0, 0);
        }, false);
    }

    /**
     * Inicializa las propiedades del nivel antes de precarga.
     */
    init() {
        // Inicialización personalizada del nivel
    }

    /**
     * Precarga los recursos específicos del nivel del desierto.
     */
    preload() {
        console.log('=== INICIO ===');
        this.load.tilemapTiledJSON(this.mapKey, 'MapaDeTiled/MapaDesierto.json');
        this.score = 0;
        this.coinScore = 0;
        this.purpleCoinScore = 0;
        this.timer = 80;
        this.enPausa = false;
        this.bloquePausaActivo = null;
        this.impulsoActivo = null;
    }

    /**
     * Crea e inicializa el nivel del desierto.
     * Configura la música y spawns de PowerUps específicos.
     */
    create() {
        super.create();
        
        // Música de fondo del nivel
        if ((!this.levelMusic || !this.levelMusic.isPlaying) && !this.endTimer) {
            this.levelMusic = this.sound.add('Desierto', { loop: true, volume: 1 });
            this.levelMusic.play();
        } else if (this.levelMusic) {
            this.levelMusic.stop();
        }
        
        spawnPowerUp(this, 50, 625, POWERUP_TYPES.HAMMER);
    }
}

export default Nivel_D;