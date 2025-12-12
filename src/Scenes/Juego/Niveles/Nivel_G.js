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
            const tilesetBGD = this.map?.addTilesetImage('Greece_BG', 'bg_tileset_Greece');
            const tilesetBGS = this.map?.addTilesetImage('Sky_BG', 'bg_tileset_Sky');
            const tilesetBGP = this.map?.addTilesetImage('MapaTiles', 'mi_tileset');

            // Crear capa de fondo del Coliseo
            let bgLayer = this.map?.createLayer('CapaFondo', [tilesetBGD, tilesetBGP, tilesetBGS], 0, 0);
            let frontLayer = this.map?.createLayer('CapaFalsoSuelo2', tilesetBGP, 0, 0);
            this.fakeFloorLayer?.setTint(0x666666);
            this.fakeFloorLayer?.setDepth(0);
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