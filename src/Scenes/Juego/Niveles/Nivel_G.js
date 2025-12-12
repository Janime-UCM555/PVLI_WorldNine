/**
 * @fileoverview Nivel de Grecia.
 * @module Scenes/Nivel_G
 */

import GameScenes from '../GameScenes.js'
import { PowerUp, POWERUP_TYPES } from '../../../gameObjects/PowerUps/PowerUps.js';
import spawnPowerUp from '../../../gameObjects/PowerUps/PowerUpSpawn.js';

/**
 * @class Nivel_G
 * @extends GameScenes
 * @description Escena del nivel de Grecia.
 * Configura el mapa temático griego con arquitectura clásica.
 */
class Nivel_G extends GameScenes {
    /**
     * Crea una instancia del Nivel G (Grecia).
     */
    constructor() {
        super('Nivel_G', () => {
            // Configuración de capas de fondo para Grecia
            // (Actualmente comentado, puede añadirse si se necesita)
        }, false);
    }

    /**
     * Inicializa las propiedades del nivel antes de precarga.
     */
    init() {
        // Inicialización personalizada del nivel
    }

    /**
     * Precarga los recursos específicos del nivel de Grecia.
     */
    preload() {
        console.log('=== INICIO ===');
        this.load.tilemapTiledJSON(this.mapKey, 'MapaDeTiled/MapaGrecia.json');
        this.score = 0;
        this.coinScore = 0;
        this.purpleCoinScore = 0;
        this.timer = 80;
        this.enPausa = false;
        this.bloquePausaActivo = null;
        this.impulsoActivo = null;
    }

    /**
     * Crea e inicializa el nivel de Grecia.
     * Configura la música y spawns de PowerUps específicos.
     */
    create() {
        super.create();
        
        // Música de fondo del nivel
        if ((!this.levelMusic || !this.levelMusic.isPlaying) && !this.endTimer) {
            this.levelMusic = this.sound.add('greece_music', { loop: true, volume: 1 });
            this.levelMusic.play();
        } else if (this.levelMusic) {
            this.levelMusic.stop();
        }
        
        spawnPowerUp(this, 50, 625, POWERUP_TYPES.HAMMER);
    }
}

export default Nivel_G;